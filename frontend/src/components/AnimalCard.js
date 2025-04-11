// src/components/AnimalCard.js
import React, { useState } from 'react';
import { ClipboardList, MoreHorizontal } from 'lucide-react';
import AnimalObservationModal from './AnimalObservationModal';
import EditAnimalModal from './EditAnimalModal';

const AnimalCard = ({ animal, refreshAnimals }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = () => {
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);

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
      {/* Dropdown trigger */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 p-1"
      >
        <MoreHorizontal size={20} />
      </button>
      
      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-8 right-2 bg-white border rounded shadow-md z-10">
          <button onClick={openEditModal} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Edit
          </button>
          <button onClick={handleDelete} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Delete
          </button>
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
          <button 
            onClick={openModal}
            className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center transition duration-300 text-sm font-['Mukta_Mahee']"
          >
            <ClipboardList size={16} className="mr-1" />
            Observations
          </button>
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
    </div>
  );
};

export default AnimalCard;