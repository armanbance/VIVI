// src/components/Navbar.jsx
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import { Link } from "react-router-dom";
import { useState } from "react";
import icon from "../assets/icon.png";

const Navbar = () => {
  const { isAuthenticated } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white p-1 rounded-full">
                <img
                  src={icon}
                  alt="Vivi logo"
                  className="h-6 w-6 text-[#9076ff]"
                />
              </div>
              <span
                className="text-[#9076ff] hover:text-[#4e398e] font-bold text-3xl transition
        duration-300"
              >
                VIVI
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/"
              className="text-[#9076ff] hover:text-[#4e398e] px-3 py-2 rounded-md transition duration-300"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/recorder"
                  className="text-[#9076ff] hover:text-purple-800 px-3 py-2 rounded-md transition
        duration-300"
                >
                  Recorder
                </Link>
                <Link
                  to="/profile"
                  className="text-[#9076ff] hover:text-purple-800 px-3 py-2 rounded-md transition
        duration-300"
                >
                  Profile
                </Link>
                <LogoutButton />
              </>
            ) : (
              <LoginButton />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-[#9076ff] hover:text-purple-800 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
            >
              Home
            </Link>

            {!isAuthenticated ? (
              <div onClick={() => setIsMenuOpen(false)}>
                <LoginButton className="w-full block text-center" />
              </div>
            ) : (
              <>
                <Link
                  to="/recorder"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
                >
                  Recorder
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
                >
                  Profile
                </Link>
                <div onClick={() => setIsMenuOpen(false)}>
                  <LogoutButton className="w-full block text-center" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
