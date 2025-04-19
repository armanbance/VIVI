import { useAuth0 } from "@auth0/auth0-react";
import { useUserSync } from "../hooks/useUserSync";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { isUserSynced, error } = useUserSync();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div>
        {user && (
          <>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <p>
              {isUserSynced
                ? "User data synced with database"
                : "Syncing user data..."}
            </p>
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
          </>
        )}
      </div>
    )
  );
};

export default Profile;
