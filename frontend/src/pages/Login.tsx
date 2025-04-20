import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import Profile from "../components/Profile";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Redirect to homepage if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to VIVI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <LoginButton />

          {isAuthenticated && (
            <div className="mt-4">
              <Profile />
              <div className="mt-4 flex justify-center">
                <LogoutButton />
              </div>
            </div>
          )}

          <div className="text-center text-sm">
            <p className="text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
