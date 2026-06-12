"use client";

import { useState, useEffect, useRef } from "react";
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
  serverTimestamp,
  arrayUnion,
  writeBatch,
  increment,
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";

import { Html5Qrcode } from "html5-qrcode";

// --- Step 1: Import all the new child components ---
import StudentHeader from "@/components/Dashboard/Student/StudentHeader";
import StudentStatsCards from "@/components/Dashboard/Student/StudentStatsCards";
import ScannerActionCard from "@/components/Dashboard/Student/ScannerActionCard";
import SubjectAttendanceTable from "@/components/Dashboard/Student/SubjectAttendanceTable";
import RecentSessionsList from "@/components/Dashboard/Student/RecentSessionsList";
import ScannerModal from "@/components/Dashboard/Student/ScannerModal";
import QuickActions from "@/components/Dashboard/Student/QuickActions";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { isMobile } = useDeviceType();
  const [studentProfile, setStudentProfile] = useState(null);
  const [subjectWiseStats, setSubjectWiseStats] = useState([]);
  const [overallStats, setOverallStats] = useState({
    present: 0,
    total: 0,
    percentage: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const html5QrCodeScannerRef = useRef(null);

  // --- LOGIC SECTION ---
  // All your state management and core logic functions remain in this parent component.
  // No changes are needed to the functions themselves.

  const syncAbsentSessions = async (currentStudentData) => {
    if (
      !user ||
      !currentStudentData?.profile?.course ||
      !currentStudentData?.profile?.semester
    ) {
      return false;
    }

    const { course, semester } = currentStudentData.profile;
    const processedSessions = currentStudentData.processedSessions || [];

    const endedSessionsQuery = query(
      collection(db, "sessions"),
      where("courses", "array-contains", course),
      where("semester", "==", semester),
      where("status", "==", "ended")
    );

    const snapshot = await getDocs(endedSessionsQuery);
    if (snapshot.empty) return false;

    const batch = writeBatch(db);
    let updatesMade = false;

    snapshot.forEach((sessionDoc) => {
      const sessionId = sessionDoc.id;
      if (processedSessions.includes(sessionId)) {
        return;
      }
      updatesMade = true;
      const sessionData = sessionDoc.data();
      const subjectId = sessionData.subjectId;
      const studentDocRef = doc(db, "users", user.uid);
      const wasPresent = sessionData.attendees.includes(user.uid);

      if (!wasPresent) {
        batch.update(studentDocRef, {
          [`subjects.${subjectId}.sessionDetails.${sessionId}`]: {
            status: "absent",
            timestamp: sessionData.endedAt,
          },
        });
      }
      batch.update(studentDocRef, {
        processedSessions: arrayUnion(sessionId),
      });
    });

    if (updatesMade) {
      try {
        await batch.commit();
        return true;
      } catch (error) {
        console.error("Error syncing absent sessions:", error);
        return false;
      }
    }
    return false;
  };

  const processDashboardData = (studentData) => {
    setStudentProfile(studentData);
    const subjects = studentData.subjects || {};
    let overallPresent = 0;
    let overallTotal = 0;
    const allSessions = [];

    const stats = Object.keys(subjects).map((subjectId) => {
      const subject = subjects[subjectId];
      const attended = subject.attendedClasses || 0;
      const total = subject.sessionDetails
        ? Object.keys(subject.sessionDetails).length
        : 0;

      overallPresent += attended;
      overallTotal += total;

      if (subject.sessionDetails) {
        Object.keys(subject.sessionDetails).forEach((sessionId) => {
          const sessionDetail = subject.sessionDetails[sessionId];
          allSessions.push({
            ...sessionDetail,
            timestamp: sessionDetail.timestamp.toDate(),
            sessionId,
            subjectName: subject.subjectName || subjectId,
            subjectCode: subject.subjectCode || subjectId,
          });
        });
      }
      return {
        subjectId,
        subjectName: subject.subjectName || subjectId,
        subjectCode: subject.subjectCode || subjectId,
        attendedClasses: attended,
        totalClasses: total,
        percentage: total > 0 ? Math.round((attended / total) * 100) : 0,
      };
    });

    setSubjectWiseStats(stats);
    setOverallStats({
      present: overallPresent,
      total: overallTotal,
      percentage:
        overallTotal > 0
          ? Math.round((overallPresent / overallTotal) * 100)
          : 0,
    });

    allSessions.sort((a, b) => b.timestamp - a.timestamp);
    setRecentSessions(allSessions.slice(0, 5));
  };

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const studentDocRef = doc(db, "users", user.uid);
        let studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          const updatesWereMade = await syncAbsentSessions(studentDoc.data());
          if (updatesWereMade) {
            studentDoc = await getDoc(studentDocRef);
          }
          if (studentDoc.exists()) {
            processDashboardData(studentDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching initial student data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, [user]);

  const handleScanSuccess = async (scannedValue) => {
    setScannerLoading(true);
    setScanMessage("Validating QR Code...");

    try {
      const parts = scannedValue.split(":");
      if (parts.length !== 2) {
        return setScanMessage("Error: Invalid QR code format.");
      }

      const sessionId = parts[0];
      const timestamp = parseInt(parts[1], 10);

      if (isNaN(timestamp) || Date.now() - timestamp > 7000) {
        setScannerLoading(false);
        return setScanMessage(
          "Error: QR code has expired. Please scan the live code."
        );
      }

      setScanMessage("Processing...");
      const sessionDocRef = doc(db, "sessions", sessionId);
      const sessionDoc = await getDoc(sessionDocRef);

      if (!sessionDoc.exists()) {
        return setScanMessage("Error: Invalid session code.");
      }

      const sessionData = sessionDoc.data();
      if (sessionData.status !== "active") {
        return setScanMessage("Error: This session is no longer active.");
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (
        userDoc.exists() &&
        userDoc.data().subjects?.[sessionData.subjectId]?.sessionDetails?.[
          sessionId
        ]
      ) {
        return setScanMessage("Attendance already marked for this session.");
      }

      const subjectId = sessionData.subjectId;
      const batch = writeBatch(db);

      batch.update(sessionDocRef, { attendees: arrayUnion(user.uid) });

      const userSessionPath = `subjects.${subjectId}.sessionDetails.${sessionId}`;
      const userAttendedPath = `subjects.${subjectId}.attendedClasses`;

      batch.update(userDocRef, {
        [userSessionPath]: { status: "present", timestamp: serverTimestamp() },
        [userAttendedPath]: increment(1),
      });

      await batch.commit();
      setScanMessage("Success! Attendance marked.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error marking attendance:", error);
      setScanMessage("An error occurred. Please try again.");
    } finally {
      setScannerLoading(false);
    }
  };

  const initializeScanner = () => {
    if (typeof window !== "undefined") {
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        if (html5QrCodeScannerRef.current?.isScanning) {
          closeScanner();
        }
        handleScanSuccess(decodedText);
      };
      const qrCodeErrorCallback = (error) => {
        /* Handle error silently */
      };

      if (!html5QrCodeScannerRef.current) {
        html5QrCodeScannerRef.current = new Html5Qrcode("qr-scanner", false);
      }

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCodeScannerRef.current
        .start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        )
        .catch((err) => {
          console.error("Unable to start scanning.", err);
          setScanMessage(
            "Error: Could not access camera. Please grant permission."
          );
        });
    }
  };

  const openScanner = () => {
    setShowScanner(true);
    setScanMessage("");
    setTimeout(() => initializeScanner(), 100);
  };
  const opendetails = () => {
    window.location.href = "/dashboard/student/details";
  };

  const closeScanner = () => {
    if (html5QrCodeScannerRef.current?.isScanning) {
      try {
        html5QrCodeScannerRef.current.stop();
      } catch (error) {
        console.error("Error clearing scanner on close:", error);
      }
    }
    setShowScanner(false);
    setScanMessage("");
    setScannerLoading(false);
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return <LoadingSpinner datam="Student Dashboard" />;
  }
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ScannerModal
            show={showScanner}
            onClose={closeScanner}
            isMobile={isMobile}
            scanMessage={scanMessage}
            scannerLoading={scannerLoading}
          />

          <StudentHeader
            studentProfile={studentProfile}
            user={user}
            isMobile={isMobile}
          />

          <StudentStatsCards
            overallStats={overallStats}
            subjectWiseStats={subjectWiseStats}
            studentProfile={studentProfile}
            isMobile={isMobile}
          />

          <ScannerActionCard openScanner={openScanner} isMobile={isMobile} />

          <SubjectAttendanceTable
            subjectWiseStats={subjectWiseStats}
            isMobile={isMobile}
          />

          {recentSessions.length > 0 && (
            <RecentSessionsList recentSessions={recentSessions} />
          )}

          <QuickActions
            openScanner={openScanner}
            isMobile={isMobile}
            opendetails={opendetails}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
