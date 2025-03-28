import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AttractionDetails = () => {
    const {id: urlAttractionId} = useParams();

    /*States*/
    const {currentUser} = useAuth(); // user from authContext
    const [search_aID, setSearchAID] = useState(urlAttractionId || ''); // search variable
    const [attractionList, setAttractionList] = useState([]); //preload attractions for manager functions
    const [assignedAttractions, setAssignedAttractions] = useState([]); // for regular staff
    const [selectedAttraction, setSelectedAttraction] = useState(null); //fetch enclosure details
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

    /* joshua code to refernece
    useEffect(() => {
        const fetchAssignedAttraction = async () => {
            if(!currentUser) return;
            try {
                setLoading(true);
                let endpoint = '/api/attraction';

                // if user is a zookeeper, get their assigned attraction
                if(currentUser.staffType === 'Zookeeper'){
                    endpoint = `/api/attraction/staff/${currentUser.id}`;
                }

            } catch (err) {
                console.error("Failed to fetch attraction", err);
                setError("Failed to load your assigned enclosures. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    }, [currentUser, urlAttractionId]);
    */

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

    //load attraction by its ID
    const loadAttraction = async (id) => {
        if (!id) return;
        setError(null);
        setLoading(true);

        try{
            const response = await axios.get(`/api/attraction/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
              
            /*
            // Get staff in this enclosure
            const animalsResponse = await axios.get(`/api/animals/enclosure/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            */
            setSelectedAttraction(response);
            
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
            setLoading(null);
        }
    };

    // get attraction by ID (event handler)
    const searchAttractiom = async (a) => {
        a.preventDefault();
        if (!search_aID) {
            setError("Enter an enclosure ID.");
            return;
        }
        loadAttraction(search_aID);
    }

    // handle changes in form inputs
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

    // add (for managers)
    const handleToggleAdd = () => {
        setIsAdding(true);
        setIsEditing(false);
        setSelectedEnclosure(null); // Clear any displayed enclosure when adding new one
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
                StaffID: selectedAttraction.data.StaffID || "",
                Location: selectedAttraction.data.Location || "",
                StartTimeStamp: selectedAttraction.data.StartTimeStamp || "",
                EndTimeStamp: selectedAttraction.data.EndTimeStamp || "",
                Title: selectedAttraction.data.Title || "",
                Description: selectedAttraction.data.Description || "",
                Picture: selectedAttraction.data.Picture || "",
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

            // update the local state with new data
            setSelectedAttraction({
                ...selectedAttraction,
                ...formData
            });

            setIsEditing(false);
            alert("Attraction updated successfully");

            // refresh attraction list for managers
            if (currentUser && currentUser.staffRole === "Manager") {
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

            // new enclosure object using new returned AttractionID
            const newAttraction = {
                ...formData,
                AttractionID: response.data.AttractionID,
                Staff: [] // initialize with empty staff array
            };

            setSelectedAttraction(newAttraction); // set the new attraction as the current one
            setIsAdding(false); // exit add mode
            alert("Attraction added successfully");

            // refresh attraction list for managers
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

    // delete attraction (manager only)
    const handleDelete = async () => {
        if(!selectedAttraction) return;
        if(!window.confirm("Are you sure you want to delete this enclosure? This action cannot be undone."))
            return;

        try {
            await axios.delete(`/api/attractions/${selectedAttraction.AttractionID}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            setSelectedAttraction(null); // Clear the current enclosure from state
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
                {currentUser?.staffType === 'Zookeeper' ? (
                    // Zookeeper interface
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Mukta_Mahee']">
                            Select Your Assigned Attraction:
                        </label>
                        <select className="border border-gray-300 p-2 rounded w-full md:w-64 font-['Mukta_Mahee']"
                            value={selectedEnclosure?.EnclosureID || ""}
                            onChange={handleAttractionSelect}
                        >
                            <option  value=""> Select an attraction</option>
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
                    // manager or vet interface - Search by ID
                    <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <form onSubmit={searchAttractiom} className="flex items-center">
                                <input 
                                    type="text"
                                    placeholder="Enter Enclosure ID"
                                    value={search_aID}
                                    onChange={(a) => setSearchAID(e.target.value)}
                                    className="border border-gray-300 p-2 rounded mr-2 font-['Mukta_Mahee']"
                                />
                                <button type="submit" className="bg-green-600 text-white p-2 rounded font-['Mukta_Mahee']">
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AttractionDetails;