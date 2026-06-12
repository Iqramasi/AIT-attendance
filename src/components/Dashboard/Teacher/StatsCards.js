export default function StatsCards({
  activeSessionsCount,
  coursesCount,
  subjectsCount,
  isMobile,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
      {/* Active Sessions Card */}
      <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-blue-200 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
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
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
          </div>
          <div className="ml-4 sm:ml-6 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {isMobile ? "Sessions" : "Active Sessions"}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {activeSessionsCount}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1">
              {isMobile ? "Running" : "Currently running"}
            </p>
          </div>
        </div>
      </div>

      {/* Total Courses Card */}
      <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-green-200 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="ml-4 sm:ml-6 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {isMobile ? "Courses" : "Total Courses"}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {coursesCount}
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">
              {isMobile ? "Available" : "Available courses"}
            </p>
          </div>
        </div>
      </div>

      {/* Available Subjects Card */}
      <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-purple-200 hover:-translate-y-1">
        <div className="flex items-center">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div className="ml-4 sm:ml-6 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {isMobile ? "Subjects" : "Available Subjects"}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {subjectsCount}
            </p>
            <p className="text-xs text-purple-600 font-medium mt-1">
              {isMobile ? "Ready" : "Ready to teach"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
