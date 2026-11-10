import os
from app.config import settings

client = None
db = None


def get_database():
    global client, db
    if db is not None:
        return db

    # In test mode only, allow mongomock for unit tests
    if os.getenv("USE_MOCK_MONGO", "0") == "1":
        from mongomock_motor import AsyncMongoMockClient
        client = AsyncMongoMockClient()
        db = client["emergent_test"]
        return db

    # Real MongoDB connection via Motor AsyncIOMotorClient
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_name = settings.MONGODB_URI.split("/")[-1].split("?")[0] or "emergent"
    db = client[db_name]
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
