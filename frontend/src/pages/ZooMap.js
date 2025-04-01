// src/pages/ZooMap.js
import React, { useState } from 'react';

const ZooMap = () => {
  const [activeSection, setActiveSection] = useState('all');
  
  const zoneInfo = {
    asia: {
      name: 'Asian Forest',
      animals: ['Bengal Tigers', 'Asian Elephants', 'Red Pandas', 'Komodo Dragons', 'Orangutans'],
      facilities: ['Asian Garden Cafe', 'Bamboo Rest Area', 'Gift Shop'],
      description: 'Explore the diverse habitats of Asia, from dense jungles to bamboo forests. Our Asian Forest zone features some of the most endangered species from the continent.'
    },
    africa: {
      name: 'African Savanna',
      animals: ['Lions', 'Giraffes', 'Zebras', 'Meerkats', 'Rhinos'],
      facilities: ['Safari Grill', 'Vista Point', 'Water Station'],
      description: 'Experience the wide-open plains of Africa with our collection of savanna wildlife. Watch as giraffes graze on tall trees and lions rest in the shade.'
    },
    amazon: {
      name: 'Amazon Rainforest',
      animals: ['Jaguars', 'Anacondas', 'Poison Dart Frogs', 'Sloths', 'Macaws'],
      facilities: ['Rainforest Cafe', 'Misting Stations', 'Conservation Center'],
      description: 'Journey through our recreated rainforest environment featuring multiple levels of canopy. The humid, lush setting is home to hundreds of species of plants and animals.'
    },
    arctic: {
      name: 'Arctic Circle',
      animals: ['Polar Bears', 'Arctic Foxes', 'Snowy Owls', 'Beluga Whales'],
      facilities: ['Glacier Treats', 'Indoor Viewing Areas', 'Education Center'],
      description: 'Our climate-controlled Arctic Circle zone allows you to observe cold-weather species year-round, even in the summer heat.'
    },
    australia: {
      name: 'Australian Outback',
      animals: ['Kangaroos', 'Koalas', 'Emus', 'Tasmanian Devils', 'Wombats'],
      facilities: ['Aussie BBQ', 'Walkabout Path', 'Shade Structures'],
      description: 'Walk among free-roaming kangaroos and wallabies in our Australian Outback zone. See nocturnal marsupials in our specialized habitat facilities.'
    }
  };
  
  const facilities = [
    { id: 'restrooms', name: 'Restrooms', icon: '🚻', locations: 6 },
    { id: 'food', name: 'Food & Drink', icon: '🍔', locations: 8 },
    { id: 'gifts', name: 'Gift Shops', icon: '🛍️', locations: 4 },
    { id: 'firstaid', name: 'First Aid', icon: '🩹', locations: 2 }
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.webp" 
          alt="Zoo Map Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">Zoo Map</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4">
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 font-['Roboto_Flex']">Interactive Map</h2>
          
          {/* Zone Selection Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              className={`px-4 py-2 rounded-md font-medium transition-colors font-['Mukta_Mahee'] ${activeSection === 'all' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveSection('all')}
            >
              All Zones
            </button>
            {Object.keys(zoneInfo).map((zone) => (
              <button 
                key={zone}
                className={`px-4 py-2 rounded-md font-medium transition-colors font-['Mukta_Mahee'] ${activeSection === zone ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveSection(zone)}
              >
                {zoneInfo[zone].name}
              </button>
            ))}
          </div>
          
          {/* Map Display Area */}
          <div className="w-full h-96 bg-gray-200 rounded-lg mb-6 relative overflow-hidden">
            {/* This would be an actual interactive map in a real implementation */}
            <img 
              src={`https://placehold.co/1200x600/222222/FFFFFF?text=Zoo+Map+-+${activeSection === 'all' ? 'Full Zoo' : zoneInfo[activeSection].name}`} 
              alt="Zoo Map" 
              className="w-full h-full object-cover"
            />
            
            {/* Map Controls Overlay */}
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md">
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-100 rounded-md">
                  <span>➕</span>
                </button>
                <button className="p-2 bg-gray-100 rounded-md">
                  <span>➖</span>
                </button>
                <button className="p-2 bg-gray-100 rounded-md">
                  <span>🔄</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Zone Information */}
          {activeSection !== 'all' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-2xl font-bold mb-3 text-gray-800 font-['Roboto_Flex']">{zoneInfo[activeSection].name}</h3>
              <p className="text-gray-600 mb-4 font-['Lora']">{zoneInfo[activeSection].description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-700 font-['Mukta_Mahee']">Animals to See</h4>
                  <ul className="list-disc pl-5 space-y-1 font-['Lora']">
                    {zoneInfo[activeSection].animals.map((animal, idx) => (
                      <li key={idx} className="text-gray-600">{animal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-700 font-['Mukta_Mahee']">Facilities</h4>
                  <ul className="list-disc pl-5 space-y-1 font-['Lora']">
                    {zoneInfo[activeSection].facilities.map((facility, idx) => (
                      <li key={idx} className="text-gray-600">{facility}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Key Facilities */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 font-['Roboto_Flex']">Key Facilities</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {facilities.map((facility) => (
              <div key={facility.id} className="border border-gray-200 rounded-lg p-4 flex items-start">
                <div className="text-3xl mr-3">{facility.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 font-['Mukta_Mahee']">{facility.name}</h3>
                  <p className="text-gray-600 font-['Lora']">{facility.locations} locations throughout the zoo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Planning Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 font-['Roboto_Flex']">Planning Tips</h2>
          
          <ul className="space-y-2 font-['Lora']">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-gray-600">The zoo is laid out in a circular pattern, with the main plaza at the center.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-gray-600">Allow at least 3-4 hours to see the entire zoo.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-gray-600">Most animal feedings happen in the morning and late afternoon.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-gray-600">Download our mobile app for real-time updates on animal activities and shows.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-gray-600">All pathways are wheelchair and stroller accessible.</span>
            </li>
          </ul>
        </div>
        
        {/* PDF Map Download */}
        <div className="mt-8 text-center">
          <button className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md inline-flex items-center transition duration-300 font-['Mukta_Mahee']">
            <span className="mr-2">📥</span>
            <span>Download Printable Map (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZooMap;