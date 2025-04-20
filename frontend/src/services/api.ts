import axios from "axios";

const API_URL = "http://localhost:8000";

// Basic GET request function
export const fetchData = async (endpoint: string) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

// Basic POST request function
export const postData = async (endpoint: string, data: unknown) => {
  try {
    const response = await axios.post(`${API_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
