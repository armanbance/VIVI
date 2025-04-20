from fastapi import APIRouter, Depends, HTTPException, Body, status
from pydantic import BaseModel
import logging

# Import the users collection from your db setup
try:
    from db import users_collection
except ImportError:
    logging.error("Failed to import users_collection from db.py. Ensure db.py exists and is correctly configured.", exc_info=True)
    users_collection = None # Handle this case appropriately

# --- Placeholder for Authentication Dependency ---
# Replace this with your actual Auth0 token validation logic
async def get_current_user_id() -> str:
    """Placeholder: Replace with actual Auth0 'sub' extraction."""
    logging.warning("Using placeholder authentication dependency (get_current_user_id).")
    return "auth0|replace_with_real_sub"
# --- End Placeholder ---

router = APIRouter(
    prefix="/users",
    tags=["User Stats"],
)

class WordCountRequest(BaseModel):
    word_count: int

@router.post("/word_count", status_code=status.HTTP_204_NO_CONTENT)
async def update_user_word_count(
    payload: WordCountRequest = Body(...),
    user_id: str = Depends(get_current_user_id) # Inject authenticated user ID
):
    """
    Updates the total word count read by the authenticated user.
    Uses atomic $inc operation and upserts the user if they don't exist.
    """
    if users_collection is None:
         raise HTTPException(
              status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
              detail="Database connection is not configured correctly."
         )

    if payload.word_count <= 0:
        logging.info(f"Received non-positive word count ({payload.word_count}) for user {user_id}. Skipping update.")
        return # Processed successfully by skipping

    try:
        # Ensure the field name "auth0_id" matches how you store the Auth0 'sub' in MongoDB
        result = await users_collection.update_one(
            {"auth0_id": user_id}, # Use the correct field name for lookup
            {"$inc": {"words_read": payload.word_count}} # Use the correct field name for increment
        )
        # Note: result.upserted_id will always be None now since upsert=False
        logging.info(f"Word count update status for user {user_id}: Matched={result.matched_count}, Modified={result.modified_count}")

    except Exception as e:
        logging.error(f"Error updating word count for user {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update word count in database."
        )
    return
