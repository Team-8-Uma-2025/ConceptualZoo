// src/components/AnimalObservationModal.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { X, CheckCircle, Clock } from 'lucide-react';

const AnimalObservationModal = ({ animal, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newObservation, setNewObservation] = useState({ title: '', content: '' });

  // Check permissions based on user role
  const canAddObservations = currentUser?.role === 'staff' &&
    (currentUser?.staffType === 'Zookeeper' || currentUser?.staffRole === 'Manager');

  const canAcknowledgeObservations = currentUser?.role === 'staff' &&
    currentUser?.staffType === 'Vet';


    const fetchObservations = useCallback(async () => {
      if (!animal) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/observations/animal/${animal.AnimalID}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setObservations(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch observations:', err);
        setError('Failed to load observations. Please try again.');
      } finally {
        setLoading(false);
      }
    }, [animal]);

    useEffect(() => {
      if (isOpen && animal) {
        fetchObservations();
      }
    }, [isOpen, animal, fetchObservations]);

  const handleAddObservation = async (e) => {
    e.preventDefault();
    if (!newObservation.title.trim() || !newObservation.content.trim()) {
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/observations', {
        animalId: animal.AnimalID,
        title: newObservation.title,
        content: newObservation.content
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Clear form and refresh observations
      setNewObservation({ title: '', content: '' });
      fetchObservations();
    } catch (err) {
      console.error('Failed to add observation:', err);
      setError('Failed to add observation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (observationId) => {
    try {
      setLoading(true);
      await axios.put(`/api/observations/${observationId}/acknowledge`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Refresh observations
      fetchObservations();
    } catch (err) {
      console.error('Failed to acknowledge observation:', err);
      setError('Failed to acknowledge observation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-green-700 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold font-['Mukta_Mahee']">
            Animal Observations: {animal?.Name}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-green-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Animal Info Section */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 font-['Lora']">Species</p>
              <p className="font-medium font-['Mukta_Mahee']">{animal?.Species}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-['Lora']">Health Status</p>
              <p className={`font-medium font-['Mukta_Mahee'] ${animal?.HealthStatus === 'Healthy' ? 'text-green-600' :
                  animal?.HealthStatus === 'Sick' ? 'text-red-600' : 'text-gray-600'
                }`}>
                {animal?.HealthStatus}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-['Lora']">Last Checkup</p>
              <p className="font-medium font-['Mukta_Mahee']">
                {animal?.LastVetCheckup ? new Date(animal.LastVetCheckup).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Observations List */}
        <div className="flex-grow overflow-y-auto px-6 py-4">
          {loading && observations.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : observations.length === 0 ? (
            <p className="text-center text-gray-500 py-8 font-['Lora']">No observations have been recorded for this animal yet.</p>
          ) : (
            <div className="space-y-4">
              {observations.map((observation) => (
                <div
                  key={observation.ObservationID}
                  className={`border rounded-lg p-4 ${observation.Acknowledged ? 'bg-gray-50' : 'bg-white border-green-200'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg font-['Mukta_Mahee']">{observation.Title}</h3>
                      <p className="text-sm text-gray-500 font-['Lora']">
                        By {observation.StaffName} • {new Date(observation.Timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      {observation.Acknowledged ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle size={16} className="mr-1" />
                          <span>Acknowledged</span>
                        </div>
                      ) : canAcknowledgeObservations ? (
                        <button
                          onClick={() => handleAcknowledge(observation.ObservationID)}
                          className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Acknowledge
                        </button>
                      ) : (
                        <div className="flex items-center text-amber-600 text-sm">
                          <Clock size={16} className="mr-1" />
                          <span>Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 font-['Lora'] text-gray-700">
                    {observation.Content}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 italic">
                    {observation.Acknowledged
                      ? `Acknowledged by ${observation.AcknowledgedByName} on ${new Date(observation.AcknowledgedAt).toLocaleString()}`
                      : "Not yet acknowledged"
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Observation Form - Only for Zookeepers and Managers */}
        {canAddObservations && (
          <div className="border-t p-4">
            <form onSubmit={handleAddObservation}>
              <div className="mb-3">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Observation Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newObservation.title}
                  onChange={(e) => setNewObservation({ ...newObservation, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Observation Details
                </label>
                <textarea
                  id="content"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newObservation.content}
                  onChange={(e) => setNewObservation({ ...newObservation, content: e.target.value })}
                  placeholder="Describe what you observed..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Add Observation'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalObservationModal;