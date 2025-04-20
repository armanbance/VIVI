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
  const [callLoading, setCallLoading] = useState(false);
  const [callMessage, setCallMessage] = useState("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        setAudioURL(URL.createObjectURL(blob));
        setAudioBlob(blob);
        audioChunksRef.current = [];
        transcribeAudio(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  const transcribeAudio = async (blob = audioBlob) => {
    if (!blob) return console.error("No audio to transcribe");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.mp3");
      const res = await axios.post(
        "http://localhost:8000/transcribe",
        formData
      );
      setTranscript(res.data.text);
      setText(res.data.text);
    } catch (err) {
      console.error(err);
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

  const callVoiceAgent = async () => {
    setCallLoading(true);
    setCallMessage("");
    setError("");

    try {
      const response = await axios.post(
        "https://095f-128-120-27-122.ngrok-free.app/outbound-call", // Replace with your current ngrok URL
        {
          prompt:
            "Purpose: You are Chiller, a compassionate wellness check-in voice agent. Your role is to help users relax, center themselves, and feel supported through guided breathing exercises and mindfulness check-ins. Tasks: Greet the user and ask how they're feeling. Adapt your response based on their emotional state—if stressed, suggest a slowing down with a breathing exercise; if calm, invite them to celebrate the moment with a brief pause. Guide the user through a simple breathing exercise: instruct them to find a comfortable position, optionally close their eyes, and breathe in slowly (count \"1… 2… 3…\"), then exhale completely. Repeat once or twice. End with gentle encouragement and ask how they feel afterward. Guidelines: Maintain a calm, patient, and warm tone. Use clear, simple, and concise instructions. Focus on mindfulness and self-care. If you're unsure of the user's response, ask for clarification politely.",
          first_message:
            "Hi! I'm Chiller from Chill Guy AI. How are you doing today?",
          number: "+17078169356", // Replace with an actual phone number or add a phone input field
        }
      );

      setCallMessage("Call initiated successfully!");
      console.log("Call initiated:", response.data);
    } catch (error) {
      console.error("Error initiating call:", error);
      setError("Failed to initiate call. Please check console for details.");
    } finally {
      setCallLoading(false);
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
        {/* <div className="text-center">
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
        </div> */}

        {/* Generate button and Call Voice Agent button */}
        <div className="text-center flex justify-center space-x-4">
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

          <button
            onClick={callVoiceAgent}
            disabled={callLoading}
            className={`inline-block px-10 py-3 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105 
              ${
                callLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {callLoading ? "Calling…" : "Call Voice Agent"}
          </button>
        </div>

        {/* Call message */}
        {callMessage && (
          <p className="text-center text-green-600 font-medium">
            {callMessage}
          </p>
        )}

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
