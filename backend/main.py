from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import time
from openai import OpenAI, AsyncOpenAI
import mediapipe as mp
import os
from dotenv import load_dotenv
import tempfile
from db import test_connection, users_collection
from routers import auth0_users
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from json import JSONEncoder
import re # Import regex for potential cleanup later if needed


# ========== CONFIG ==========

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client2 = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="HackDavis API")

FREE_PIK = os.getenv("FREE_PIK")

# ========== Pydantic Models ==========
class GenerateImageRequest(BaseModel):
    title: str
    transcript: str | None = None


# ========== CORS CONFIG ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing; lock down in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_analytics = {
    "total_words": 0,
    "num_queries": 0,
    "dictlist": []
}

# ========== HELPER FUNCTIONS ==========

def update_session_analytics(transcribed_text: str):
    """Update total words and query count based on a new transcript."""
    word_count = len(transcribed_text.split())
    session_analytics["total_words"] += word_count
    session_analytics["num_queries"] += 1
    session_analytics["dictlist"].append({"query": session_analytics["num_queries"], "words": word_count})
    print(f"🧮 Updated analytics: {word_count} new words.")

def is_looking_at_camera():
    gazing = 0
    not_gazing = 0
    cap = cv2.VideoCapture(1)

    if not cap.isOpened():
        print("❌ Failed to open webcam.")
        return False

    mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6
    )

    print("🟡 Checking for direct eye contact...")

    looking = False
    frames_checked = 0

    for i in range(10):  # ~5 seconds at 20 FPS
        ret, frame = cap.read()
        if not ret:
            print(f"[Frame {i}] ❌ Frame grab failed.")
            continue

        frames_checked += 1
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = mp_face_mesh.process(rgb)

        if results.multi_face_landmarks:
            print(f"[Frame {i}] 👁️ Face mesh detected.")
            landmarks = results.multi_face_landmarks[0].landmark

            # Landmark indices
            LEFT_EYE = (33, 133)
            RIGHT_EYE = (362, 263)
            LEFT_IRIS = 468
            RIGHT_IRIS = 473

            def is_eye_centered(eye_corners, iris_idx):
                x1 = landmarks[eye_corners[0]].x
                x2 = landmarks[eye_corners[1]].x
                cx = landmarks[iris_idx].x
                center = (x1 + x2) / 2
                delta = abs(cx - center)
                print(f"   ➤ Eye delta: {delta:.4f}")
                return delta < 0.004  # 🔥 More strict now!

            left_ok = is_eye_centered(LEFT_EYE, LEFT_IRIS)
            right_ok = is_eye_centered(RIGHT_EYE, RIGHT_IRIS)

            if left_ok and right_ok:
                print(f"[Frame {i}] ✅ STRONG GAZE DETECTED")
                gazing += 1
            else:
                print(f"[Frame {i}] ❌ Gaze NOT centered.")
                not_gazing += 1

        else:
            print(f"[Frame {i}] ❌ No face mesh.")
            not_gazing += 1



    if gazing >= not_gazing:
        looking = True
    else:
        looking = False

    cap.release()


    print(f"🔚 Checked {frames_checked} frames.")
    print(f"🧠 Final Gaze Verdict: {'LOOKING AT CAMERA' if looking else 'NOT looking'}")

    return looking

def monitor_gaze():
    print("📷 Starting gaze monitoring loop...")


    while True:
        result = is_looking_at_camera()
        if result:
            print("👋 User is no longer looking at the camera.")
            break
        else:
            print("👁️ Still looking. Checking again in 3 seconds...\n")




# ========== ROUTES ==========

@app.get("/")
def root():
    return {"message": "Welcome to HackDavis API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/look-test")
def look_test():
    result = is_looking_at_camera()
    return {"looking_at_camera": result}

@app.get("/gaze-track")
def look_test():
    monitor_gaze()
    return {"message": "Gaze tracking complete"}


@app.post("/start-session")
def start_session():
    if not is_looking_at_camera():
        return {"error": "No face detected. Please look at the camera."}
    
    text = transcribe_audio()
    image_url = generate_image(text)

    return {
        "prompt": text,
        "image_url": image_url
    }


@app.get("/session-analytics") 
def get_session_analytics():
    """Return the current analytics summary."""
    total = session_analytics["total_words"]
    queries = session_analytics["num_queries"]
    avg = total / queries if queries > 0 else 0
    return {
        "total_words": total,
        "num_queries": queries,
        "avg_words_per_query": round(avg, 2),
        "dictlist": session_analytics["dictlist"]
    }



# == Generate Image ==

@app.post("/generate-image")
def generate_image(request_body: GenerateImageRequest):
    print(request_body.title, ":", request_body.transcript)
    if request_body.transcript is None:
        raise HTTPException(status_code=400, detail="Transcript is required")
    try:
        response = client.images.generate(
            model="dall-e-3",
            
            prompt = 
                "Create a detailed and imaginative illustration in the art style of " + request_body.title + "The image should visually represent the following narration or story passage: " +  request_body.transcript + ". Make it easy to understand, emotionally engaging, and helpful for someone who has difficulty visualizing mental images.",
            n=1,
            size="1024x1024"
        )
        image_url = response.data[0].url
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# == Transcribe ==

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        # Create a temporary file to save the uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_file.write(await audio.read())
            temp_file_path = temp_file.name
        
        # Open the file 
        with open(temp_file_path, 'rb') as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )

        # Remove the temporary file
        os.unlink(temp_file_path)

        print(transcription.text)

        update_session_analytics(transcription.text)

        # Return the transcription text
        return {"text": transcription.text}

    except Exception as transcription_error:
        # Remove the temporary file in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        raise HTTPException(
            status_code=500, 
            detail=f"Transcription failed: {str(transcription_error)}"
        )


