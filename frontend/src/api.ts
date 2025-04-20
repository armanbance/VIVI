import { useAuth0 } from "@auth0/auth0-react";

// Base API URL
const API_URL = "http://localhost:8000/api";

/**
 * Custom hook to get authenticated API functions
 */
export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  /**
   * Make an authenticated API request
   */
  const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    try {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      // Get the access token
      const token = await getAccessTokenSilently();

      // Add the Authorization header
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      // Make the request
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Check if the response is successful
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "API request failed");
      }

      // Return the JSON response
      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };

  /**
   * Make a non-authenticated API request
   */
  const publicFetch = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "API request failed");
      }
      
      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };

  return {
    authFetch,
    publicFetch,
    
    // Convenience methods for common API operations
    getItems: () => publicFetch("/items"),
    getItem: (id: number) => publicFetch(`/items/${id}`),
    createItem: (item: any) => authFetch("/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    }),
  };
}; 