import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to VIVI
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Your AI-powered audio-to-image book companion
          </p>
        </div>

        <div className="mt-10">
          {isAuthenticated ? (
            <div className="space-y-4">
              <Link
                to="/recorder"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Go to Recorder
              </Link>
              <Link
                to="/profile"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
              <p className="text-sm text-gray-500 text-center">
                Create an account or sign in to use all features
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
