"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceType } from "@/hooks/useWindowSize";
import { useNotifications } from "@/hooks/useNotifications";
import { db } from "@/lib/firebase";
import QRCode from "react-qr-code";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Import the new components
import StatsCards from "@/components/Dashboard/Teacher/StatsCards";
import SessionCreationForm from "@/components/Dashboard/Teacher/SessionCreation";
import ActiveSessionsList from "@/components/Dashboard/Teacher/ActiveSessionsList";
import QRCodeModal from "@/components/Dashboard/Teacher/QRCodeModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import NotificationAlert from "@/components/UI/NotificationAlert";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { isMobile } = useDeviceType();
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();
  const [loading, setLoading] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    department: "",
    course: "",
    semester: "",
    subject: "",
  });

  // --- DATA FETCHING & STATE MANAGEMENT ---
  // (All data fetching and logic functions remain in the parent component)

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const teacherDoc = await getDoc(doc(db, "users", user.uid));
        if (!teacherDoc.exists()) {
          setLoading(false);
          return;
        }
        const teacherData = teacherDoc.data();
        setTeacherProfile(teacherData);
        if (teacherData.profile?.department) {
          const deptId = teacherData.profile.department;
          setSessionForm((prev) => ({ ...prev, department: deptId }));
          const q = query(
            collection(db, "courses"),
            where("departmentId", "==", deptId)
          );
          const coursesSnapshot = await getDocs(q);
          const coursesData = coursesSnapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setCourses(coursesData);
        }
        await fetchActiveSessions();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!sessionForm.course || !sessionForm.semester) {
        setSubjects([]);
        return;
      }
      try {
        const q = query(
          collection(db, "subjects"),
          where("course", "array-contains", sessionForm.course),
          where("semester", "==", parseInt(sessionForm.semester))
        );
        const subjectsSnapshot = await getDocs(q);
        const subjectsData = subjectsSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, [sessionForm.course, sessionForm.semester]);

  const fetchActiveSessions = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "sessions"),
        where("teacherId", "==", user.uid),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      const sessionsData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setActiveSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
    }
  };

  const handleFormChange = (field, value) => {
    setSessionForm((prev) => {
      const newForm = { ...prev, [field]: value };
      if (field === "course") newForm.semester = "";
      if (field === "semester") newForm.subject = "";
      return newForm;
    });
  };
  const createSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.course || !sessionForm.semester || !sessionForm.subject) {
      showError("Please fill out all fields.", {
        title: "Missing Information",
      });
      return;
    }
    try {
      const sessionId = `session_${Date.now()}`;
      const sessionData = {
        teacherId: user.uid,
        teacherName: teacherProfile?.profile?.name || user.email,
        departmentId: sessionForm.department,
        courseId: sessionForm.course,
        courses: [sessionForm.course],
        semester: parseInt(sessionForm.semester),
        subjectId: sessionForm.subject,
        subjectName:
          subjects.find((s) => s.id === sessionForm.subject)?.name ||
          sessionForm.subject,
        status: "active",
        createdAt: serverTimestamp(),
        endedAt: null,
        attendees: [],
      };
      await setDoc(doc(db, "sessions", sessionId), sessionData);
      setCurrentSession({ id: sessionId, ...sessionData });
      await fetchActiveSessions();
      setShowQRModal(true);
      showSuccess("Session created successfully!", { title: "Session Active" });
    } catch (error) {
      console.error("Error creating session:", error);
      showError("Failed to create session. Please try again.", {
        title: "Session Creation Failed",
      });
    }
  };

  const endSession = async (sessionId) => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, {
        status: "ended",
        endedAt: serverTimestamp(),
      });
      setCurrentSession(null);
      setShowQRModal(false);
      await fetchActiveSessions();
      showSuccess("Session ended successfully!", { title: "Session Ended" });
    } catch (error) {
      console.error("Error ending session:", error);
      showError("Failed to end session. Please try again.", {
        title: "Session End Failed",
      });
    }
  };

  const handleViewQR = (session) => {
    setCurrentSession(session);
    setShowQRModal(true);
  };

  // --- RENDER LOGIC ---

  if (loading) {
    return <LoadingSpinner datam="Teacher Dashboard" />;
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* QR Code Modal (Can also be extracted into its own component) */}
          <QRCodeModal
            show={showQRModal}
            onClose={() => setShowQRModal(false)}
            session={currentSession}
            onEndSession={endSession}
          />

          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 sm:mb-4">
              Teacher Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6 px-4">
              Welcome back,{" "}
              <span className="font-semibold text-gray-800">
                {teacherProfile?.profile?.name || "Teacher"}
              </span>
              !
            </p>
          </div>

          {/* Render the new components */}
          <StatsCards
            activeSessionsCount={activeSessions.length}
            coursesCount={courses.length}
            subjectsCount={subjects.length}
            isMobile={isMobile}
          />

          <SessionCreationForm
            sessionForm={sessionForm}
            courses={courses}
            subjects={subjects}
            handleFormChange={handleFormChange}
            createSession={createSession}
          />

          {activeSessions.length > 0 ? (
            <ActiveSessionsList
              activeSessions={activeSessions}
              courses={courses}
              isMobile={isMobile}
              onViewQR={handleViewQR}
              onEndSession={endSession}
            />
          ) : (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg
                  className="w-12 h-12 text-gray-400"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Active Sessions
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Create your first attendance session to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Alert Component */}
      <NotificationAlert
        notifications={notifications}
        onRemove={removeNotification}
      />
    </ProtectedRoute>
  );
}
