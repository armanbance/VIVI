import "../App.css";
import { useState, useRef } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

function RecorderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [gazeTrack, setGazeTrack] = useState(null);

  const startRecording = async () => {
    try {
      // Reset recording state
      setAudioBlob(null);
      setTranscript(null);
      setText("");
      setError("");
      audioChunksRef.current = [];

      // Request access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize the MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("Audio chunk added, size:", event.data.size);
        }
      };

      recorder.onstop = async () => {
        console.log("Recording stopped, processing audio chunks...");

        if (audioChunksRef.current.length === 0) {
          console.error("No audio chunks recorded");
          setError(
            "No audio was recorded. Please try again and speak into your microphone."
          );
          setLoading(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });

        console.log("Audio blob created, size:", audioBlob.size);

        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);

        // Only proceed with transcription if we have audio data
        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        } else {
          setError("Recording was too quiet. Please try again.");
          setLoading(false);
        }
      };

      // Start recording with 10ms timeslice to get data frequently
      recorder.start(10);
      setIsRecording(true);
      console.log("Recording started");

      return true; // Indicate success
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError(
        "Could not access microphone. Please check permissions and try again."
      );
      setLoading(false);
      return false; // Indicate failure
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");

    if (!mediaRecorderRef.current) {
      console.warn("No MediaRecorder exists to stop");
      setIsRecording(false);
      return;
    }

    // Only call stop() if the recorder is actually recording
    if (mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
        console.log("MediaRecorder stopped");
      } catch (err) {
        console.error("Error stopping MediaRecorder:", err);
      }
    } else {
      console.warn("MediaRecorder already inactive");
    }

    // Stop all tracks regardless of recorder state
    try {
      mediaRecorderRef.current?.stream?.getTracks().forEach((track) => {
        track.stop();
        console.log("Audio track stopped");
      });
    } catch (err) {
      console.error("Error stopping audio tracks:", err);
    }

    setIsRecording(false);
  };

  const transcribeAudio = async (blob = audioBlob) => {
    // Check if audio blob exists before sending
    if (!blob) {
      console.error("No audio recorded");
      setError("No audio recorded. Please try again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting transcription of audio blob size:", blob.size);

      // Create FormData to send audio file
      const formData = new FormData();
      formData.append("audio", blob, "recording.mp3");

      // Send to transcription endpoint
      const response = await axios.post(
        "http://localhost:8000/transcribe",
        formData
      );

      if (!response || !response.data) {
        throw new Error("Transcription failed - no response data");
      }

      // Parse transcription result
      const data = response.data;
      console.log("Transcription successful:", data.text);

      if (data.text && data.text.trim() !== "") {
        const transcribedText = data.text.trim();
        setTranscript(transcribedText);
        setText(transcribedText);

        // Store in local variable to ensure it's available for image generation
        return transcribedText;
      } else {
        setError(
          "Transcription returned empty text. Please speak louder or clearer."
        );
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setError("Failed to transcribe audio. Please try again.");
      setLoading(false);
      return null;
    }
  };

  const generateImage = async (title: string, transcript: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:8000/generate-image?title=${encodeURIComponent(
          title
        )}&transcript=${encodeURIComponent(transcript)}`
      );

      const data = await response.json();

      if (data.image_url) {
        setImageUrl(data.image_url); // Set the image URL to state
      } else {
        setError("Failed to generate image.");
      }
    } catch (error) {
      setError("Error fetching image.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const recordWithGazeTracking = async () => {
    setLoading(true);
    setError("");

    try {
      // Start recording audio first - recording will collect audio chunks
      const recordingStarted = await startRecording();

      if (!recordingStarted) {
        throw new Error("Failed to start recording");
      }

      // Then start gaze tracking - this will block until the user looks away
      const gazeResponse = await axios.get("http://localhost:8000/gaze-track");
      console.log("Gaze tracking complete:", gazeResponse.data);

      // Stop recording after gaze tracking completes
      stopRecording();

      // Give some time for the audio processing and transcription to complete
      setTimeout(() => {
        console.log("Checking for transcript to generate image...");
        console.log("Current title:", title);
        console.log("Current text state:", text);

        if (title && (text || transcript)) {
          // Use transcript as fallback if text is not available
          const contentToUse = text || transcript || "";
          console.log("Generating image with content:", contentToUse);
          generateImage(title, contentToUse);
        } else {
          console.log("Current transcript:", transcript);
          console.log("Current text:", text);
          setError("Missing title or transcript. Make sure to speak clearly.");
          setLoading(false);
        }
      }, 8000); // Extended timeout to ensure transcription completes
    } catch (error) {
      console.error("Error during recording with gaze tracking:", error);
      setError("Error during recording process");
      setLoading(false);

      // Make sure to stop recording if there was an error
      if (isRecording) {
        stopRecording();
      }
    }
  };

  const { isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Audio Recorder</h1>

      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8 border border-gray-700">
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-gray-300 mb-2 text-sm font-medium"
          >
            Book Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex flex-col items-center mb-6">
          <p className="text-gray-300 mb-3">
            {isRecording
              ? "Recording in progress..."
              : "Click to start recording"}
          </p>
          <div className="flex space-x-4">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 animate-pulse"
                aria-label="Stop recording"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300"
                aria-label="Start recording"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            )}
            <button
              onClick={recordWithGazeTracking}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-300"
              aria-label="Start recording with gaze tracking"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        {transcript && (
          <div className="mb-6">
            <h3 className="text-gray-300 mb-2 text-sm font-medium">
              Transcript
            </h3>
            <div className="p-4 text-white bg-gray-700 rounded-lg border border-gray-600 max-h-40 overflow-y-auto">
              {transcript}
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-400 italic">
        {title
          ? "Read a passage and click generate to generate an image"
          : "Enter a book title and record your voice to generate an image"}
      </p>
      <button
        onClick={() => generateImage(title, text)}
        disabled={!title || !text}
        className={`mt-4 px-6 py-3 rounded-lg text-white ${
          !title || !text
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        } transition`}
      >
        Generate Image
      </button>

      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : imageUrl ? (
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-4">Generated Image</h3>
          <div className="rounded-lg overflow-hidden shadow-lg border border-gray-700">
            <img
              src={imageUrl}
              alt="Generated scene"
              className="w-full max-h-96 object-contain bg-black"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RecorderPage;
