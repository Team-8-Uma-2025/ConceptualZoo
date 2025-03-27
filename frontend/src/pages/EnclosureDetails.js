// src/pages/EnclosureDetails.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import AnimalCard from "../components/AnimalCard";
import { useParams } from 'react-router-dom'; // Import useParams


const EnclosureDetails = () => {
  const { id: urlEnclosureId } = useParams();

  // States
  const { currentUser } = useAuth(); // user from authContext
  const [search_eID, setSearchEID] = useState(urlEnclosureId || ""); // Initialize with URL param
  const [enclosureList, setEnclosureList] = useState([]); // preload enclosures for dropdown
  const [assignedEnclosures, setAssignedEnclosures] = useState([]); // for zookeepers
  const [selectedEnclosure, setSelectedEnclosure] = useState(null); // fetch enclosure details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For managers when editing or adding
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // add and edit form fields (managers)
  const [formData, setFormData] = useState({
    StaffID: "",
    Name: "",
    Type: "",
    Capacity: "",
    Location: "",
  });

  // Modified first useEffect
  useEffect(() => {
    const fetchAssignedEnclosures = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        let endpoint = '/api/enclosures';
        
        // If user is a zookeeper, get their assigned enclosures
        if (currentUser.staffType === 'Zookeeper') {
          endpoint = `/api/enclosures/staff/${currentUser.id}`;
        }
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setAssignedEnclosures(response.data);
        
        // If enclosure ID was in URL, we've already triggered loadEnclosure, 
        // so we don't need to auto-select the first one
        if (!urlEnclosureId && response.data.length > 0 && currentUser.staffType === 'Zookeeper') {
          loadEnclosure(response.data[0].EnclosureID);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch assigned enclosures:", err);
        setError("Failed to load your assigned enclosures. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    // If there's an ID in the URL, load it first, then fetch assigned enclosures
    if (urlEnclosureId) {
      loadEnclosure(urlEnclosureId).then(() => {
        fetchAssignedEnclosures();
      });
    } else {
      // Otherwise just fetch the assigned enclosures
      fetchAssignedEnclosures();
    }
  }, [currentUser, urlEnclosureId]);

  // preload enclosure lists for managers
  useEffect(() => {
    const fetchEnclosures = async () => {
      try {
        const response = await axios.get("/api/enclosures", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnclosureList(response.data);
      } catch (err) {
        console.error("Error fetching enclosures list:", err);
      }
    };
    
    if (currentUser && currentUser.staffRole === "Manager") {
      fetchEnclosures();
    }
  }, [currentUser]);

  // load enclosure by its ID
  const loadEnclosure = async (id) => {
    if (!id) return;
    setError(null);
    setLoading(true);

    try {
      const response = await axios.get(`/api/enclosures/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Get animals in this enclosure
      const animalsResponse = await axios.get(`/api/animals/enclosure/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Combine enclosure data with animals
      const enclosureWithAnimals = {
        ...response.data,
        Animals: animalsResponse.data
      };
      
      setSelectedEnclosure(enclosureWithAnimals);

      // fill form data
      setFormData({
        StaffID: response.data.StaffID || "",
        Name: response.data.Name || "",
        Type: response.data.Type || "",
        Capacity: response.data.Capacity || "",
        Location: response.data.Location || "",
      });
      
      setIsEditing(false);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      setError("Failed to get enclosure. Enter valid ID");
      setSelectedEnclosure(null);
    } finally {
      setLoading(false);
    }
  };

  // get enclosure by ID (event handler)
  const searchEnclosure = async (e) => {
    e.preventDefault(); // stop page from reloading on submit
    if (!search_eID) {
      setError("Enter an enclosure ID.");
      return;
    }

    loadEnclosure(search_eID);
  };

  // handle changes in form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // add (for managers)
  const handleToggleAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedEnclosure(null); // Clear any displayed enclosure when adding new one
    setFormData({
      StaffID: "",
      Name: "",
      Type: "",
      Capacity: "",
      Location: "",
    });
  };

  // Toggle edit mode (for managers)
  const handleToggleEdit = () => {
    if (selectedEnclosure) {
      setIsEditing(true);
      setIsAdding(false);
    }
  };

  // Cancel add/edit mode
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    
    // Restore form data from selected enclosure if any
    if (selectedEnclosure) {
      setFormData({
        StaffID: selectedEnclosure.StaffID || "",
        Name: selectedEnclosure.Name || "",
        Type: selectedEnclosure.Type || "",
        Capacity: selectedEnclosure.Capacity || "",
        Location: selectedEnclosure.Location || "",
      });
    }
  };

  // Update enclosure (manager only)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/enclosures/${selectedEnclosure.EnclosureID}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the local state with the new data
      setSelectedEnclosure({ 
        ...selectedEnclosure, 
        ...formData 
      });
      
      setIsEditing(false);
      alert("Enclosure updated successfully");
      
      // Refresh enclosure list for managers
      if (currentUser && currentUser.staffRole === "Manager") {
        const response = await axios.get("/api/enclosures", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnclosureList(response.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update enclosure");
    }
  };
  
  // add enclosure (Manager only)
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/enclosures`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Construct a new enclosure object using the returned EnclosureID
      const newEnclosure = {
        ...formData,
        EnclosureID: response.data.EnclosureID,
        Animals: [] // Initialize with empty animals array
      };
      
      setSelectedEnclosure(newEnclosure); // Set the new enclosure as the current one
      setIsAdding(false); // Exit add mode
      alert("Enclosure added successfully");
      
      // Refresh enclosure list for managers
      if (currentUser && currentUser.staffRole === "Manager") {
        const response = await axios.get("/api/enclosures", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnclosureList(response.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add enclosure");
    }
  };
  
  // Delete enclosure (manager only)
  const handleDelete = async () => {
    if (!selectedEnclosure) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this enclosure? This action cannot be undone."
      )
    ) 
      return;
      
    try {
      await axios.delete(`/api/enclosures/${selectedEnclosure.EnclosureID}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setSelectedEnclosure(null); // Clear the current enclosure from state
      setSearchEID(""); // Clear the search input
      
      // Refresh enclosure list for managers
      if (currentUser && currentUser.staffRole === "Manager") {
        const response = await axios.get("/api/enclosures", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnclosureList(response.data);
      }
      
      alert("Enclosure deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete enclosure");
    }
  };

  // Select enclosure from dropdown (for zookeepers)
  const handleEnclosureSelect = (e) => {
    const enclosureId = e.target.value;
    if (enclosureId) {
      loadEnclosure(enclosureId);
    } else {
      setSelectedEnclosure(null);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 font-['Roboto_Flex']">
          Enclosure Management
        </h1>
        
        {/* Different UI based on user role */}
        {currentUser?.staffType === 'Zookeeper' ? (
          // Zookeeper Interface - Dropdown of assigned enclosures
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Mukta_Mahee']">
              Select Your Assigned Enclosure:
            </label>
            <select
              className="border border-gray-300 p-2 rounded w-full md:w-64 font-['Mukta_Mahee']"
              value={selectedEnclosure?.EnclosureID || ""}
              onChange={handleEnclosureSelect}
            >
              <option value="">Select an enclosure</option>
              {assignedEnclosures.map(enclosure => (
                <option key={enclosure.EnclosureID} value={enclosure.EnclosureID}>
                  {enclosure.Name} (ID: {enclosure.EnclosureID})
                </option>
              ))}
            </select>
            
            {assignedEnclosures.length === 0 && !loading && (
              <p className="mt-2 text-amber-600 font-['Lora']">
                You don't have any assigned enclosures.
              </p>
            )}
          </div>
        ) : (
          // Manager or Vet Interface - Search by ID
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <form onSubmit={searchEnclosure} className="flex items-center">
                <input
                  type="text"
                  placeholder="Enter Enclosure ID"
                  value={search_eID}
                  onChange={(e) => setSearchEID(e.target.value)}
                  className="border border-gray-300 p-2 rounded mr-2 font-['Mukta_Mahee']"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded font-['Mukta_Mahee']"
                >
                  Search
                </button>
              </form>

              {/* Manager-only buttons */}
              {currentUser?.staffRole === "Manager" && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleToggleAdd}
                    className="bg-green-700 text-white p-2 rounded font-['Mukta_Mahee']"
                  >
                    Add Enclosure
                  </button>
                  {selectedEnclosure && (
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

        {/* Add enclosure form */}
        {isAdding && currentUser?.staffRole === "Manager" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">
              Add New Enclosure
            </h2>
            <form onSubmit={handleAdd}>
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
                    Enclosure Name
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Type
                  </label>
                  <select
                    name="Type"
                    value={formData.Type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Mammal">Mammal</option>
                    <option value="Avian">Avian</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Amphibian">Amphibian</option>
                    <option value="Aquatic">Aquatic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="Capacity"
                    value={formData.Capacity}
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
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded font-['Mukta_Mahee']"
                >
                  Add Enclosure
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

        {/* Edit enclosure form */}
        {isEditing && currentUser?.staffRole === "Manager" && selectedEnclosure && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">
              Edit Enclosure
            </h2>
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
                    Enclosure Name
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Type
                  </label>
                  <select
                    name="Type"
                    value={formData.Type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Mammal">Mammal</option>
                    <option value="Avian">Avian</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Amphibian">Amphibian</option>
                    <option value="Aquatic">Aquatic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="Capacity"
                    value={formData.Capacity}
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
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded font-['Mukta_Mahee']"
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

        {/* Enclosure details section */}
        {selectedEnclosure && !isAdding && !isEditing && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">
              Enclosure Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <table className="min-w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Enclosure ID:</td>
                      <td className="py-2 font-['Lora']">{selectedEnclosure.EnclosureID}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Name:</td>
                      <td className="py-2 font-['Lora']">{selectedEnclosure.Name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Type:</td>
                      <td className="py-2 font-['Lora']">{selectedEnclosure.Type}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Capacity:</td>
                      <td className="py-2 font-['Lora']">{selectedEnclosure.Capacity}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Location:</td>
                      <td className="py-2 font-['Lora']">{selectedEnclosure.Location}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold mb-2 font-['Mukta_Mahee']">Summary</h3>
                <div className="flex flex-wrap gap-4 font-['Lora']">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Animals</p>
                    <p className="text-xl font-bold">{selectedEnclosure.Animals?.length || 0}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Capacity Used</p>
                    <p className="text-xl font-bold">
                      {Math.round(((selectedEnclosure.Animals?.length || 0) / selectedEnclosure.Capacity) * 100)}%
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Sick Animals</p>
                    <p className="text-xl font-bold text-red-600">
                      {selectedEnclosure.Animals?.filter(animal => animal.HealthStatus === 'Sick').length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animal cards section */}
            <h3 className="text-xl font-semibold mb-4 font-['Roboto_Flex']">
              Animals in this Enclosure
            </h3>
            
            {selectedEnclosure.Animals && selectedEnclosure.Animals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedEnclosure.Animals.map(animal => (
                  <AnimalCard key={animal.AnimalID} animal={animal} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4 font-['Lora']">No animals are currently assigned to this enclosure.</p>
            )}
          </div>
        )}

        {/* Show this when no enclosure is selected and not adding */}
        {!selectedEnclosure && !isAdding && !loading && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-500 font-['Lora']">
              {currentUser?.staffType === 'Zookeeper' 
                ? "Select an enclosure from the dropdown above to view details." 
                : "Enter an enclosure ID to view details."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnclosureDetails;