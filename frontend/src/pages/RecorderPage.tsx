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
      setAudioBlob(null);
      setTranscript(null);
      setText("");
      setError("");
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setError(
            "No audio was recorded. Please try again and speak into your microphone."
          );
          setLoading(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);

        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        } else {
          setError("Recording was too quiet. Please try again.");
          setLoading(false);
        }
      };

      recorder.start(10);
      setIsRecording(true);
      return true;
    } catch (error) {
      setError(
        "Could not access microphone. Please check permissions and try again."
      );
      setLoading(false);
      return false;
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    if (!mediaRecorderRef.current) {
      console.warn("No MediaRecorder exists to stop");
      setIsRecording(false);
      return;
    }

    if (mediaRecorderRef.current.state !== "inactive") {
      try {
        console.log("Calling stop() on MediaRecorder");
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping MediaRecorder:", err);
      }
    } else {
      console.warn("MediaRecorder already inactive");
    }

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
    console.log("Starting transcription with blob size:", blob?.size);
    if (!blob) {
      console.error("No audio blob to transcribe");
      setError("No audio recorded. Please try again.");
      setLoading(false);
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.mp3");
      console.log("Sending audio for transcription, blob size:", blob.size);

      const response = await axios.post(
        "http://localhost:8000/transcribe",
        formData
      );

      if (!response || !response.data) {
        throw new Error("Transcription failed - no response data");
      }

      const data = response.data;
      console.log("Transcription response:", data);

      if (data.text && data.text.trim() !== "") {
        const transcribedText = data.text.trim();
        console.log("Setting transcript to:", transcribedText);
        setTranscript(transcribedText);
        setText(transcribedText);
        return transcribedText;
      } else {
        console.error("Transcription returned empty text");
        setError(
          "Transcription returned empty text. Please speak louder or clearer."
        );
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error during transcription:", error);
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
      // Clear previous transcript before starting new recording
      setTranscript(null);
      setText("");

      const recordingStarted = await startRecording();
      if (!recordingStarted) throw new Error("Failed to start recording");

      const gazeResponse = await axios.get("http://localhost:8000/gaze-track");
      console.log("Gaze tracking complete, stopping recording");

      // Create a promise that will resolve when transcription is complete
      const transcriptionPromise = new Promise<string | null>((resolve) => {
        // First stop the recording
        stopRecording();

        // Check transcript state periodically
        let attempts = 0;
        const maxAttempts = 20; // Check for up to 20 seconds

        const checkTranscription = () => {
          attempts++;
          console.log(
            `Checking transcript (attempt ${attempts}/${maxAttempts}) - text state:`,
            text
          );
          console.log(`Transcript state:`, transcript);

          // React state updates are asynchronous, so we need to get the current values directly
          const currentText = document
            .querySelector(".p-3.bg-gray-100")
            ?.textContent?.trim();
          console.log("Transcript from DOM:", currentText);

          if (text || transcript || currentText) {
            // We have a transcript, resolve with whichever value is available
            const finalTranscript = text || transcript || currentText || "";
            console.log("Found transcript:", finalTranscript);
            resolve(finalTranscript);
          } else if (attempts < maxAttempts) {
            // No transcript yet, wait a bit longer
            setTimeout(checkTranscription, 1000);
          } else {
            // Reached max attempts, resolve with empty string to avoid null errors
            console.warn("Max attempts reached without finding transcript");
            resolve("");
          }
        };

        // Start checking after a short delay to allow the MediaRecorder.onstop to fire
        setTimeout(checkTranscription, 2000);
      });

      // Wait for the transcription to complete
      const transcriptResult = await transcriptionPromise;

      // Double-check the transcript one more time from React state and DOM
      const currentText = text || transcript;
      const domTranscript = document
        .querySelector(".p-3.bg-gray-100")
        ?.textContent?.trim();

      // Use whatever transcript we can find, preferring React state over DOM
      const finalTranscript =
        currentText || transcriptResult || domTranscript || "";

      console.log("Final transcript to use:", finalTranscript);
      console.log("Title:", title);

      if (title && finalTranscript) {
        console.log("Generating image with title and transcript:", {
          title,
          transcript: finalTranscript,
        });
        generateImage(title, finalTranscript);
      } else if (title) {
        // If we have a title but no transcript, generate with just the title
        console.log("Generating with title only:", title);
        generateImage(title, title); // Use the title as the transcript
        setError("No transcript detected, using title as prompt");
      } else {
        console.error("Missing data for image generation:", {
          title,
          transcript: finalTranscript,
        });
        setError("Missing title. Please enter a book title.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during gaze tracking process:", error);
      setError("Error during recording process");
      setLoading(false);
      if (isRecording) stopRecording();
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

          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600">
              {isRecording
                ? "Recording… click the button to stop"
                : "Click to start recording"}
            </p>
            <div className="flex space-x-4">
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
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-[#9076ff] hover:bg-[#4e398e] transition transform hover:scale-110"
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
              <button
                onClick={recordWithGazeTracking}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-[#9076ff] hover:bg-[#4e398e] text-white transition-all duration-300 hover:scale-110"
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
            <div>
              <h3 className="text-gray-700 mb-1 font-medium">Transcript</h3>
              <div className="p-3 bg-gray-100 rounded-lg border border-gray-200 max-h-40 overflow-y-auto text-gray-800">
                {transcript}
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => generateImage(title, text)}
            disabled={!title || !text || loading}
            className={`inline-block px-10 py-3 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105 ${
              !title || !text
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#9076ff] hover:bg-[#4e398e]"
            }`}
          >
            {loading ? "Generating…" : "Generate Image"}
          </button>
        </div>

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
