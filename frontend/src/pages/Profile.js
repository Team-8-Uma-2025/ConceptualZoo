import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import TransactionHistory from "../components/TransactionHistory";
import TicketHistory from "../components/TicketHistory";
import { Save, User as UserIcon, MapPin, AlertTriangle, Check, Trash2, Key } from "lucide-react";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(
    location.state?.message || ""
  );

  // States for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    billingAddress: "",
  });

  // States for password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // States for account deletion
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Load user data into form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        billingAddress: currentUser.billingAddress || "",
      });
    }
  }, [currentUser]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    if (editSuccess) {
      const timer = setTimeout(() => setEditSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [editSuccess]);

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => setPasswordSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  if (!currentUser) {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-gray-700 font-['Lora']">
            Please login to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditError("");
    // Reset form data to current user data
    if (!isEditing) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        billingAddress: currentUser.billingAddress || "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError("");

    try {
      // Call API to update user profile
      await axios.put(
        `/api/visitors/${currentUser.id}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          billingAddress: formData.billingAddress,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Show success message
      setEditSuccess(true);
      setIsEditing(false);
      
      // Update local state
      // Note: In a real application, you might want to refresh the auth context
      // or update the currentUser object with the new data
    } catch (err) {
      console.error("Failed to update profile:", err);
      setEditError(
        err.response?.data?.error || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteToggle = () => {
    setIsDeleting(!isDeleting);
    setDeleteError("");
    setDeletePassword("");
    setDeleteConfirmation("");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError("");
    
    try {
      // Call API to change password
      await axios.put(
        `/api/visitors/${currentUser.id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      
      // Show success message
      setPasswordSuccess(true);
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Close password form after delay
      setTimeout(() => {
        setIsChangingPassword(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError(
        err.response?.data?.error || "Failed to change password. Please check your current password and try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    // Verify confirmation text
    if (deleteConfirmation !== "Delete my account") {
      setDeleteError("Please type 'Delete my account' to confirm");
      return;
    }

    setDeleteInProgress(true);
    setDeleteError("");

    try {
      // Call API to delete account
      await axios.delete(`/api/visitors/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        data: { password: deletePassword },
      });

      // Log out the user
      logout();
      
      // Redirect to home page
      navigate("/", { 
        state: { message: "Your account has been successfully deleted" } 
      });
    } catch (err) {
      console.error("Failed to delete account:", err);
      setDeleteError(
        err.response?.data?.error || "Failed to delete account. Please check your password and try again."
      );
    } finally {
      setDeleteInProgress(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      {/* Show notification if present */}
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {notification}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-green-700 text-white py-6 px-8">
            <h1 className="text-3xl font-bold font-['Roboto_Flex']">
              My Profile
            </h1>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* User Information */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold font-['Mukta_Mahee']">
                      Personal Information
                    </h3>
                    {!isEditing ? (
                      <button
                        onClick={handleEditToggle}
                        className="text-green-700 hover:text-green-600 underline font-['Mukta_Mahee']"
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>

                  {editSuccess && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded flex items-center">
                      <Check size={16} className="mr-2" />
                      Profile updated successfully
                    </div>
                  )}

                  {editError && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded flex items-center">
                      <AlertTriangle size={16} className="mr-2" />
                      {editError}
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Billing Address
                          </label>
                          <textarea
                            name="billingAddress"
                            value={formData.billingAddress}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows="3"
                          />
                        </div>

                        <div className="pt-2 flex space-x-3">
                          <button
                            type="submit"
                            className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded transition duration-300 text-sm font-['Mukta_Mahee'] flex items-center"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={16} className="mr-2" />
                                Save Changes
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleEditToggle}
                            className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded transition duration-300 text-sm font-['Mukta_Mahee']"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4 font-['Lora']">
                      <div className="flex items-start">
                        <UserIcon size={18} className="text-gray-500 mr-2 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-gray-800">{currentUser.firstName} {currentUser.lastName}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin size={18} className="text-gray-500 mr-2 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Billing Address</p>
                          <p className="text-gray-800">
                            {currentUser.billingAddress || "No address provided"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="text-gray-800">{currentUser.username}</p>
                      </div>
                    </div>
                  )}

                  {/* Account Deletion Section */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-2 font-['Mukta_Mahee']">
                      Account Management
                    </h4>
                    
                    <button
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm mb-3"
                    >
                      <Key size={16} className="mr-1" />
                      Change Password
                    </button>
                    
                    {isChangingPassword && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                        <h5 className="text-blue-800 font-medium mb-2">
                          Change Password
                        </h5>
                        
                        {passwordError && (
                          <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                            {passwordError}
                          </div>
                        )}
                        
                        {passwordSuccess && (
                          <div className="mb-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm flex items-center">
                            <Check size={16} className="mr-2" />
                            Password updated successfully
                          </div>
                        )}
                        
                        <form onSubmit={handlePasswordChange}>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                              minLength="6"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                          </div>
                          
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          
                          <div className="flex space-x-3">
                            <button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-['Mukta_Mahee'] flex items-center"
                              disabled={passwordLoading}
                            >
                              {passwordLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Save size={16} className="mr-1" />
                                  Update Password
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsChangingPassword(false);
                                setPasswordData({
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: ''
                                });
                                setPasswordError('');
                              }}
                              className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded text-sm font-['Mukta_Mahee']"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {!isDeleting ? (
                      <button
                        onClick={handleDeleteToggle}
                        className="mt-2 text-red-600 hover:text-red-800 font-medium flex items-center text-sm"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="mt-3">
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <h5 className="text-red-800 font-medium mb-2">
                            Delete Account
                          </h5>
                          
                          {deleteError && (
                            <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                              {deleteError}
                            </div>
                          )}
                          
                          <p className="text-sm text-red-700 mb-3">
                            This action cannot be undone. All your data, including purchase history and tickets, will be permanently deleted.
                          </p>
                          
                          <form onSubmit={handleDeleteAccount}>
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                              </label>
                              <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type "Delete my account" to confirm
                              </label>
                              <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Delete my account"
                                required
                              />
                            </div>
                            
                            <div className="flex space-x-3">
                              <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-['Mukta_Mahee'] flex items-center"
                                disabled={deleteInProgress}
                              >
                                {deleteInProgress ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={16} className="mr-1" />
                                    Confirm Deletion
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={handleDeleteToggle}
                                className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded text-sm font-['Mukta_Mahee']"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tickets and Transaction History */}
              <div className="md:col-span-2">
                {/* Tickets in collapsible format */}
                <TicketHistory />

                {/* Transaction History */}
                <TransactionHistory />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;