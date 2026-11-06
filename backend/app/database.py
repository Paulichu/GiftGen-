import os
from app.config import settings

client = None
db = None


def get_database():
    global client, db
    if db is not None:
        return db

    # If mock flag or test environment, or if connection to live mongodb fails gracefully
    use_mock = os.getenv("USE_MOCK_MONGO", "0") == "1"

    if use_mock:
        from mongomock_motor import AsyncMongoMockClient
        client = AsyncMongoMockClient()
        db = client["emergent_test"]
        return db

    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1000)
        db_name = settings.MONGODB_URI.split("/")[-1].split("?")[0] or "emergent"
        db = client[db_name]
        return db
    except Exception:
        from mongomock_motor import AsyncMongoMockClient
        client = AsyncMongoMockClient()
        db = client["emergent"]
        return db


def set_mock_database(mock_db):
    global db
    db = mock_db


def close_database():
    global client, db
    if client is not None:
        client.close()
        client = None
        db = None