# == Pydantic Model for Transcript Payload ==
class TranscriptPayload(BaseModel):
    transcript: str

# == Add Transcript to Specific User ==
@app.post("/api/add-transcript", status_code=200)
async def add_transcript(payload: TranscriptPayload):
    """
    Adds a transcript string to the hardcoded user 'armanbance@gmail.com'
    and attempts to extract character names using OpenAI.
    Expects a JSON body like: {"transcript": "the transcript text"}
    """
    target_email = "armanbance@gmail.com" # Hardcoded as requested
    transcript_text = payload.transcript
    extracted_characters_list = [] # Initialize empty list for characters

    if not transcript_text or not transcript_text.strip():
        raise HTTPException(status_code=400, detail="Transcript text cannot be empty.")

    # --- Attempt to extract characters using OpenAI ---
    try:
        print(f"Attempting OpenAI character extraction for transcript: '{transcript_text[:100]}...'") # Log snippet
        prompt = (
            f"Extract all the character names mentioned in the following text. "
            f"List only the unique names, separated by commas. "
            f"If no character names are found, respond with the single word 'None'.\n\n"
            f"Text: \"{transcript_text}\""
        )

        # Make the call to OpenAI Chat Completions API
        chat_completion = await client2.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts character names from text.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="gpt-3.5-turbo", # Or another model like gpt-4o-mini if preferred
            temperature=0.2, # Lower temperature for more deterministic output
            max_tokens=100 # Limit response length
        )

        # Extract the response content
        ai_response_content = chat_completion.choices[0].message.content
        print(f"OpenAI response: {ai_response_content}")

        # Parse the response
        if ai_response_content and ai_response_content.strip().lower() != 'none':
            # Split by comma, strip whitespace from each name, and deduplicate using a set
            potential_names = ai_response_content.split(',')
            # Use a set comprehension for concise stripping and deduplication
            unique_characters = {name.strip() for name in potential_names if name.strip()}
            extracted_characters_list = sorted(list(unique_characters)) # Store as sorted list
            print(f"Extracted characters: {extracted_characters_list}")
        else:
            print("OpenAI indicated no characters found or response was empty.")

    except Exception as ai_error:
        print(f"Error during OpenAI character extraction: {ai_error}")
        # Decide how to handle: Proceed without characters? Return an error?
        # For now, just log it and proceed to save the transcript only.
        pass # Continue execution even if AI fails

    # --- Save Transcript (Character saving logic will be added next) ---
    try:
        # Temporarily, only update the transcript
        # TODO: Combine this with character update later
        update_operation = {
             "$push": {"transcripts": transcript_text}
        }

        if extracted_characters_list:
            # $addToSet adds items to the array only if they don't already exist
            # $each allows adding multiple items from the list
            update_operation["$addToSet"] = {"characters": {"$each": extracted_characters_list}}
        # -------------------

        print(f"Performing database update: {update_operation}") # Log the update command
        # In the next step, we'll add:
        # if extracted_characters_list:
        #    update_operation["$addToSet"] = {"characters": {"$each": extracted_characters_list}}

        result = await users_collection.update_one(
            {"email": target_email},
            update_operation # Pass the combined update later
        )

        if result.matched_count == 0:
            print(f"Warning: User with email '{target_email}' not found for adding transcript.")
            raise HTTPException(
                status_code=404,
                detail=f"User with email '{target_email}' not found."
            )
        elif result.modified_count == 0:
             print(f"Warning: User '{target_email}' matched but transcript array not modified (or character update didn't modify).")

        print(f"Successfully added transcript for user '{target_email}'. Character extraction attempted.")
        # Return extracted characters for verification in this step
        return {
            "message": f"Transcript added successfully to user {target_email}. Character extraction attempted.",
            "extracted_characters": extracted_characters_list # Return the list found in this transcript
        }

    except Exception as db_error:
        print(f"Error adding transcript for user {target_email} after AI attempt: {db_error}")
        # Raise DB error even if AI succeeded or failed
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add transcript to DB: {str(db_error)}"
        )

# Re-add the dummy endpoint for now if it was needed
@app.post("/add-dummy-transcript", status_code=200)
async def add_dummy_transcript_to_user():
    """
    Adds a dummy transcript string to the user with email 'armanbance@gmail.com'.
    Uses MongoDB's $push operator.
    """
    target_email = "armanbance@gmail.com"
    dummy_text = f"Dummy transcript added at {time.time()}" # Add timestamp for uniqueness

    try:
        # No need to import users_collection here, it's imported globally

        # Use update_one with $push to add to the array
        result = await users_collection.update_one(
            {"email": target_email},
            {"$push": {"transcripts": dummy_text}}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail=f"User with email '{target_email}' not found."
            )
        elif result.modified_count == 0:
             print(f"Warning: User '{target_email}' matched but not modified by dummy add.")

        print(f"Successfully added dummy transcript to user '{target_email}'. Matched: {result.matched_count}, Modified: {result.modified_count}")
        return {"message": f"Dummy transcript added successfully to user {target_email}"}
    except Exception as e:
        print(f"Error adding dummy transcript: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add dummy transcript: {str(e)}"
        )

# ========== DEV SERVER ==========
app.include_router(auth0_users.router)

# Custom JSON encoder for MongoDB ObjectID
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Configure FastAPI to use the custom encoder
app.json_encoder = CustomJSONEncoder

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)