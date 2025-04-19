import cv2
import time

def test_webcam():
    # Try different camera indices
    for camera_index in [0, 1, 2]:
        print(f"Trying to open camera at index {camera_index}...")
        cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            print(f"❌ Failed to open webcam at index {camera_index}")
        else:
            print(f"✅ Successfully opened camera {camera_index}")
            # Try to read a frame
            ret, frame = cap.read()
            if ret:
                print(f"✅ Successfully captured a frame from camera {camera_index}")
                # Save a test image
                cv2.imwrite(f"test_camera_{camera_index}.jpg", frame)
                print(f"✅ Saved test image as test_camera_{camera_index}.jpg")
            else:
                print(f"❌ Failed to capture frame from camera {camera_index}")
        
        # Release the camera
        cap.release()
        time.sleep(1)

if __name__ == "__main__":
    test_webcam() 