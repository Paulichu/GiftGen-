import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from app.database import get_database
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are ALWAYS-ON assistant on Telegram/WhatsApp. "
    "Work 24/7 even when owner closes browser. "
    "Answer short, in Polish. "
    "Use tools for bookings. "
    "Never say you are AI model."
)

TOOLS_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Sprawdź dostępne terminy rezerwacji dla danej daty.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Data do sprawdzenia, np. '2025-05-10', 'jutro', 'dzisiaj'."
                    }
                },
                "required": ["date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_booking",
            "description": "Utwórz nową rezerwację.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Imię lub nazwisko klienta."
                    },
                    "time": {
                        "type": "string",
                        "description": "Data i godzina rezerwacji, np. '2025-05-10 15:00', 'jutro 14:00'."
                    }
                },
                "required": ["name", "time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_bookings",
            "description": "Pobierz listę aktualnych rezerwacji.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]


async def check_availability(date: str) -> str:
    db = get_database()
    bookings_coll = db["bookings"]
    cursor = bookings_coll.find({"time": {"$regex": str(date)}})
    existing = await cursor.to_list(length=50)
    taken_hours = [b.get("time") for b in existing if b.get("time")]
    if taken_hours:
        return f"Dla terminu {date} zajęte godziny to: {', '.join(taken_hours)}. Dostępne pozostałe godziny robocze."
    return f"Termin {date} jest w pełni dostępny w godzinach 09:00 - 18:00."


async def create_booking(name: str, time: str) -> str:
    db = get_database()
    bookings_coll = db["bookings"]
    record = {
        "name": name,
        "time": time,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "confirmed"
    }
    result = await bookings_coll.insert_one(record)
    return f"Rezerwacja potwierdzona dla {name} na {time} (ID: {str(result.inserted_id)})."


async def get_bookings() -> str:
    db = get_database()
    bookings_coll = db["bookings"]
    cursor = bookings_coll.find({}).sort("created_at", -1)
    items = await cursor.to_list(length=20)
    if not items:
        return "Brak zapisanych rezerwacji w systemie."
    lines = [f"- {item.get('name')}: {item.get('time')} [{item.get('status', 'confirmed')}]" for item in items]
    return "Aktualne rezerwacje:\n" + "\n".join(lines)


async def execute_tool_call(name: str, arguments: Dict[str, Any]) -> str:
    if name == "check_availability":
        date = arguments.get("date", "dzisiaj")
        return await check_availability(date)
    elif name == "create_booking":
        client_name = arguments.get("name", "Klient")
        time_slot = arguments.get("time", "najbliższy termin")
        return await create_booking(client_name, time_slot)
    elif name == "get_bookings":
        return await get_bookings()
    return f"Nieznane narzędzie: {name}"


def _heuristic_fallback(user_message: str) -> Optional[Dict[str, Any]]:
    msg_lower = user_message.lower()
    if any(k in msg_lower for k in ["wolne", "dostęp", "jutro", "termin"]):
        return {"tool": "check_availability", "args": {"date": "jutro"}}
    if any(k in msg_lower for k in ["zapisz", "rezerwuj", "umów", "paulina"]):
        return {"tool": "create_booking", "args": {"name": "Paulina", "time": "jutro 15:00"}}
    if any(k in msg_lower for k in ["lista", "rezerwacje", "pokaz"]):
        return {"tool": "get_bookings", "args": {}}
    return None


async def run_persistent_agent(
    user_message: str,
    history: Optional[List[Dict[str, str]]] = None
) -> Tuple[str, List[str]]:
    """
    Runs the persistent assistant with OpenAI gpt-4o-mini and handles tool calls.
    Returns:
        tuple (reply: str, tool_names: list[str])
    """
    messages: List[Dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]

    if history:
        for item in history:
            role = item.get("role", "user")
            content = item.get("content", "")
            if role in ["user", "assistant", "system"]:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_message})

    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.strip() == "":
        heuristic = _heuristic_fallback(user_message)
        if heuristic:
            tool_name = heuristic["tool"]
            args = heuristic["args"]
            tool_res = await execute_tool_call(tool_name, args)
            tool_call_str = f"{tool_name}({json.dumps(args)})"
            return f"Cześć! {tool_res}", [tool_call_str]
        return "Cześć! W czym mogę pomóc w kwestii rezerwacji lub wolnych terminów?", []

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOLS_DEFINITIONS,
            tool_choice="auto",
            temperature=0.2,
        )

        choice = response.choices[0]
        response_msg = choice.message

        if response_msg.tool_calls:
            tool_calls_executed: List[str] = []
            messages.append(response_msg)

            for tool_call in response_msg.tool_calls:
                fn_name = tool_call.function.name
                raw_args = tool_call.function.arguments or "{}"
                try:
                    fn_args = json.loads(raw_args)
                except Exception:
                    fn_args = {}

                tool_calls_executed.append(f"{fn_name}({raw_args})")
                tool_result = await execute_tool_call(fn_name, fn_args)

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": fn_name,
                    "content": tool_result
                })

            second_response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.2,
            )
            final_content = second_response.choices[0].message.content or "Gotowe."
            return final_content, tool_calls_executed

        return response_msg.content or "Gotowe.", []

    except Exception as e:
        logger.error(f"Error in run_persistent_agent OpenAI call: {e}")
        heuristic = _heuristic_fallback(user_message)
        if heuristic:
            tool_name = heuristic["tool"]
            args = heuristic["args"]
            tool_res = await execute_tool_call(tool_name, args)
            return f"{tool_res}", [f"{tool_name}({json.dumps(args)})"]
        return "Przepraszam, chwilowo nie mogę sprawdzić terminarza. Proszę o ponowny kontakt za chwilę.", []
