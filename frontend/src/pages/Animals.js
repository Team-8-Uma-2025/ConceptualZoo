// src/pages/Animals.js
import React from 'react';
import { Link } from 'react-router';

const Animals = () => {
  const animalCategories = [
    { 
      id: 1, 
      name: 'Mammals', 
      animals: [
        { id: 1, name: 'Lions', image: 'https://placehold.co/400x300/222222/EEEEEE' },
        { id: 2, name: 'Gorillas', image: 'https://placehold.co/400x300/222222/EEEEEE' },
        { id: 3, name: 'Elephants', image: 'https://placehold.co/400x300/222222/EEEEEE' }
      ] 
    },
    { 
      id: 2, 
      name: 'Birds', 
      animals: [
        { id: 4, name: 'Eagles', image: 'https://placehold.co/400x300/222222/EEEEEE' },
        { id: 5, name: 'Penguins', image: 'https://placehold.co/400x300/222222/EEEEEE' },
        { id: 6, name: 'Flamingos', image: 'https://placehold.co/400x300/222222/EEEEEE' }
      ] 
    },
    { 
      id: 3, 
      name: 'Reptiles', 
      animals: [
        { id: 7, name: 'Crocodiles', image: 'https://placehold.co/400x300/222222/EEEEEE' },
        { id: 8, name: 'Snakes', image: 'https://placehold.co/400x300/222222/EEEEEE' },
        { id: 9, name: 'Turtles', image: 'https://placehold.co/400x300/222222/EEEEEE' }
      ] 
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.png" 
          alt="Animals Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">Our Animals</h1>
        </div>
      </div>

      {/* Animal Categories */}
      <div className="container mx-auto py-12 px-4">
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12 text-center font-['Lora']">
          Discover the diverse collection of animals at Wild Wood Zoo. From majestic mammals to colorful birds and fascinating reptiles, there's always something new to discover.
        </p>
        
        {animalCategories.map((category) => (
          <div key={category.id} className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 font-['Roboto_Flex']">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {category.animals.map((animal) => (
                <div key={animal.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
                  <img 
                    src={animal.image} 
                    alt={animal.name} 
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">{animal.name}</h3>
                    <p className="text-gray-600 mb-4 font-['Lora']">
                      Learn about our {animal.name.toLowerCase()} and their natural habitats.
                    </p>
                    <Link 
                      to={`/animals/${animal.id}`} 
                      className="inline-block bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 font-['Mukta_Mahee']"
                    >
                      Learn More
                    </Link>
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