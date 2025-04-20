import { useAuth0 } from "@auth0/auth0-react";
import Profile from "../components/Profile";
import LogoutButton from "../components/LogoutButton";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SessionAnalytics {
  total_words: number;
  num_queries: number;
  avg_words_per_query: number;
  dictlist: any[];
}

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth0();

  const [analyticsData, setAnalyticsData] = useState<SessionAnalytics | null>(
    null
  );
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchAnalytics = async () => {
        setIsLoadingAnalytics(true);
        setAnalyticsError(null);
        try {
          const response = await axios.get<SessionAnalytics>(
            "http://localhost:8000/session-analytics"
          );
          setAnalyticsData(response.data);
        } catch (error) {
          console.error("Error fetching session analytics:", error);
          setAnalyticsError("Failed to load session analytics.");
        } finally {
          setIsLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    } else {
      setIsLoadingAnalytics(false);
    }
  }, [isAuthenticated]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Please log in to view your profile
          </h2>
          <Link
            to="/login"
            className="mt-6 px-8 py-4 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const Chart = ({ data }: { data: any[] }) => (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="query" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="words" stroke="#8884d8" />
    </LineChart>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          </div>

          <div className="mb-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Account Details
            </h2>
            <Profile />
          </div>

          <div className="mb-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Session Analytics
            </h2>
            {isLoadingAnalytics && (
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                <span>Loading analytics...</span>
              </div>
            )}
            {analyticsError && (
              <p className="text-red-600 text-center">{analyticsError}</p>
            )}
            {!isLoadingAnalytics && !analyticsError && analyticsData && (
              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Total Words Transcribed:</span>
                  <span className="font-medium text-gray-800">
                    {analyticsData.total_words}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Recordings:</span>
                  <span className="font-medium text-gray-800">
                    {analyticsData.num_queries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Words per Recording:</span>
                  <span className="font-medium text-gray-800">
                    {analyticsData.avg_words_per_query}
                  </span>
                </div>
              </div>
            )}
            {!isLoadingAnalytics && !analyticsError && !analyticsData && (
              <p className="text-gray-500 text-center">
                No analytics data available yet. Try recording something!
              </p>
            )}
          </div>

          <div className="flex justify-center mb-8">
            <Chart data={analyticsData?.dictlist || []} />
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <Link
              to="/"
              className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out"
            >
              Back to Home
            </Link>
            <Link
              to="/recorder"
              className="px-6 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium rounded-lg hover:bg-[#4e398e] transition duration-150 ease-in-out shadow-sm"
            >
              Go to Recorder
            </Link>
          </div>

          <div className="text-center">
            <LogoutButton className="px-6 py-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
