// src/pages/Attractions.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const Attractions = () => {
  // states
  const [attractions, setAttractions] = useState([]); // store and set attraction state
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // fetch attractions when page loads
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const resposne = await axios.get(`/api/attractions`); // public route
        setAttractions(resposne.data) // store reponse in state

      } catch (err) {
        console.error("Error getting attractions", err);
        setError(" Unable to load Attraction");

      } finally {
        setLoading(false);
      }
    }
    
    fetchAttractions();

  }, [] );
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.png" 
          alt="Attractions Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">Attractions & Experiences</h1>
        </div>
      </div>

      {/* Attractions List */}
      <div className="container mx-auto py-12 px-4">
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12 text-center font-['Lora']">
          Make the most of your visit with our exciting attractions and immersive experiences. Create unforgettable memories as you explore everything Wild Wood has to offer.
        </p>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-center font-semibold font-['Mukta_Mahee'] mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction) => (
            <div 
              key={attraction.AttractionID} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
            >
              <img 
                src={attraction.Picture} 
                alt={attraction.Title} 
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">
                  {attraction.Title}
                </h3>

                <p className="text-gray-600 mb-4 font-['Lora']">
                  {attraction.Description}
                </p>
                <div className="text-sm text-gray-500 mb-4 font-['Mukta_Mahee'] italic">
                  Location: {attraction.Location}
                </div>
              </div>
            </div>
          ))}; 
        </div>
      </div>
    </div>
  );
};

export default Attractions;