import { useAuth0 } from "@auth0/auth0-react";
import Profile from "../components/Profile";
import LogoutButton from "../components/LogoutButton";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your profile
          </h2>
          <Link
            to="/login"
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        </div>

        <div className="mb-8">
          <Profile />
        </div>

        <div className="flex justify-between">
          <Link
            to="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Back to Home
          </Link>
          <Link
            to="/recorder"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Go to Recorder
          </Link>
        </div>

        <div className="mt-8 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
