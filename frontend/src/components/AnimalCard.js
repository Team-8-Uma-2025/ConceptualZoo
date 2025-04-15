// src/components/AnimalCard.js
import React, { useState, useEffect } from 'react';
import { ClipboardList, MoreHorizontal, Activity, HeartPulse } from 'lucide-react';
import AnimalObservationModal from './AnimalObservationModal';
import EditAnimalModal from './EditAnimalModal';
import HealthStatusModal from './HealthStatusModal';
import VetCheckupModal from './VetCheckupModal';
import { useAuth } from '../context/AuthContext';

const AnimalCard = ({ animal, refreshAnimals, autoOpenObservations = false }) => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check user permissions
  const isAdmin = currentUser?.staffType === 'Admin';
  const isManager = currentUser?.staffRole === 'Manager';
  const isZookeeper = currentUser?.staffType === 'Zookeeper';
  const isVet = currentUser?.staffType === 'Vet';
  
  // Check if user can edit/delete (only managers and admins)
  const canEditDelete = isAdmin || (isZookeeper && isManager);
  
  // Check if user can update health status (zookeepers and vets)
  const canUpdateHealth = isZookeeper || isVet;
  
  // Check if user can perform checkups (only vets)
  const canPerformCheckup = isVet;

  // Auto-open the observations modal if the autoOpenObservations prop is true
  useEffect(() => {
    if (autoOpenObservations) {
      setIsModalOpen(true);
    }
  }, [autoOpenObservations]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = () => {
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);
  
  const openHealthModal = () => {
    setIsMenuOpen(false);
    setIsHealthModalOpen(true);
  };
  
  const closeHealthModal = () => setIsHealthModalOpen(false);
  
  const openCheckupModal = () => {
    setIsMenuOpen(false);
    setIsCheckupModalOpen(true);
  };
  
  const closeCheckupModal = () => setIsCheckupModalOpen(false);

  const handleDelete = async () => {
    setIsMenuOpen(false);
    if (window.confirm('Are you sure you want to delete this animal?')) {
      try {
        const response = await fetch(`/api/animals/${animal.AnimalID}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          alert('Animal deleted successfully');
          refreshAnimals(); // Refresh the list of animals after deletion
        } else {
          alert(data.error || 'Error deleting animal');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting animal');
      }
    }
  };

  return (
    <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
      {/* Dropdown trigger - only show if the user can perform any actions */}
      {(canEditDelete || canUpdateHealth || canPerformCheckup) && (
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 p-1"
        >
          <MoreHorizontal size={20} />
        </button>
      )}
      
      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-8 right-2 bg-white border rounded shadow-md z-10">
          {/* Edit and Delete options are only available to managers and admins */}
          {canEditDelete && (
            <>
              <button onClick={openEditModal} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Edit
              </button>
              <button onClick={handleDelete} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Delete
              </button>
            </>
          )}
          
          {/* Health Status update option for zookeepers and vets */}
          {canUpdateHealth && (
            <button onClick={openHealthModal} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
              Update Health Status
            </button>
          )}
          
          {/* Checkup option only for vets */}
          {canPerformCheckup && (
            <button onClick={openCheckupModal} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
              Perform Checkup
            </button>
          )}
        </div>
      )}
      
      {/* Animal Details */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">{animal.Name}</h3>
        <div className="mb-3">
          <span className="text-sm bg-gray-100 rounded-full px-3 py-1 text-gray-700 mr-2">
            {animal.Species}
          </span>
          <span className={`text-sm rounded-full px-3 py-1 mr-2 ${
            animal.HealthStatus === 'Healthy' 
              ? 'bg-green-100 text-green-800' 
              : animal.HealthStatus === 'Sick'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {animal.HealthStatus}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3 font-['Lora']">
          <div>Gender: {animal.Gender}</div>
          <div>ID: {animal.AnimalID}</div>
        </div>
        
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500 font-['Lora']">
            Last Checkup: {new Date(animal.LastVetCheckup).toLocaleDateString()}
          </span>
          <div className="flex space-x-2">
            {/* Show checkup button for vets directly in the card for quick access */}
            {canPerformCheckup && (
              <button 
                onClick={openCheckupModal}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center transition duration-300 text-sm font-['Mukta_Mahee']"
              >
                <HeartPulse size={16} className="mr-1" />
                Checkup
              </button>
            )}
            
            {/* Health status button for zookeepers directly in the card */}
            {canUpdateHealth && !canPerformCheckup && (
              <button 
                onClick={openHealthModal}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded flex items-center transition duration-300 text-sm font-['Mukta_Mahee']"
              >
                <Activity size={16} className="mr-1" />
                Health
              </button>
            )}
            
            {/* Observations button for all staff */}
            <button 
              onClick={openModal}
              className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center transition duration-300 text-sm font-['Mukta_Mahee']"
            >
              <ClipboardList size={16} className="mr-1" />
              Observations
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal for animal observations */}
      <AnimalObservationModal 
        animal={animal}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Modal for editing the animal */}
      <EditAnimalModal 
        animal={animal}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        refreshAnimals={refreshAnimals}
      />
      
      {/* Modal for updating health status */}
      {canUpdateHealth && (
        <HealthStatusModal
          animal={animal}
          isOpen={isHealthModalOpen}
          onClose={closeHealthModal}
          refreshAnimals={refreshAnimals}
        />
      )}
      
      {/* Modal for performing checkups */}
      {canPerformCheckup && (
        <VetCheckupModal
          animal={animal}
          isOpen={isCheckupModalOpen}
          onClose={closeCheckupModal}
          refreshAnimals={refreshAnimals}
        />
      )}
    </div>
  );
};

export default AnimalCard;