import React, { useState, useEffect } from 'react';
import { ClipboardList, Activity, HeartPulse } from 'lucide-react';
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

  // Check user permissions
  const isAdmin = currentUser?.staffType === 'Admin';
  const isManager = currentUser?.staffRole === 'Manager';
  const isZookeeper = currentUser?.staffType === 'Zookeeper';
  const isVet = currentUser?.staffType === 'Vet';
  
  // Only managers and admins can edit
  const canEdit = isAdmin || (isZookeeper && isManager);
  
  // Check if user can update health status (zookeepers and vets)
  const canUpdateHealth = isZookeeper || isVet;
  
  // Check if user can perform checkups (only vets)
  const canPerformCheckup = isVet;

  // Auto-open the observations modal if requested
  useEffect(() => {
    if (autoOpenObservations) {
      setIsModalOpen(true);
    }
  }, [autoOpenObservations]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);
  
  const openHealthModal = () => setIsHealthModalOpen(true);
  const closeHealthModal = () => setIsHealthModalOpen(false);
  
  const openCheckupModal = () => setIsCheckupModalOpen(true);
  const closeCheckupModal = () => setIsCheckupModalOpen(false);

  return (
    <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
      {/* Edit button */}
      {canEdit && (
        <button
          onClick={openEditModal}
          className="absolute top-2 right-2 bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-300 text-sm font-['Mukta_Mahee']"
        >
          Edit
        </button>
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
            {/* Checkup button */}
            {canPerformCheckup && (
              <button 
                onClick={openCheckupModal}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center transition duration-300 text-sm font-['Mukta_Mahee']"
              >
                <HeartPulse size={16} className="mr-1" />
                Checkup
              </button>
            )}
            
            {/* Health button */}
            {canUpdateHealth && !canPerformCheckup && (
              <button 
                onClick={openHealthModal}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded flex items-center transition duration-300 text-sm font-['Mukta_Mahee']"
              >
                <Activity size={16} className="mr-1" />
                Health
              </button>
            )}
            
            {/* Observations button */}
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
      
      {/* Modals */}
      <AnimalObservationModal 
        animal={animal}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <EditAnimalModal 
        animal={animal}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        refreshAnimals={refreshAnimals}
      />
      
      {canUpdateHealth && (
        <HealthStatusModal
          animal={animal}
          isOpen={isHealthModalOpen}
          onClose={closeHealthModal}
          refreshAnimals={refreshAnimals}
        />
      )}
      
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