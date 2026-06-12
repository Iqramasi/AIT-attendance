"use client";

export default function ScannerModal({
  show,
  onClose,
  isMobile,
  scanMessage,
  scannerLoading,
}) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl shadow-2xl p-4 sm:p-6 max-w-md w-full transform transition-all">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                />
              </svg>
            </div>
            Scan QR Code
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200/60 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Scanner Area with Overlay */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner bg-gray-900 border-4 border-gray-200/50">
            {/* This is where the camera feed will be mounted */}
            <div id="qr-scanner" className="w-full h-full"></div>

            {/* Animated Scan Box Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[70%] h-[70%] relative">
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/80 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/80 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/80 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/80 rounded-br-lg"></div>

                {/* Animated Laser Line */}
                <div className="scan-line absolute left-0 right-0 h-1 bg-red-400/80 rounded-full shadow-[0_0_10px_red]"></div>
              </div>
            </div>
          </div>

          {/* Instructional Text */}
          <p className="text-center text-gray-600 font-medium text-sm sm:text-base">
            Point your camera at the QR code
          </p>

          {/* Status Message Area */}
          {scanMessage && (
            <div
              className={`p-4 rounded-xl text-center font-semibold ${
                scanMessage.includes("Success")
                  ? "bg-green-100 text-green-800"
                  : scanMessage.includes("Error") ||
                    scanMessage.includes("expired")
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {scanMessage}
            </div>
          )}

          {scannerLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-blue-700 font-medium">
                Processing...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
