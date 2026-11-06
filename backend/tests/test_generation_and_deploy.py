import pytest
from httpx import AsyncClient, ASGITransport
import os

os.environ["USE_MOCK_MONGO"] = "1"
os.environ["JWT_SECRET"] = "testsecretkeytestsecretkeytestsecretkey123"

from app.main import app


@pytest.mark.asyncio
async def test_generation_and_deploy_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register user
        res = await client.post("/api/auth/register", json={
            "email": "agentuser@emergent.sh",
            "password": "Password123!",
            "name": "Sam Agent"
        })
        assert res.status_code == 200
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Test vague prompt -> needs clarification
        vague_res = await client.post(
            "/api/generate-blueprint",
            json={"prompt": "make an app"},
            headers=headers
        )
        assert vague_res.status_code == 200
        vague_data = vague_res.json()
        assert vague_data["needs_clarification"] is True
        assert len(vague_data["questions"]) > 0

        # Create project for detailed generation
        proj_res = await client.post("/api/projects", json={"name": "Gym Workout Tracker"}, headers=headers)
        assert proj_res.status_code == 201
        project_id = proj_res.json()["id"]

        # 2. Test detailed prompt -> valid blueprint & credit deduction
        clear_res = await client.post(
            "/api/generate-blueprint",
            json={"prompt": "app for tracking my gym workouts", "project_id": project_id},
            headers=headers
        )
        assert clear_res.status_code == 200
        blueprint_data = clear_res.json()
        assert blueprint_data["needs_clarification"] is False
        assert len(blueprint_data["pages"]) > 0
        assert len(blueprint_data["data_models"]) > 0

        # Check credits deducted by 5
        cred_res = await client.get("/api/credits", headers=headers)
        assert cred_res.json()["balance"] == 95

        # 3. Test generate-code endpoint
        code_res = await client.post(
            "/api/generate-code",
            json={
                "project_id": project_id,
                "blueprint": blueprint_data,
                "prompt": "app for tracking my gym workouts"
            },
            headers=headers
        )
        assert code_res.status_code == 200
        code_data = code_res.json()
        assert code_data["status"] == "success"
        assert code_data["version_number"] == 2
        assert len(code_data["files"]) >= 3
        assert len(code_data["agent_logs"]) == 5
        # Verify agents ran in sequence: Architect, Designer, Developer, Integration, PM
        agents_run = [log["agent"] for log in code_data["agent_logs"]]
        assert agents_run == ["Architect Agent", "Designer Agent", "Developer Agent", "Integration Agent", "PM Agent"]

        # 4. Test Deploy endpoint
        deploy_res = await client.post("/api/deploy", json={"project_id": project_id}, headers=headers)
        assert deploy_res.status_code == 200
        deploy_data = deploy_res.json()
        assert deploy_data["status"] == "deployed"
        assert "emergent.app" in deploy_data["url"]

        # 5. Test Rollback endpoint back to version 1
        rollback_res = await client.post(f"/api/projects/{project_id}/rollback/1", headers=headers)
        assert rollback_res.status_code == 200
        assert rollback_res.json()["version_number"] == 1
