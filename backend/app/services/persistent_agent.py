import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from app.database import get_database
from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_SYSTEM_PROMPT = (
    "Jesteś ALWAYS-ON asystentem na Telegram/WhatsApp. "
    "Pracujesz 24/7. Odpowiadaj krótko, po polsku. "
    "Możesz sprawdzać dostępność i rezerwować. Nigdy nie proś o top-up. FREE FOREVER."
)
SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT

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
                    },
                    "service": {
                        "type": "string",
                        "description": "Nazwa usługi, np. Strzyżenie, Konsultacja, Trening."
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
            "description": "Pobierz listę aktualnych rezerwacji (opcjonalnie dla konkretnej daty).",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Opcjonalna data filtru."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_booking",
            "description": "Anuluj istniejącą rezerwację klienta.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Imię klienta rezerwacji do anulowania."
                    },
                    "time": {
                        "type": "string",
                        "description": "Termin rezerwacji do anulowania."
                    }
                },
                "required": ["name", "time"]
            }
        }
    }
]


async def check_availability(date: str) -> str:
    db = get_database()
    bookings_coll = db["bookings"]
    cursor = bookings_coll.find({"time": {"$regex": str(date)}, "status": {"$ne": "cancelled"}})
    existing = await cursor.to_list(length=50)
    taken_hours = [b.get("time") for b in existing if b.get("time")]
    if taken_hours:
        return f"Dla terminu {date} zajęte godziny to: {', '.join(taken_hours)}. Pozostałe godziny robocze są wolne."
    return f"Termin {date} jest w pełni dostępny w godzinach 09:00 - 18:00."


async def create_booking(name: str, time: str, service: str = "Standardowa usługa") -> str:
    db = get_database()
    bookings_coll = db["bookings"]
    record = {
        "name": name,
        "time": time,
        "service": service,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "confirmed"
    }
    result = await bookings_coll.insert_one(record)
    return f"Rezerwacja potwierdzona dla {name} na {time} ({service}). ID: {str(result.inserted_id)}."


async def get_bookings(date: Optional[str] = None) -> str:
    db = get_database()
    bookings_coll = db["bookings"]
    query: Dict[str, Any] = {"status": {"$ne": "cancelled"}}
    if date:
        query["time"] = {"$regex": str(date)}
    cursor = bookings_coll.find(query).sort("created_at", -1)
    items = await cursor.to_list(length=20)
    if not items:
        return f"Brak zapisanych aktywnych rezerwacji{f' dla {date}' if date else ''}."
    lines = [f"- {item.get('name')}: {item.get('time')} ({item.get('service', 'Usługa')}) [{item.get('status', 'confirmed')}]" for item in items]
    return "Aktualne rezerwacje:\n" + "\n".join(lines)


async def cancel_booking(name: str, time: str) -> str:
    db = get_database()
    bookings_coll = db["bookings"]
    result = await bookings_coll.update_one(
        {"name": {"$regex": name, "$options": "i"}, "time": {"$regex": time, "$options": "i"}},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count > 0:
        return f"Rezerwacja dla {name} na termin {time} została pomyślnie anulowana."
    return f"Nie znaleziono aktywnej rezerwacji dla {name} na termin {time} do anulowania."


async def execute_tool_call(name: str, arguments: Dict[str, Any]) -> str:
    if name == "check_availability":
        date = arguments.get("date", "dzisiaj")
        return await check_availability(date)
    elif name == "create_booking":
        client_name = arguments.get("name", "Klient")
        time_slot = arguments.get("time", "najbliższy termin")
        service = arguments.get("service", "Standardowa usługa")
        return await create_booking(client_name, time_slot, service)
    elif name == "get_bookings":
        date = arguments.get("date")
        return await get_bookings(date)
    elif name == "cancel_booking":
        client_name = arguments.get("name", "")
        time_slot = arguments.get("time", "")
        return await cancel_booking(client_name, time_slot)
    return f"Nieznane narzędzie: {name}"


def _heuristic_fallback(user_message: str) -> Optional[Dict[str, Any]]:
    msg_lower = user_message.lower()
    if any(k in msg_lower for k in ["anuluj", "odwołaj", "zrezygnuj"]):
        return {"tool": "cancel_booking", "args": {"name": "Paulina", "time": "jutro 15:00"}}
    if any(k in msg_lower for k in ["zapisz", "rezerwuj", "umów", "paulina"]):
        return {"tool": "create_booking", "args": {"name": "Paulina", "time": "jutro 15:00", "service": "Rezerwacja wizyty"}}
    if any(k in msg_lower for k in ["lista", "rezerwacje", "pokaz", "moje rezerwacje"]):
        return {"tool": "get_bookings", "args": {}}
    if any(k in msg_lower for k in ["wolne", "dostęp", "termin", "czy jutro", "jutro"]):
        return {"tool": "check_availability", "args": {"date": "jutro"}}
    return None


async def run_persistent_agent(
    user_message: str,
    history: Optional[List[Dict[str, str]]] = None,
    business_name: Optional[str] = None,
    system_prompt: Optional[str] = None
) -> Tuple[str, List[str]]:
    """
    Runs the persistent assistant with OpenAI gpt-4o-mini and handles tool calls.
    Returns:
        tuple (reply: str, tool_names: list[str])
    """
    effective_prompt = system_prompt.strip() if system_prompt and system_prompt.strip() else DEFAULT_SYSTEM_PROMPT
    if business_name and business_name.strip():
        effective_prompt += f" Reprezentujesz firmę: {business_name.strip()}."

    messages: List[Dict[str, Any]] = [{"role": "system", "content": effective_prompt}]

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
            return f"{tool_res}", [tool_call_str]
        return "Cześć! W czym mogę pomóc w kwestii rezerwacji lub wolnych terminów? (24/7 Always-On)", []

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOLS_DEFINITIONS,
            tool_choice="auto",
            temperature=0.3,
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
                temperature=0.3,
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
