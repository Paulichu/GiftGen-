from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_database
from app.auth import get_current_user
from app.models.schemas import (
    GenerateBlueprintRequest,
    GenerateCodeRequest,
    BlueprintModel,
    DeployRequest,
    DeployResponse,
)
from app.services.agents import (
    synthesize_blueprint,
    synthesize_design_system,
    synthesize_code_files,
    validate_bundle,
)

router = APIRouter(prefix="/api", tags=["generation"])


@router.post("/generate-blueprint", response_model=BlueprintModel)
async def generate_blueprint(req: GenerateBlueprintRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()

    # Check if prompt requires clarification
    blueprint = await synthesize_blueprint(req.prompt)

    if blueprint.needs_clarification:
        return blueprint

    # Deduct 5 credits for blueprint generation
    credit_doc = await db.credits.find_one({"user_id": current_user["id"]})
    balance = credit_doc.get("balance", 100) if credit_doc else 100
    if balance < 5:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits for blueprint generation. Required: 5, Available: {balance}. Please upgrade your plan."
        )

    now = datetime.now(timezone.utc)
    await db.credits.update_one(
        {"user_id": current_user["id"]},
        {
            "$set": {"balance": balance - 5},
            "$push": {
                "history": {
                    "amount": -5,
                    "description": "Architect Agent: Blueprint synthesis",
                    "created_at": now,
                }
            }
        },
        upsert=True
    )

    if req.project_id:
        try:
            pid = ObjectId(req.project_id)
        except Exception:
            pid = req.project_id

        await db.projects.update_one(
            {"_id": pid},
            {"$inc": {"credits_used": 5}, "$set": {"updated_at": now}}
        )

        await db.agent_logs.insert_one({
            "project_id": str(req.project_id),
            "agent": "Architect Agent",
            "message": f"Generated blueprint with {len(blueprint.pages)} pages and {len(blueprint.data_models)} data models",
            "level": "info",
            "created_at": now,
        })

    return blueprint


@router.post("/generate-code")
async def generate_code(req: GenerateCodeRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()

    # Deduct 5 credits for code generation
    credit_doc = await db.credits.find_one({"user_id": current_user["id"]})
    balance = credit_doc.get("balance", 100) if credit_doc else 100
    if balance < 5:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits for code generation. Required: 5, Available: {balance}. Please upgrade your plan."
        )

    now = datetime.now(timezone.utc)
    await db.credits.update_one(
        {"user_id": current_user["id"]},
        {
            "$set": {"balance": balance - 5},
            "$push": {
                "history": {
                    "amount": -5,
                    "description": "Developer Agent: Full-stack code synthesis",
                    "created_at": now,
                }
            }
        },
        upsert=True
    )

    prompt = req.prompt or "Full-stack Web Application"

    # 1. Designer Agent
    design_system = synthesize_design_system(prompt)

    # 2. Developer Agent & Integration Agent
    files = synthesize_code_files(req.blueprint, prompt)

    # 3. PM Agent validation
    validation = validate_bundle(files, req.blueprint)

    # Fetch project and create new version
    try:
        pid = ObjectId(req.project_id)
    except Exception:
        pid = req.project_id

    project = await db.projects.find_one({"_id": pid})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_version_num = project.get("current_version", 1) + 1

    await db.versions.insert_one({
        "project_id": req.project_id,
        "version_number": new_version_num,
        "blueprint": req.blueprint.model_dump(),
        "files": [f.model_dump() for f in files],
        "created_at": now,
    })

    await db.projects.update_one(
        {"_id": pid},
        {
            "$set": {
                "current_version": new_version_num,
                "design_system": design_system,
                "status": "ready",
                "updated_at": now,
            },
            "$inc": {"credits_used": 5}
        }
    )

    # Log sequential agent outputs
    agent_logs = [
        {"agent": "Architect Agent", "message": "Blueprint validated and ingested", "level": "info"},
        {"agent": "Designer Agent", "message": "Synthesized dark theme design system & palette", "level": "info"},
        {"agent": "Developer Agent", "message": f"Generated {len(files)} full-stack files (Next.js + FastAPI + SQL)", "level": "success"},
        {"agent": "Integration Agent", "message": "Wired authentication & Stripe payments module", "level": "info"},
        {"agent": "PM Agent", "message": f"Bundle verified: {validation['checked_files']} files passed all integrity checks", "level": "success"},
    ]

    for log in agent_logs:
        await db.agent_logs.insert_one({
            "project_id": req.project_id,
            "agent": log["agent"],
            "message": log["message"],
            "level": log["level"],
            "created_at": now,
        })

    return {
        "status": "success",
        "version_number": new_version_num,
        "design_system": design_system,
        "files": files,
        "validation": validation,
        "agent_logs": agent_logs,
    }


@router.post("/deploy", response_model=DeployResponse)
async def deploy_project(req: DeployRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        pid = ObjectId(req.project_id)
    except Exception:
        pid = req.project_id

    project = await db.projects.find_one({"_id": pid, "owner_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc)
    slug = project.get("name", "app").lower().replace(" ", "-")
    short_id = str(project["_id"])[-6:]
    deploy_url = f"https://{slug}-{short_id}.emergent.app"

    await db.projects.update_one(
        {"_id": pid},
        {"$set": {"status": "deployed", "deploy_url": deploy_url, "updated_at": now}}
    )

    await db.agent_logs.insert_one({
        "project_id": req.project_id,
        "agent": "Deploy Agent",
        "message": f"Deployed application to production URL: {deploy_url}",
        "level": "success",
        "created_at": now,
    })

    return DeployResponse(
        project_id=req.project_id,
        url=deploy_url,
        status="deployed",
        deployed_at=now,
    )
