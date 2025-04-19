from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import cv2
import time
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
import whisper
import openai
import mediapipe as mp

# ========== CONFIG ==========
openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace this!

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

    for i in range(100):  # ~5 seconds
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

# ========== DEV SERVER ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
