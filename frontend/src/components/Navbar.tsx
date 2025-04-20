import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              VIVI
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/recorder"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                >
                  Recorder
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                >
                  Profile
                </Link>
                <button
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-400 hover:text-white focus:outline-none"
              onClick={toggleMenu}
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/recorder"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Recorder
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    });
                  }}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
