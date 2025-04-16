// src/components/HealthStatusModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

const HealthStatusModal = ({ animal, isOpen, onClose, refreshAnimals }) => {
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (animal) {
      setNewStatus(animal.HealthStatus);
      setError(null);
    }
  }, [animal]);

  if (!isOpen || !animal) return null;

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.put(
        `/api/animals/${animal.AnimalID}`,
        { HealthStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          validateStatus: () => true,
        }
      );
  
      if (response.status >= 200 && response.status < 300) {
        refreshAnimals();
        onClose();
      } else {
        setError(response.data?.error || response.data?.message || 'Failed to update.');
      }
    } catch (err) {
      console.error('Full error object:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-['Mukta_Mahee']">Update Health Status</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-700 mb-2 font-['Lora']">
            Current Health Status:
            <span
              className={`ml-2 font-medium ${
                animal.HealthStatus === 'Healthy'
                  ? 'text-green-600'
                  : animal.HealthStatus === 'Sick'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {animal.HealthStatus}
            </span>
          </p>

          <p className="text-gray-700 mb-4 font-['Lora']">
            Animal: <span className="font-medium">{animal.Name}</span> ({animal.Species})
          </p>
        </div>

        <form onSubmit={handleUpdateStatus}>
          <div className="mb-4">
            <label className="block text-gray-700 font-['Mukta_Mahee'] mb-2">Set New Status:</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="healthStatus"
                  value="Healthy"
                  checked={newStatus === 'Healthy'}
                  onChange={() => setNewStatus('Healthy')}
                  className="mr-2"
                />
                <CheckCircle size={18} className="text-green-500 mr-2" />
                <span>Healthy</span>
              </label>

              <label className="flex items-center border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="healthStatus"
                  value="Sick"
                  checked={newStatus === 'Sick'}
                  onChange={() => setNewStatus('Sick')}
                  className="mr-2"
                />
                <AlertTriangle size={18} className="text-red-500 mr-2" />
                <span>Sick</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
              disabled={loading || newStatus === animal.HealthStatus}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthStatusModal;