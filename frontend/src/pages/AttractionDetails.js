// src/pages/AttractionDetails.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams
import StaffCard from '../components/StaffCard'; // import staffCard component for staff data

const AttractionDetails = () => {
    const {id: urlAttractionId} = useParams();

    /*States*/
    const {currentUser} = useAuth(); // user from authContext
    const [search_aID, setSearchAID] = useState(urlAttractionId || ''); // search variable
    const [attractionList, setAttractionList] = useState([]); //preload attractions for manager functions
    const [assignedAttractions, setAssignedAttractions] = useState([]); // for regular staff
    const [selectedAttraction, setSelectedAttraction] = useState(null); //fetch atraction details
    const [assignedStaff, setAssignedStaff] = useState([]); // store and set staff working an enclosure 
    const [zookeepers, setZookeepers] = useState([]); // zookeepers to select for attraction lead
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

    
    useEffect(() => {
        if (urlAttractionId) {
          loadAttraction(urlAttractionId);
        }
      }, [urlAttractionId]);

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
        if (currentUser && (currentUser.staffType === "Zookeeper" || currentUser.staffType === "Admin")) {
            fetchAttractions();
        }
    }, [currentUser]);

    // fetch staff that are zookeepers for attraction lead dropdown menu
    // these are the staff allowed to be assigned to the attractions
    useEffect(() => {
        const fetchZookeepers = async () => {
            try {
                const response = await axios.get("/api/staff/zookeepers", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });

                setZookeepers(response.data);
            } catch (err) {
                console.error("Error fetching zookeepers:", err);
            }
        };

        // only get if the manager is the user, others cant add or edit so they dont need this data
        if (currentUser && currentUser.staffRole === "Manager") {
            fetchZookeepers();
        }

    }, [currentUser]);

    //load attraction by its ID
    const loadAttraction = async (id) => {
        if (!id) return;
        setError(null);
        setLoading(true);

        try{
            const response = await axios.get(`/api/attractions/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSelectedAttraction(response.data);

            // this is what we are working on 
            const staffResponse = await axios.get(`/api/attractions/${id}/assigned-staff`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setAssignedStaff(staffResponse.data);
            
            // fill form data
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
        } catch (err) {
            console.error(err);
            setError("Failed to get attraction. Enter valid ID");
            setSelectedAttraction(null);
        } finally {
            setLoading(false);
        }
    };

    // get attraction by ID (event handler)
    const searchAttraction = async (a) => {
        a.preventDefault();
        if (!search_aID) {
            setError("Enter an Attraction ID.");
            return;
        }
        loadAttraction(search_aID);
    }

    // handle changes in form inputs
    const handleChange = (a) => {
        const { name, value } = a.target;
        setFormData((prev) => ({
            ...prev,    
            [name]:
                name === "StaffID"
                    ? parseInt(value)
                    : name === "EndTimeStamp" && value === ""
                    ? null
                    : value,
        }));
    };

    // Toggle edit mode (for managers)
    const handleToggleEdit = () => {
        if (selectedAttraction) {
            setIsEditing(true);
            setIsAdding(false);
        }
    };

    // add (for managers)
    const handleToggleAdd = () => {
        setIsAdding(true);
        setIsEditing(false);
        setSelectedAttraction(null); // Clear any displayed attraction when adding new one
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

        if(selectedAttraction){
            // Restore form data from selected attraction if any
            setFormData({
                StaffID: selectedAttraction.StaffID || "",
                Location: selectedAttraction.Location || "",
                StartTimeStamp: selectedAttraction.StartTimeStamp || "",
                EndTimeStamp: selectedAttraction.EndTimeStamp || "",
                Title: selectedAttraction.Title || "",
                Description: selectedAttraction.Description || "",
                Picture: selectedAttraction.Picture || "",
            })
        }
    }; 

    // update attraction (manager only)
    const handleUpdate = async (a) => {
        a.preventDefault();
        try{
            await axios.put(
                `/api/attractions/${selectedAttraction.AttractionID}`,
                formData,
                {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );

            // Fetch updated attraction (gets StaffName & any updates from DB)
            const updated = await axios.get(`/api/attractions/${selectedAttraction.AttractionID}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setSelectedAttraction(updated.data);


            setIsEditing(false);
            alert("Attraction updated successfully");

            // refresh attraction list for managers
            if (currentUser?.staffRole === "Manager") {
                const response = await axios.get("/api/attractions", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                setAttractionList(response.data);
            }
        } catch (err){
            console.error(err);
            alert("Failed to update attraction")
        }
    };

    // add attraction (manager only)
    const handleAdd = async (a) => {
        a.preventDefault();
        try {
            const response = await axios.post(`/api/attractions`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            const newId = response.data.AttractionID;

            // fetch new attraction including the staff ID
            const fullAttraction = await axios.get(`/api/attractions/${newId}`, {
                headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
            });

            setSelectedAttraction(fullAttraction.data); // set the new attraction as the current one
            setAssignedStaff([]); // clear staff cards from previous attraction, if any 
            setIsAdding(false); // exit add mode
            alert("Attraction added successfully");

            // refresh attraction list for managers
            if (currentUser?.staffRole === "Manager") {
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

    // delete attraction (manager only)
    const handleDelete = async () => {
        if(!selectedAttraction) return;
        if(!window.confirm("Are you sure you want to delete this attraction? This action cannot be undone."))
            return;

        try {
            await axios.delete(`/api/attractions/${selectedAttraction.AttractionID}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            setSelectedAttraction(null); // Clear the current attraction from state
            setSearchAID(""); // clear the search input

            // refresh attraction list for managers
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
        if(attractionId) {
            loadAttraction(attractionId);
        } else {
            setSelectedAttraction(null);
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
                        <select className="border border-gray-300 p-2 rounded w-full md:w-64 font-['Mukta_Mahee']"
                            value={selectedAttraction?.AttractionID || ""}
                            onChange={handleAttractionSelect}
                        >
                            <option  value=""> Select an attraction</option>
                            {attractionList.map(attraction => (
                                <option key={attraction.AttractionID} value={attraction.AttractionID}>
                                    {attraction.Title} (ID: {attraction.AttractionID})
                                </option>
                            ))}
                        </select>

                        {attractionList.length === 0 && !loading && (
                            <p className="mt-2 text-amber-600 font-['Lora']">
                                You don't have any assigned attractions
                            </p>
                        )}
                    </div>
                ) : (
                    // Zookeeper manager/Admin interface - Search by ID
                    <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <form onSubmit={searchAttraction} className="flex items-center">
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Mukta_Mahee']">
                                    Search:
                                </label>

                                {/* dropdown attraction search */}
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
                            
                            {/* Add button for Admin */}
                            {currentUser?.staffType === 'Admin' && (
                                <button
                                    type="button"
                                    onClick={handleToggleAdd}
                                    className="bg-green-700 text-white p-2 rounded font-['Mukta_Mahee']"
                                >
                                    Add Attraction
                              </button>
                            )}

                            {/* Edit button for admin(and delete for admin) and zookeeper managers */}
                            {selectedAttraction && (
                                <>
                                    {((currentUser?.staffType === "Zookeeper" && currentUser?.staffRole === "Manager") ||
                                        currentUser?.staffType === "Admin") && (
                                        <button
                                            type="button"
                                            onClick={handleToggleEdit}
                                            className="bg-blue-600 text-white p-2 rounded font-['Mukta_Mahee']"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {currentUser?.staffType === "Admin" && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="bg-red-600 text-white p-2 rounded font-['Mukta_Mahee']"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </>
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
                        <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']"> Add New Attraction</h2>
                        <form onSubmit={handleAdd}>
                            {/* entry tables */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                                    Attraction Lead
                                </label>
                                <select
                                    name="StaffID"
                                    value={formData.StaffID}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                                    required
                                >
                                    <option value="">Select Zookeeper for Attraction</option>
                                    {zookeepers.map((zookeeper) => (
                                    <option key={zookeeper.Staff} value={zookeeper.Staff}>
                                        {zookeeper.Name} (ID: {zookeeper.Staff})
                                    </option>
                                    ))}
                                </select>
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
                                        value={formData.EndTimeStamp || ""}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                                        Location
                                    </label>
                                    <select
                                        name="Location"
                                        value={formData.Location}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                                        required
                                    >
                                        <option value="">Select Location</option>
                                        <option value="North Wing">North Wing</option>
                                        <option value="East Wing">East Wing</option>
                                        <option value="South Wing">South Wing</option>
                                        <option value="West Wing">West Wing</option>
                                        <option value="Central Plaza">Central Plaza</option>
                                    </select>
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

                            {/* submit/cancel buttons */}
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
                                    Attraction Lead
                                </label>
                                <select
                                    name="StaffID"
                                    value={formData.StaffID}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                                    required
                                >
                                    <option value="">Select a Zookeeper</option>
                                    {zookeepers.map((zookeeper) => (
                                    <option key={zookeeper.Staff} value={zookeeper.Staff}>
                                        {zookeeper.Name} (ID: {zookeeper.Staff})
                                    </option>
                                    ))}
                                </select>
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
                                        End Time (Select "clear" if this is a permanent attraction)
                                    </label>
                                    <input 
                                        type="datetime-local"
                                        name="EndTimeStamp"
                                        onChange={(a) => {
                                            // Always trim whitespace so that accidental spaces don’t sneak in
                                            const { name, value } = a.target;
                                            setFormData((prev) => ({
                                              ...prev,
                                              [name]: value.trim(), // sets to "" when cleared
                                            }));
                                          }}
                                          onBlur={(a) => {
                                            // If the user leaves the field empty (or with only spaces), ensure we reset it to ""
                                            if (a.target.value.trim() === "") {
                                              setFormData((prev) => ({ ...prev, EndTimeStamp: "" }));
                                            }
                                          }}
                                        className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                                        placeholder="Leave blank if permanent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                                        Location
                                    </label>
                                    <select
                                        name="Location"
                                        value={formData.Location}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 p-2 rounded font-['Mukta_Mahee']"
                                        required
                                    >
                                        <option value="">Select Location</option>
                                        <option value="North Wing">North Wing</option>
                                        <option value="East Wing">East Wing</option>
                                        <option value="South Wing">South Wing</option>
                                        <option value="West Wing">West Wing</option>
                                        <option value="Central Plaza">Central Plaza</option>
                                    </select>
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

                            {/* submit/cancel buttons */}
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
                        <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">Enclosure Details</h2>

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
                                        <td className="py-2 pr-4 font-semibold font-['Mukta_Mahee']">Attraction Lead:</td>
                                        <td className="py-2 font-['Lora']">{selectedAttraction.StaffName}</td>
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
                                        {selectedAttraction.EndTimeStamp
                                            ? new Date(selectedAttraction.EndTimeStamp).toLocaleString()
                                            : <span className="text-gray-500">Permanent</span>}
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
                        {/* Staff cards section */}
                        <h3 className="text-xl font-semibold mb-4 font-['Roboto_Flex']">
                            Staff Assigned to This Attraction
                        </h3>

                        {assignedStaff.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {assignedStaff.map((staff) => (
                                    <StaffCard key={staff.StaffID} staff={staff} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 py-4 font-['Lora']">No staff assigned to this attraction.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default AttractionDetails;