from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    name: Optional[str] = "Builder"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Credits / Balance Models
class CreditHistoryItem(BaseModel):
    amount: int
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreditAccount(BaseModel):
    user_id: str
    balance: int = 100
    history: List[CreditHistoryItem] = Field(default_factory=list)


# Project Models
class GeneratedFile(BaseModel):
    path: str
    content: str


class BlueprintModel(BaseModel):
    data_models: List[Dict[str, Any]] = Field(default_factory=list)
    api_endpoints: List[Dict[str, Any]] = Field(default_factory=list)
    pages: List[Dict[str, Any]] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    tech_notes: Optional[str] = ""
    needs_clarification: Optional[bool] = False
    questions: Optional[List[str]] = Field(default_factory=list)


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = ""
    prompt: Optional[str] = ""


class ProjectOut(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str] = ""
    status: str = "draft"
    design_system: Optional[Dict[str, Any]] = None
    current_version: int = 1
    credits_used: int = 0
    forked_from: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProjectDetail(ProjectOut):
    blueprint: Optional[BlueprintModel] = None
    files: List[GeneratedFile] = Field(default_factory=list)


# Generation Request & Response Models
class GenerateBlueprintRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=4000)
    project_id: Optional[str] = None


class GenerateCodeRequest(BaseModel):
    project_id: str
    blueprint: BlueprintModel
    prompt: Optional[str] = ""


class VersionOut(BaseModel):
    version_number: int
    project_id: str
    created_at: datetime
    files_count: int


class DeployRequest(BaseModel):
    project_id: str


class DeployResponse(BaseModel):
    project_id: str
    url: str
    status: str
    deployed_at: datetime
