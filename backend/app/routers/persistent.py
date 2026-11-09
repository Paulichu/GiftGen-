import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Request, Query, HTTPException, status
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
import httpx
from app.config import settings
from app.database import get_database
from app.services.persistent_agent import run_persistent_agent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agent", tags=["persistent-agent"])


class ChatRequest(BaseModel):
    message: str
    channel: str = "app"
    chat_id: str = "app-user"
    history: List[Dict[str, str]] = []


class ChatResponse(BaseModel):
    reply: str
    tool_calls: List[str] = []
    channel: str


@router.post("/chat", response_model=ChatResponse)
async def direct_agent_chat(req: ChatRequest):
    """
    Direct synchronous endpoint for the frontend / app:
    App -> Railway Backend -> OpenAI -> Mongo.
    Never returns 500, saves messages to Mongo db.messages.
    """
    reply = ""
    tool_calls: List[str] = []

    try:
        raw_res = await run_persistent_agent(req.message, req.history)
        if isinstance(raw_res, tuple):
            reply, tool_calls = raw_res
        elif isinstance(raw_res, dict):
            reply = raw_res.get("reply", "")
            tool_calls = raw_res.get("tool_calls", [])
        else:
            reply = str(raw_res)
            tool_calls = []
    except Exception as e:
        logger.error(f"Error running persistent agent in /chat: {e}")
        reply = f"Wystąpił problem z asystentem: {str(e)}"
        tool_calls = []

    # Save to MongoDB db.messages without failing request on DB errors
    try:
        db = get_database()
        await db["messages"].insert_one({
            "channel": req.channel,
            "chat_id": req.chat_id,
            "in": req.message,
            "out": reply,
            "tool_calls": tool_calls,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    except Exception as dbe:
        logger.error(f"Failed to record chat in db.messages: {dbe}")

    return ChatResponse(
        reply=reply,
        tool_calls=tool_calls,
        channel=req.channel
    )


@router.post("/webhook/telegram")
async def telegram_webhook(request: Request) -> Dict[str, bool]:
    try:
        body = await request.json()
        message = body.get("message") or {}
        chat = message.get("chat") or {}
        chat_id = chat.get("id")
        sender = message.get("from") or {}
        first_name = sender.get("first_name", "User")
        text = message.get("text", "")

        if not chat_id or not text:
            return {"ok": True}

        db = get_database()

        try:
            await db["messages"].insert_one({
                "channel": "telegram",
                "direction": "inbound",
                "chat_id": chat_id,
                "sender_name": first_name,
                "text": text,
                "raw": body,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        except Exception as dbe:
            logger.error(f"DB error recording telegram inbound: {dbe}")

        raw_res = await run_persistent_agent(text)
        if isinstance(raw_res, tuple):
            reply_text, _ = raw_res
        elif isinstance(raw_res, dict):
            reply_text = raw_res.get("reply", "")
        else:
            reply_text = str(raw_res)

        bot_token = settings.TELEGRAM_BOT_TOKEN
        if bot_token:
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            payload = {
                "chat_id": chat_id,
                "text": reply_text
            }
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    logger.info(f"Telegram sendMessage status: {resp.status_code}")
            except Exception as e:
                logger.error(f"Failed to send Telegram message: {e}")

        try:
            await db["messages"].insert_one({
                "channel": "telegram",
                "direction": "outbound",
                "chat_id": chat_id,
                "reply_to_name": first_name,
                "text": reply_text,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        except Exception as dbe:
            logger.error(f"DB error recording telegram outbound: {dbe}")

        return {"ok": True}

    except Exception as e:
        logger.error(f"Exception in telegram_webhook: {e}")
        return {"ok": False}


@router.get("/webhook/whatsapp")
async def whatsapp_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    expected_secret = settings.WEBHOOK_SECRET or "emergent_webhook_secret"
    if hub_mode == "subscribe" and hub_verify_token == expected_secret:
        if hub_challenge:
            try:
                return int(hub_challenge)
            except ValueError:
                return PlainTextResponse(content=hub_challenge)
        return PlainTextResponse(content="1")
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")


@router.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request) -> Dict[str, bool]:
    try:
        body = await request.json()
        entries = body.get("entry", [])
        if not entries:
            return {"ok": True}

        changes = entries[0].get("changes", [])
        if not changes:
            return {"ok": True}

        value = changes[0].get("value", {})
        messages = value.get("messages", [])
        if not messages:
            return {"ok": True}

        incoming_msg = messages[0]
        sender_phone = incoming_msg.get("from")
        text_body = ""
        msg_type = incoming_msg.get("type")
        if msg_type == "text":
            text_body = incoming_msg.get("text", {}).get("body", "")
        else:
            text_body = f"[{msg_type} received]"

        db = get_database()

        try:
            await db["messages"].insert_one({
                "channel": "whatsapp",
                "direction": "inbound",
                "sender_phone": sender_phone,
                "text": text_body,
                "raw": incoming_msg,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        except Exception as dbe:
            logger.error(f"DB error saving whatsapp inbound: {dbe}")

        raw_res = await run_persistent_agent(text_body)
        if isinstance(raw_res, tuple):
            reply_text, _ = raw_res
        elif isinstance(raw_res, dict):
            reply_text = raw_res.get("reply", "")
        else:
            reply_text = str(raw_res)

        phone_id = settings.WHATSAPP_PHONE_ID
        whatsapp_token = settings.WHATSAPP_TOKEN

        if phone_id and whatsapp_token and sender_phone:
            url = f"https://graph.facebook.com/v20.0/{phone_id}/messages"
            headers = {
                "Authorization": f"Bearer {whatsapp_token}",
                "Content-Type": "application/json"
            }
            send_payload = {
                "messaging_product": "whatsapp",
                "to": sender_phone,
                "type": "text",
                "text": {"body": reply_text}
            }
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=send_payload, headers=headers)
                    logger.info(f"WhatsApp message response code: {resp.status_code}")
            except Exception as e:
                logger.error(f"Failed to send WhatsApp message: {e}")

        try:
            await db["messages"].insert_one({
                "channel": "whatsapp",
                "direction": "outbound",
                "recipient_phone": sender_phone,
                "text": reply_text,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        except Exception as dbe:
            logger.error(f"DB error saving whatsapp outbound: {dbe}")

        return {"ok": True}

    except Exception as e:
        logger.error(f"Exception in whatsapp_webhook: {e}")
        return {"ok": False}
