// src/components/AnimalCard.js
import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import AnimalObservationModal from './AnimalObservationModal';

const AnimalCard = ({ animal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
      {/* Animal Image
      <div className="h-48 bg-gray-200">
        <img 
          src={animal.image || `https://placehold.co/400x300/222222/EEEEEE?text=${animal.Name}`} 
          alt={animal.Name} 
          className="w-full h-full object-cover"
        />
      </div> */}
      
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
    </div>
  );
};

export default AnimalCard;