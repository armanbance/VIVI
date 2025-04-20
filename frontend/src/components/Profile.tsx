import { useAuth0 } from "@auth0/auth0-react";
import { useUserSync } from "../hooks/useUserSync";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { isUserSynced, error } = useUserSync();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    isAuthenticated && (
      <div className="max-w-md mx-auto mt-10">
        {user && (
          <div className="p-2">
            <div className="flex flex-col items-center">
              <img
                src={user.picture}
                alt={user.name}
                className="h-24 w-24 rounded-full border-4 border-pastel-purple-200 shadow-md mb-4"
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {user.name}
                </h2>
                <p className="text-gray-600 mb-4">{user.email}</p>

                <div className="border-t border-gray-200 pt-4 mt-2 w-full">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Account Status
                  </h3>
                  {!isUserSynced ? (
                    <div className="bg-pastel-yellow-100 text-pastel-gray-700 px-4 py-2 rounded-lg flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-pastel-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Syncing user data...
                    </div>
                  ) : (
                    <div className="bg-pastel-blue-100 text-pastel-blue-800 px-4 py-2 rounded-lg">
                      Account synced successfully
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 bg-pastel-pink-100 text-red-700 px-4 py-2 rounded-lg">
                      Error: {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default Profile;
