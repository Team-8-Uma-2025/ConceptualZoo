// src/pages/VisitorAnimalView.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VisitorAnimalView = () => {
  const { id } = useParams(); // Get the enclosure ID from the URL
  const [enclosure, setEnclosure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnclosure = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/enclosures/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch enclosure');
        }
        const data = await response.json();
        setEnclosure(data);
      } catch (error) {
        console.error('Error fetching enclosure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnclosure();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!enclosure) {
    return <div>Enclosure not found.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header / Banner */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.webp" 
          alt="Enclosure Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">
            {enclosure.Name}
          </h1>
        </div>
      </div>

      {/* Enclosure Details & Animal List */}
      <div className="container mx-auto py-12 px-4">
        {enclosure.Description && (
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12 text-center font-['Lora']">
            {enclosure.Description}
          </p>
        )}

        {enclosure.Animals && enclosure.Animals.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {enclosure.Animals.map((animal) => (
              <div 
                key={animal.AnimalID} 
                className="bg-white rounded-lg my-4 overflow-hidden shadow-md hover:shadow-xl transition duration-300"
              >
                <img
                  src={animal.Image}
                  alt={animal.Name}
                  className="w-full h-70 object-cover"
                />
                <div className="p-3">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">
                    {animal.Name}
                  </h3>
                  <p className="text-gray-600 mb-4 font-['Lora']">
                    {animal.Species}<br />
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            No animals found in this enclosure.
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorAnimalView;