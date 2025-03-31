// src/pages/Animals.js
import React, { useState, useEffect } from 'react';

const Animals = () => {
  const [groupedEnclosures, setGroupedEnclosures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all enclosures from the API
    const fetchEnclosures = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/enclosures');
        if (!response.ok) {
          throw new Error('Failed to fetch enclosures');
        }
        const enclosures = await response.json();
        // Group enclosures by their Type
        const groups = enclosures.reduce((acc, enclosure) => {
          const type = enclosure.Type || 'Unknown';
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(enclosure);
          return acc;
        }, {});
        setGroupedEnclosures(groups);
      } catch (error) {
        console.error('Error fetching enclosures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnclosures();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.png" 
          alt="Enclosures Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">Our Enclosures</h1>
        </div>
      </div>

      {/* Enclosure Categories */}
      <div className="container mx-auto py-12 px-4">
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12 text-center font-['Lora']">
          Discover the diverse collection of enclosures at Wild Wood Zoo.
        </p>
        
        {Object.keys(groupedEnclosures).map((type, idx) => (
          <div key={idx} className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 font-['Roboto_Flex']">{type}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {groupedEnclosures[type].map((enclosure) => (
                <div 
                  key={enclosure.EnclosureID} 
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
                >
                  {/* Using placeholder images for now */}
                  <img
                    src={enclosure.ImageURL}
                    alt={enclosure.Name}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">
                      {enclosure.Name}
                    </h3>
                    {/* Removed description text and Learn More button */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Animals;