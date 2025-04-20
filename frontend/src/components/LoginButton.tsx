// src/components/LoginButton.jsx
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = ({ className = "" }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
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
      Log In
    </button>
  );
};

export default LoginButton;
