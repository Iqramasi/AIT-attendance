"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getCountFromServer } from "firebase/firestore";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationAlert from "@/components/UI/NotificationAlert";

export default function SystemSettings({
  users = [],
  departments = [],
  courses = [],
}) {
  const [config, setConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });

  const [systemStats, setSystemStats] = useState({
    uptime: "0 hours",
    lastBackup: "Just now",
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    totalCourses: 0,
    totalSubjects: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [firestoreLoading, setFirestoreLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  // Wrap fetchSystemStats in useCallback to prevent infinite re-renders
  const fetchSystemStats = useCallback(async () => {
    const now = Date.now();

    // Only show main loading on first load or if data is very old
    if (systemStats.totalUsers === 0 && systemStats.totalDepartments === 0) {
      setLoading(true);
    } else {
      // Only fetch Firestore data if more than 30 seconds have passed
      if (now - lastFetch < 30000) {
        // Just update local stats without fetching from Firestore
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return (
            u.createdAt && new Date(u.createdAt.seconds * 1000) > thirtyDaysAgo
          );
        }).length;

        setSystemStats((prev) => ({
          ...prev,
          totalUsers,
          activeUsers,
          totalDepartments: departments.length,
          totalCourses: courses.length,
        }));
        setLoading(false);
        return;
      }
      setFirestoreLoading(true);
    }

    try {
      // Calculate immediate stats first (no waiting)
      const totalUsers = users.length;
      const activeUsers = users.filter((u) => {
        // Consider users created in the last 30 days as "active"
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return (
          u.createdAt && new Date(u.createdAt.seconds * 1000) > thirtyDaysAgo
        );
      }).length;

      // Calculate uptime (since app start)
      const uptimeHours = Math.floor(
        (Date.now() - performance.timeOrigin) / (1000 * 60 * 60)
      );
      const uptimeDisplay =
        uptimeHours > 24
          ? `${Math.floor(uptimeHours / 24)} days ${uptimeHours % 24} hours`
          : `${uptimeHours} hours`;

      // Get last backup time (simulate with current time minus random hours)
      const lastBackupHours = Math.floor(Math.random() * 24) + 1;
      const lastBackupDisplay =
        lastBackupHours === 1 ? "1 hour ago" : `${lastBackupHours} hours ago`;

      // Update immediate stats first
      setSystemStats((prev) => ({
        ...prev,
        uptime: uptimeDisplay,
        lastBackup: lastBackupDisplay,
        totalUsers,
        activeUsers,
        totalDepartments: departments.length,
        totalCourses: courses.length,
      }));

      // Then fetch Firestore counts asynchronously
      const [subjectsCount, sessionsCount] = await Promise.all([
        getCountFromServer(collection(db, "subjects")),
        getCountFromServer(collection(db, "sessions")).catch(() => ({
          data: () => ({ count: 0 }),
        })), // Handle if sessions collection doesn't exist
      ]); // Update with Firestore data
      setSystemStats((prev) => ({
        ...prev,
        totalSubjects: subjectsCount.data().count,
        totalSessions: sessionsCount.data().count,
      }));

      setLastFetch(now);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      // Fallback to basic stats
      setSystemStats({
        uptime: "Unknown",
        lastBackup: "Unknown",
        totalUsers: users.length,
        activeUsers: Math.floor(users.length * 0.3), // Estimate 30% as active
        totalDepartments: departments.length,
        totalCourses: courses.length,
        totalSubjects: 0,
        totalSessions: 0,
      });
    } finally {
      setLoading(false);
      setFirestoreLoading(false);
    }
  }, [
    users,
    departments,
    courses,
    systemStats.totalUsers,
    systemStats.totalDepartments,
    lastFetch,
  ]); // Dependencies for useCallback

  useEffect(() => {
    const savedConfig = localStorage.getItem("firebaseConfig");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    fetchSystemStats();
  }, [fetchSystemStats]); // Now depends on the memoized function

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveConfig = () => {
    try {
      localStorage.setItem("firebaseConfig", JSON.stringify(config));
      showSuccess("Firebase configuration saved successfully!", {
        title: "Configuration Saved",
      });
    } catch (error) {
      showError("Failed to save configuration. Please try again.", {
        title: "Save Failed",
      });
    }
  };

  const ConfigInput = ({ id, label, value, onChange, type = "text" }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label} *
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none transition-colors"
        placeholder={`Enter your ${label.toLowerCase()}`}
        required
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          System Settings
        </h2>
        <p className="text-gray-600">
          Configure your application settings and monitor system status
        </p>
      </div>{" "}
      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-lg font-semibold text-green-600">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>{" "}
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">
                {systemStats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-lg font-semibold text-gray-900">
                {systemStats.activeUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? "Loading..." : systemStats.totalDepartments}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Additional Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-lg font-semibold text-gray-900">
                {loading ? "Loading..." : systemStats.totalCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              {" "}
              <p className="text-sm font-medium text-gray-600">
                Total Subjects
              </p>
              <p className="text-lg font-semibold text-gray-900 flex items-center">
                {firestoreLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {systemStats.totalSubjects}
                  </>
                ) : (
                  systemStats.totalSubjects
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>{" "}
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Sessions
              </p>
              <p className="text-lg font-semibold text-gray-900 flex items-center">
                {firestoreLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {systemStats.totalSessions}
                  </>
                ) : (
                  systemStats.totalSessions
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Firebase Configuration */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Firebase Configuration
            </h3>
            <p className="text-gray-600">
              Configure your Firebase project settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(config).map((key) => (
            <ConfigInput
              key={key}
              id={key}
              label={key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              value={config[key]}
              onChange={handleInputChange}
            />
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSaveConfig}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save Configuration{" "}
            </div>
          </button>
        </div>
      </div>{" "}
      {/* Interactive Database Schema */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Interactive Database Schema
              </h3>
              <p className="text-gray-600">
                Explore your Firestore collections and relationships
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-blue-400 mr-2"></div>
              <span>Relationships</span>
            </div>
          </div>
        </div>

        {/* Interactive Schema Diagram */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 overflow-hidden">
          {/* Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ minHeight: "600px" }}
          >
            {/* Users to Sessions */}
            <path
              d="M 200 120 Q 400 120 600 200"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {/* Departments to Courses */}
            <path
              d="M 200 280 Q 300 280 400 280"
              stroke="#8b5cf6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {/* Courses to Subjects */}
            <path
              d="M 500 280 Q 600 280 700 380"
              stroke="#f59e0b"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
            />
            {/* Subjects to Sessions */}
            <path
              d="M 700 450 Q 700 500 650 250"
              stroke="#ef4444"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>

          {/* Collection Cards */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "users",
                color: "from-green-500 to-emerald-600",
                borderColor: "border-green-200 hover:border-green-400",
                icon: "👥",
                fields: [
                  { name: "email", type: "string", key: true },
                  { name: "role", type: "string" },
                  { name: "profile", type: "object" },
                  { name: "createdAt", type: "timestamp" },
                ],
                description: "User accounts and profiles",
                relationships: ["sessions"],
                count: systemStats.totalUsers,
              },
              {
                name: "departments",
                color: "from-blue-500 to-cyan-600",
                borderColor: "border-blue-200 hover:border-blue-400",
                icon: "🏢",
                fields: [
                  { name: "id", type: "string", key: true },
                  { name: "name", type: "string" },
                ],
                description: "Academic departments",
                relationships: ["courses"],
                count: systemStats.totalDepartments,
              },
              {
                name: "courses",
                color: "from-purple-500 to-pink-600",
                borderColor: "border-purple-200 hover:border-purple-400",
                icon: "📚",
                fields: [
                  { name: "id", type: "string", key: true },
                  { name: "name", type: "string" },
                  { name: "departmentId", type: "reference" },
                ],
                description: "Available courses",
                relationships: ["subjects"],
                count: systemStats.totalCourses,
              },
              {
                name: "subjects",
                color: "from-yellow-500 to-orange-600",
                borderColor: "border-yellow-200 hover:border-yellow-400",
                icon: "📖",
                fields: [
                  { name: "name", type: "string" },
                  { name: "code", type: "string", key: true },
                  { name: "semester", type: "number" },
                  { name: "course", type: "array" },
                ],
                description: "Subject information",
                relationships: ["sessions"],
                count: systemStats.totalSubjects,
              },
              {
                name: "sessions",
                color: "from-red-500 to-rose-600",
                borderColor: "border-red-200 hover:border-red-400",
                icon: "📝",
                fields: [
                  { name: "id", type: "string", key: true },
                  { name: "teacherId", type: "reference" },
                  { name: "subjectId", type: "reference" },
                  { name: "status", type: "string" },
                  { name: "attendees", type: "array" },
                ],
                description: "Attendance sessions",
                relationships: [],
                count: systemStats.totalSessions,
              },
            ].map((collection, index) => (
              <div
                key={collection.name}
                className={`group bg-white rounded-2xl shadow-lg border-2 ${collection.borderColor} transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${collection.color} rounded-t-xl p-4 relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 text-6xl opacity-10 transform rotate-12">
                    {collection.icon}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-bold text-xl flex items-center">
                        <span className="text-2xl mr-2">{collection.icon}</span>
                        {collection.name}
                      </h4>
                      <div className="bg-white/20 rounded-full px-3 py-1">
                        <span className="text-white text-sm font-semibold">
                          {collection.count}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/90 text-sm mt-1">
                      {collection.description}
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="p-4">
                  <div className="space-y-2">
                    {collection.fields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group-hover:bg-blue-50"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-3 ${
                              field.key
                                ? "bg-yellow-400"
                                : field.type === "reference"
                                ? "bg-blue-400"
                                : field.type === "object"
                                ? "bg-purple-400"
                                : field.type === "array"
                                ? "bg-green-400"
                                : "bg-gray-400"
                            }`}
                          ></div>
                          <span className="font-mono text-gray-700 font-medium">
                            {field.name}
                          </span>
                          {field.key && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                              KEY
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            field.type === "string"
                              ? "bg-blue-100 text-blue-700"
                              : field.type === "number"
                              ? "bg-green-100 text-green-700"
                              : field.type === "reference"
                              ? "bg-purple-100 text-purple-700"
                              : field.type === "object"
                              ? "bg-orange-100 text-orange-700"
                              : field.type === "array"
                              ? "bg-pink-100 text-pink-700"
                              : field.type === "timestamp"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {field.type}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Relationships */}
                  {collection.relationships.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-4 4a4 4 0 01-5.656 0z"
                          />
                        </svg>
                        Related to:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {collection.relationships.map((rel) => (
                          <span
                            key={rel}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                          >
                            {rel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 bg-white/80 rounded-xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">
              Field Types Legend
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
              {[
                { type: "KEY", color: "bg-yellow-400", desc: "Primary Key" },
                { type: "string", color: "bg-blue-400", desc: "Text" },
                { type: "number", color: "bg-green-400", desc: "Number" },
                {
                  type: "reference",
                  color: "bg-purple-400",
                  desc: "Reference",
                },
                { type: "object", color: "bg-orange-400", desc: "Object" },
                { type: "array", color: "bg-pink-400", desc: "Array" },
              ].map((item) => (
                <div key={item.type} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${item.color} mr-2`}
                  ></div>
                  <span className="text-gray-700">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Notification Alert Component */}
      <NotificationAlert
        notifications={notifications}
        onRemove={removeNotification}
        position="top-right"
      />
    </div>
  );
}
