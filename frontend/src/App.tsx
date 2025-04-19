import "./App.css";
import { useState } from "react";
import { fetchData } from "./services/api";

function App() {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [apiData, setApiData] = useState<any>(null);

  const handleFetchData = async () => {
    try {
      const data = await fetchData("/your-endpoint"); // Replace with your actual endpoint
      setApiData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <>
      <h1>VIVI</h1>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Transcription"
      />
      <button>Generate Image</button>
      {image && <img src={image} alt="Generated" />}
      <button onClick={handleFetchData}>Fetch Data</button>
      {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>}
    </>
  );
}

export default App;
