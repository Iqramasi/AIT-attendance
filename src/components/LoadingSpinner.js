"use client";
export default function LoadingSpinner({ datam }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600/30 border-t-blue-600 absolute"></div>
          <div className="animate-ping rounded-full h-20 w-20 border-4 border-blue-400/20 absolute"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-blue-800">
            Loading Your {datam}
          </h2>
          <p className="text-blue-600">
            Please wait while we gather your data...
          </p>
        </div>
      </div>
    </div>
  );
}
