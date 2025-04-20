import { useAuth0 } from "@auth0/auth0-react";
import Profile from "../components/Profile";
import LogoutButton from "../components/LogoutButton";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Please log in to view your profile
          </h2>
          <Link
            to="/login"
            className="mt-6 px-8 py-4 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mt-6">My Profile</h1>
        </div>

        <div className="mb-8">
          <Profile />
        </div>

        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="px-5 py-2.5 bg-gray-200 text-gray-800 text-base font-medium rounded-lg hover:bg-gray-300 transition"
          >
            Back to Home
          </Link>
          <Link
            to="/recorder"
            className="px-5 py-2.5 bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600 transition"
          >
            Go to Recorder
          </Link>
        </div>

        <div className="mt-10 text-center">
          <LogoutButton className="text-base px-6 py-2.5 mb-6" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
