// src/pages/StaffManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users, User, Search, Edit, Trash2, Plus, X, Save,
  // ChevronDown, ChevronUp, X, Save, ArrowLeft,
  // ChevronLeft, ChevronRight
} from 'lucide-react';

const StaffManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id: urlStaffId, action } = useParams(); // Get staff ID and action from URL

  // State for staff list and selected staff
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Role: '',
    StaffType: '',
    Address: '',
    SupervisorID: '',
    Username: '',
    Password: '',
    Sex: '',
    Birthdate: '',
    SSN: ''
  });

  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [staffPerPage] = useState(8); // Same as in Dashboard

  // Check if current manager can modify the selected staff
  const canModifyStaff = useCallback((staff) => {
    // No staff selected yet
    if (!staff) return false;

    // Current user must be a Manager
    if (!currentUser || currentUser.role !== 'staff' || currentUser.staffRole !== 'Manager') {
      return false;
    }

    // Admin Managers can modify anyone
    if (currentUser.staffType === 'Admin') {
      return true;
    }

    // Other Managers can only modify staff (not managers) of their own StaffType
    if (staff.Role === 'Manager') {
      return false; // Cannot modify other managers
    }

    // Can only modify staff of their own StaffType
    return staff.StaffType === currentUser.staffType;
  }, [currentUser]);

  // Fetch staff members
  const fetchStaffMembers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get('/api/staff', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setStaffMembers(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch staff members:', err);
      setError('Unable to load staff data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch staff details
  const fetchStaffDetails = async (staffId) => {
    try {
      setLoading(true);

      const response = await axios.get(`/api/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSelectedStaff(response.data);
      setFormData({
        Name: response.data.Name || '',
        Role: response.data.Role || '',
        StaffType: response.data.StaffType || '',
        Address: response.data.Address || '',
        SupervisorID: response.data.SupervisorID || '',
        Username: response.data.Username || '',
        Password: '', // Don't populate password for security
        Sex: response.data.Sex || '',
        Birthdate: response.data.Birthdate ? new Date(response.data.Birthdate).toISOString().split('T')[0] : '',
        SSN: response.data.SSN || '' // Include SSN
      });

      setError(null);
    } catch (err) {
      console.error('Failed to fetch staff details:', err);
      setError('Unable to load staff details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check permission first
    if (!currentUser || currentUser.role !== 'staff' || currentUser.staffRole !== 'Manager') {
      navigate('/unauthorized');
      return;
    }

    fetchStaffMembers();

    // Check for staff ID in URL
    if (urlStaffId) {
      fetchStaffDetails(urlStaffId);
      // If action is 'edit', set editing mode
      if (action === 'edit') {
        setIsEditing(true);
      }
    }
  }, [currentUser, fetchStaffMembers, navigate, urlStaffId, action]);

  const handleSelectStaff = (staffId) => {
    if (selectedStaff && selectedStaff.Staff === staffId) {
      setSelectedStaff(null);
      setIsEditing(false);
    } else {
      fetchStaffDetails(staffId);
      setIsEditing(false);
      setIsAdding(false);
    }
  };

  const handleAddStaff = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedStaff(null);
    // Reset form data
    setFormData({
      Name: '',
      Role: '',
      StaffType: '',
      Address: '',
      SupervisorID: '',
      Username: '',
      Password: '',
      Sex: '',
      Birthdate: '',
      SSN: ''
    });
  };

  const handleEditStaff = () => {
    if (!canModifyStaff(selectedStaff)) {
      setError('You do not have permission to edit this staff member.');
      return;
    }
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setError(null);

    if (selectedStaff) {
      // Restore form data from selected staff
      setFormData({
        Name: selectedStaff.Name || '',
        Role: selectedStaff.Role || '',
        StaffType: selectedStaff.StaffType || '',
        Address: selectedStaff.Address || '',
        SupervisorID: selectedStaff.SupervisorID || '',
        Username: selectedStaff.Username || '',
        Password: '', // Don't populate password for security
        Sex: selectedStaff.Sex || '',
        Birthdate: selectedStaff.Birthdate ? new Date(selectedStaff.Birthdate).toISOString().split('T')[0] : '',
        SSN: selectedStaff.SSN || '' // Include SSN when restoring data
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!canModifyStaff(selectedStaff)) {
      setError('You do not have permission to update this staff member.');
      return;
    }

    try {
      setLoading(true);

      // Handle empty string for SupervisorID - convert to null
      const supervisorID = formData.SupervisorID === '' ? null : formData.SupervisorID;

      // Only include fields that can be updated
      const updateData = {
        name: formData.Name,
        role: formData.Role,
        address: formData.Address,
        supervisorID: supervisorID
      };

      await axios.put(`/api/staff/${selectedStaff.Staff}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Refresh staff list and selected staff
      fetchStaffMembers();
      fetchStaffDetails(selectedStaff.Staff);

      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update staff:', err);
      setError(`Unable to update staff: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    // Managers can only add staff of their own type unless they are Admin
    if (currentUser.staffType !== 'Admin' && formData.StaffType !== currentUser.staffType) {
      setError(`As a ${currentUser.staffType} manager, you can only add ${currentUser.staffType} staff.`);
      return;
    }

    // Non-admin managers cannot add other managers
    if (currentUser.staffType !== 'Admin' && formData.Role === 'Manager') {
      setError('Only Admin managers can add new managers.');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for new staff
      const newStaffData = {
        name: formData.Name,
        role: formData.Role,
        stafftype: formData.StaffType,
        address: formData.Address,
        supervisorID: formData.SupervisorID || null,
        username: formData.Username,
        password: formData.Password,
        sex: formData.Sex,
        birthdate: formData.Birthdate,
        ssn: formData.SSN // Placeholder - in a real app you'd handle this securely
      };

      await axios.post('/api/auth/register-staff', newStaffData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Refresh staff list
      fetchStaffMembers();

      setIsAdding(false);
      setError(null);
    } catch (err) {
      console.error('Failed to add staff:', err);
      setError('Unable to add staff. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    // Fetch the staff details first to check permissions
    try {
      const response = await axios.get(`/api/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const staffToDelete = response.data;

      // Check if current manager can delete this staff
      if (!canModifyStaff(staffToDelete)) {
        setError('You do not have permission to delete this staff member.');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
        return;
      }

      setLoading(true);

      // This would need to be implemented in your backend
      await axios.delete(`/api/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Refresh staff list
      fetchStaffMembers();

      if (selectedStaff && selectedStaff.Staff === staffId) {
        setSelectedStaff(null);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to delete staff:', err);
      setError('Unable to delete staff. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to staff list
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.Username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'All' || staff.Role === filterRole;
    const matchesType = filterType === 'All' || staff.StaffType === filterType;

    return matchesSearch && matchesRole && matchesType;
  });

  // Pagination logic
  const indexOfLastStaff = currentPage * staffPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffPerPage;
  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);

  // Functions for pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Get current staff for pagination
  const currentStaff = filteredStaff.slice(indexOfFirstStaff, indexOfLastStaff);

  // Extract unique roles and types for filters
  const roles = ['All', ...new Set(staffMembers.map(staff => staff.Role))];
  const types = ['All', ...new Set(staffMembers.map(staff => staff.StaffType))];

  // For new staff, restrict options based on manager type
  const getAvailableStaffTypes = () => {
    if (currentUser && currentUser.staffType === 'Admin') {
      return ['Zookeeper', 'Vet', 'Gift Shop Clerk', 'Admin'];
    } else if (currentUser) {
      // Non-admin managers can only add staff of their own type
      return [currentUser.staffType];
    }
    return [];
  };

  const getAvailableRoles = () => {
    if (currentUser && currentUser.staffType === 'Admin') {
      return ['Manager', 'Staff'];
    } else {
      // Non-admin managers can only add staff, not managers
      return ['Staff'];
    }
  };

  // Check permission
  if (!currentUser || currentUser.role !== 'staff' || currentUser.staffRole !== 'Manager') {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 font-['Lora']">Access denied. This page is only for zoo managers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Roboto_Flex'] flex items-center">
            <Users size={28} className="mr-3 text-purple-700" />
            Staff Management
          </h1>
          <p className="text-gray-600 font-['Lora']">
            Manage zoo staff members, roles, and assignments
          </p>
          <p className="text-purple-600 mt-2 font-['Lora'] text-sm">
            {currentUser.staffType === 'Admin'
              ? 'You have admin privileges to manage all staff.'
              : `As a ${currentUser.staffType} manager, you can only modify ${currentUser.staffType} staff.`}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Staff List Panel */}
          <div className="md:w-1/2 lg:w-2/5">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold font-['Roboto_Flex']">Staff Directory</h2>
                <button
                  onClick={handleAddStaff}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Staff
                </button>
              </div>

              {/* Search and Filters */}
              <div className="mb-4">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role === 'All' ? 'All Roles' : role}</option>
                    ))}
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff List */}
              {loading && !isEditing && !isAdding ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : (
                <div className="border rounded-md divide-y">
                  {filteredStaff.length === 0 ? (
                    <div className="py-4 px-3 text-center text-gray-500 font-['Lora']">
                      No staff members found.
                    </div>
                  ) : (
                    currentStaff.map(staff => (
                      <div
                        key={staff.Staff}
                        className={`py-3 px-3 cursor-pointer hover:bg-gray-50 ${selectedStaff && selectedStaff.Staff === staff.Staff ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}
                        onClick={() => handleSelectStaff(staff.Staff)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-800 font-['Mukta_Mahee']">{staff.Name}</div>
                            <div className="text-sm text-gray-500 font-['Lora']">
                              {staff.StaffType} {staff.Role === 'Manager' ? '- Manager' : ''}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs bg-gray-100 rounded-full px-2 py-1 text-gray-600">ID: {staff.Staff}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              )}

              {/* Pagination Controls */}
              {filteredStaff.length > staffPerPage && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`px-3 py-1 border rounded ${currentPage === index + 1 ? 'bg-purple-600 text-white' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* Staff Details/Edit Panel */}
          <div className="md:w-1/2 lg:w-3/5">
            {isAdding ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold font-['Roboto_Flex']">Add New Staff Member</h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitAdd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                      <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SSN*</label>
                      <input
                        value={formData.SSN}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        type="password"
                        name="SSN"
                        inputMode="numeric"
                        pattern="^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$"
                        placeholder="XXX-XX-XXXX"
                        aria-describedby="ssn-help ssn-error"
                        maxLength="11"
                        autoComplete="off"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                      <input
                        type="text"
                        name="Username"
                        value={formData.Username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                      <input
                        type="password"
                        name="Password"
                        value={formData.Password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
                      <select
                        name="Role"
                        value={formData.Role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select Role</option>
                        {getAvailableRoles().map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type*</label>
                      <select
                        name="StaffType"
                        value={formData.StaffType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select Type</option>
                        {getAvailableStaffTypes().map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sex*</label>
                      <select
                        name="Sex"
                        value={formData.Sex}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate*</label>
                      <input
                        type="date"
                        name="Birthdate"
                        value={formData.Birthdate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor ID</label>
                      <input
                        type="text"
                        name="SupervisorID"
                        value={formData.SupervisorID}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                      <input
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Add Staff
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : isEditing && selectedStaff ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold font-['Roboto_Flex']">Edit Staff Member</h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitEdit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="Username"
                        value={formData.Username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="Role"
                        value={formData.Role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        {getAvailableRoles().map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
                      <input
                        type="text"
                        name="StaffType"
                        value={formData.StaffType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor ID</label>
                      <input
                        type="text"
                        name="SupervisorID"
                        value={formData.SupervisorID}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedStaff ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold font-['Roboto_Flex']">Staff Details</h2>
                  <div className="flex space-x-2">
                    {canModifyStaff(selectedStaff) ? (
                      <>
                        <button
                          onClick={handleEditStaff}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(selectedStaff.Staff)}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        {currentUser.staffType !== 'Admin' && selectedStaff.Role === 'Manager'
                          ? "Cannot modify other managers"
                          : `Cannot modify ${selectedStaff.StaffType} staff`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="bg-purple-200 rounded-full p-3 mr-4">
                      <User size={30} className="text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold font-['Mukta_Mahee']">{selectedStaff.Name}</h3>
                      <p className="text-gray-600 font-['Lora']">
                        {selectedStaff.StaffType} {selectedStaff.Role === 'Manager' ? '- Manager' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Staff ID</p>
                    <p className="font-medium">{selectedStaff.Staff}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Username</p>
                    <p className="font-medium">{selectedStaff.Username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Role</p>
                    <p className="font-medium">{selectedStaff.Role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Staff Type</p>
                    <p className="font-medium">{selectedStaff.StaffType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Gender</p>
                    <p className="font-medium">{selectedStaff.Sex === 'M' ? 'Male' : selectedStaff.Sex === 'F' ? 'Female' : selectedStaff.Sex}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Birth Date</p>
                    <p className="font-medium">{selectedStaff.Birthdate ? new Date(selectedStaff.Birthdate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Hire Date</p>
                    <p className="font-medium">{selectedStaff.HireDate ? new Date(selectedStaff.HireDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Supervisor ID</p>
                    <p className="font-medium">{selectedStaff.SupervisorID || 'None'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 font-['Lora']">Address</p>
                    <p className="font-medium">{selectedStaff.Address || 'N/A'}</p>
                  </div>
                </div>

                {/* Staff Assignments Section */}
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 font-['Mukta_Mahee']">Assignments</h3>

                  {/* Implemented assignments section with loading states */}
                  <StaffAssignments
                    staffId={selectedStaff.Staff}
                    canModify={canModifyStaff(selectedStaff)}
                    staffType={selectedStaff.StaffType}
                    currentUserType={currentUser.staffType}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <Users size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Mukta_Mahee']">Staff Management</h3>
                <p className="text-gray-600 font-['Lora'] mb-6">
                  Select a staff member to view details, or add a new staff member.
                </p>
                <button
                  onClick={handleAddStaff}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add New Staff
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Staff Assignments component to show enclosures and attractions
const StaffAssignments = ({ staffId, canModify, staffType, currentUserType }) => {
  const [enclosures, setEnclosures] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState(null);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        // Fetch enclosures this staff member is assigned to
        const enclosuresResponse = await axios.get(`/api/enclosures/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setEnclosures(enclosuresResponse.data || []);

        // Fetch attractions this staff member is assigned to
        // Construct a compatible endpoint URL
        const attractionsResponse = await axios.get(`/api/attractions/${staffId}/staff-assignments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(err => {
          // If this endpoint doesn't exist yet, handle gracefully
          console.log('Attractions assignments endpoint may not be implemented yet');
          return { data: [] };
        });

        setAttractions(attractionsResponse.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
        setError('Unable to load assignments data');
      } finally {
        setLoading(false);
      }
    };

    if (staffId) {
      fetchAssignments();
    }
  }, [staffId]);

  const openAssignModal = async (type) => {
    // Check if user has permission to assign
    if (!canModify) {
      setError(`You don't have permission to assign this staff member.`);
      return;
    }

    setAssignmentType(type);
    setLoading(true);

    try {
      // Fetch available options based on type
      let options = [];

      if (type === 'enclosure') {
        const response = await axios.get('/api/enclosures', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        options = response.data;
      } else if (type === 'attraction') {
        const response = await axios.get('/api/attractions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        options = response.data;
      }

      // Filter out already assigned options
      const alreadyAssignedIds = type === 'enclosure'
        ? enclosures.map(e => e.EnclosureID)
        : attractions.map(a => a.AttractionID);

      const filteredOptions = options.filter(option => {
        const optionId = type === 'enclosure' ? option.EnclosureID : option.AttractionID;
        return !alreadyAssignedIds.includes(optionId);
      });

      setAvailableOptions(filteredOptions);
      setSelectedOptionId(filteredOptions.length > 0 ?
        (type === 'enclosure' ? filteredOptions[0].EnclosureID : filteredOptions[0].AttractionID) :
        '');
    } catch (err) {
      console.error(`Failed to fetch available ${type}s:`, err);
      setError(`Unable to load available ${type}s`);
    } finally {
      setLoading(false);
      setShowAssignModal(true);
    }
  };

  const handleAssign = async () => {
    if (!selectedOptionId) return;

    // Double check permission
    if (!canModify) {
      setError(`You don't have permission to assign this staff member.`);
      setShowAssignModal(false);
      return;
    }

    try {
      setLoading(true);

      if (assignmentType === 'enclosure') {
        // Add staff to enclosure assignment
        await axios.post(`/api/enclosures/${selectedOptionId}/assign-staff`,
          { Staff: staffId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        // Refresh enclosures
        const response = await axios.get(`/api/enclosures/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnclosures(response.data || []);
      } else if (assignmentType === 'attraction') {
        // Add staff to attraction assignment
        // This endpoint needs to be implemented in your backend
        await axios.post(`/api/attractions/${selectedOptionId}/assign-staff`,
          { Staff: staffId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        // Refresh attractions
        const response = await axios.get(`/api/attractions/${staffId}/staff-assignments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: [] }));
        setAttractions(response.data || []);
      }

      setShowAssignModal(false);
      setError(null);
    } catch (err) {
      console.error(`Failed to assign staff to ${assignmentType}:`, err);
      setError(`Failed to assign staff to ${assignmentType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (type, id) => {
    // Check permission first
    if (!canModify) {
      setError(`You don't have permission to modify this staff member's assignments.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to remove this ${type} assignment?`)) {
      return;
    }

    try {
      setLoading(true);

      if (type === 'enclosure') {
        // Remove staff from enclosure assignment
        // This endpoint needs to be implemented in your backend
        await axios.delete(`/api/enclosures/${id}/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Refresh enclosures
        const response = await axios.get(`/api/enclosures/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnclosures(response.data || []);
      } else if (type === 'attraction') {
        // Remove staff from attraction assignment
        // This endpoint needs to be implemented in your backend
        await axios.delete(`/api/attractions/${id}/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Refresh attractions
        const response = await axios.get(`/api/attractions/${staffId}/staff-assignments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: [] }));
        setAttractions(response.data || []);
      }

      setError(null);
    } catch (err) {
      console.error(`Failed to remove staff from ${type}:`, err);
      setError(`Failed to remove staff from ${type}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && enclosures.length === 0 && attractions.length === 0) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error && enclosures.length === 0 && attractions.length === 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Assignment buttons - Only show if user can modify this staff */}
      {canModify && (
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => openAssignModal('enclosure')}
            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Assign to Enclosure
          </button>
          <button
            onClick={() => openAssignModal('attraction')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Assign to Attraction
          </button>
        </div>
      )}

      {/* Enclosures */}
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2 font-['Mukta_Mahee'] text-gray-700">
          Enclosures
        </h4>

        {enclosures.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded text-gray-600 font-['Lora'] mb-4">
            No enclosures assigned to this staff member.
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {enclosures.map((enclosure) => (
              <div key={enclosure.EnclosureID} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
                <div>
                  <div className="font-medium">{enclosure.Name}</div>
                  <div className="text-sm text-gray-500">
                    Type: {enclosure.Type} | Location: {enclosure.Location}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Relation: {enclosure.StaffRelation}
                  </div>
                </div>
                {canModify && (
                  <button
                    onClick={() => handleRemoveAssignment('enclosure', enclosure.EnclosureID)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                    title="Remove assignment"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attractions */}
      <div>
        <h4 className="text-md font-semibold mb-2 font-['Mukta_Mahee'] text-gray-700">
          Attractions
        </h4>

        {attractions.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded text-gray-600 font-['Lora']">
            No attractions assigned to this staff member.
          </div>
        ) : (
          <div className="space-y-2">
            {attractions.map((attraction) => (
              <div key={attraction.AttractionID} className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
                <div>
                  <div className="font-medium">{attraction.Title}</div>
                  <div className="text-sm text-gray-500">
                    Location: {attraction.Location}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {attraction.StartTimeStamp && attraction.EndTimeStamp && (
                      <>Schedule: {new Date(attraction.StartTimeStamp).toLocaleTimeString()} - {new Date(attraction.EndTimeStamp).toLocaleTimeString()}</>
                    )}
                  </div>
                </div>
                {canModify && (
                  <button
                    onClick={() => handleRemoveAssignment('attraction', attraction.AttractionID)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                    title="Remove assignment"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4 font-['Mukta_Mahee']">
              Assign to {assignmentType === 'enclosure' ? 'Enclosure' : 'Attraction'}
            </h3>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : availableOptions.length === 0 ? (
              <div className="text-center py-4 text-gray-600 font-['Lora']">
                No available {assignmentType === 'enclosure' ? 'enclosures' : 'attractions'} to assign.
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select {assignmentType === 'enclosure' ? 'Enclosure' : 'Attraction'}
                </label>
                <select
                  value={selectedOptionId}
                  onChange={(e) => setSelectedOptionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {availableOptions.map((option) => (
                    <option
                      key={assignmentType === 'enclosure' ? option.EnclosureID : option.AttractionID}
                      value={assignmentType === 'enclosure' ? option.EnclosureID : option.AttractionID}
                    >
                      {assignmentType === 'enclosure' ? option.Name : option.Title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500"
                disabled={loading || availableOptions.length === 0}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;