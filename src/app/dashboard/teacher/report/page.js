"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceType } from "@/hooks/useWindowSize";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";

// Helper component for when no report is generated yet
const EmptyState = () => (
  <div className="text-center py-16 px-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 transform animate-in fade-in duration-500">
    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg transform transition-all duration-300 hover:scale-110">
      <svg
        className="w-12 h-12 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
      Generate Your First Report
    </h3>
    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
      Select a course, semester, section, and subject to generate detailed
      attendance insights.
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
      {[
        { icon: "📊", text: "Detailed Analytics" },
        { icon: "📋", text: "Export Options" },
        { icon: "🎯", text: "Accurate Data" },
        { icon: "📱", text: "Mobile Friendly" },
      ].map((feature, index) => (
        <div
          key={index}
          className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="text-2xl mb-2">{feature.icon}</div>
          <p className="text-sm font-medium text-gray-700">{feature.text}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function TeacherReportsPage() {
  const { user } = useAuth();
  const { isMobile, isTablet, deviceType } = useDeviceType();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null); // To track which student's edit is in progress
  const [expandedStudentId, setExpandedStudentId] = useState(null); // To track which student's row is expanded

  const [filters, setFilters] = useState({
    courseId: "",
    semester: "",
    section: "", // Added section filter
    subjectId: "",
  });

  // Fetch teacher's assigned courses initially
  useEffect(() => {
    if (!user) return;
    const fetchTeacherCourses = async () => {
      const teacherDoc = await getDoc(doc(db, "users", user.uid));
      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();
        if (teacherData.profile?.department) {
          const q = query(
            collection(db, "courses"),
            where("departmentId", "==", teacherData.profile.department)
          );
          const coursesSnapshot = await getDocs(q);
          setCourses(
            coursesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        }
      }
    };
    fetchTeacherCourses();
  }, [user]);

  // Fetch subjects when course and semester are selected
  useEffect(() => {
    if (!filters.courseId || !filters.semester) {
      setSubjects([]);
      return;
    }
    const fetchSubjects = async () => {
      const q = query(
        collection(db, "subjects"),
        where("course", "array-contains", filters.courseId),
        where("semester", "==", parseInt(filters.semester))
      );
      const subjectsSnapshot = await getDocs(q);
      setSubjects(
        subjectsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    };
    fetchSubjects();
  }, [filters.courseId, filters.semester]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [field]: value };
      if (field === "courseId") {
        newFilters.semester = "";
        newFilters.section = "";
        newFilters.subjectId = "";
      }
      if (field === "semester") {
        newFilters.section = "";
        newFilters.subjectId = "";
      }
      if (field === "section") {
        newFilters.subjectId = "";
      }
      return newFilters;
    });
    setReportData(null); // Clear previous report on any filter change
    setExpandedStudentId(null);
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    if (
      !filters.courseId ||
      !filters.semester ||
      !filters.section ||
      !filters.subjectId
    ) {
      alert("Please select a course, semester, section, and subject.");
      return;
    }
    setLoading(true);
    setReportData(null);
    setExpandedStudentId(null);

    try {
      // Find all students matching the selected class definition
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("profile.course", "==", filters.courseId),
        where("profile.semester", "==", parseInt(filters.semester)),
        where("profile.section", "==", filters.section) // Query by section
      );
      const studentsSnapshot = await getDocs(studentsQuery);

      if (studentsSnapshot.empty) {
        setReportData([]); // No students found
        setLoading(false);
        return;
      }

      // For each student, calculate their attendance for the selected subject
      const studentReports = studentsSnapshot.docs.map((studentDoc) => {
        const studentData = studentDoc.data();
        const subjectStats = studentData.subjects?.[filters.subjectId];
        const sessionDetails = subjectStats?.sessionDetails || {};

        const sortedSessions = Object.entries(sessionDetails)
          .map(([sessionId, details]) => ({
            sessionId,
            status: details.status,
            timestamp: details.timestamp.toDate(),
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        const attendedClasses = sortedSessions.filter(
          (s) => s.status === "present"
        ).length;
        const totalClasses = sortedSessions.length;
        const percentage =
          totalClasses > 0
            ? Math.round((attendedClasses / totalClasses) * 100)
            : 0;

        return {
          id: studentDoc.id,
          name: studentData.profile?.name || "N/A",
          email: studentData.email,
          attendedClasses,
          totalClasses,
          percentage,
          sessions: sortedSessions,
        };
      });

      setReportData(studentReports);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (
    studentId,
    sessionId,
    currentStatus
  ) => {
    setEditingStudentId(studentId); // Show loading state for this specific student row
    const newStatus = currentStatus === "present" ? "absent" : "present";
    const attendanceIncrement = newStatus === "present" ? 1 : -1;

    try {
      const studentDocRef = doc(db, "users", studentId);
      const statusPath = `subjects.${filters.subjectId}.sessionDetails.${sessionId}.status`;
      const attendedPath = `subjects.${filters.subjectId}.attendedClasses`;

      // Update Firestore
      await updateDoc(studentDocRef, {
        [statusPath]: newStatus,
        [attendedPath]: increment(attendanceIncrement),
      });

      // Update local state for instant UI feedback
      setReportData((currentReport) => {
        return currentReport.map((student) => {
          if (student.id === studentId) {
            const updatedSessions = student.sessions.map((session) => {
              if (session.sessionId === sessionId) {
                return { ...session, status: newStatus };
              }
              return session;
            });

            const newAttendedCount =
              student.attendedClasses + attendanceIncrement;
            const newPercentage =
              student.totalClasses > 0
                ? Math.round((newAttendedCount / student.totalClasses) * 100)
                : 0;

            return {
              ...student,
              sessions: updatedSessions,
              attendedClasses: newAttendedCount,
              percentage: newPercentage,
            };
          }
          return student;
        });
      });
    } catch (error) {
      console.error("Failed to update attendance:", error);
      alert("Error updating attendance. Please try again.");
    } finally {
      setEditingStudentId(null); // Hide loading state
    }
  };

  const toggleExpand = (studentId) => {
    setExpandedStudentId((prevId) => (prevId === studentId ? null : studentId));
  };

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = [
      "Student Name",
      "Email",
      "Attended Classes",
      "Total Classes",
      "Percentage",
    ];
    const csvRows = [
      headers.join(","),
      ...reportData.map((row) =>
        [
          `"${row.name}"`,
          `"${row.email}"`,
          row.attendedClasses,
          row.totalClasses,
          `${row.percentage}%`,
        ].join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData || reportData.length === 0) return;

    // Ensure the library is loaded
    if (typeof window.jspdf === "undefined") {
      console.error("jsPDF not loaded");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const subjectName =
      subjects.find((s) => s.id === filters.subjectId)?.name || "N/A";
    const courseName =
      courses.find((c) => c.id === filters.courseId)?.name || "N/A";
    const title = `Attendance Report for ${subjectName}`;
    const subtitle = `Class: ${courseName} - Semester ${filters.semester} - Section ${filters.section}`;

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 30);

    const tableColumn = [
      "#",
      "Student Name",
      "Email",
      "Attended",
      "Total",
      "Percentage",
    ];
    const tableRows = [];

    reportData.forEach((student, index) => {
      const studentData = [
        index + 1,
        student.name,
        student.email,
        student.attendedClasses,
        student.totalClasses,
        `${student.percentage}%`,
      ];
      tableRows.push(studentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { font: "helvetica", fontSize: 10 },
    });

    doc.save("attendance_report.pdf");
  };
  if (loading) {
    return <LoadingSpinner datam="Reports " />;
  }
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 sm:mb-4">
              {isMobile ? "Reports" : "Attendance Reports"}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              {isMobile
                ? "Track student attendance"
                : "Generate and view detailed attendance reports for your classes"}
            </p>
          </div>
          {/* Filter Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 mb-8 transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl mr-3 shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isMobile ? "Filters" : "Report Filters"}
              </h2>
            </div>

            <form onSubmit={handleGenerateReport}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Course *
                  </label>
                  <select
                    value={filters.courseId}
                    onChange={(e) =>
                      handleFilterChange("courseId", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Semester *
                  </label>
                  <select
                    value={filters.semester}
                    onChange={(e) =>
                      handleFilterChange("semester", e.target.value)
                    }
                    required
                    disabled={!filters.courseId}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-blue-300"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Section *
                  </label>
                  <select
                    value={filters.section}
                    onChange={(e) =>
                      handleFilterChange("section", e.target.value)
                    }
                    required
                    disabled={!filters.semester}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-blue-300"
                  >
                    <option value="">Select Section</option>
                    {["A", "B", "C", "D"].map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Subject *
                  </label>
                  <select
                    value={filters.subjectId}
                    onChange={(e) =>
                      handleFilterChange("subjectId", e.target.value)
                    }
                    required
                    disabled={!filters.section}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-blue-300"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {isMobile ? s.name : `${s.name} (${s.id})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 sm:col-span-2 lg:col-span-4 xl:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 opacity-0 pointer-events-none">
                    Action
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {loading
                      ? isMobile
                        ? "Loading..."
                        : "Generating..."
                      : isMobile
                      ? "Generate"
                      : "Generate Report"}
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* Results Section */}
          <div>
            {loading && <LoadingSpinner />}
            {!loading && reportData === null && <EmptyState />}
            {!loading && reportData && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform animate-in fade-in duration-500">
                {/* Report Header */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">
                        📊 Generated Report
                      </h3>
                      <p className="text-blue-100 opacity-90">
                        Found {reportData.length} student
                        {reportData.length !== 1 ? "s" : ""} matching your
                        criteria
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 text-xs sm:text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                          {courses.find((c) => c.id === filters.courseId)
                            ?.name || "N/A"}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                          Semester {filters.semester}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                          Section {filters.section}
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                          {subjects.find((s) => s.id === filters.subjectId)
                            ?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={exportToCSV}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        {isMobile ? "CSV" : "Export CSV"}
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {isMobile ? "PDF" : "Export PDF"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                {reportData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Student
                          </th>
                          {!isMobile && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Email
                            </th>
                          )}
                          <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Attended
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {reportData.map((student, index) => (
                          <React.Fragment key={student.id}>
                            {/* Main Student Row - Clickable */}
                            <tr
                              onClick={() => toggleExpand(student.id)}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group cursor-pointer"
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animation: "fadeInUp 0.5s ease-out forwards",
                              }}
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                                      {student.name.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                      {student.name}
                                    </div>
                                    {isMobile && (
                                      <div className="text-xs text-gray-500">
                                        {student.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {!isMobile && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {student.email}
                                </td>
                              )}
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                  {student.attendedClasses}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                                  {student.totalClasses}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center">
                                  <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-3 shadow-inner mr-3">
                                    <div
                                      className={`h-3 rounded-full transition-all duration-1000 ${
                                        student.percentage >= 75
                                          ? "bg-gradient-to-r from-green-400 to-green-500"
                                          : student.percentage >= 50
                                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                          : "bg-gradient-to-r from-red-400 to-red-500"
                                      }`}
                                      style={{
                                        width: `${student.percentage}%`,
                                        animationDelay: `${index * 200}ms`,
                                      }}
                                    />
                                  </div>
                                  <span
                                    className={`font-bold text-sm ${
                                      student.percentage >= 75
                                        ? "text-green-600"
                                        : student.percentage >= 50
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {student.percentage}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center">
                                  <span
                                    className={`transform transition-all duration-300 text-gray-400 text-lg ${
                                      expandedStudentId === student.id
                                        ? "rotate-180 text-blue-600"
                                        : "group-hover:text-blue-500"
                                    }`}
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Expandable Row for Session Details */}
                            {expandedStudentId === student.id && (
                              <tr className="bg-gradient-to-r from-blue-50/70 to-purple-50/70 animate-in slide-in-from-top duration-300">
                                <td
                                  colSpan={isMobile ? "5" : "6"}
                                  className="px-4 sm:px-6 py-6"
                                >
                                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                                    <div className="flex items-center justify-between mb-6">
                                      <h4 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-blue-700 bg-clip-text text-transparent">
                                        📋 Session Details for {student.name}
                                      </h4>
                                      {editingStudentId === student.id && (
                                        <div className="flex items-center text-blue-600">
                                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                                          <span className="text-sm font-medium">
                                            Updating...
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {student.sessions.length > 0 ? (
                                      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100">
                                        {student.sessions.map(
                                          (session, sessionIndex) => (
                                            <div
                                              key={session.sessionId}
                                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                                                session.status === "present"
                                                  ? "bg-green-50 border-green-200 hover:border-green-300"
                                                  : "bg-red-50 border-red-200 hover:border-red-300"
                                              }`}
                                              style={{
                                                animationDelay: `${
                                                  sessionIndex * 50
                                                }ms`,
                                                animation:
                                                  "fadeInUp 0.3s ease-out forwards",
                                              }}
                                            >
                                              <div className="flex items-center space-x-4">
                                                <div
                                                  className={`flex-shrink-0 w-3 h-3 rounded-full ${
                                                    session.status === "present"
                                                      ? "bg-green-500"
                                                      : "bg-red-500"
                                                  }`}
                                                ></div>
                                                <div>
                                                  <div className="text-sm font-medium text-gray-900">
                                                    {session.timestamp.toLocaleDateString(
                                                      "en-US",
                                                      {
                                                        weekday: "short",
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                      }
                                                    )}
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                    {session.timestamp.toLocaleTimeString(
                                                      "en-US",
                                                      {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                      }
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="flex items-center space-x-3">
                                                <span
                                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                    session.status === "present"
                                                      ? "bg-green-100 text-green-800"
                                                      : "bg-red-100 text-red-800"
                                                  }`}
                                                >
                                                  {session.status === "present"
                                                    ? "✓ Present"
                                                    : "✗ Absent"}
                                                </span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAttendanceChange(
                                                      student.id,
                                                      session.sessionId,
                                                      session.status
                                                    );
                                                  }}
                                                  disabled={
                                                    editingStudentId ===
                                                    student.id
                                                  }
                                                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                                    session.status === "present"
                                                      ? "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
                                                      : "bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
                                                  }`}
                                                >
                                                  Mark as{" "}
                                                  {session.status === "present"
                                                    ? "Absent"
                                                    : "Present"}
                                                </button>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                          <svg
                                            className="w-8 h-8 text-gray-400"
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
                                        <h5 className="text-sm font-medium text-gray-700 mb-1">
                                          No Sessions Found
                                        </h5>
                                        <p className="text-xs text-gray-500">
                                          This student has no recorded sessions
                                          for the selected subject.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No Students Found
                    </h3>
                    <p className="text-gray-500">
                      No students were found matching the selected class
                      definition.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
