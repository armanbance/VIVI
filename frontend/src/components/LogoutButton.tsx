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
        bg-[#9076ff]
        hover:bg-[#4e398e]
        text-white
        font-semibold
        px-6 py-3
        rounded-full
        shadow-lg
        transition
        duration-300
        ${className}
      `}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
