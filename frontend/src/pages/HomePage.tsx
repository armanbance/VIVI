import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import icon from "../assets/icon.png";

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
        bg-gradient-to-tr from-[#f5f2ff] via-white to-blue-50
        flex flex-col justify-center
        px-4 sm:px-6 lg:px-8
      "
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          {/* Optional book icon above the title */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-8 rounded-full shadow-lg">
              <img
                src={icon}
                alt="Vivi Logo"
                className=" w-32 object-contain text-[#9076ff]"
              />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900">
            Welcome to <span className="text-[#9076ff]">VIVI</span>
          </h1>

          {/* — badges under the heading — */}

          <p className="mt-6 max-w-xl mx-auto text-lg sm:text-xl text-gray-600">
            Your AI‑powered audio‑to‑image book companion
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center space-y-6">
          {isAuthenticated ? (
            <div className="space-y-4 space-x-4">
              <Link
                to="/recorder"
                className="inline-block px-8 py-3 text-lg font-medium text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg transition-all duration-300"
              >
                Go to Recorder
              </Link>
              <Link
                to="/profile"
                className="inline-block px-8 py-3 text-lg font-medium text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg transition-all duration-300"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              <Link
                to="/login"
                className="inline-block px-10 py-4 text-lg font-semibold text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg transition duration-300 mb-4"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
        <div className="rounded-full max-w-96 p-1 bg-gradient-to-r from-[#9076ff] to-[#4e398e] hover:from-[#4e398e] hover:to-[#9076ff] transition duration-300 mx-auto">
          <a
            href="/files/vivi-chrome.zip"
            download="vivi-chrome.zip"
            className="block px-5 py-4 text-lg font-semibold text-[#4e398e] bg-white rounded-full shadow-lg hover:text-[#9076ff] transition text-center transition duration-300"
          >
            Download Our Chrome Extension!
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
