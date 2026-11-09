import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
import os

os.environ["USE_MOCK_MONGO"] = "1"
os.environ["JWT_SECRET"] = "testsecretkeytestsecretkeytestsecretkey123"

from app.main import app
from app.database import get_database


@pytest.mark.asyncio
async def test_health_check_returns_persistent_agent():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        assert data.get("persistent_agent") == "online"


@pytest.mark.asyncio
async def test_telegram_webhook_success_with_mocked_agent():
    db = get_database()
    transport = ASGITransport(app=app)
    fake_update = {
        "update_id": 10001,
        "message": {
            "message_id": 1,
            "chat": {"id": 999, "type": "private"},
            "from": {"id": 999, "first_name": "Paulina", "is_bot": False},
            "date": 1441645532,
            "text": "Czy jutro 15:00 wolne?"
        }
    }

    with patch("app.routers.persistent.run_persistent_agent", new_callable=AsyncMock) as mock_agent:
        mock_agent.return_value = "Termin jutro o 15:00 jest wolny!"

        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/agent/webhook/telegram", json=fake_update)
            assert response.status_code == 200
            data = response.json()
            assert data == {"ok": True}
            mock_agent.assert_called_once_with("Czy jutro 15:00 wolne?")


@pytest.mark.asyncio
async def test_whatsapp_verify_and_webhook():
    db = get_database()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # GET verification with token mismatch -> 403
        resp = await ac.get("/api/agent/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345")
        assert resp.status_code == 403

        # POST whatsapp payload
        fake_payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "123",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "1234", "phone_number_id": "phone_1"},
                        "messages": [{
                            "from": "48123456789",
                            "id": "wamid.123",
                            "timestamp": "12345678",
                            "type": "text",
                            "text": {"body": "Zapisz mnie na jutro"}
                        }]
                    },
                    "field": "messages"
                }]
            }]
        }

        with patch("app.routers.persistent.run_persistent_agent", new_callable=AsyncMock) as mock_agent:
            mock_agent.return_value = "Zapisano rezerwację."
            post_resp = await ac.post("/api/agent/webhook/whatsapp", json=fake_payload)
            assert post_resp.status_code == 200
            assert post_resp.json() == {"ok": True}
