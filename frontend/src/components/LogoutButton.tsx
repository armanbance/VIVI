// src/components/LogoutButton.jsx
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = ({ className = "" }) => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className={`
        bg-purple-600
        hover:bg-purple-700
        text-white
        font-semibold
        px-6 py-3
        rounded-full
        shadow-lg
        transition
        transform hover:scale-105
        ${className}
      `}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
