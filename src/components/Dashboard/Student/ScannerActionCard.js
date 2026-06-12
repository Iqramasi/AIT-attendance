"use client";

export default function ScannerActionCard({ openScanner, isMobile }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-0 sm:mr-4 mb-3 sm:mb-0 shadow-lg">
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
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            Mark Attendance
          </h3>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            {isMobile
              ? "Scan QR code to mark attendance"
              : "Scan the QR code displayed by your teacher to mark your attendance for the current class."}
          </p>
        </div>
      </div>

      <button
        onClick={openScanner}
        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-sm sm:text-base"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3"
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
        {isMobile ? "Scan QR" : "Scan QR Code"}
      </button>
    </div>
  );
}
