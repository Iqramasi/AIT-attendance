"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationAlert from "@/components/UI/NotificationAlert";

// Import all the new components
import AdminOverview from "@/components/Dashboard/Admin/AdminOverview";
import UserManagement from "@/components/Dashboard/Admin/UserManagement";
import AcademicManagement from "@/components/Dashboard/Admin/AcademicManagement";
import SystemSettings from "@/components/Dashboard/Admin/SystemSettings";
import DeleteConfirmationModal from "@/components/Dashboard/Admin/DeleteConfirmationModal";
import CreateUserModal from "@/components/Dashboard/Admin/CreateUserModal";
import EditUserModal from "@/components/Dashboard/Admin/EditUserModal";
import AcademicItemModal from "@/components/Dashboard/Admin/AcademicItemModal";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotifications();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    attendanceRate: "N/A",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(allUsers);

        // Fetch departments
        const departmentsSnapshot = await getDocs(
          collection(db, "departments")
        );
        const allDepartments = departmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDepartments(allDepartments);

        // Fetch courses
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const allCourses = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(allCourses);

        // Calculate stats
        const students = allUsers.filter((u) => u.role === "student");
        const teachers = allUsers.filter((u) => u.role === "teacher");

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalSubjects: allCourses.length,
          attendanceRate: "85%", // This would be calculated from actual attendance data
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleCreateUser = async (formData) => {
    setCreateLoading(true);
    try {
      // Validate password length
      if (formData.password.length < 6) {
        showError("Password must be at least 6 characters long.", {
          title: "Invalid Password",
        });
        setCreateLoading(false);
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const firebaseUser = userCredential.user;

      // Create user data structure
      const userData = {
        email: formData.email,
        role: formData.role,
        profile: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          ...(formData.role === "student" && {
            usn: formData.usn,
            course: formData.course,
            department: formData.department,
            section: formData.section,
            semester: formData.semester,
          }),
          ...(formData.role === "teacher" && {
            employeeID: formData.employeeID,
            department: formData.department,
            designation: formData.designation,
          }),
        },
        createdAt: new Date(),
      };

      // Add user to Firestore using the Firebase Auth UID as document ID
      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      // Update local state
      setUsers([...users, { id: firebaseUser.uid, ...userData }]);
      setShowCreateModal(false);

      // Show success message
      showSuccess(
        `User account created successfully! ${formData.name} can now log in with their credentials.`,
        {
          title: `${
            formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
          } Created!`,
          duration: 6000,
        }
      );
    } catch (error) {
      console.error("Error creating user:", error); // Handle specific Firebase Auth errors
      let errorMessage = "Failed to create user.";
      let errorTitle = "Creation Failed";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email address is already in use by another account.";
        errorTitle = "Email Already Exists";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
        errorTitle = "Invalid Email";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
        errorTitle = "Weak Password";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage =
          "Email/password accounts are not enabled. Please contact support.";
        errorTitle = "Operation Not Allowed";
      }

      showError(errorMessage, { title: errorTitle });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSaveUser = async (formData) => {
    if (!userToEdit) return;

    try {
      const userRef = doc(db, "users", userToEdit.id);

      // Update user data
      const updateData = {
        email: formData.email,
        role: formData.role,
        profile: {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          ...(formData.role === "student" && {
            usn: formData.usn,
            course: formData.course,
            department: formData.department,
            section: formData.section,
            semester: formData.semester,
          }),
          ...(formData.role === "teacher" && {
            employeeID: formData.employeeID,
            department: formData.department,
            designation: formData.designation,
          }),
        },
      };

      await updateDoc(userRef, updateData);

      // Update local state
      setUsers(
        users.map((u) => (u.id === userToEdit.id ? { ...u, ...updateData } : u))
      );
      setShowEditModal(false);
      setUserToEdit(null);

      // Show success message
      showSuccess("User profile has been updated successfully!", {
        title: "Update Successful",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      showError("Failed to update user. Please try again.", {
        title: "Update Failed",
      });
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      showSuccess(
        `${
          userToDelete.profile?.name || "User"
        } has been deleted successfully.`,
        {
          title: "User Deleted",
        }
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      showError("Failed to delete user. Please try again.", {
        title: "Delete Failed",
      });
    }
  };

  // Helper function to get department or course name from ID
  const getDepartmentAndCourseName = (id, type) => {
    if (type === "department") {
      const dept = departments.find((d) => d.id === id);
      return dept ? dept.name : "Unknown Department";
    } else if (type === "course") {
      const course = courses.find((c) => c.id === id);
      return course ? course.name : "Unknown Course";
    }
    return "Unknown";
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (u) =>
        (u.profile?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.profile?.usn || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (u.profile?.employeeID || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);

  if (loading) return <LoadingSpinner datam="Admin Dashboard" />;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
        {showDeleteModal && (
          <DeleteConfirmationModal
            user={userToDelete}
            onConfirm={confirmDeleteUser}
            onCancel={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
          />
        )}
        {showEditModal && (
          <EditUserModal
            user={userToEdit}
            departments={departments}
            courses={courses}
            onSave={handleSaveUser}
            onCancel={() => {
              setShowEditModal(false);
              setUserToEdit(null);
            }}
          />
        )}
        {showCreateModal && (
          <CreateUserModal
            departments={departments}
            courses={courses}
            onSave={handleCreateUser}
            onCancel={() => setShowCreateModal(false)}
            loading={createLoading}
          />
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Welcome back, {user?.profile?.name || user?.email}! Manage your
              institution efficiently.
            </p>
          </div>
          {/* Navigation Tabs */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-1 flex flex-wrap justify-center space-x-1 border border-white/20">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 sm:px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 sm:px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === "users"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                👥 Users
              </button>
              <button
                onClick={() => setActiveTab("academics")}
                className={`px-4 sm:px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === "academics"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                🎓 Academics
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 sm:px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === "settings"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="animate-in fade-in-up duration-500">
            {activeTab === "overview" && (
              <AdminOverview
                stats={stats}
                departments={departments}
                courses={courses}
                users={users}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === "users" && (
              <UserManagement
                users={filteredUsers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
                handleCreateClick={handleCreateClick}
                departments={departments}
                courses={courses}
                getDepartmentAndCourseName={getDepartmentAndCourseName}
              />
            )}
            {activeTab === "academics" && <AcademicManagement />}
            {activeTab === "settings" && (
              <SystemSettings
                users={users}
                departments={departments}
                courses={courses}
              />
            )}
          </div>
        </div>

        {/* Notification Alert Component */}
        <NotificationAlert
          notifications={notifications}
          onRemove={removeNotification}
          position="top-right"
        />
      </div>
    </ProtectedRoute>
  );
}
