"use client";

export default function StudentStatsCards({
  overallStats,
  subjectWiseStats,
  studentProfile,
  isMobile,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
      {/* Overall Attendance Card */}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4 sm:ml-6 min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {isMobile ? "Attendance" : "Overall Attendance"}
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {overallStats.percentage}%
            </p>
            <p className="text-xs text-green-600 font-medium mt-1 truncate">
              {overallStats.present} / {overallStats.total} classes
            </p>
          </div>
        </div>
      </div>

      {/* Total Subjects Card */}
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="ml-4 sm:ml-6 min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              {isMobile ? "Subjects" : "Total Subjects"}
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {subjectWiseStats.length}
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1">
              {isMobile ? "Enrolled" : "Enrolled subjects"}
            </p>
          </div>
        </div>
      </div>

      {/* Department Card */}
      <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-purple-200 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4 sm:ml-6 min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Department
            </h3>
            <p className="text-lg sm:text-xl font-bold text-purple-600 uppercase truncate">
              {studentProfile?.profile?.department || "N/A"}
            </p>
            <p className="text-xs text-purple-600 font-medium mt-1">
              {isMobile ? "Dept" : "Academic unit"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
