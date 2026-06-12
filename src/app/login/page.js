"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDeviceType } from "../../hooks/useWindowSize";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationAlert from "../../components/UI/NotificationAlert";

export default function Login() {
  const { signIn, user, userRole } = useAuth();
  const { isMobile } = useDeviceType();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
  } = useNotifications();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole) {
      if (userRole === "student") {
        router.push("/dashboard/student");
      } else if (userRole === "teacher") {
        router.push("/dashboard/teacher");
      } else if (userRole === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/");
      }
    }
  }, [user, userRole, router]);
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = await signIn(data.email, data.password);

      if (result) {
        showSuccess("Welcome back! Redirecting to your dashboard...", {
          title: "Login Successful",
          duration: 3000,
        });
        // The useEffect above will handle the redirect
      }
    } catch (error) {
      let errorMessage = "Failed to sign in. Please check your credentials.";
      let errorTitle = "Login Failed";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
        errorTitle = "User Not Found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
        errorTitle = "Wrong Password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
        errorTitle = "Invalid Email";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed login attempts. Please try again later.";
        errorTitle = "Too Many Attempts";
      }

      showError(errorMessage, { title: errorTitle });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          <div className="text-center">
            {/* Logo */}
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
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
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isMobile ? "Atria Attendance" : "Atria Attendance System"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account{" "}
            </p>
          </div>

          <form
            className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type="password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isMobile ? "Signing in..." : "Signing in..."}
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>{" "}
          </form>
        </div>
      </div>

      {/* Notification Alert Component */}
      <NotificationAlert
        notifications={notifications}
        onRemove={removeNotification}
        position="top-right"
      />
    </div>
  );
}
