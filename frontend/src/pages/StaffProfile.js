// src/pages/StaffProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Key, Save, AlertTriangle } from 'lucide-react';

const StaffProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    username: '',
  });

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser || !currentUser.id) return;
        
        const response = await axios.get(`/api/staff/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setFormData({
          name: response.data.Name || '',
          address: response.data.Address || '',
          username: response.data.Username || '',
        });
      } catch (err) {
        console.error('Failed to fetch staff details:', err);
        setError('Unable to load your profile information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordChange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Only send fields that the backend allows to be updated
      const updateData = {
        name: formData.name,
        address: formData.address
      };
      
      await axios.put(`/api/staff/${currentUser.id}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSuccess(true);
      setIsEditing(false);
      
      // Update local user data if API doesn't return updated user
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // This endpoint would need to be implemented in your backend
      await axios.put(`/api/staff/${currentUser.id}/password`, {
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSuccess(true);
      // Reset password fields
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to update password:', err);
      setError(err.response?.data?.error || 'Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser || currentUser.role !== 'staff') {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 font-['Lora']">Access denied. This page is only for zoo staff members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Roboto_Flex'] flex items-center">
            <User size={28} className="mr-3 text-purple-700" />
            Staff Profile
          </h1>
          <p className="text-gray-600 font-['Lora']">
            View and manage your staff account information
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
            <span className="block sm:inline">Your changes have been saved successfully.</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative flex items-start">
            <AlertTriangle className="flex-shrink-0 mr-2 mt-0.5" size={18} />
            <span className="block">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Info Card */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold font-['Roboto_Flex']">Profile Information</h2>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded ${isEditing ? 'bg-gray-200 text-gray-800' : 'bg-purple-600 text-white'}`}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                          disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center transition duration-150"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 font-['Lora']">Full Name</p>
                      <p className="font-medium text-gray-900 font-['Mukta_Mahee']">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Lora']">Username</p>
                      <p className="font-medium text-gray-900 font-['Mukta_Mahee']">{formData.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Lora']">Role</p>
                      <p className="font-medium text-gray-900 font-['Mukta_Mahee']">{currentUser.staffType} {currentUser.staffRole === 'Manager' ? '- Manager' : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-['Lora']">Staff ID</p>
                      <p className="font-medium text-gray-900 font-['Mukta_Mahee']">{currentUser.id}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 font-['Lora']">Address</p>
                      <p className="font-medium text-gray-900 font-['Mukta_Mahee']">{formData.address || 'No address provided'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change Card */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 font-['Roboto_Flex'] flex items-center">
                  <Key size={20} className="mr-2 text-purple-700" />
                  Change Password
                </h2>
                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordChange.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordChange.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordChange.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center justify-center transition duration-150"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffProfile;