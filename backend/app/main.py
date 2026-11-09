import os
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

# Parse origins from environment, split by comma if string, and include production frontends
raw_cors = os.getenv("CORS_ORIGINS", "")
origins_list: list[str] = []

if isinstance(raw_cors, str) and raw_cors.strip():
    # If comma-separated or json string
    if raw_cors.startswith("[") and raw_cors.endswith("]"):
        try:
            import json
            origins_list = json.loads(raw_cors)
        except Exception:
            origins_list = [o.strip() for o in raw_cors.strip("[]").split(",") if o.strip()]
    else:
        origins_list = [o.strip() for o in raw_cors.split(",") if o.strip()]
elif settings.CORS_ORIGINS:
    origins_list = list(settings.CORS_ORIGINS)

# Always include development origins and https://frontend-84ui.vercel.app for testing
default_allowed = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "https://frontend-84ui.vercel.app",
    "*"
]
for item in default_allowed:
    if item not in origins_list:
        origins_list.append(item)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list if "*" not in origins_list else ["*"],
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
