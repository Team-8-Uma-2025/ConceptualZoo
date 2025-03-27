import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AttractionDetails = () => {
    const {id: urlAttractionId} = useParams();

    /*States*/
    const {currentUser} = useAuth(); // user from authContext
    const [search_aID, setAttractionId] = useState(''); // search variable
    const [attractionList, setAttractionList] = useState([]); //preload attractions for manager functions
    const [assignedAttractions, setAssignedAttractions] = useState([]); // for regular staff
    const [selectedAttraction, setSelectedAttraction] = useState(null); //fetch enclosure details
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 

    // For managers when editing or adding
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        AttractionID: "",
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
                AttractionID: response.data.AttractionID || "",
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

    // Cancel add/edit mode
    const handleCancel = () => {
        setIsEditing(false);
        setIsAdding(false);
    };



    return (
        <div>
            <h1>Attractions Details</h1>
        </div>
    );
};
export default AttractionDetails;