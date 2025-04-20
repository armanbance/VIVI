import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { BookOpen, Sparkles, Image } from "lucide-react";

type HeroSectionProps = {
  isAuthenticated: boolean;
};

const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated }) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f3ff] to-[#f0f9ff] py-16 sm:py-24">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#fef08a] opacity-20 blur-3xl transform animate-float"></div>
        <div className="absolute top-[30%] right-[15%] w-72 h-72 rounded-full bg-[#fbcfe8] opacity-20 blur-3xl transform animate-float-delayed"></div>
        <div className="absolute bottom-[20%] left-[20%] w-80 h-80 rounded-full bg-[#bae6fd] opacity-20 blur-3xl transform animate-float-slow"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <BookOpen className="h-10 w-10 text-[#8b5cf6]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-[#27272a] sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
              Welcome to <span className="text-[#7c3aed]">VIVI</span>
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="flex items-center bg-white py-1 px-4 rounded-full shadow-sm">
                <Sparkles className="h-5 w-5 text-[#facc15] mr-2" />
                <p className="text-[#52525b] font-medium">AI-powered</p>
              </div>
              <div className="flex items-center bg-white py-1 px-4 rounded-full shadow-sm">
                <Image className="h-5 w-5 text-[#38bdf8] mr-2" />
                <p className="text-[#52525b] font-medium">Audio-to-Image</p>
              </div>
            </div>
            <p className="mt-5 max-w-xl mx-auto text-xl text-[#52525b]">
              Turn any story into vivid images to help with reading
              comprehension and imagination
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/recorder"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transform hover:scale-105 transition-all duration-300 md:py-4 md:text-lg md:px-10"
                  >
                    Start Recording
                  </Link>
                  <Link
                    to="/profile"
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-[#6d28d9] bg-white hover:bg-[#f5f3ff] transition-all duration-300 md:py-4 md:text-lg md:px-10"
                  >
                    View Profile
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => loginWithRedirect()}
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transform hover:scale-105 transition-all duration-300 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
