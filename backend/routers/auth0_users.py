from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from db import users_collection, insert_document, find_document, update_document

router = APIRouter(prefix="/api/auth0-users", tags=["auth0-users"])

# Auth0 user model
class Auth0UserCreate(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None
    auth0_id: str
    
class Auth0UserResponse(Auth0UserCreate):
    id: str

@router.post("/", response_model=Auth0UserResponse, status_code=201)
async def sync_auth0_user(user: Auth0UserCreate):
    # Check if user with this auth0_id already exists
    existing_user = await find_document("users", {"auth0_id": user.auth0_id})
    
    if existing_user:
        # Update existing user
        user_dict = user.dict()
        await update_document("users", {"auth0_id": user.auth0_id}, user_dict)
        return {**user_dict, "id": str(existing_user["_id"])}
    
    # Create new user document
    user_dict = user.dict()
    user_id = await insert_document("users", user_dict)
    
    # Return the created user
    return {**user_dict, "id": str(user_id)}

@router.get("/by-email/{email}", response_model=Auth0UserResponse)
async def get_user_by_email(email: str):
    user = await find_document("users", {"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {**user, "id": str(user["_id"])}
