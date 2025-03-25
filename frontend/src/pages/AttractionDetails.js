import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AttractionDetails = () => {
    /*States*/
    const {currentUser} = useAuth(); // user from authContext
    const [search_aID, setAttractionId] = useState(''); // search variable
    const [attractionList, setAttractionList] = useState([]); //preload attractions for manager functions
    const [selectedAttraction, setSelectedAttraction] = useState(null); //fetch enclosure details

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 

    // For managers when editing or adding
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({

    });

    // handle changes in form inputs
    const handleChange = (a) => {
        setFormData({
            ...formData,
            [a.target.name]: a.target.value
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
    };



    return (
        <div>
            <h1>Attractions Details</h1>
        </div>
    );
};
export default AttractionDetails;