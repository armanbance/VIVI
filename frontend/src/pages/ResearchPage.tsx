import { Link } from "react-router-dom";
import { useEffect } from "react";

const ResearchPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f5f2ff] via-white to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-12">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-[#9076ff]">
            Our <span className="text-[#9076ff]">Research</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Exploring the impact of multisensory learning for neurodivergent learners
          </p>
        </div>

        {/* Section Divider */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gradient-to-r from-[#f5f2ff] via-white to-blue-50 text-lg font-medium text-[#9076ff]">
              Research Insights
            </span>
          </div>
        </div>

        {/* Section 1: Understanding Neurodivergence */}
        <section className="prose prose-lg max-w-none mb-16 bg-white rounded-xl shadow-sm p-8 transform transition-all hover:shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#9076ff]/30">Understanding Neurodivergence in the Classroom</h2>
          <p className="text-gray-700">Neurodivergent conditions such as autism, ADHD, dyslexia, and aphantasia are common in school-aged children, each affecting how students learn and process information.</p>
          <ul className="list-none pl-0 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li className="flex items-center bg-[#f5f2ff] p-3 rounded-lg"><span className="text-[#9076ff] font-bold mr-2">ADHD:</span> ~11% of U.S. children</li>
            <li className="flex items-center bg-[#f5f2ff] p-3 rounded-lg"><span className="text-[#9076ff] font-bold mr-2">Dyslexia:</span> 5–15% of the population</li>
            <li className="flex items-center bg-[#f5f2ff] p-3 rounded-lg"><span className="text-[#9076ff] font-bold mr-2">Autism (ASD):</span> ~3% of children</li>
            <li className="flex items-center bg-[#f5f2ff] p-3 rounded-lg"><span className="text-[#9076ff] font-bold mr-2">Aphantasia:</span> 1–5% of individuals</li>
          </ul>
        </section>

        {/* Section 2: Learning Challenges & Strengths */}
        <section className="prose prose-lg max-w-none mb-16 bg-white rounded-xl shadow-sm p-8 transform transition-all hover:shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#9076ff]/30">Learning Challenges & Strengths by Condition</h2>
          <p className="text-gray-700">Each condition presents unique barriers and advantages:</p>
          <ul className="list-none pl-0 mt-4 space-y-3">
            <li className="p-4 border-l-4 border-[#9076ff] bg-[#f5f2ff]/50 rounded-r-lg"><span className="font-bold text-[#9076ff]">ASD:</span> Strong visual learners, benefit from structure and literal instruction</li>
            <li className="p-4 border-l-4 border-[#9076ff] bg-[#f5f2ff]/50 rounded-r-lg"><span className="font-bold text-[#9076ff]">ADHD:</span> Thrive in interactive, hands-on, and multi-sensory environments</li>
            <li className="p-4 border-l-4 border-[#9076ff] bg-[#f5f2ff]/50 rounded-r-lg"><span className="font-bold text-[#9076ff]">Dyslexia:</span> Struggle with decoding text, but excel in verbal and creative tasks</li>
            <li className="p-4 border-l-4 border-[#9076ff] bg-[#f5f2ff]/50 rounded-r-lg"><span className="font-bold text-[#9076ff]">Aphantasia:</span> Can't visualize, but succeed with real visuals and logical learning</li>
          </ul>
        </section>

        {/* Section 3: Modalities Table */}
        <section className="prose prose-lg max-w-none mb-16 bg-white rounded-xl shadow-sm p-8 transform transition-all hover:shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#9076ff]/30">Modality Performance Across Neurodivergent Profiles</h2>
          <div className="overflow-x-auto mt-6">
            <table className="table-auto w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#9076ff]/10">
                  <th className="p-4 border border-gray-200 rounded-tl-lg font-bold text-[#9076ff]">Modality</th>
                  <th className="p-4 border border-gray-200 font-bold text-[#9076ff]">Works Best For</th>
                  <th className="p-4 border border-gray-200 rounded-tr-lg font-bold text-[#9076ff]">Less Effective For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border border-gray-200 font-medium">Text Reading</td>
                  <td className="p-4 border border-gray-200">ASD (some), Aphantasia</td>
                  <td className="p-4 border border-gray-200">Dyslexia, ADHD</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border border-gray-200 font-medium">Visual Aids</td>
                  <td className="p-4 border border-gray-200">ASD, Dyslexia, ADHD, Aphantasia</td>
                  <td className="p-4 border border-gray-200">ADHD (if overstimulated)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border border-gray-200 font-medium">Spoken Audio</td>
                  <td className="p-4 border border-gray-200">Dyslexia, Aphantasia</td>
                  <td className="p-4 border border-gray-200">ASD (idioms), ADHD (long lectures)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-4 border border-gray-200 rounded-bl-lg font-medium">Interactive Conversation</td>
                  <td className="p-4 border border-gray-200">ADHD, Dyslexia, ASD (structured)</td>
                  <td className="p-4 border border-gray-200 rounded-br-lg">ASD (unstructured discussions)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Why VIVI? */}
        <section className="prose prose-lg max-w-none mb-16 bg-white rounded-xl shadow-sm p-8 transform transition-all hover:shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#9076ff]/30">How VIVI Supports Every Learner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-[#f5f2ff]/30 rounded-lg flex items-start">
              <div className="mr-3 text-[#9076ff] font-bold">1.</div>
              <div><span className="font-bold">Individualized Learning:</span> Adapts content to visual, audio, or text preferences</div>
            </div>
            <div className="p-4 bg-[#f5f2ff]/30 rounded-lg flex items-start">
              <div className="mr-3 text-[#9076ff] font-bold">2.</div>
              <div><span className="font-bold">Enhanced Engagement:</span> Detects attention and dynamically re-engages students</div>
            </div>
            <div className="p-4 bg-[#f5f2ff]/30 rounded-lg flex items-start">
              <div className="mr-3 text-[#9076ff] font-bold">3.</div>
              <div><span className="font-bold">Multimodal Explanation:</span> Combines speech + images for deeper understanding</div>
            </div>
            <div className="p-4 bg-[#f5f2ff]/30 rounded-lg flex items-start">
              <div className="mr-3 text-[#9076ff] font-bold">4.</div>
              <div><span className="font-bold">Accessible Expression:</span> Accepts responses via voice, gaze, or image selection</div>
            </div>
            <div className="p-4 bg-[#f5f2ff]/30 rounded-lg flex items-start">
              <div className="mr-3 text-[#9076ff] font-bold">5.</div>
              <div><span className="font-bold">Low-Pressure Learning:</span> Safe, judgment-free practice space for kids with anxiety</div>
            </div>
            <div className="p-4 bg-[#f5f2ff]/30 rounded-lg flex items-start">
              <div className="mr-3 text-[#9076ff] font-bold">6.</div>
              <div><span className="font-bold">Immediate Feedback:</span> Reinforces learning in real-time, increasing retention</div>
            </div>
            <div className="p-4 bg-[#f5f2ff]/30 rounded-lg flex items-start md:col-span-2">
              <div className="mr-3 text-[#9076ff] font-bold">7.</div>
              <div><span className="font-bold">Boosted Inclusion:</span> Helps students fully participate in class with reduced barriers</div>
            </div>
          </div>
        </section>

        {/* CTA Button */}
        <div className="text-center mt-16 mb-8">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-[#9076ff] to-[#7c5eff] hover:from-[#7c5eff] hover:to-[#4e398e] rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <span>Back to Home</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;