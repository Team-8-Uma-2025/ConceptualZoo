// src/components/EditAnimalModal.js
import React, { useState } from 'react';

const EditAnimalModal = ({ animal, isOpen, onClose, refreshAnimals }) => {
  const [formData, setFormData] = useState({
    Name: animal.Name,
    Species: animal.Species,
    DateOfBirth: animal.DateOfBirth,
    Gender: animal.Gender,
    HealthStatus: animal.HealthStatus,
    LastVetCheckup: animal.LastVetCheckup,
    EnclosureID: animal.EnclosureID,
    DangerLevel: animal.DangerLevel,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/animals/${animal.AnimalID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Animal updated successfully');
        refreshAnimals(); // Refresh the list to reflect changes
        onClose();
      } else {
        alert(data.error || 'Error updating animal');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating animal');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 bg-black bg-opacity-50 overflow-y-auto pt-20">
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 max-h-[80vh] overflow-y-auto mb-20">
          <h2 className="text-2xl mb-4">Edit Animal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Name</label>
              <input 
                type="text" 
                name="Name" 
                value={formData.Name} 
                onChange={handleChange}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Species</label>
              <input 
                type="text" 
                name="Species" 
                value={formData.Species} 
                onChange={handleChange}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Date of Birth</label>
              <input 
                type="date" 
                name="DateOfBirth" 
                value={formData.DateOfBirth.split('T')[0]} 
                onChange={handleChange}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Gender</label>
              <input 
                type="text" 
                name="Gender" 
                value={formData.Gender} 
                onChange={handleChange}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Health Status</label>
              <select 
                name="HealthStatus" 
                value={formData.HealthStatus} 
                onChange={handleChange} 
                className="w-full border p-2"
              >
                <option value="Healthy">Healthy</option>
                <option value="Sick">Sick</option>
                <option value="Dead">Dead</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Last Vet Checkup</label>
              <input 
                type="date" 
                name="LastVetCheckup" 
                value={formData.LastVetCheckup.split('T')[0]} 
                onChange={handleChange}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Enclosure ID</label>
              <input 
                type="number" 
                name="EnclosureID" 
                value={formData.EnclosureID} 
                onChange={handleChange}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Danger Level</label>
              <select 
                name="DangerLevel" 
                value={formData.DangerLevel} 
                onChange={handleChange} 
                className="w-full border p-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAnimalModal;