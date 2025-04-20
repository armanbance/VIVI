from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from db import users_collection, insert_document, find_document, update_document

router = APIRouter(prefix="/api/auth0-users", tags=["auth0-users"])

# Auth0 user model
class Auth0UserCreate(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None
    auth0_id: str
    transcripts: List[str] = []
    characters: List[str] = []
    
class Auth0UserResponse(Auth0UserCreate):
    id: str

class CharacterListResponse(BaseModel):
    characters: List[str]

@router.get("/my-characters", response_model=CharacterListResponse)
async def get_my_characters():
    """
    Retrieves the character list for the hardcoded user 'armanbance@gmail.com'.
    (For testing purposes - eventually needs authentication)
    """
    target_email = "armanbance@gmail.com" # Hardcoded email
    print(f"Attempting to fetch characters for hardcoded user: {target_email}")

    user_doc = await find_document("users", {"email": target_email})

    if not user_doc:
        print(f"Hardcoded user '{target_email}' not found.")
        # Decide: return empty list or 404? Let's return empty for simplicity now.
        # raise HTTPException(status_code=404, detail="User not found")
        return CharacterListResponse(characters=[]) # Return empty list if user not found

    # Extract the characters list, default to empty list if field is missing
    characters_list = user_doc.get('characters', [])

    print(f"Found characters for {target_email}: {characters_list}")
    return CharacterListResponse(characters=characters_list)

@router.post("/", response_model=Auth0UserResponse, status_code=201)
async def sync_auth0_user(user: Auth0UserCreate):
    try:
        # Log the request for debugging
        print(f"Received user sync request: {user}")
        
        # Check if user with this auth0_id already exists
        existing_user = await find_document("users", {"auth0_id": user.auth0_id})
        
        if existing_user:
            # Update existing user
            user_dict = user.dict()
            await update_document("users", {"auth0_id": user.auth0_id}, user_dict)
            return {**user_dict, "id": str(existing_user["_id"])}
        
        # Create new user document
        user_dict = user.dict()
        # Ensure transcripts field is included for new users (will be [])
        user_id = await insert_document("users", user_dict)
        
        # Return the created user
        # The user_dict already contains 'transcripts: []'
        return {**user_dict, "id": str(user_id)}
    except Exception as e:
        # Properly handle and log errors
        print(f"Error in sync_auth0_user: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to sync user: {str(e)}"
        )

@router.get("/by-email/{email}", response_model=Auth0UserResponse)
async def get_user_by_email(email: str):
    user = await find_document("users", {"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {**user, "id": str(user["_id"])}
