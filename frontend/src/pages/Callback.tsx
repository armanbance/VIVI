import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const { handleRedirectCallback } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await handleRedirectCallback();
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error handling redirect callback:", error);
        navigate("/login", { replace: true });
      }
    })();
  }, [handleRedirectCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-xl font-medium">Logging you in...</p>
      </div>
    </div>
  );
}
