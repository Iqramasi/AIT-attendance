"use client";

export default function QuickActions({ openScanner, isMobile, opendetails }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-3 sm:mr-4 shadow-lg">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          Quick Actions
        </h2>
        <p className="text-gray-600 mt-2 ml-10 sm:ml-14 text-sm sm:text-base">
          {isMobile
            ? "Quick access to features"
            : "Access frequently used features"}
        </p>
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <button
            onClick={openScanner}
            className="group flex items-center p-4 sm:p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
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
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div className="text-left min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                {isMobile ? "Scan QR" : "Scan QR Code"}
              </h4>
              <p className="text-sm text-gray-600 font-medium">
                {isMobile
                  ? "Mark attendance"
                  : "Mark attendance for current class"}
              </p>
            </div>
          </button>
          <button onClick={opendetails}>
            <div className="group flex items-center p-4 sm:p-6 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="text-left min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                  {isMobile ? "View Report" : "View Detailed Report"}
                </h4>
                <p className="text-sm text-gray-600 font-medium">
                  {isMobile
                    ? "Attendance analytics"
                    : "See comprehensive attendance analytics"}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
