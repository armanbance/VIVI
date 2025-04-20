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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gazeTrack, setGazeTrack] = useState(null);

  const [callLoading, setCallLoading] = useState(false);
  const [callMessage, setCallMessage] = useState("");

  const generateButtonRef = useRef<HTMLButtonElement | null>(null);

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
          const transcript = await transcribeAudio(audioBlob);
          if (transcript) {
            setTranscript(transcript);
            setText(transcript);
          }
          generateImage(title, transcript);
          return transcript;
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
    setText("");
    setTranscript("");
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

  const callVoiceAgent = async () => {
    setCallLoading(true);
    setCallMessage("");
    setError(""); // Clear general error if setting specific message

    // Make sure to use your *current* ngrok URL
    const outboundServiceUrl =
      "https://9d0d-128-120-27-122.ngrok-free.app/outbound-call";
    // TODO: Replace hardcoded number with dynamic input if needed
    const recipientNumber = "+17078169356";
    const agentPrompt =
      "You are Stark, a genius inventor and billionaire philanthropist turned wellness guide. Your mission is to help fellow heroes power down stress and recharge with arc‑reactor breathing exercises and mindfulness, just as you would before a high‑stakes mission. Speak with Tony’s confidence, wit, and warmth. Use simple “tech” imagery (no heavy engineering—this is wellness, not building a suit!).";
    const firstMessage = "Hi! How's it going?";

    try {
      const response = await axios.post(outboundServiceUrl, {
        prompt: agentPrompt,
        first_message: firstMessage,
        number: recipientNumber,
      });

      setCallMessage("Call initiated successfully!");
      console.log("Call initiated:", response.data);
    } catch (error) {
      console.error("Error initiating call:", error);
      // Set specific error or use the general error state
      setError("Failed to initiate call. Check console for details.");
      setCallMessage(""); // Clear any success message
    } finally {
      setCallLoading(false);
    }
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
        console.log("HAHAHAHAHAHHA:", transcribedText);
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

  const generateImage = async (titleValue: string, transcriptValue: string) => {
    setLoading(true);
    setError("");
    setImageUrl(null);
    console.log(
      `Generating image for title: "${titleValue}" and transcript: "${transcriptValue}"`
    );
    try {
      const response = await axios.post<{ image_url?: string }>(
        "http://localhost:8000/generate-image",
        {
          title: titleValue,
          transcript: transcriptValue,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data.image_url) {
        setImageUrl(data.image_url);
        console.log("Image generated successfully:", data.image_url);
      } else {
        console.error(
          "Failed to generate image - no image_url in response:",
          data
        );
        setError(
          "Failed to generate image. The server didn't provide an image URL."
        );
      }
    } catch (err) {
      console.error("Error fetching image:", err);
      if (axios.isAxiosError(err)) {
        setError(
          `Error generating image: ${err.response?.data?.detail || err.message}`
        );
      } else {
        setError("An unexpected error occurred while generating the image.");
      }
    } finally {
      setLoading(false);
    }
  };

  const recordWithGazeTracking = async () => {
    setText("");
    setTranscript("");
    setImageUrl(null);

    const recordingStarted = await startRecording();
    if (!recordingStarted) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/gaze-track");
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Unknown gaze tracking error" }));
        throw new Error(
          errorData.detail || `Gaze tracking failed with status ${res.status}`
        );
      }
      stopRecording();
    } catch (err) {
      console.error("Error during gaze tracking or subsequent actions:", err);
      setError(
        `Error during gaze tracking: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
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

        {/* Container for action buttons */}
        <div className="text-center flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            ref={generateButtonRef}
            onClick={() => generateImage(title, transcript || text)} // Added onClick handler
            disabled={!title || !(transcript || text) || loading || callLoading}
            className={`inline-block px-8 py-3 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105 ${
              !title || !(transcript || text) || loading || callLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700" // Adjusted color for consistency
            }`}
          >
            {loading ? "Generating…" : "Generate Image"}
          </button>

          {/* Call Agent Button */}
          <button
            onClick={callVoiceAgent}
            disabled={callLoading || loading}
            className={`inline-block px-8 py-3 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105 ${
              callLoading || loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600" // Example: green color
            }`}
          >
            {callLoading ? "Calling…" : "Call Agent"}
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
