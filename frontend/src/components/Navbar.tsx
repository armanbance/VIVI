// src/components/Navbar.jsx
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../components/LoginButton";
import LogoutButton from "../components/LogoutButton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import icon from "../assets/icon.png";

const Navbar = () => {
  const { isAuthenticated } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToAbout = () => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollToAbout: true } });
    } else {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        // Add a small offset to account for navbar height
        const navbarHeight = 64; // Approximate height of navbar (16 * 4 = 64px)
        const elementPosition = aboutSection.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
    setIsMenuOpen(false);
  };

  const scrollToResearch = () => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollToResearch: true } });
    } else {
      const researchSection = document.getElementById("research");
      if (researchSection) {
        // Calculate a better vertical centering
        const navbarHeight = 64; // Approximate height of navbar
        const viewportHeight = window.innerHeight;
        const elementHeight = researchSection.offsetHeight;
        const elementPosition = researchSection.getBoundingClientRect().top;

        // Calculate offset to center the element vertically, accounting for navbar
        const centerOffset = (viewportHeight - elementHeight) / 2;
        const offsetPosition =
          elementPosition + window.pageYOffset - centerOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (location.state?.scrollToAbout) {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          // Add a small offset to account for navbar height
          const navbarHeight = 64; // Approximate height of navbar (16 * 4 = 64px)
          const elementPosition = aboutSection.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 100);
      }
      // Clear the state after scrolling
      navigate(location.pathname, { state: {}, replace: true });
    }

    if (location.state?.scrollToResearch) {
      const researchSection = document.getElementById("research");
      if (researchSection) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          // Calculate a better vertical centering
          const navbarHeight = 64; // Approximate height of navbar
          const viewportHeight = window.innerHeight;
          const elementHeight = researchSection.offsetHeight;
          const elementPosition = researchSection.getBoundingClientRect().top;

          // Calculate offset to center the element vertically, accounting for navbar
          const centerOffset = (viewportHeight - elementHeight) / 2;
          const offsetPosition =
            elementPosition + window.pageYOffset - centerOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 100);
      }
      // Clear the state after scrolling
      navigate(location.pathname, { state: {}, replace: true });
    }
  }, [location, navigate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Function to navigate to a route and ensure we start at the top
  const navigateToRoute = (route: string) => {
    navigate(route);
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={scrollToTop}
            >
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
            <button
              onClick={scrollToAbout}
              className="text-[#9076ff] hover:text-purple-800 px-3 py-2 rounded-md transition duration-300"
            >
              About
            </button>
            <button
              onClick={scrollToResearch}
              className="text-[#9076ff] hover:text-purple-800 px-3 py-2 rounded-md transition duration-300"
            >
              Research
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigateToRoute("/recorder")}
                  className="text-[#9076ff] hover:text-purple-800 px-3 py-2 rounded-md transition
        duration-300"
                >
                  Compiler
                </button>
                <button
                  onClick={() => navigateToRoute("/profile")}
                  className="text-[#9076ff] hover:text-purple-800 px-3 py-2 rounded-md transition
        duration-300"
                >
                  Profile
                </button>
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
            <button
              onClick={() => {
                navigateToRoute("/");
              }}
              className="w-full text-left text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
            >
              Home
            </button>

            <button
              onClick={scrollToAbout}
              className="w-full text-left text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
            >
              About
            </button>

            <button
              onClick={scrollToResearch}
              className="w-full text-left text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
            >
              Research
            </button>

            {!isAuthenticated ? (
              <div onClick={() => setIsMenuOpen(false)}>
                <LoginButton className="w-full block text-center" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigateToRoute("/recorder")}
                  className="w-full text-left text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
                >
                  Recorder
                </button>
                <button
                  onClick={() => navigateToRoute("/profile")}
                  className="w-full text-left text-[#9076ff] hover:text-purple-800 block px-3 py-2 rounded-md"
                >
                  Profile
                </button>
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
