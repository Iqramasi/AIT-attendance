"use client";

export default function RecentSessionsList({ recentSessions }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 mb-12">
      <div className="p-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          Recent Sessions
        </h2>
        <p className="text-gray-600 mt-2 ml-14">
          Your latest class attendance records
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {recentSessions.map((session) => (
          <div
            key={session.sessionId}
            className="p-8 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <h4 className="text-lg font-bold text-gray-900 mr-3">
                    {session.subjectName}
                  </h4>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full ${
                      session.status === "present"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        session.status === "present"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    ></span>
                    {session.status === "present" ? "Present" : "Absent"}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {session.subjectCode}
                </p>
                <div className="flex items-center text-xs text-gray-500">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {session.timestamp?.toLocaleString?.() ||
                    new Date(session.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
