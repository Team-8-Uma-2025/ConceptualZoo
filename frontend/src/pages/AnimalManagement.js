// src/pages/AnimalManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  Search,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
} from 'lucide-react';

const AnimalManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id: urlAnimalId, action } = useParams(); // Get animal ID and action from URL

  // State for animal list and selected animal
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editing/adding
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Species: '',
    DateOfBirth: '',
    Gender: '',
    HealthStatus: '',
    LastVetCheckup: '',
    EnclosureID: '',
    DangerLevel: '',
    Image: ''
  });

  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [filterHealthStatus, setFilterHealthStatus] = useState('All');
  const [filterEnclosureID, setfilterEnclosureID] = useState('All');
  const [filterDangerLevel, setFilterDangerLevel] = useState('All');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [animalsPerPage] = useState(8); // Same as in Dashboard

  // Fetch animals
  const fetchAnimals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/animals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAnimals(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch animals:', err);
      setError('Unable to load animal data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch animal details
  const fetchAnimalDetails = async (animalId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/animals/${animalId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedAnimal(response.data);
      setFormData({
        Name: response.data.Name || '',
        Species: response.data.Species || '',
        DateOfBirth: response.data.DateOfBirth
          ? new Date(response.data.DateOfBirth).toISOString().split('T')[0]
          : '',
        Gender: response.data.Gender || '',
        HealthStatus: response.data.HealthStatus || '',
        LastVetCheckup: response.data.LastVetCheckup
          ? new Date(response.data.LastVetCheckup).toISOString().split('T')[0]
          : '',
        EnclosureID: response.data.EnclosureID || '',
        DangerLevel: response.data.DangerLevel || '',
        Image: response.data.Image || ''
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch animal details:', err);
      setError('Unable to load animal details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check permission (only zoo managers are allowed)
    if (!currentUser || currentUser.role !== 'staff' || currentUser.staffRole !== 'Manager') {
      navigate('/unauthorized');
      return;
    }
    fetchAnimals();
    // If an animal ID is present in URL, fetch its details
    if (urlAnimalId) {
      fetchAnimalDetails(urlAnimalId);
      if (action === 'edit') {
        setIsEditing(true);
      }
    }
  }, [currentUser, fetchAnimals, navigate, urlAnimalId, action]);

  const handleSelectAnimal = (animalId) => {
    if (selectedAnimal && selectedAnimal.AnimalID === animalId) {
      setSelectedAnimal(null);
      setIsEditing(false);
    } else {
      fetchAnimalDetails(animalId);
      setIsEditing(false);
      setIsAdding(false);
    }
  };

  const handleAddAnimal = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedAnimal(null);
    setFormData({
      Name: '',
      Species: '',
      DateOfBirth: '',
      Gender: '',
      HealthStatus: '',
      LastVetCheckup: '',
      EnclosureID: '',
      DangerLevel: '',
      Image: ''
    });
  };

  const handleEditAnimal = () => {
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    if (selectedAnimal) {
      setFormData({
        Name: selectedAnimal.Name || '',
        Species: selectedAnimal.Species || '',
        DateOfBirth: selectedAnimal.DateOfBirth
          ? new Date(selectedAnimal.DateOfBirth).toISOString().split('T')[0]
          : '',
        Gender: selectedAnimal.Gender || '',
        HealthStatus: selectedAnimal.HealthStatus || '',
        LastVetCheckup: selectedAnimal.LastVetCheckup
          ? new Date(selectedAnimal.LastVetCheckup).toISOString().split('T')[0]
          : '',
        EnclosureID: selectedAnimal.EnclosureID || '',
        DangerLevel: selectedAnimal.DangerLevel || '',
        Image: selectedAnimal.Image || ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit edited animal details
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = {
        Name: formData.Name,
        Species: formData.Species,
        DateOfBirth: formData.DateOfBirth,
        Gender: formData.Gender,
        HealthStatus: formData.HealthStatus,
        LastVetCheckup: formData.LastVetCheckup,
        EnclosureID: formData.EnclosureID,
        DangerLevel: formData.DangerLevel,
        Image: formData.Image
      };

      await axios.put(`/api/animals/${selectedAnimal.AnimalID}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAnimals();
      fetchAnimalDetails(selectedAnimal.AnimalID);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update animal:', err);
      setError('Unable to update animal. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Submit a new animal
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newAnimalData = {
        Name: formData.Name,
        Species: formData.Species,
        DateOfBirth: formData.DateOfBirth,
        Gender: formData.Gender,
        HealthStatus: formData.HealthStatus,
        LastVetCheckup: formData.LastVetCheckup,
        EnclosureID: formData.EnclosureID,
        DangerLevel: formData.DangerLevel,
        Image: formData.Image
      };

      await axios.post('/api/animals', newAnimalData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAnimals();
      setIsAdding(false);
      setError(null);
    } catch (err) {
      console.error('Failed to add animal:', err);
      setError('Unable to add animal. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Delete an animal
  const handleDeleteAnimal = async (animalId) => {
    if (!window.confirm('Are you sure you want to delete this animal? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`/api/animals/${animalId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAnimals();
      if (selectedAnimal && selectedAnimal.AnimalID === animalId) {
        setSelectedAnimal(null);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to delete animal:', err);
      setError('Unable to delete animal. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Filtering and Pagination ----------

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch =
      animal.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.Species.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecies = filterSpecies === 'All' || animal.Species === filterSpecies;
    const matchesHealthStatus = filterHealthStatus === 'All' || animal.HealthStatus === filterHealthStatus;
    const matchesEnclosure = filterEnclosureID === 'All' || String(animal.EnclosureID) === filterEnclosureID;
    const matchesDangerLevel = filterDangerLevel === 'All' || animal.DangerLevel === filterDangerLevel;


    return (
      matchesSearch &&
      matchesSpecies &&
      matchesHealthStatus &&
      matchesEnclosure &&
      matchesDangerLevel
    );
  });

  const indexOfLastAnimal = currentPage * animalsPerPage;
  const indexOfFirstAnimal = indexOfLastAnimal - animalsPerPage;
  const totalPages = Math.ceil(filteredAnimals.length / animalsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const currentAnimals = filteredAnimals.slice(indexOfFirstAnimal, indexOfLastAnimal);

  // Extract unique values for filters
  const speciesList = ['All', ...new Set(animals.map(animal => animal.Species))];
  const healthStatusList = ['All', ...new Set(animals.map(animal => animal.HealthStatus))];
  const enclosureList = ['All', ...new Set(animals.map(animal => animal.EnclosureID))];
  const dangerLevelList = ['All', ...new Set(animals.map(animal => animal.DangerLevel))];

  // ---------- UI Rendering ----------
  if (!currentUser || currentUser.role !== 'staff' || currentUser.staffRole !== 'Manager') {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 font-['Lora']">
            Access denied. This page is only for zoo managers.
          </p>
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
            <Users size={28} className="mr-3 text-yellow-700" />
            Animal Management
          </h1>
          <p className="text-gray-600 font-['Lora']">
            Manage zoo animals, species, and health statuses
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Animal List Panel */}
          <div className="md:w-3/4 lg:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="w-full flex justify-between items-center my-4 space-x-2">
                <h2 className="text-xl font-semibold font-['Roboto_Flex']">Animal Directory</h2>
                <button
                  onClick={handleAddAnimal}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Animal
                </button>
              </div>

              {/* Search and Filters */}
              <div className="mb-4">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search animals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterSpecies}
                    onChange={(e) => setFilterSpecies(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {speciesList.map(species => (
                      <option key={species} value={species}>
                        {species === 'All' ? 'All Species' : species}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterHealthStatus}
                    onChange={(e) => setFilterHealthStatus(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {healthStatusList.map(status => (
                      <option key={status} value={status}>
                        {status === 'All' ? 'All Health Statuses' : status}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterEnclosureID}
                    onChange={(e) => setfilterEnclosureID(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {enclosureList.map(enclosure => (
                      <option key={enclosure} value={enclosure}>
                        {enclosure === 'All' ? 'All Enclosures' : enclosure}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterDangerLevel}
                    onChange={(e) => setFilterDangerLevel(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {dangerLevelList.map(level => (
                      <option key={level} value={level}>
                        {level === 'All' ? 'All Danger Levels' : level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Animal List */}
              {loading && !isEditing && !isAdding ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-700"></div>
                </div>
              ) : (
                <div className="border rounded-md divide-y">
                  {filteredAnimals.length === 0 ? (
                    <div className="py-4 px-3 text-center text-gray-500 font-['Lora']">
                      No animals found.
                    </div>
                  ) : (
                    currentAnimals.map(animal => (
                      <div
                        key={animal.AnimalID}
                        className={`py-3 px-3 cursor-pointer hover:bg-gray-50 ${
                          selectedAnimal && selectedAnimal.AnimalID === animal.AnimalID
                            ? 'bg-yellow-50 border-l-4 border-yellow-500'
                            : ''
                        }`}
                        onClick={() => handleSelectAnimal(animal.AnimalID)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-800 font-['Mukta_Mahee']">
                              {animal.Name}
                            </div>
                            <div className="text-sm text-gray-500 font-['Lora']">
                              {animal.Species}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs bg-gray-100 rounded-full px-2 py-1 text-gray-600">
                              ID: {animal.AnimalID}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredAnimals.length > animalsPerPage && (
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
                      className={`px-3 py-1 border rounded ${
                        currentPage === index + 1 ? 'bg-yellow-600 text-white' : ''
                      }`}
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

          {/* Animal Details / Edit Panel */}
          <div className="md:w-1/2 lg:w-3/5">
            {isAdding ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold font-['Roboto_Flex']">Add New Animal</h2>
                  <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmitAdd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Species*</label>
                      <input
                        type="text"
                        name="Species"
                        value={formData.Species}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                      <input
                        type="date"
                        name="DateOfBirth"
                        value={formData.DateOfBirth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                      <select
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Health Status*</label>
                      <select
                        type="text"
                        name="HealthStatus"
                        value={formData.HealthStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                       >
                        <option value="">Select</option>
                        <option value="Healthy">Healthy</option>
                        <option value="Sick">Sick</option>
                        <option value="Recovering">Recovering</option>
                        <option value="Dead">Dead</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Vet Checkup*</label>
                      <input
                        type="date"
                        name="LastVetCheckup"
                        value={formData.LastVetCheckup}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enclosure ID*</label>
                      <select
                        type="text"
                        name="EnclosureID"
                        value={formData.EnclosureID}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                      {enclosureList.map(enclosure => (
                      <option key={enclosure} value={enclosure}>
                        {enclosure === '' ? 'Select' : enclosure}
                      </option>
                      ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Danger Level*</label>
                      <select
                        type="text"
                        name="DangerLevel"
                        value={formData.DangerLevel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        name="Image"
                        value={formData.Image}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
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
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 flex items-center"
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
                          Add Animal
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : isEditing && selectedAnimal ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold font-['Roboto_Flex']">Edit Animal</h2>
                  <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmitEdit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                      <input
                        type="text"
                        name="Species"
                        value={formData.Species}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="DateOfBirth"
                        value={formData.DateOfBirth}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                      <select
                        type="text"
                        name="HealthStatus"
                        value={formData.HealthStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled
                       >
                        <option value="">Select</option>
                        <option value="Healthy">Healthy</option>
                        <option value="Sick">Sick</option>
                        <option value="Recovering">Recovering</option>
                        <option value="Dead">Dead</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Vet Checkup</label>
                      <input
                        type="date"
                        name="LastVetCheckup"
                        value={formData.LastVetCheckup}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enclosure ID</label>
                      <select
                        type="text"
                        name="EnclosureID"
                        value={formData.EnclosureID}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                      {enclosureList.map(enclosure => (
                      <option key={enclosure} value={enclosure}>
                        {enclosure === '' ? 'Select' : enclosure}
                      </option>
                      ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Danger Level</label>
                      <select
                        type="text"
                        name="DangerLevel"
                        value={formData.DangerLevel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        name="Image"
                        value={formData.Image}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
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
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 flex items-center"
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
            ) : selectedAnimal ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold font-['Roboto_Flex']">Animal Details</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditAnimal}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAnimal(selectedAnimal.AnimalID)}
                      className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Animal ID</p>
                    <p className="font-medium">{selectedAnimal.AnimalID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Name</p>
                    <p className="font-medium">{selectedAnimal.Name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Species</p>
                    <p className="font-medium">{selectedAnimal.Species}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Date of Birth</p>
                    <p className="font-medium">
                      {selectedAnimal.DateOfBirth
                        ? new Date(selectedAnimal.DateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Gender</p>
                    <p className="font-medium">{selectedAnimal.Gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Health Status</p>
                    <p className="font-medium">{selectedAnimal.HealthStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Last Vet Checkup</p>
                    <p className="font-medium">
                      {selectedAnimal.LastVetCheckup
                        ? new Date(selectedAnimal.LastVetCheckup).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Enclosure ID</p>
                    <p className="font-medium">{selectedAnimal.EnclosureID || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-['Lora']">Danger Level</p>
                    <p className="font-medium">{selectedAnimal.DangerLevel || 'N/A'}</p>
                  </div>
                  {selectedAnimal.Image && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 font-['Lora']">Image</p>
                      <img
                        src={selectedAnimal.Image}
                        alt={selectedAnimal.Name}
                        className="mt-2 max-w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <Users size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-['Mukta_Mahee']">Animal Management</h3>
                <p className="text-gray-600 font-['Lora'] mb-6">
                  Select an animal to view details, or add a new animal.
                </p>
                <button
                  onClick={handleAddAnimal}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add New Animal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalManagement;
