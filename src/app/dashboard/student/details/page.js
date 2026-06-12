"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceType } from "@/hooks/useWindowSize";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";

const COLORS = ["#16a34a", "#dc2626"]; // Green for Present, Red for Absent

// --- FIX 1: Loading State Centering ---
// Ensure the main div has min-h-screen and flex properties to center everything.
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-20 h-20">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600/30 border-t-blue-600 absolute"></div>
        <div className="animate-ping rounded-full h-20 w-20 border-4 border-blue-400/20 absolute"></div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-blue-800">
          Loading Your Attendance
        </h2>
        <p className="text-blue-600">
          Please wait while we gather your data...
        </p>
      </div>
    </div>
  </div>
);

export default function StudentAttendanceDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isMobile } = useDeviceType();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [activeTab, setActiveTab] = useState("charts");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      const fetchData = async () => {
        setPageLoading(true);
        const studentDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(studentDocRef);
        if (docSnap.exists()) {
          const studentData = docSnap.data();
          const subjects = studentData.subjects || {};
          let overallPresent = 0,
            overallAbsent = 0;
          const allSessions = [],
            subjectStats = [];

          Object.keys(subjects).forEach((subjectId) => {
            const subject = subjects[subjectId];
            const sessionDetails = subject.sessionDetails || {};
            const attended = Object.values(sessionDetails).filter(
              (s) => s.status === "present"
            ).length;
            const total = Object.keys(sessionDetails).length;
            const absent = total - attended;
            overallPresent += attended;
            overallAbsent += absent;
            Object.entries(sessionDetails).forEach(([sessionId, details]) => {
              allSessions.push({
                sessionId,
                subjectName: subject.subjectName || subjectId,
                subjectCode: subject.subjectCode || subjectId,
                status: details.status,
                timestamp: details.timestamp.toDate(),
              });
            });
            subjectStats.push({
              name: subject.subjectName || subjectId,
              percentage: total > 0 ? Math.round((attended / total) * 100) : 0,
            });
          });

          allSessions.sort((a, b) => b.timestamp - a.timestamp);

          setAttendanceData({
            overallChartData: [
              { name: "Present", value: overallPresent },
              { name: "Absent", value: overallAbsent },
            ],
            subjectChartData: subjectStats,
            detailedLog: allSessions,
          });
        }
        setPageLoading(false);
      };
      fetchData();
    }
  }, [user, authLoading, router]);

  if (authLoading || pageLoading || !attendanceData) {
    return <LoadingSpinner datam="Attendance Report" />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "charts":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Overall Attendance Pie Chart */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-3 shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Overall Attendance
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={attendanceData.overallChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {attendanceData.overallChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Subject-wise Performance Bar Chart */}
            <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-3 shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Subject-wise Performance
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <BarChart
                  data={attendanceData.subjectChartData}
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 20,
                    left: isMobile ? -20 : -10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    interval={isMobile ? "preserveStartEnd" : 0}
                  />
                  <YAxis
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="percentage"
                    fill="url(#barGradient)"
                    name="Attendance Percentage"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "log":
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-xl mr-4 shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    Attendance Log
                  </h3>
                  <p className="text-purple-100 opacity-90">
                    Detailed history of all your attendance records
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {attendanceData.detailedLog.map((session, index) => (
                    <tr
                      key={session.sessionId}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {session.timestamp.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {session.subjectName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.subjectCode}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                            session.status === "present"
                              ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                              : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                          }`}
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 sm:mb-6 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 bg-clip-text text-transparent mb-2 sm:mb-4 pt-4">
              Attendance Details
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              A detailed breakdown of your attendance records
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:border-blue-200 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {attendanceData.overallChartData.reduce(
                      (sum, item) => sum + item.value,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:border-green-200 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Present
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceData.overallChartData.find(
                      (item) => item.name === "Present"
                    )?.value || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:border-purple-200 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Percentage
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const total = attendanceData.overallChartData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      );
                      const present =
                        attendanceData.overallChartData.find(
                          (item) => item.name === "Present"
                        )?.value || 0;
                      return total > 0
                        ? Math.round((present / total) * 100)
                        : 0;
                    })()}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-1 flex space-x-1 border border-white/20 overflow-hidden">
              <button
                onClick={() => setActiveTab("charts")}
                className={`px-4 sm:px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 transform ${
                  activeTab === "charts"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  {isMobile ? "Charts" : "Visual Charts"}
                </div>
              </button>
              <button
                onClick={() => setActiveTab("log")}
                className={`px-4 sm:px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 transform ${
                  activeTab === "log"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {isMobile ? "Log" : "Detailed Log"}
                </div>
              </button>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
}
