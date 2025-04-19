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

        // Send user data to backend
        const response = await fetch(`${API_URL}/auth0-users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            picture: user.picture,
            auth0_id: user.sub, // Auth0 user ID
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to sync user data");
        }

        const userData = await response.json();
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
