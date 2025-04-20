from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import time
from openai import OpenAI
import mediapipe as mp
import os
from dotenv import load_dotenv
import tempfile
from routers import auth0_users
from fastapi import Form


# ========== CONFIG ==========

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

from db import test_connection
app = FastAPI(title="HackDavis API")

# Include routers
app.include_router(auth0_users.router)

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

    for i in range(40):  # ~5 seconds at 20 FPS
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
                return delta < 0.002  # 🔥 More strict now!

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


        time.sleep(0.05)

    if gazing >= not_gazing:
        looking = True
    else:
        looking = False

    cap.release()


    print(f"🔚 Checked {frames_checked} frames.")
    print(f"🧠 Final Gaze Verdict: {'LOOKING AT CAMERA' if looking else 'NOT looking'}")

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
        # Save uploaded audio to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_file.write(await audio.read())
            temp_file_path = temp_file.name

        # Transcribe audio using Whisper with language detection
        with open(temp_file_path, 'rb') as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="json",
                language="auto"  # auto-detect language
            )

        os.unlink(temp_file_path)

        original_text = transcription["text"]
        detected_lang = transcription.get("language", "en")
        print(f"🔎 Detected language: {detected_lang}")
        print(f"🗣️ Original: {original_text}")

        # Translate if not English
        if detected_lang != "en":
            print("🌐 Translating to English...")
            translation = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a translator that returns clear, fluent English."},
                    {"role": "user", "content": f"Translate this into English: {original_text}"}
                ]
            )
            english_text = translation.choices[0].message.content.strip()
        else:
            english_text = original_text

        return {"text": english_text}

    except Exception as transcription_error:
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(transcription_error)}"
        )
    
@app.post("/translate-to-english")
def translate_to_english(text: str = Form(...)):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful translator who translates any language to natural English only return the translated text."},
                {"role": "user", "content": f"Translate this into English: {text}"}
            ]
        )
        translation = response.choices[0].message.content.strip()
        return {"original_text": text, "translated_text": translation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# ========== DEV SERVER ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)