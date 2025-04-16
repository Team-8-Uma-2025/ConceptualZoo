// src/pages/Messages.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Bell, CheckCircle, AlertTriangle, X, AlertCircle } from "lucide-react";

const Messages = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("/api/notifications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setNotifications(response.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Unable to load notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === "staff") {
      fetchNotifications();
    }
  }, [currentUser]);

  const acknowledgeNotification = async (notificationId) => {
    try {
      await axios.put(
        `/api/notifications/${notificationId}/acknowledge`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update local state after acknowledging
      setNotifications(
        notifications.map((notification) =>
          notification.NotificationID === notificationId
            ? { ...notification, Acknowledged: 1 }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to acknowledge notification:", err);
      setError("Failed to acknowledge notification. Please try again.");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case '"Sick Animals"':
        return <AlertTriangle className="text-red-500" size={24} />;
      case '"Low inventory"':
        return <Bell className="text-amber-500" size={24} />;
      default:
        return <Bell className="text-blue-500" size={24} />;
    }
  };

  if (!currentUser || currentUser.role !== "staff") {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 font-['Lora']">
            Access denied. This page is only for zoo staff members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Messages Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Roboto_Flex'] flex items-center">
            <Bell size={28} className="mr-3 text-green-700" />
            Messages & Notifications
          </h1>
          <p className="text-gray-600 font-['Lora']">
            View and manage your notifications and alerts
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className="mr-2 mt-1" size={20} />
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:bg-red-200 rounded-full p-1 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 font-['Roboto_Flex']">
            Recent Notifications
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-['Lora']">
                No notifications to display.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.NotificationID}
                  className={`border rounded-lg p-4 ${
                    notification.Acknowledged
                      ? "bg-gray-50 border-gray-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        {getNotificationIcon(notification.NotificationType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 font-['Mukta_Mahee']">
                          {notification.Title}
                        </h3>
                        <p className="text-gray-700 font-['Lora']">
                          {notification.Description}
                        </p>
                        <div className="mt-2 flex items-center">
                          <div className="mr-4">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                notification.NotificationType ===
                                '"Sick Animals"'
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {notification.NotificationType &&
                                notification.NotificationType.replace(/"/g, "")}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                notification.Acknowledged
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {notification.Acknowledged
                                ? "Acknowledged"
                                : "New"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!notification.Acknowledged &&
                      (currentUser.staffType !== "Gift Shop Clerk" ||
                        currentUser.staffRole === "Manager") && (
                        <button
                          onClick={() =>
                            acknowledgeNotification(notification.NotificationID)
                          }
                          className="bg-green-700 hover:bg-green-600 text-white rounded-full p-2 transition duration-300"
                          title="Mark as acknowledged"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
