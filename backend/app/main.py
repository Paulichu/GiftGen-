from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import close_database
from app.routers import auth, projects, versions, stats, generation, persistent

app = FastAPI(
    title="Emergent Clone API",
    description="Full-stack AI App Builder API backend with Persistent Agent",
    version="1.0.0",
)

cors_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(versions.router)
app.include_router(stats.router)
app.include_router(generation.router)
app.include_router(persistent.router)


@app.on_event("shutdown")
async def shutdown_event():
    close_database()


@app.get("/health")
async def health():
    return {"status": "ok", "persistent_agent": "online"}
