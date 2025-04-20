import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Base API URL
const API_URL = "http://localhost:8000/api";

export const useUserSync = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [isUserSynced, setIsUserSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncUserWithDatabase = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // Get the access token
        const token = await getAccessTokenSilently();

        // Fix the endpoint URL to match the router prefix exactly
        const response = await fetch(`${API_URL}/auth0-users/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            picture: user.picture,
            auth0_id: user.sub,
          }),
        });

        // Add better error handling
        if (!response.ok) {
          const text = await response.text();
          let errorMessage = "Failed to sync user data";
          try {
            // Try to parse as JSON if possible
            const errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            // If it's not JSON, use the text directly
            errorMessage = text || errorMessage;
          }
          throw new Error(errorMessage);
        }

        // Get response data - with error handling
        const responseText = await response.text();
        if (!responseText) {
          throw new Error("Empty response from server");
        }
        
        const userData = JSON.parse(responseText);
        setIsUserSynced(true);
        return userData;
      } catch (error) {
        console.error("Error syncing user:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        return null;
      }
    };

    if (isAuthenticated && user) {
      syncUserWithDatabase();
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return { isUserSynced, error };
};
