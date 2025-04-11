import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams
import StaffCard from '../components/StaffCard'; // import staffCard component for staff data

const AttractionDetails = () => {
  const { id: urlAttractionId } = useParams();

  /* States */
  const { currentUser } = useAuth(); // user from authContext
  const [search_aID, setSearchAID] = useState(urlAttractionId || ''); // search variable
  const [attractionList, setAttractionList] = useState([]); // preload attractions for manager functions
  const [assignedAttractions, setAssignedAttractions] = useState([]); // for regular staff
  const [selectedAttraction, setSelectedAttraction] = useState(null); // fetch attraction details
  const [assignedStaff, setAssignedStaff] = useState([]); // store and set staff working in an attraction 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

  // For managers when editing or adding
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    StaffID: "",
    Location: "",
    StartTimeStamp: "",
    EndTimeStamp: "",
    Title: "",
    Description: "",
    Picture: "",
  });

  // New states for the add popup and removal selection
  const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedStaffToRemove, setSelectedStaffToRemove] = useState([]);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await axios.get("/api/attractions", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAttractionList(response.data);
      } catch (err) {
        console.error("Error fetching attractions list:", err);
      }
    };
    if (currentUser && currentUser.staffRole === "Manager") {
      fetchAttractions();
    }
  }, [currentUser]);

  // Load attraction by its ID
  const loadAttraction = async (id) => {
    if (!id) return;
    setError(null);
    setLoading(true);

    try {
      const response = await axios.get(`/api/attractions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedAttraction(response.data);

      // Fetch assigned staff for this attraction
      const staffResponse = await axios.get(`/api/attractions/${id}/assigned-staff`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAssignedStaff(staffResponse.data);
      
      // Fill form data
      setFormData({
        StaffID: response.data.StaffID || "",
        Location: response.data.Location || "",
        StartTimeStamp: response.data.StartTimeStamp || "",
        EndTimeStamp: response.data.EndTimeStamp || "",
        Title: response.data.Title || "",
        Description: response.data.Description || "",
        Picture: response.data.Picture || "",
      });

      setIsEditing(false);
      setIsAdding(false);
      // Clear any previously selected staff for removal
      setSelectedStaffToRemove([]);
    } catch (err) {
      console.error(err);
      setError("Failed to get attraction. Enter valid ID");
      setSelectedAttraction(null);
    } finally {
      setLoading(false);
    }
  };

  // Get attraction by ID (event handler)
  const searchAttraction = async (a) => {
    a.preventDefault();
    if (!search_aID) {
      setError("Enter an Attraction ID.");
      return;
    }
    loadAttraction(search_aID);
  };

  // Handle changes in form inputs
  const handleChange = (a) => {
    setFormData({
      ...formData,
      [a.target.name]: a.target.value
    });
  };

  // Toggle edit mode (for managers)
  const handleToggleEdit = () => {
    if (selectedAttraction) {
      setIsEditing(true);
      setIsAdding(false);
    }
  };

  // Toggle add mode (for managers)
  const handleToggleAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedAttraction(null); // Clear any displayed attraction when adding a new one
    setFormData({
      StaffID: "",
      Location: "",
      StartTimeStamp: "",
      EndTimeStamp: "",
      Title: "",
      Description: "",
      Picture: "",
    });
  };

  // Cancel add/edit mode
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);

    if (selectedAttraction) {
      // Restore form data from selected attraction if any
      setFormData({
        StaffID: selectedAttraction.StaffID || "",
        Location: selectedAttraction.Location || "",
        StartTimeStamp: selectedAttraction.StartTimeStamp || "",
        EndTimeStamp: selectedAttraction.EndTimeStamp || "",
        Title: selectedAttraction.Title || "",
        Description: selectedAttraction.Description || "",
        Picture: selectedAttraction.Picture || "",
      });
    }
  };

  // Update attraction (manager only)
  const handleUpdate = async (a) => {
    a.preventDefault();
    try {
      await axios.put(
        `/api/attractions/${selectedAttraction.AttractionID}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the local state with new data
      setSelectedAttraction({
        ...selectedAttraction,
        ...formData
      });

      setIsEditing(false);
      alert("Attraction updated successfully");

      // Refresh attraction list for managers
      if (currentUser && currentUser.staffRole === "Manager") {
        const response = await axios.get("/api/attractions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setAttractionList(response.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update attraction");
    }
  };

  // Add attraction (manager only)
  const handleAdd = async (a) => {
    a.preventDefault();
    try {
      const response = await axios.post(`/api/attractions`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // New attraction object using new returned AttractionID
      const newAttraction = {
        ...formData,
        AttractionID: response.data.AttractionID,
        Staff: [] // initialize with empty staff array
      };

      setSelectedAttraction(newAttraction); // set the new attraction as the current one
      setIsAdding(false); // exit add mode
      alert("Attraction added successfully");

      // Refresh attraction list for managers
      if (currentUser && currentUser.staffRole === "Manager") {
        const response = await axios.get("/api/attractions", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAttractionList(response.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add attraction");
    }
  };

  // Delete attraction (manager only)
  const handleDelete = async () => {
    if (!selectedAttraction) return;
    if (!window.confirm("Are you sure you want to delete this attraction? This action cannot be undone."))
      return;

    try {
      await axios.delete(`/api/attractions/${selectedAttraction.AttractionID}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setSelectedAttraction(null); // Clear the current attraction from state
      setSearchAID(""); // Clear the search input

      // Refresh attraction list for managers
      if (currentUser && currentUser.staffRole === "Manager") {
        const response = await axios.get("/api/attractions", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAttractionList(response.data);
      }

      alert("Attraction deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete attraction");
    }
  };

  // Select attraction from dropdown (for zookeepers)
  const handleAttractionSelect = (a) => {
    const attractionId = a.target.value;
    if (attractionId) {
      loadAttraction(attractionId);
    } else {
      setSelectedAttraction(null);
    }
  };

  // -------------------------------
  // New Functions for Employee Removal & Add Popup
  // -------------------------------

  // Fetch available staff (only those not Managers) for the add popup
  const fetchAvailableStaff = async () => {
    try {
      const response = await axios.get('/api/staff/available', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Filter staff that are not Managers
      const available = response.data.filter(staff => staff.Role !== "Manager");
      setAvailableStaff(available);
    } catch (err) {
      console.error("Error fetching available staff:", err);
    }
  };

  // Open the Add Employee modal
  const openAddEmployeeModal = () => {
    fetchAvailableStaff();
    setAddEmployeeModalOpen(true);
  };

  // Close the Add Employee modal
  const closeAddEmployeeModal = () => {
    setAddEmployeeModalOpen(false);
  };

  // Handle adding an employee from the popup to the current attraction
  const handleAddEmployee = async (staff) => {
    try {
      await axios.post(`/api/attractions/${selectedAttraction.AttractionID}/add-staff`, { staffId: staff.StaffID }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Update the assignedStaff state
      setAssignedStaff([...assignedStaff, staff]);
      // Optionally remove the added staff from the available list
      setAvailableStaff(availableStaff.filter(s => s.StaffID !== staff.StaffID));
      alert(`Added ${staff.NAME} successfully`);
    } catch (error) {
      console.error("Failed to add employee:", error);
      alert("Failed to add employee");
    }
  };

  // Handle selection toggle for removal on an assigned staff card
  const handleSelectForRemoval = (staff, selected) => {
    if (selected) {
      setSelectedStaffToRemove(prev => [...prev, staff.StaffID]);
    } else {
      setSelectedStaffToRemove(prev => prev.filter(id => id !== staff.StaffID));
    }
  };

  // Handle removal of selected employees from the attraction
  const handleRemoveEmployees = async () => {
    if (selectedStaffToRemove.length === 0) return;
    if (!window.confirm("Are you sure you want to remove the selected employees?")) return;
    try {
      await axios.delete(`/api/attractions/${selectedAttraction.AttractionID}/remove-staff`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { staffIds: selectedStaffToRemove }
      });
      // Update the assignedStaff list by filtering out removed staff
      setAssignedStaff(prev => prev.filter(staff => !selectedStaffToRemove.includes(staff.StaffID)));
      // Clear the selection
      setSelectedStaffToRemove([]);
      alert("Selected employees removed successfully");
    } catch (error) {
      console.error("Error removing employees:", error);
      alert("Failed to remove employees");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 font-['Roboto_Flex']">Attractions Management</h1>

        {/* Different UI based on user role */}
        {currentUser?.staffType === 'Zookeeper' && currentUser?.staffRole !== 'Manager' ? (
          // Zookeeper interface
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Mukta_Mahee']">
              Select Your Assigned Attraction:
            </label>
            <select
              className="border border-gray-300 p-2 rounded w-full md:w-64 font-['Mukta_Mahee']"
              value={selectedAttraction?.AttractionID || ""}
              onChange={handleAttractionSelect}
            >
              <option value="">Select an attraction</option>
              {assignedAttractions.map(attraction => (
                <option key={attraction.Title} value={attraction.AttractionID}>
                  {attraction.Title} (ID: {attraction.AttractionID})
                </option>
              ))}
            </select>

            {assignedAttractions.length === 0 && !loading && (
              <p className="mt-2 text-amber-600 font-['Lora']">
                You don't have any assigned attractions
              </p>
            )}
          </div>
        ) : (
          // Zookeeper manager interface - Search by ID
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <form onSubmit={searchAttraction} className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Mukta_Mahee']">
                  Search:
                </label>
                {/* Dropdown attraction search */}
                <select
                  value={selectedAttraction?.AttractionID || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) loadAttraction(id);
                    else setSelectedAttraction(null);
                  }}
                  className="border border-gray-300 p-2 rounded w-full md:w-64 font-['Mukta_Mahee']"
                >
                  <option value="">Select an attraction</option>
                  {attractionList.map((attraction) => (
                    <option key={attraction.AttractionID} value={attraction.AttractionID}>
                      {attraction.Title} (ID: {attraction.AttractionID})
                    </option>
                  ))}
                </select>
              </form>

              {/* Manager-only buttons */}
              {currentUser?.staffType === 'Zookeeper' && currentUser?.staffRole === "Manager" && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleToggleAdd}
                    className="bg-green-700 text-white p-2 rounded font-['Mukta_Mahee']"
                  >
                    Add Attraction
                  </button>
                  {selectedAttraction && (
                    <>
                      <button
                        type="button"
                        onClick={handleToggleEdit}
                        className="bg-blue-600 text-white p-2 rounded font-['Mukta_Mahee']"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-600 text-white p-2 rounded font-['Mukta_Mahee']"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading and error messages */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-['Lora']">
            {error}
          </div>
        )}

        {/* Add attraction form */}
        {isAdding && currentUser?.staffRole === "Manager" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">Add New Attraction</h2>
            <form onSubmit={handleAdd}>
              {/* Entry tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    name="StaffID"
                    value={formData.StaffID}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Attraction Title
                  </label>
                  <input
                    type="text"
                    name="Title"
                    value={formData.Title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="StartTimeStamp"
                    value={formData.StartTimeStamp}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="EndTimeStamp"
                    value={formData.EndTimeStamp}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Location
                  </label>
                  <input
                    type="text"
                    name="Location"
                    value={formData.Location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    placeholder="Enter a short description..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Picture URL
                  </label>
                  <input
                    type="text"
                    name="Picture"
                    value={formData.Picture}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>
              </div>

              {/* Submit/Cancel buttons */}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded font-['Mukta_Mahee']"
                >
                  Add Attraction
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 text-white p-2 rounded font-['Mukta_Mahee']"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit attraction form */}
        {isEditing && currentUser?.staffRole === "Manager" && selectedAttraction && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">Edit Attraction</h2>
            {/* Edit form entry tables */}
            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    name="StaffID"
                    value={formData.StaffID}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Attraction Title
                  </label>
                  <input
                    type="text"
                    name="Title"
                    value={formData.Title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="StartTimeStamp"
                    value={formData.StartTimeStamp}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="EndTimeStamp"
                    value={formData.EndTimeStamp}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Location
                  </label>
                  <input
                    type="text"
                    name="Location"
                    value={formData.Location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    placeholder="Enter a short description..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Picture URL
                  </label>
                  <input
                    type="text"
                    name="Picture"
                    value={formData.Picture}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>
              </div>

              {/* Submit/Cancel buttons */}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded font-['Mukta_Mahee']"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 text-white p-2 rounded font-['Mukta_Mahee']"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Attraction Details */}
        {selectedAttraction && !isAdding && !isEditing && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">Attraction Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <table className="min-w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Attraction ID:</td>
                      <td className="py-2 font-['Lora']">{selectedAttraction.AttractionID}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Title:</td>
                      <td className="py-2 font-['Lora']">{selectedAttraction.Title}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Location:</td>
                      <td className="py-2 font-['Lora']">{selectedAttraction.Location}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Start Time:</td>
                      <td className="py-2 font-['Lora']">
                        {new Date(selectedAttraction.StartTimeStamp).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">End Time:</td>
                      <td className="py-2 font-['Lora']">
                        {new Date(selectedAttraction.EndTimeStamp).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Description:</td>
                      <td className="py-2 font-['Lora']">{selectedAttraction.Description}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Picture:</td>
                      <td className="py-2 font-['Lora']">
                        <img
                          src={selectedAttraction.Picture}
                          alt="Attraction"
                          className="w-64 rounded border"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff Cards Section Header with New Buttons */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold font-['Roboto_Flex']">
                Staff Assigned to This Attraction
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={openAddEmployeeModal}
                  type="button"
                  className="bg-green-600 text-white p-2 rounded font-['Mukta_Mahee']"
                >
                  Add Employee
                </button>
                <button
                  onClick={handleRemoveEmployees}
                  type="button"
                  disabled={selectedStaffToRemove.length === 0}
                  className={`${selectedStaffToRemove.length > 0 ? 'bg-red-600' : 'bg-gray-400'} text-white p-2 rounded font-['Mukta_Mahee']`}
                >
                  Remove Employee
                </button>
              </div>
            </div>

            {/* Assigned Staff Cards */}
            {assignedStaff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedStaff.map((staff) => (
                  <StaffCard
                    key={staff.StaffID}
                    staff={staff}
                    // Only enable selection (checkbox) if the staff is not a Manager.
                    selectable={staff.Role !== "Manager"}
                    isSelected={selectedStaffToRemove.includes(staff.StaffID)}
                    onSelect={handleSelectForRemoval}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4 font-['Lora']">No staff assigned to this attraction.</p>
            )}
          </div>
        )}

        {/* Add Employee Modal */}
        {addEmployeeModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Available Staff</h2>
                <button onClick={closeAddEmployeeModal} className="text-gray-500">
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableStaff.length > 0 ? (
                  availableStaff.map(staff => (
                    <div key={staff.StaffID} onClick={() => handleAddEmployee(staff)} className="cursor-pointer">
                      <StaffCard staff={staff} />
                    </div>
                  ))
                ) : (
                  <p>No available staff to add.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttractionDetails;