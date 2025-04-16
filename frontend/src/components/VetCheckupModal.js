// Modified VetCheckupModal.js to create cleaner records
import React, { useState } from 'react';
import { X, Stethoscope, Calendar } from 'lucide-react';
import axios from 'axios';

const VetCheckupModal = ({ animal, isOpen, onClose, refreshAnimals }) => {
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [healthStatus, setHealthStatus] = useState(animal.HealthStatus);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handlePerformCheckup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const formattedDate = new Date().toLocaleDateString();

        try {
            // Step 1: Update the animal's health status and last checkup date
            const updateResponse = await axios.put(`/api/animals/${animal.AnimalID}`, {
                LastVetCheckup: today,
                HealthStatus: healthStatus
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

            // Step 2: Create a structured observation for the checkup
            // Format the content as clean text without markdown formatting
            const checkupContent = `
Diagnosis: ${diagnosis || 'None provided'}
Treatment: ${treatment || 'None provided'}

Notes:
${notes || 'No additional notes.'}
      `.trim();

            await axios.post('/api/observations', {
                animalId: animal.AnimalID,
                title: `[VET CHECKUP] ${formattedDate}`,
                content: checkupContent
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

            refreshAnimals();
            onClose();
        } catch (err) {
            console.error('Error performing checkup:', err);
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-['Mukta_Mahee'] flex items-center">
                        <Stethoscope size={24} className="mr-2 text-blue-600" />
                        Veterinary Checkup
                    </h2>
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
                    <div className="flex items-center text-gray-700 mb-2 font-['Lora']">
                        <Calendar size={18} className="mr-2 text-blue-600" />
                        Last Checkup: <span className="ml-2 font-medium">{new Date(animal.LastVetCheckup).toLocaleDateString()}</span>
                    </div>

                    <p className="text-gray-700 mb-4 font-['Lora']">
                        Animal: <span className="font-medium">{animal.Name}</span> ({animal.Species})
                    </p>
                </div>

                <form onSubmit={handlePerformCheckup}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-['Mukta_Mahee'] mb-2">Health Status:</label>
                        <select
                            value={healthStatus}
                            onChange={(e) => setHealthStatus(e.target.value)}
                            className="w-full border rounded-lg p-2"
                        >
                            <option value="Healthy">Healthy</option>
                            <option value="Sick">Sick</option>
                            <option value="Recovering">Recovering</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-['Mukta_Mahee'] mb-2">Diagnosis:</label>
                        <input
                            type="text"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="e.g., Respiratory infection, Minor injury, etc."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-['Mukta_Mahee'] mb-2">Treatment:</label>
                        <input
                            type="text"
                            value={treatment}
                            onChange={(e) => setTreatment(e.target.value)}
                            className="w-full border rounded-lg p-2"
                            placeholder="e.g., Antibiotics, Wound cleaning, etc."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-['Mukta_Mahee'] mb-2">Additional Notes:</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border rounded-lg p-2 min-h-[100px]"
                            placeholder="Enter detailed observations and recommendations..."
                        />
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Complete Checkup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VetCheckupModal;