// components/teacher/QRCodeModal.js
"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRCodeModal({ show, onClose, session, onEndSession }) {
  // State to hold the value that will be encoded in the QR code.
  // This will be a combination of the session ID and a timestamp.
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    let intervalId = null;

    // This effect runs whenever the 'show' or 'session' prop changes.
    if (show && session) {
      // Function to generate the time-sensitive QR value
      const generateQrValue = () => {
        const timestamp = Date.now();
        const newQrValue = `${session.id}:${timestamp}`;
        setQrValue(newQrValue);
        console.log("Regenerated QR Value:", newQrValue); // For debugging
      };

      // Generate the first QR code immediately when the modal opens
      generateQrValue();

      // Set up an interval to regenerate the QR code every 5 seconds
      intervalId = setInterval(generateQrValue, 5000);
    }

    // Cleanup function: This is crucial!
    // It runs when the component unmounts or before the effect runs again.
    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Stop the 5-second interval
      }
    };
  }, [show, session]); // Dependencies for the effect

  // If the 'show' prop is false, render nothing.
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Session Active!
          </h3>
          <p className="text-gray-600 text-lg">{session.subjectName}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-100 mb-8 shadow-inner">
          {/* The QR Code now uses the regenerating 'qrValue' from state */}
          {qrValue ? (
            <QRCode
              value={qrValue}
              size={200}
              className="mx-auto"
              fgColor="#1f2937"
              bgColor="transparent"
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              Loading QR Code...
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500 mb-8">
          <p className="mb-2">
            Students can scan this QR code to mark attendance
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-xs font-medium text-gray-400">
              SESSION ID
            </span>
            <p className="font-mono text-sm text-gray-700 mt-1">{session.id}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Close
          </button>
          <button
            onClick={() => onEndSession(session.id)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}
