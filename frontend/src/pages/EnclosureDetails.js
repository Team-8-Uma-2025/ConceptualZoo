import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EnclosureDetails = () =>{
    /*States*/
    const {currentUser} = useAuth(); // user from authContext
    const [search_eID, setEnclosureId] = useState(''); // search variable
    const [enclosureList, setEnclosureList] = useState([]); //preload enclosures for manager functions

    const [selectedEnclosure, setSelectedEnclosure] = useState(null); //fetch enclosure details
    const [loading, setLoading] = useState(false); // change to true if you see behavior change
    const [error, setError] = useState(null); 

    // For managers when editing or adding
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // add and edit form fields (managers)
    const [formData, setFormData] = useState({
        StaffID: '',
        Name: '',
        Type: '',
        Capacity: '',
        Location: ''
    });

    //preload enclosure lists for managers
    useEffect(() => {
       const fetchEnclosure = async () => {
        try{
            const response = await axios.get('/api/enclosures');
            setEnclosureList(response.data);
        } catch(err){
            console.error('Error fetching enclosures list:', err);
        }
       }
       if (currentUser && currentUser.staffRole === 'Manager') {
            fetchEnclosure();
       }

    }, [currentUser]);

    // load enclosure by its ID
    const loadEnclosure = async (id) =>{
        if(!id) return;
        setError(null);
        setLoading(true);

        try{
            const response = await axios.get(`/api/enclosures/${id}`);
            setSelectedEnclosure(response.data);

            // fill data
            setFormData({
                StaffID: response.data.StaffID || '',
                Name: response.data.Name,
                Type: response.data.Type,
                Capacity: response.data.Capacity,
                Location: response.data.Location
            });
            setIsEditing(false);
            setIsAdding(false);
        } catch (err) {
            console.error(err);
            setError('Failed to get enclosure. Enter valid ID')
            setSelectedEnclosure(null);
        } finally{
            setLoading(false);
        }
    };


    // get enclosure by ID (event handler)
    const searchEnclosure = async (e) => {
        e.preventDefault(); // stop page from reloading on submit
        if(!search_eID){
            setError('Enter an enclosure ID.');
            return;
        }

        loadEnclosure(search_eID); 
    };
    
    // handle changes in form inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // add (for managers)
    const handleToggleAdd = () => {
        setIsAdding(true);
        setIsEditing(false);
        setSelectedEnclosure(null); // Clear any displayed enclosure when adding new one
        setFormData({
          StaffID: '',
          Name: '',
          Type: '',
          Capacity: '',
          Location: ''
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

    // Update enclosure (manager only)
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/enclosures/${selectedEnclosure.EnclosureID}`, formData, {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            });

            setSelectedEnclosure({...selectedEnclosure, ...formData});
            setIsEditing(false);
            alert('Enclosure updated');

        } catch(err){
            console.error(err);
            alert('Failed to update enclosure');
        }
    };

    // add enclosure (Manager only)
    const handleAdd = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.post(`/api/enclosures`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
            // Construct a new enclosure object using the returned EnclosureID
            const newEnclosure = { ...formData, EnclosureID: response.data.EnclosureID };
            setSelectedEnclosure(newEnclosure);  // Set the new enclosure as the current one
            setIsAdding(false);          // Exit add mode
            alert('Enclosure added.');
        } catch (err) {
          console.error(err);
          alert('Failed to add enclosure.');
        }
    };
    // Delete enclosure (manager only)
    const handleDelete = async () => {
        if (!selectedEnclosure) return;
        if (!window.confirm('Are you sure you want to delete this enclosure? This action can NOT be reversed')) return;
        try {
            await axios.delete(`/api/enclosures/${selectedEnclosure.EnclosureID}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setSelectedEnclosure(null); // Clear the current enclosure from state
            alert('Enclosure deleted successfully.');
        } catch (err) {
            console.error(err);
            alert('Failed to delete enclosure.');
        }
    };
    
    return (
        /*displays*/
        <div className="bg-gray-100 min-h-screen pt-20">
            <div className="container mx-auto px-4 py-12 font-['Lora']">
                <h1 className="text-3xl font-bold mb-6 font-['Roboto_Flex']">Enclosure Management and Details</h1>
                <p className="text-sm text-gray-800 italic">Search for enclsoure to edit or delete.</p>
                <div className="mb-6 flex items-center space-x-4">
                    <form onSubmit={searchEnclosure}  className="flex items-center">
                        <input type="text" placeholder='Enter Enclosure ID' value= {search_eID} onChange={(e => setEnclosureId(e.target.value))}
                            className="border border-gray-300 p-2 rounded mr-2 font-['Mukta_Mahee']" />
                        <button type="submit" className="bg-green-600 text-white p-2 rounded font-['Mukta_Mahee']">
                            Search
                        </button>
                    </form>
                    
                    {/*Manager only options (Update/Edit, Add enclsoure, Delete enclosure) */}
                    {currentUser && currentUser.staffRole === 'Manager' && (
                        <div lassName="flex space-x-4">
                            <button 
                                type="button"
                                onClick={handleToggleEdit}
                                className="bg-green-700 text-white p-2 rounded font-['Mukta_Mahee']"
                                disabled={!selectedEnclosure}
                            >
                                Edit Enclosure
                            </button>
                            <button 
                                type="button"
                                onClick={handleToggleAdd}
                                className="bg-green-900 text-white p-2 rounded font-['Mukta_Mahee']"
                                
                            >
                                Add Enclosure
                            </button>
                        </div>
                    )}
                </div>

                {loading && <p className="font-['Lora']">Loading...</p>}
                {error && <p className="text-red-500 font-['Lora']">{error}</p>}

                {/*show enclosure and animals in it */}
                {selectedEnclosure && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">Enclosure: {selectedEnclosure.EnclosureID} Details</h2>
                        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-4 font-['Lora']">
                            <thead className="bg-gray-200 font-['Roboto_Flex']">
                                <tr className="border-b">
                                    <th className="py-2 px-4">Name</th>
                                    <th className="py-2 px-4">Enclosure Type</th>
                                    <th className="py-2 px-4">Capacity</th>
                                    <th className="py-2 px-4">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 px-4">{selectedEnclosure.Name}</td>
                                    <td className="py-2 px-4">{selectedEnclosure.Type}</td>
                                    <td className="py-2 px-4">{selectedEnclosure.Capacity}</td>
                                    <td className="py-2 px-4">{selectedEnclosure.Location}</td>
                                </tr>
                            </tbody>
                        </table>
                        {/*animals table based on enclosure*/}
                        <h3 className="text-xl font-semibold mb-2 font-['Roboto_Flex']">Assigned Animals</h3>
                        {selectedEnclosure.Animals && selectedEnclosure.Animals.length > 0 ? (
                            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-4 font-['Lora']">
                                <thead className="bg-gray-200 font-['Roboto_Flex']">
                                    <tr>
                                        <th className="py-2 px-4">Animal ID</th>
                                        <th className="py-2 px-4">Name</th>
                                        <th className="py-2 px-4">Species</th>
                                        <th className="py-2 px-4">Gender</th>
                                        <th className="py-2 px-4">Health</th>
                                        <th className="py-2 px-4">Danger Level</th>
                                    </tr>
                                </thead>
                                <tbody className="font-['Lora']">
                                    {selectedEnclosure.Animals.map((animal) => (
                                        <tr key={animal.AnimalID} className="border-b">
                                            <td className="py-2 px-4">{animal.AnimalID}</td>
                                            <td className="py-2 px-4">{animal.Name}</td>
                                            <td className="py-2 px-4">{animal.Species}</td>
                                            <td className="py-2 px-4">{animal.Gender}</td>
                                            <td className="py-2 px-4">{animal.HealthStatus}</td>
                                            <td className="py-2 px-4">{animal.DangerLevel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="font-['Lora']">No animals are assigned to this enclosure.</p>
                        )}
                    </div>
                )}

                {/*Edit form for manager */}
                {isEditing && currentUser && currentUser.staffRole === 'Manager' && selectedEnclosure && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">Edit Enclosures</h2>
                        <form onSubmit={handleUpdate}>
                            <input 
                                type='text'
                                name='StaffID'
                                placeholder='Staff ID'
                                value={formData.StaffID}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <input 
                                type='text'
                                name='Name'
                                placeholder=' Enclosure Name'
                                value={formData.Name}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <select 
                                name='Type'
                                placeholder='Enclosure Type'
                                onChange={handleChange}
                                value={formData.Type}
                                className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            >
                                <option value="">Select Type</option>
                                <option value="Mammal">Mammal</option>
                                <option value="Avian">Avian</option>
                                <option value="Reptile">Reptile</option>
                                <option value="Amphibian">Amphibian</option>
                                <option value="Aquatic">Aquatic</option>
                            </select>
                            <input 
                                type='number'
                                name='Capacity'
                                placeholder='Capacity'
                                value={formData.Capacity}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <input 
                                type='text'
                                name='Location'
                                placeholder='Location'
                                value={formData.Location}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <div className='flex'>
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded mr-2 font-['Mukta_Mahee']">
                                    Save Changes
                                </button>
                                <button type="button" onClick={handleCancel} className="bg-gray-600 text-white p-2 rounded font-['Mukta_Mahee']">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {isAdding && currentUser && currentUser.staffRole === 'Manager' && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4 font-['Roboto_Flex']">Add New Enclosure</h2>
                        <form onSubmit={handleAdd}>
                            <input 
                                type='text'
                                name='StaffID'
                                placeholder='Staff ID'
                                value={formData.StaffID}
                                onChange={handleChange}
                                 className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <input 
                                type='text'
                                name='Name'
                                placeholder=' Enclosure Name'
                                value={formData.Name}
                                onChange={handleChange}
                                 className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <select name='Type' value={formData.Type} onChange={handleChange} 
                                 className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            >
                                <option value="">Select Type</option>
                                <option value="Mammal">Mammal</option>
                                <option value="Avian">Avian</option>
                                <option value="Reptile">Reptile</option>
                                <option value="Amphibian">Amphibian</option>
                                <option value="Aquatic">Aquatic</option>

                            </select>
                            <input 
                                type='number'
                                name='Capacity'
                                placeholder='Capacity'
                                value={formData.Capacity}
                                onChange={handleChange}
                                 className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <input 
                                type='text'
                                name='Location'
                                placeholder='Location'
                                value={formData.Location}
                                onChange={handleChange}
                                 className="border border-gray-300 p-2 rounded mb-2 block font-['Mukta_Mahee']"
                            />
                            <div className="flex">
                                <button type="submit" className="bg-green-600 text-white p-2 rounded mr-2 font-['Mukta_Mahee']">
                                    Add
                                </button>
                                <button type="button" onClick={handleCancel} className="bg-gray-600 text-white p-2 rounded font-['Mukta_Mahee']">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {currentUser && currentUser.staffRole === "Manager" && (
                    <div className="flex items-center space-x-4">
                        <button 
                            type="button" 
                            onClick={handleDelete}
                             className="bg-red-600 text-white p-2 rounded font-['Mukta_Mahee']" 
                             disabled={!selectedEnclosure}
                        >
                            Delete Enclosure
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
export default EnclosureDetails;