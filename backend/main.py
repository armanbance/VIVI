from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import time
from openai import OpenAI
import mediapipe as mp
import os
from dotenv import load_dotenv
import tempfile


# ========== CONFIG ==========

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="HackDavis API")

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
    cap = cv2.VideoCapture(1)

    if not cap.isOpened():
        print("❌ Failed to open webcam.")
        return False

    mp_face = mp.solutions.face_detection.FaceDetection(
        model_selection=0, min_detection_confidence=0.5
    )

    print("🟡 Looking for a face...")

    looking = False
    frames_checked = 0

    for i in range(1000):  # ~5 seconds
        ret, frame = cap.read()
        if not ret:
            print(f"[Frame {i}] ❌ Failed to read frame.")
            continue

        frames_checked += 1
        print(f"[Frame {i}] ✅ Frame captured.")

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = mp_face.process(rgb)

        if results.detections:
            print(f"[Frame {i}] ✅ Face detected with {len(results.detections)} detection(s).")
            for det in results.detections:
                score = det.score[0] if det.score else 0
                print(f"   ➤ Confidence: {score:.2f}")
                if score > 0.5:
                    looking = True
                    break
            if looking:
                break
        else:
            print(f"[Frame {i}] ❌ No face detected.")

        time.sleep(0.05)

    cap.release()
    print(f"🔚 Finished checking {frames_checked} frames.")
    print(f"🧠 Final result: {'LOOKING' if looking else 'NOT looking'}")

    return looking


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


@app.post("/start-session")
def start_session():
    if not is_looking_at_camera():
        return {"error": "No face detected. Please look at the camera."}
    
    record_audio()
    text = transcribe_audio()
    image_url = generate_image(text)

    return {
        "prompt": text,
        "image_url": image_url
    }


# == Generate Image ==

@app.get("/generate-image")
def generate_image(title: str, transcript: str = None):
    print(title, ":", transcript)
    if transcript is None:
        return {"message": "No audio"}
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt="Generate a simple, cartoonish illustration inspired by the book title: " + title + ". Create an image that represents the key themes and atmosphere from this text: " + transcript + ". The style should be colorful, minimalistic, and suitable for a children's book or storybook.",
            n=1,
            size="1024x1024"
        )
        image_url = response.data[0].url
        return {"image_url": image_url}
    except Exception as e:
        return {"error": str(e)}

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
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)