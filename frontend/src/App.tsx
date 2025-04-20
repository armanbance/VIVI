import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import "./App.css";

// Import pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import RecorderPage from "./pages/RecorderPage";
import ProfilePage from "./pages/ProfilePage";
import ResearchPage from "./pages/ResearchPage";
import Callback from "./pages/Callback";
import Navbar from "./components/Navbar";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route
          path="/recorder"
          element={
            <ProtectedRoute>
              <RecorderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// import "./App.css";
// import { useState, useRef } from "react";
// import axios from "axios";
// import LoginButton from "./components/LoginButton";
// import LogoutButton from "./components/LogoutButton";
// import Profile from "./components/Profile";
// import { useAuth0 } from "@auth0/auth0-react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// function App() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURL, setAudioURL] = useState<string | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [transcript, setTranscript] = useState<string | null>(null);
//   const [title, setTitle] = useState("");
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [imageUrl, setImageUrl] = useState(null);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

//       mediaRecorderRef.current = recorder;
//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       recorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, {
//           type: "audio/mp3",
//         });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         setAudioURL(audioUrl);
//         setAudioBlob(audioBlob);
//         audioChunksRef.current = [];

//         transcribeAudio(audioBlob);
//       };

//       recorder.start();
//       setIsRecording(true);
//     } catch (error) {
//       console.error("Error accessing microphone:", error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//     }
//     mediaRecorderRef.current?.stream
//       .getTracks()
//       .forEach((track) => track.stop());

//     setIsRecording(false);
//   };

//   const transcribeAudio = async (blob = audioBlob) => {
//     // Check if audio blob exists before sending
//     if (!blob) {
//       console.error("No audio recorded");
//       return;
//     }

//     try {
//       // Create FormData to send audio file
//       const formData = new FormData();
//       formData.append("audio", blob, "recording.mp3");

//       // Send to transcription endpoint
//       const response = await axios.post(
//         "http://localhost:8000/transcribe",
//         formData
//       );

//       if (!response) {
//         throw new Error("Transcription failed");
//       }

//       // Parse transcription result
//       const data = response.data;

//       setTranscript(data.text);

//       setText(data.text);

//       // Generate image from transcript
//       // await generateImageFromTranscript(data.transcript);
//     } catch (error) {
//       console.error("Error transcribing audio:", error);
//     }
//   };

//   const generateImage = async (title: string, transcript: string) => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await fetch(
//         `http://localhost:8000/generate-image?title=${encodeURIComponent(
//           title
//         )}&transcript=${encodeURIComponent(transcript)}`
//       );

//       const data = await response.json();

//       if (data.image_url) {
//         setImageUrl(data.image_url); // Set the image URL to state
//       } else {
//         setError("Failed to generate image.");
//       }
//     } catch (error) {
//       setError("Error fetching image.");
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const [count, setCount] = useState(0);
//   const { isAuthenticated, isLoading } = useAuth0();

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8 border border-gray-700">
//         <div className="mb-6">
//           <label
//             htmlFor="title"
//             className="block text-gray-300 mb-2 text-sm font-medium"
//           >
//             Book Title
//           </label>
//           <input
//             id="title"
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Enter book title"
//             className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//           />
//         </div>

//         <div className="flex flex-col items-center mb-6">
//           <p className="text-gray-300 mb-3">
//             {isRecording
//               ? "Recording in progress..."
//               : "Click to start recording (whisper)"}
//           </p>
//           {isRecording ? (
//             <button
//               onClick={stopRecording}
//               className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 animate-pulse"
//               aria-label="Stop recording"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <rect x="6" y="6" width="12" height="12" rx="2" />
//               </svg>
//             </button>
//           ) : (
//             <button
//               onClick={startRecording}
//               className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300"
//               aria-label="Start recording"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
//                 <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
//                 <line x1="12" y1="19" x2="12" y2="22" />
//               </svg>
//             </button>
//           )}
//         </div>

//         {transcript && (
//           <div className="mb-6">
//             <h3 className="text-gray-300 mb-2 text-sm font-medium">
//               Transcript
//             </h3>
//             <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 max-h-40 overflow-y-auto">
//               {transcript}
//             </div>
//           </div>
//         )}
//       </div>

//       <p className="text-gray-400 italic">
//         {title
//           ? "Read a passage and click generate to generate an image"
//           : "Enter a book title and record your voice to generate an image"}
//       </p>
//       <button
//         onClick={() => generateImage(title, text)}
//         disabled={!title || !text}
//         className={`mt-4 px-6 py-3 rounded-lg text-white ${
//           !title || !text
//             ? "bg-gray-500 cursor-not-allowed"
//             : "bg-blue-500 hover:bg-blue-600"
//         } transition`}
//       >
//         Generate Image
//       </button>

//       {imageUrl ? (
//         <div className="mt-8">
//           <h3 className="text-xl font-medium mb-4">Generated Image</h3>
//           <div className="rounded-lg overflow-hidden shadow-lg border border-gray-700">
//             <img
//               src={imageUrl}
//               alt="Generated scene"
//               className="w-full max-h-96 object-contain bg-black"
//             />
//           </div>
//         </div>
//       ) : null}
//     </>
//   );
// }

// export default App;
