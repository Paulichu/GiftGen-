from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.auth import get_current_user
from app.models.schemas import ProjectCreate, ProjectOut, ProjectDetail, GeneratedFile, BlueprintModel

router = APIRouter(prefix="/api/projects", tags=["projects"])


def serialize_project(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "owner_id": str(doc["owner_id"]),
        "name": doc.get("name", "Untitled App"),
        "description": doc.get("description", ""),
        "status": doc.get("status", "draft"),
        "design_system": doc.get("design_system"),
        "current_version": doc.get("current_version", 1),
        "credits_used": doc.get("credits_used", 0),
        "forked_from": doc.get("forked_from"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc)),
    }


@router.get("", response_model=List[ProjectOut])
async def list_projects(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.projects.find({"owner_id": current_user["id"]}).sort("updated_at", -1)
    projects = []
    async for doc in cursor:
        projects.append(serialize_project(doc))
    return projects


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(project_in: ProjectCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    now = datetime.now(timezone.utc)
    new_doc = {
        "owner_id": current_user["id"],
        "name": project_in.name,
        "description": project_in.description or "",
        "status": "ready",
        "design_system": None,
        "current_version": 1,
        "credits_used": 0,
        "forked_from": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.projects.insert_one(new_doc)
    new_doc["_id"] = result.inserted_id

    # Create initial version 1
    await db.versions.insert_one({
        "project_id": str(result.inserted_id),
        "version_number": 1,
        "blueprint": None,
        "files": [],
        "created_at": now,
    })

    return serialize_project(new_doc)


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        query_id = ObjectId(project_id)
    except Exception:
        query_id = project_id

    project = await db.projects.find_one({"_id": query_id, "owner_id": current_user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    serialized = serialize_project(project)

    # Retrieve active version files and blueprint
    current_ver = await db.versions.find_one(
        {"project_id": str(project["_id"]), "version_number": project.get("current_version", 1)}
    )

    files = []
    blueprint = None
    if current_ver:
        files = current_ver.get("files", [])
        blueprint = current_ver.get("blueprint")

    return {
        **serialized,
        "blueprint": blueprint,
        "files": files,
    }


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, project_in: ProjectCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        query_id = ObjectId(project_id)
    except Exception:
        query_id = project_id

    now = datetime.now(timezone.utc)
    result = await db.projects.find_one_and_update(
        {"_id": query_id, "owner_id": current_user["id"]},
        {"$set": {"name": project_in.name, "description": project_in.description, "updated_at": now}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_project(result)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        query_id = ObjectId(project_id)
    except Exception:
        query_id = project_id

    result = await db.projects.delete_one({"_id": query_id, "owner_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.versions.delete_many({"project_id": project_id})
    await db.blueprints.delete_many({"project_id": project_id})
    await db.agent_logs.delete_many({"project_id": project_id})
    return None
