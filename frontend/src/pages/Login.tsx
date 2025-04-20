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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-50 via-white to-blue-50">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome to <span className="text-[#9076ff]">VIVI</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <LoginButton className="w-full max-w-xs flex justify-center px-10 py-4 text-lg font-semibold text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg" />
          </div>

          {isAuthenticated && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Profile />
              </div>
              <div className="flex justify-center">
                <LogoutButton className="w-full max-w-xs flex justify-center px-10 py-4 text-lg font-semibold text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;
