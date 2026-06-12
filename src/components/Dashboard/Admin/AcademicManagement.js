"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import AcademicItemModal from "./AcademicItemModal";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationAlert from "@/components/UI/NotificationAlert";

export default function AcademicManagement() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: "", item: null });
  const { notifications, removeNotification, showSuccess, showError } =
    useNotifications();

  // --- THE FIX: Wrap fetchData in useCallback to prevent infinite re-renders ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const deptsSnap = await getDocs(collection(db, "departments"));
      const coursesSnap = await getDocs(collection(db, "courses"));
      const subjectsSnap = await getDocs(collection(db, "subjects"));

      // --- FIX: Correctly map snapshots to their respective states ---
      setDepartments(deptsSnap.docs.map((d) => ({ ...d.data(), id: d.id })));
      setCourses(coursesSnap.docs.map((d) => ({ ...d.data(), id: d.id })));
      setSubjects(subjectsSnap.docs.map((d) => ({ ...d.data(), id: d.id })));
    } catch (error) {
      console.error("Error fetching academic data:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array is crucial - function will never change

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Now depends on the memoized function

  const openModal = (type, item = null) => {
    setModalConfig({ type, item });
    setIsModalOpen(true);
  };
  const handleSave = async (formData, type, isEditing) => {
    const collectionName = `${type}s`;

    try {
      if (isEditing) {
        const docRef = doc(db, collectionName, formData.id);
        // When editing, we don't want to save the `id` field back into the document
        const dataToSave = { ...formData };
        delete dataToSave.id;
        await updateDoc(docRef, dataToSave);
      } else {
        const dataToSave = { ...formData };
        let docId;

        if (type === "department" || type === "course") {
          docId = formData.id;
        } else if (type === "subject") {
          docId = formData.code; // Use the subject code as the document ID
        }

        if (!docId) {
          throw new Error("Document ID is missing for new item.");
        }

        delete dataToSave.id; // Always remove the id from the data being saved
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, dataToSave);
      }
      showSuccess(
        `${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`,
        {
          title: isEditing ? "Updated Successfully" : "Created Successfully",
        }
      );
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      showError(`Failed to save ${type}. Please try again.`, {
        title: isEditing ? "Update Failed" : "Creation Failed",
      });
    }

    setIsModalOpen(false);
    fetchData(); // Refetch all data to show changes
  };
  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await deleteDoc(doc(db, `${type}s`, id));
        fetchData();
        showSuccess(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } deleted successfully!`,
          {
            title: "Deleted Successfully",
          }
        );
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        showError(`Failed to delete ${type}. Please try again.`, {
          title: "Delete Failed",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600/30 border-t-blue-600"></div>
          <div className="animate-ping rounded-full h-16 w-16 border-4 border-blue-400/20 absolute top-0"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {isModalOpen && (
        <AcademicItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          item={modalConfig.item}
          type={modalConfig.type}
          departments={departments}
          courses={courses}
        />
      )}
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Academic Management
        </h2>
        <p className="text-gray-600">
          Manage departments, courses, and subjects for your institution
        </p>
      </div>
      {/* Academic Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Departments */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Departments</h3>
                <p className="text-indigo-100 text-sm">
                  {departments.length} departments
                </p>
              </div>
              <button
                onClick={() => openModal("department")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all"
              >
                + Add New
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {departments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p>No departments yet</p>
                <p className="text-sm">Create your first department</p>
              </div>
            ) : (
              departments.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <div>
                    <span className="font-semibold text-gray-900">
                      {d.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 bg-gray-200 px-2 py-1 rounded-full">
                      {d.id}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                    <button
                      onClick={() => openModal("department", d)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(d.id, "department")}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Courses</h3>
                <p className="text-blue-100 text-sm">
                  {courses.length} courses
                </p>
              </div>
              <button
                onClick={() => openModal("course")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all"
              >
                + Add New
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p>No courses yet</p>
                <p className="text-sm">Create your first course</p>
              </div>
            ) : (
              courses.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <div>
                    <span className="font-semibold text-gray-900">
                      {c.name}
                    </span>
                    <p className="text-xs text-gray-500">
                      {departments.find((d) => d.id === c.departmentId)?.name ||
                        "Unknown Department"}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                    <button
                      onClick={() => openModal("course", c)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, "course")}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Subjects</h3>
                <p className="text-purple-100 text-sm">
                  {subjects.length} subjects
                </p>
              </div>
              <button
                onClick={() => openModal("subject")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all"
              >
                + Add New
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {subjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>No subjects yet</p>
                <p className="text-sm">Create your first subject</p>
              </div>
            ) : (
              subjects.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <div>
                    <span className="font-semibold text-gray-900">
                      {s.name}
                    </span>
                    <p className="text-xs text-gray-500">
                      Semester {s.semester} • {s.code}
                    </p>
                    {s.course && s.course.length > 0 && (
                      <p className="text-xs text-blue-600">
                        {s.course.length} course{s.course.length > 1 ? "s" : ""}
                        assigned
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                    <button
                      onClick={() => openModal("subject", s)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, "subject")}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}{" "}
          </div>
        </div>

        {/* Notification Alert Component */}
        <NotificationAlert
          notifications={notifications}
          onRemove={removeNotification}
          position="top-right"
        />
      </div>
    </div>
  );
}
