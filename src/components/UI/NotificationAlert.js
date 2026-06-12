"use client";

import { useState, useEffect } from "react";

const NotificationAlert = ({
  notifications = [],
  onRemove,
  position = "top-right",
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
        return "bottom-4 right-4";
      default:
        return "top-4 right-4";
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case "success":
        return {
          container:
            "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800",
          icon: "text-green-600",
          progress: "bg-green-500",
        };
      case "error":
        return {
          container:
            "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800",
          icon: "text-red-600",
          progress: "bg-red-500",
        };
      case "warning":
        return {
          container:
            "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800",
          icon: "text-yellow-600",
          progress: "bg-yellow-500",
        };
      case "info":
        return {
          container:
            "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800",
          icon: "text-blue-600",
          progress: "bg-blue-500",
        };
      default:
        return {
          container:
            "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800",
          icon: "text-gray-600",
          progress: "bg-gray-500",
        };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "error":
        return (
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "warning":
        return (
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "info":
        return (
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="space-y-3 max-w-sm w-full">
        {notifications.map((notification) => {
          const styles = getNotificationStyles(notification.type);
          return (
            <NotificationItem
              key={notification.id}
              notification={notification}
              styles={styles}
              icon={getIcon(notification.type)}
              onRemove={onRemove}
            />
          );
        })}
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, styles, icon, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    if (notification.autoClose !== false && notification.duration) {
      const duration = notification.duration || 5000;
      const interval = 50;
      const step = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            handleClose();
            return 0;
          }
          return prev - step;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 shadow-lg backdrop-blur-sm transform transition-all duration-300 ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      } ${styles.container}`}
    >
      {/* Progress bar */}
      {notification.autoClose !== false && (
        <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
          <div
            className={`h-full transition-all duration-75 ease-linear ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${styles.icon}`}>{icon}</div>
          <div className="ml-3 flex-1">
            {notification.title && (
              <h3 className="text-sm font-bold mb-1">{notification.title}</h3>
            )}
            <p className="text-sm opacity-90">{notification.message}</p>
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-xs font-semibold underline hover:no-underline transition-all"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationAlert;
