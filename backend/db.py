import os
import motor.motor_asyncio
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB connection string from environment variables
# Default to a local MongoDB instance if not provided
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "vivi_db")

# Create async client
async_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
async_db = async_client[DB_NAME]

# Create sync client (for utility operations)
sync_client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
sync_db = sync_client[DB_NAME]

# Collection references (add more as needed)
users_collection = async_db.users
items_collection = async_db.items

# Database connection test
async def test_connection():
    try:
        # The ismaster command is cheap and does not require auth
        await async_client.admin.command('ismaster')
        return {"status": "Connected to MongoDB"}
    except Exception as e:
        return {"status": "Failed to connect to MongoDB", "error": str(e)}

# Helper function to get a collection by name
def get_collection(collection_name):
    return async_db[collection_name]

# Example database operations

async def insert_document(collection_name, document):
    """Insert a single document into a collection"""
    collection = get_collection(collection_name)
    result = await collection.insert_one(document)
    return result.inserted_id

async def find_document(collection_name, query):
    """Find a single document matching the query"""
    collection = get_collection(collection_name)
    return await collection.find_one(query)

async def find_documents(collection_name, query, limit=0, skip=0, sort=None):
    """Find documents matching the query with pagination"""
    collection = get_collection(collection_name)
    cursor = collection.find(query).skip(skip).limit(limit)
    if sort:
        cursor = cursor.sort(sort)
    return await cursor.to_list(length=limit if limit > 0 else None)

async def update_document(collection_name, query, update_data):
    """Update a single document matching the query"""
    collection = get_collection(collection_name)
    result = await collection.update_one(query, {"$set": update_data})
    return result.modified_count

async def delete_document(collection_name, query):
    """Delete a single document matching the query"""
    collection = get_collection(collection_name)
    result = await collection.delete_one(query)
    return result.deleted_count 