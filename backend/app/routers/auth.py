from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.models.schemas import UserCreate, UserLogin, Token, UserOut
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    db = get_database()
    existing = await db.users.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    now = datetime.now(timezone.utc)
    user_doc = {
        "email": user_in.email.lower(),
        "password_hash": hash_password(user_in.password),
        "name": user_in.name or user_in.email.split("@")[0].capitalize(),
        "created_at": now,
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Initialize 100 credits for new user
    await db.credits.insert_one({
        "user_id": user_id,
        "balance": 100,
        "history": [
            {
                "amount": 100,
                "description": "Welcome bonus credits",
                "created_at": now,
            }
        ]
    })

    user_out = UserOut(
        id=user_id,
        email=user_doc["email"],
        name=user_doc["name"],
        created_at=now,
    )
    access_token = create_access_token({"sub": user_id, "email": user_doc["email"]})
    return Token(access_token=access_token, user=user_out)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    user_out = UserOut(
        id=user_id,
        email=user["email"],
        name=user.get("name", "Builder"),
        created_at=user.get("created_at", datetime.now(timezone.utc)),
    )
    access_token = create_access_token({"sub": user_id, "email": user["email"]})
    return Token(access_token=access_token, user=user_out)
