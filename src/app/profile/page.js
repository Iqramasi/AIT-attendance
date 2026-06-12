"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDeviceType } from "@/hooks/useWindowSize";
// --- Step 1: Import Firestore functions ---
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper component for displaying a single profile detail
const ProfileDetail = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="group py-4 sm:py-6 px-4 sm:px-6 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-300 rounded-xl">
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <dt className="text-sm font-semibold text-gray-600 mb-1">{label}</dt>
          <dd className="text-base font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
            {value}
          </dd>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, userRole, loading: authLoading } = useAuth(); // Get user and auth loading state
  const { isMobile, isTablet, deviceType } = useDeviceType();
  const router = useRouter();

  // --- Step 2: Create state for this page's data and loading status ---
  const [profileData, setProfileData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if auth is done and there's no user
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // --- Step 3: Fetch profile data when user is available ---
    if (user) {
      const fetchProfile = async () => {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            // We set the profile data from the 'profile' sub-object in Firestore
            setProfileData(docSnap.data().profile);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          // --- Step 4: Always set page loading to false after trying to fetch ---
          setPageLoading(false);
        }
      };

      fetchProfile();
    }
  }, [user, authLoading, router]);
  // --- Step 5: Update the loading condition ---
  // Show spinner if either auth is loading OR the page is fetching data
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-200 rounded-full animate-ping opacity-20 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }
  // If we are done loading but have no data, show an error or redirect
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Profile Not Found
          </h3>
          <p className="text-gray-600">
            Could not load your profile information.
          </p>
        </div>
      </div>
    );
  }
  const userInitial = (profileData.name || user.email || "A")
    .charAt(0)
    .toUpperCase();

  // Helper function to get role badge styling
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      case "teacher":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "student":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const gotoDashboard = (role) => {
    switch (role) {
      case "admin":
        return router.push("/dashboard/admin");
      case "teacher":
        return router.push("/dashboard/teacher");
      case "student":
        return router.push("/dashboard/student");
      default:
        return router.push("/404");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="py-6 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 sm:mb-4">
              {isMobile ? "Profile" : "My Profile"}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              {isMobile ? "Account Details" : "Manage your account information"}
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
            {/* Profile Header */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <div className="h-20 w-20 sm:h-28 sm:w-28 bg-white rounded-full overflow-hidden border-4 border-white/20 shadow-2xl transform transition-all duration-300 group-hover:scale-105">
                    {profileData.photoURL ? (
                      <img
                        className="h-full w-full object-cover"
                        src={profileData.photoURL}
                        alt="Profile"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 text-2xl sm:text-4xl font-bold">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {profileData.name || "User"}
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-base mb-4 opacity-90">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getRoleBadgeStyle(
                        userRole
                      )} transform transition-all duration-300 hover:scale-105`}
                    >
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
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl mr-3 shadow-lg">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                Account Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ProfileDetail
                  label="Full Name"
                  value={profileData.name}
                  icon={
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />
                <ProfileDetail
                  label="Email Address"
                  value={user.email}
                  icon={
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />

                {userRole === "student" && (
                  <>
                    <ProfileDetail
                      label="Course"
                      value={profileData.course}
                      icon={
                        <svg
                          className="w-4 h-4 text-white"
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
                      }
                    />
                    <ProfileDetail
                      label="Semester"
                      value={profileData.semester}
                      icon={
                        <svg
                          className="w-4 h-4 text-white"
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
                      }
                    />
                    <ProfileDetail
                      label="Department"
                      value={profileData.department}
                      icon={
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 012-2h2a2 2 0 012 2v5M7 7h10M7 11h4"
                          />
                        </svg>
                      }
                    />
                  </>
                )}
                {userRole === "teacher" && (
                  <ProfileDetail
                    label="Department"
                    value={profileData.department}
                    icon={
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 012-2h2a2 2 0 012 2v5M7 7h10M7 11h4"
                        />
                      </svg>
                    }
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {isMobile ? "Edit" : "Edit Profile"}
                  </button>
                  <button
                    onClick={() => gotoDashboard(userRole)}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    {isMobile ? "Home" : "Back to Dashboard"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
