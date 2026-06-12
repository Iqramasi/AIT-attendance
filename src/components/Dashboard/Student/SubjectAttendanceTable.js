"use client";

export default function SubjectAttendanceTable({ subjectWiseStats, isMobile }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 mb-8 sm:mb-12">
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-3 sm:mr-4 shadow-lg">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
          {isMobile ? "Subject Attendance" : "Subject-wise Attendance"}
        </h2>
        <p className="text-gray-600 mt-2 ml-10 sm:ml-14 text-sm sm:text-base">
          {isMobile
            ? "Your attendance by subject"
            : "View your attendance record for each subject"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                Classes Attended
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                Total Classes
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Percentage
              </th>
              <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {subjectWiseStats.length > 0 ? (
              subjectWiseStats.map((subject) => (
                <tr
                  key={subject.subjectId}
                  className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200"
                >
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {subject.subjectName}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {subject.subjectCode}
                      </div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {subject.attendedClasses}/{subject.totalClasses} classes
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-sm font-medium text-gray-900 hidden sm:table-cell">
                    {subject.attendedClasses}
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-sm font-medium text-gray-900 hidden sm:table-cell">
                    {subject.totalClasses}
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="text-sm font-bold text-gray-900 mb-2 sm:mb-0">
                        {subject.percentage}%
                      </div>
                      <div className="w-full sm:w-20 sm:ml-3 bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                        <div
                          className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
                            subject.percentage >= 75
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : subject.percentage >= 50
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : "bg-gradient-to-r from-red-400 to-red-500"
                          }`}
                          style={{
                            width: `${Math.min(subject.percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="md:hidden mt-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                            subject.percentage >= 75
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : subject.percentage >= 50
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {subject.percentage >= 75
                            ? "Excellent"
                            : subject.percentage >= 50
                            ? "Average"
                            : "Needs Improvement"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap hidden md:table-cell">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        subject.percentage >= 75
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : subject.percentage >= 50
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {subject.percentage >= 75
                        ? "Excellent"
                        : subject.percentage >= 50
                        ? "Average"
                        : "Needs Improvement"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 sm:px-8 py-8 sm:py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      {/* SVG Icon */}
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No attendance records found
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base">
                      {isMobile
                        ? "Start attending classes and scan QR codes"
                        : "Start attending classes and scan QR codes to see your attendance."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
