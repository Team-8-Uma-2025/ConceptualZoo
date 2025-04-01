// src/pages/Attractions.js
import React from 'react';
import { Link } from 'react-router';

const Attractions = () => {
  const attractions = [
    {
      id: 1,
      name: 'Jungle Trek',
      description: 'Experience a guided walk through our tropical jungle environment with exotic plants and animals.',
      image: 'https://placehold.co/600x400/222222/EEEEEE',
      duration: '45 minutes',
      age: 'All ages'
    },
    {
      id: 2,
      name: 'Feeding Shows',
      description: 'Watch our zookeepers feed various animals and learn about their diets and behaviors.',
      image: 'https://placehold.co/600x400/222222/EEEEEE',
      duration: '30 minutes',
      age: 'All ages'
    },
    {
      id: 3,
      name: 'Safari Train',
      description: 'Take a scenic train ride around the zoo and visit areas not accessible by foot.',
      image: 'https://placehold.co/600x400/222222/EEEEEE',
      duration: '20 minutes',
      age: 'All ages'
    },
    {
      id: 4,
      name: 'Animal Encounters',
      description: 'Get up close with some of our friendliest residents in a supervised environment.',
      image: 'https://placehold.co/600x400/222222/EEEEEE',
      duration: '40 minutes',
      age: '6+'
    },
    {
      id: 5,
      name: 'Nocturnal House',
      description: 'Discover the fascinating world of animals that come alive at night.',
      image: 'https://placehold.co/600x400/222222/EEEEEE',
      duration: 'Self-guided',
      age: 'All ages'
    },
    {
      id: 6,
      name: 'Conservation Center',
      description: 'Learn about our global conservation efforts and how you can help protect wildlife.',
      image: 'https://placehold.co/600x400/222222/EEEEEE',
      duration: 'Self-guided',
      age: 'All ages'
    }
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.webp" 
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction) => (
            <div key={attraction.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
              <img 
                src={attraction.image} 
                alt={attraction.name} 
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">{attraction.name}</h3>
                <p className="text-gray-600 mb-4 font-['Lora']">{attraction.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4 font-['Mukta_Mahee']">
                  <span>⏱️ {attraction.duration}</span>
                  <span>👪 {attraction.age}</span>
                </div>
                <Link 
                  to={`/attractions/${attraction.id}`} 
                  className="inline-block bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 font-['Mukta_Mahee']"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Attractions;