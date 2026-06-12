"use client";

export default function UserManagement({
  users,
  searchTerm,
  setSearchTerm,
  handleEditClick,
  handleDeleteClick,
  handleCreateClick,
  departments,
  courses,
  getDepartmentAndCourseName,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
            <p className="text-gray-600">
              Create student, teacher, or admin accounts
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold"
          >
            Create New User
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Existing Users</h3>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm px-4 py-2 rounded-xl border-2 bg-white/50"
            />
          </div>
        </div>{" "}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Additional Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {(u.profile?.name || u.email)
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.profile?.name || "No Name"}
                        </div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        {u.profile?.usn && (
                          <div className="text-xs text-blue-600 font-mono">
                            USN: {u.profile.usn}
                          </div>
                        )}
                        {u.profile?.employeeID && (
                          <div className="text-xs text-green-600 font-mono">
                            ID: {u.profile.employeeID}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        u.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : u.role === "teacher"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {u.role?.charAt(0)?.toUpperCase() + u.role?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.profile?.phoneNumber && (
                      <div className="text-sm text-gray-900">
                        📞 {u.profile.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.role === "student" && (
                      <div className="space-y-1">
                        {u.profile?.department && (
                          <div className="text-xs">
                            🏛️{" "}
                            {getDepartmentAndCourseName(
                              u.profile.department,
                              "department"
                            )}
                          </div>
                        )}
                        {u.profile?.course && (
                          <div className="text-xs">
                            📚{" "}
                            {getDepartmentAndCourseName(
                              u.profile.course,
                              "course"
                            )}
                          </div>
                        )}
                        {u.profile?.section && (
                          <div className="text-xs">
                            🏫 Section {u.profile.section}
                          </div>
                        )}
                        {u.profile?.semester && (
                          <div className="text-xs">
                            📅 Semester {u.profile.semester}
                          </div>
                        )}
                      </div>
                    )}
                    {u.role === "teacher" && (
                      <div className="space-y-1">
                        {u.profile?.department && (
                          <div className="text-xs">
                            🏛️{" "}
                            {getDepartmentAndCourseName(
                              u.profile.department,
                              "department"
                            )}
                          </div>
                        )}
                        {u.profile?.designation && (
                          <div className="text-xs">
                            💼 {u.profile.designation}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {u.role !== "admin" && (
                      <>
                        <button
                          onClick={() => handleEditClick(u)}
                          className="text-blue-600 hover:text-blue-900 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {u.role === "admin" && (
                      <span className="text-gray-400 text-xs">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.121 2.121 0 11-3 3m-1.06.293a13.211 13.211 0 014.992-.749 13.063 13.063 0 014.992.749M21 14a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first user"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
