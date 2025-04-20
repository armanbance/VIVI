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
    <div
      className="
        min-h-screen
        bg-gradient-to-tr from-purple-50 via-white to-blue-50
        flex flex-col justify-center
        px-4 sm:px-6 lg:px-8
      "
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          {/* Optional book icon above the title */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              {/* swap in your real book SVG if you like */}
              <svg
                className="h-8 w-8 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6l4 4-4 4m0 0l-4-4 4-4"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900">
            Welcome to <span className="text-purple-600">VIVI</span>
          </h1>

          {/* — badges under the heading — */}
          <div className="mt-6 flex justify-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow">
              <span className="text-yellow-400 mr-2">✨</span>
              <span className="text-sm font-medium text-gray-700">
                AI-powered
              </span>
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-white rounded-full shadow">
              <span className="text-blue-400 mr-2">🖼️</span>
              <span className="text-sm font-medium text-gray-700">
                Audio-to-Image
              </span>
            </span>
          </div>

          <p className="mt-6 max-w-xl mx-auto text-lg sm:text-xl text-gray-600">
            Your AI‑powered audio‑to‑image book companion
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center space-y-6">
          {isAuthenticated ? (
            <div className="space-y-4">
              <Link
                to="/recorder"
                className="inline-block px-10 py-4 text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg"
              >
                Go to Recorder
              </Link>
              <Link
                to="/profile"
                className="inline-block px-8 py-3 text-base font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-full"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              <Link
                to="/login"
                className="inline-block px-10 py-4 text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg"
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
