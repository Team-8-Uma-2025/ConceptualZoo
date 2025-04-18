import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [enclosures, setEnclosures] = useState([]);

  useEffect(() => {
    // Fetch available enclosures
    const fetchEnclosures = async () => {
      try {
        const res = await axios.get('/api/enclosures', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEnclosures(res.data);
      } catch (err) {
        console.error('Failed to load enclosures:', err);
      }
    };

    if (isOpen) {
      fetchEnclosures();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        DateOfBirth: formData.DateOfBirth?.split('T')[0],
        LastVetCheckup: formData.LastVetCheckup?.split('T')[0],
      };

      const response = await axios.put(
        `/api/animals/${animal.AnimalID}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        alert('Animal updated successfully');
        refreshAnimals?.();
        onClose();
      } else {
        alert(response.data?.error || response.data?.message || 'Error updating animal');
      }
    } catch (err) {
      console.error('Error updating animal:', err);
      alert(err.response?.data?.error || 'Error updating animal');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Edit Animal</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
            />
          </div>

          {/* Species disabled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
            <input
              type="text"
              name="Species"
              value={formData.Species}
              disabled
              className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-600 shadow-sm p-2"
            />
          </div>

          {/* Date of Birth disabled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="DateOfBirth"
              value={formData.DateOfBirth?.split('T')[0] || ''}
              disabled
              className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-600 shadow-sm p-2"
            />
          </div>

          {/* Gender disabled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <input
              type="text"
              name="Gender"
              value={formData.Gender}
              disabled
              className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-600 shadow-sm p-2"
            />
          </div>

          {/* Last Vet Checkup disabled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Vet Checkup</label>
            <input
              type="date"
              name="LastVetCheckup"
              value={formData.LastVetCheckup?.split('T')[0] || ''}
              disabled
              className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-600 shadow-sm p-2"
            />
          </div>

          {/* Enclosure dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enclosure</label>
            <select
              name="EnclosureID"
              value={formData.EnclosureID}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
            >
              {enclosures.map(enc => (
                <option key={enc.EnclosureID} value={enc.EnclosureID}>
                  {enc.Name}
                </option>
              ))}
            </select>
          </div>

          {/* Health Status disabled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
            <select
              name="HealthStatus"
              value={formData.HealthStatus}
              disabled
              className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-600 shadow-sm p-2"
            >
              <option value="Healthy">Healthy</option>
              <option value="Sick">Sick</option>
              <option value="Dead">Dead</option>
            </select>
          </div>

          {/* Danger Level editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danger Level</label>
            <select
              name="DangerLevel"
              value={formData.DangerLevel}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none p-2"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Actions */}
          <div className="col-span-full flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnimalModal;