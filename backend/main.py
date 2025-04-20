from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import time
from openai import OpenAI
import mediapipe as mp
import os
from dotenv import load_dotenv
import tempfile
from db import test_connection
from routers import auth0_users
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from json import JSONEncoder


# ========== CONFIG ==========

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

# ========== HELPER FUNCTIONS ==========


def is_looking_at_camera():
    gazing = 0
    not_gazing = 0
    cap = cv2.VideoCapture(0)

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