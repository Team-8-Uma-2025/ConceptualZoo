// src/pages/Animals.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link

const Animals = () => {
  // Define the enclosure types you want to fetch.
  const types = ["Mammal", "Avian", "Reptile", "Amphibian", "Aquatic"]; // adjust as needed

  // State to store enclosures grouped by type.
  const [groupedEnclosures, setGroupedEnclosures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch enclosures for a given type using your API route.
    const fetchEnclosuresByType = async (type) => {
      try {
        const response = await fetch(`http://localhost:5000/api/enclosures/type/${type}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch enclosures of type ${type}`);
        }
        return await response.json();
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    // Fetch enclosures for all types.
    const fetchAllEnclosures = async () => {
      let groups = {};
      for (const type of types) {
        const data = await fetchEnclosuresByType(type);
        groups[type] = data;
      }
      setGroupedEnclosures(groups);
      setLoading(false);
    };

    fetchAllEnclosures();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.webp" 
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
        
        {types.map((type, idx) => (
          <div key={idx} className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 font-['Roboto_Flex']">{type}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {groupedEnclosures[type] && groupedEnclosures[type].length > 0 ? (
                groupedEnclosures[type].map((enclosure) => (
                  <div 
                    key={enclosure.EnclosureID} 
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
                  >
                    <img
                      src={enclosure.ImageURL} // Should be a valid URL
                      alt={enclosure.Name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">
                        {enclosure.Name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {enclosure.Description}
                      </p>
                      <Link
                        to={`/enclosures/${enclosure.EnclosureID}`}
                        className="inline-block bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 font-['Mukta_Mahee']"
                      >
                        Animals
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div>No enclosures available for {type}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Animals;