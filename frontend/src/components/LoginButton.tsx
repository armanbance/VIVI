// src/components/LoginButton.jsx
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = ({ className = "" }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
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
      Log In
    </button>
  );
};

export default LoginButton;
