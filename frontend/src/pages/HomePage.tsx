import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import icon from "../assets/icon.png";
import groupPhoto from "../assets/groupPhoto.png";

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="
         min-h-screen
        bg-gradient-to-tr from-[#f5f2ff] via-white to-blue-50
        flex flex-col justify-center
        px-4 sm:px-6 lg:px-8
      "
    >
      <div className=" mt-36 max-w-3xl mx-auto">
        <div className="text-center">
          {/* Optional book icon above the title */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-8 rounded-full shadow-lg">
              <img
                src={icon}
                alt="Vivi Logo"
                className=" w-32 object-contain text-[#9076ff]"
              />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900">
            Welcome to <span className="text-[#9076ff]">VIVI</span>
          </h1>

          {/* — badges under the heading — */}

          <p className="mt-6 max-w-xl mx-auto text-lg sm:text-xl text-gray-600">
            Your AI‑powered audio‑to‑image book companion
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center space-y-6">
          {isAuthenticated ? (
            <div className="space-y-4 space-x-4">
              <Link
                to="/recorder"
                className="inline-block px-8 py-3 text-lg font-medium text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg transition-all duration-300"
              >
                Go to Recorder
              </Link>
              <Link
                to="/profile"
                className="inline-block px-8 py-3 text-lg font-medium text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg transition-all duration-300"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              <Link
                to="/login"
                className="inline-block px-10 py-4 text-lg font-semibold text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg transition duration-300 mb-4"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
        <div className="mb-32 rounded-full max-w-96 p-1 bg-gradient-to-r from-[#9076ff] to-[#4e398e] hover:from-[#4e398e] hover:to-[#9076ff] transition duration-300 mx-auto">
          <a
            href="/files/vivi-chrome.zip"
            download="vivi-chrome.zip"
            className="block px-5 py-4 text-lg font-semibold text-[#4e398e] bg-white rounded-full shadow-lg hover:text-[#9076ff] transition text-center transition duration-300"
          >
            Download Our Chrome Extension!
          </a>
        </div>
      </div>
      <div className="mt-32 mb-32" id="about">
        <h1 className="mt-32 text-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900">
          About <span className="text-[#9076ff]">Us</span>
        </h1>
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mt-16 max-w-5xl mx-auto px-4">
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed md:max-w-xl">
            We're a team of four student developers — Pranav Bhatt, Arman Bance,
            Ryan Johnson, and Daniel Nguyen — brought together by a shared
            passion for building impactful technology for good. With backgrounds
            spanning AI, computer vision, full-stack development, and systems
            design, we combined our strengths to create an experience that helps
            neurodivergent users bring their imagination to life. We thrive on
            hacking together creative solutions fast, learning from each other,
            and pushing the boundaries of what's possible with machine learning
            and accessible design.
          </p>
          <img
            src={groupPhoto}
            alt="Group Photo"
            className="rounded-lg w-full md:w-2/5 object-cover self-center"
          />
        </div>
      </div>
      <div className="mt-32 mb-32" id="research">
        <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900">
          Research <span className="text-[#9076ff]">Summary</span>
        </h1>
        <div className="mt-16 max-w-8xl mx-auto px-4">
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Neurodivergent learners, particularly children with conditions like
            autism spectrum disorder (ASD) and aphantasia, often face
            significant challenges with traditional text-based learning.
            Research shows that 65–80% of individuals with ASD experience
            difficulties with imagination-based tasks, including reading
            comprehension and mental imagery formation. Aphantasia, which
            affects an estimated 3–5% of the population, further impedes a
            learner's ability to visualize concepts or narratives. These
            barriers can severely impact engagement, memory retention, and
            self-expression when learning through books or lectures alone.
            Meanwhile, comorbid conditions like ADHD contribute to attention
            regulation difficulties, reducing time spent in productive
            engagement and limiting a learner's ability to derive meaning from
            static content.
          </p>
        </div>
        <div className="mt-16 max-w-8xl mx-auto px-4">
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            By transforming textual input into dynamic, personalized visual and
            auditory content, our application VIVI bridges this critical
            learning gap. Our solution leverages gaze detection to sense user
            attention, OpenAI's Whisper and GPT models to transcribe and
            interpret voice input, and DALL·E to generate customized
            illustrations, all in real time. This multimodal approach enhances
            comprehension by providing visual, oral, and interactive layers that
            cater to a wider spectrum of cognitive processing styles.
            Evidence-backed benefits of multisensory learning include 50% higher
            recall rates, increased engagement, and improved emotional
            connection to educational material, especially for neurodivergent
            children. Our research-informed strategy ensures not only
            inclusivity but also positions VIVI as a meaningful tool for
            accessible, human-centered learning.
          </p>
        </div>
        <div className="flex justify-center mt-8">
          <Link
            to="/research"
            className="px-8 py-3 text-lg font-medium text-white bg-[#9076ff] hover:bg-[#4e398e] rounded-full shadow-lg transition-all duration-300"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
