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
      const res = await axios.post(
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
      const res = await fetch(
        `http://localhost:8000/generate-image?title=${encodeURIComponent(
          title
        )}&transcript=${encodeURIComponent(transcript)}`
      );
      const data = await res.json();
      if (data.image_url) setImageUrl(data.image_url);
      else setError("Failed to generate image");
    } catch {
      setError("Error fetching image");
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
  if (isLoading) return <div>Loading…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900">
          Audio Recorder
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Title input */}
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 mb-1 font-medium"
            >
              Book Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
            />
          </div>

          {/* Record controls */}
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600">
              {isRecording
                ? "Recording… click the button to stop"
                : "Click to start recording"}
            </p>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition transform hover:scale-110 animate-pulse"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition transform hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            )}
          </div>

          {/* Transcript box */}
          {transcript && (
            <div>
              <h3 className="text-gray-700 mb-1 font-medium">Transcript</h3>
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 max-h-40 overflow-y-auto text-gray-800">
                {transcript}
              </div>
            </div>
          )}
        </div>

        {/* Generate button */}
        <div className="text-center">
          <button
            onClick={() => generateImage(title, text)}
            disabled={!title || !text || loading}
            className={`inline-block px-10 py-3 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105 ${
              !title || !text
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Generating…" : "Generate Image"}
          </button>
        </div>

        {/* Generated image */}
        {imageUrl && (
          <div className="space-y-4">
            <h3 className="text-center text-xl font-medium text-gray-900">
              Generated Image
            </h3>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full object-contain"
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-red-600 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}

export default RecorderPage;
