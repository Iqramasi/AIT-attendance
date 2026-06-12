"use client";

export default function StudentHeader({ studentProfile, user, isMobile }) {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
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
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 bg-clip-text text-transparent mb-2 sm:mb-4">
        {isMobile ? "Dashboard" : "Student Dashboard"}
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6 px-4">
        {isMobile ? "Welcome back!" : "Welcome back,"}{" "}
        {!isMobile && (
          <span className="font-semibold text-gray-800">
            {studentProfile?.profile?.name || user.email}
          </span>
        )}
        {!isMobile && "!"}
      </p>
    </div>
  );
}
