import pytest
from httpx import AsyncClient, ASGITransport
import os

os.environ["USE_MOCK_MONGO"] = "1"
os.environ["JWT_SECRET"] = "testsecretkeytestsecretkeytestsecretkey123"

from app.main import app
from app.database import get_database


@pytest.mark.asyncio
async def test_auth_and_projects_flow():
    db = get_database()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test Stats endpoint
        res = await client.get("/api/stats")
        assert res.status_code == 200
        stats = res.json()
        assert "active_builders" in stats
        assert "apps_created" in stats
        assert "countries" in stats

        # Test Register
        reg_payload = {
            "email": "testbuilder@emergent.sh",
            "password": "Password123!",
            "name": "Alex Builder"
        }
        res = await client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "testbuilder@emergent.sh"
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Duplicate register should fail
        res = await client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 400

        # Test Login
        login_payload = {
            "email": "testbuilder@emergent.sh",
            "password": "Password123!"
        }
        res = await client.post("/api/auth/login", json=login_payload)
        assert res.status_code == 200
        assert "access_token" in res.json()

        # Test Credits endpoint (should start with 100)
        res = await client.get("/api/credits", headers=headers)
        assert res.status_code == 200
        assert res.json()["balance"] == 100

        # Test Credits deduct (5 credits)
        res = await client.post("/api/credits/deduct", json={"amount": 5, "description": "Blueprint"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["balance"] == 95

        # Test Projects CRUD
        # 1. Create project
        proj_payload = {
            "name": "Gym Workout Tracker",
            "description": "Track workout sets, reps and personal records",
            "prompt": "app for tracking my gym workouts"
        }
        res = await client.post("/api/projects", json=proj_payload, headers=headers)
        assert res.status_code == 201
        proj = res.json()
        project_id = proj["id"]
        assert proj["name"] == "Gym Workout Tracker"

        # 2. List projects
        res = await client.get("/api/projects", headers=headers)
        assert res.status_code == 200
        projs = res.json()
        assert len(projs) >= 1

        # 3. Get project detail
        res = await client.get(f"/api/projects/{project_id}", headers=headers)
        assert res.status_code == 200
        assert res.json()["id"] == project_id

        # 4. Fork project
        res = await client.post(f"/api/projects/{project_id}/fork", headers=headers)
        assert res.status_code == 200
        forked = res.json()
        assert "id" in forked
        assert "(Fork)" in forked["name"]

        # 5. Export to github mock
        res = await client.post(f"/api/projects/{project_id}/export-github", headers=headers)
        assert res.status_code == 200
        assert "repository" in res.json()
