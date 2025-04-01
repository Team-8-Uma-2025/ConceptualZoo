// src/pages/PlanVisit.js
import React from 'react';
import { Link } from 'react-router';

const PlanVisit = () => {
  const visitorInfo = [
    {
      title: 'Hours & Location',
      icon: '🕒',
      content: [
        'Monday - Friday: 9am - 5pm',
        'Saturday - Sunday: 9am - 6pm',
        'Last entry is 1 hour before closing',
        'Located at 123 Wild Way, Manhattan, NY 10001'
      ]
    },
    {
      title: 'Admission',
      icon: '🎟️',
      content: [
        'Adults (13-64): $24.99',
        'Children (3-12): $16.99',
        'Seniors (65+): $19.99',
        'Children under 3: Free',
        'Members: Free'
      ]
    },
    {
      title: 'Getting Here',
      icon: '🚗',
      content: [
        'By Subway: Lines A, B, C to Forest Station',
        'By Bus: Routes 12, 44, 67 stop nearby',
        'Parking available for $15 per day',
        'Bike racks available free of charge'
      ]
    },
    {
      title: 'Accessibility',
      icon: '♿',
      content: [
        'Wheelchair accessible paths throughout',
        'Wheelchairs available for rent',
        'Service animals welcome',
        'Sensory-friendly hours every Tuesday'
      ]
    }
  ];

  const tips = [
    'Visit on weekdays for smaller crowds',
    'Download our mobile app for interactive maps and schedules',
    'Bring water bottles – refill stations available throughout the zoo',
    'Check the feeding schedule to catch these special moments',
    'Wear comfortable shoes – our paths cover over 3 miles if you see everything!'
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="/background/tree_bg.webp" 
          alt="Plan Your Visit Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">Plan Your Visit</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 font-['Roboto_Flex']">Visitor Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visitorInfo.map((info, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{info.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-800 font-['Mukta_Mahee']">{info.title}</h3>
                </div>
                <ul className="space-y-2 font-['Lora']">
                  {info.content.map((item, idx) => (
                    <li key={idx} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 font-['Roboto_Flex']">Visitor Tips</h2>
          <ul className="list-disc pl-6 space-y-3 font-['Lora']">
            {tips.map((tip, index) => (
              <li key={index} className="text-gray-600">{tip}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800 font-['Roboto_Flex']">Ready to Visit?</h2>
            <p className="text-gray-600 mb-6 md:mb-0 font-['Lora']">Purchase your tickets online for a faster entry experience.</p>
          </div>
          <Link 
            to="/tickets" 
            className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg font-['Mukta_Mahee']"
          >
            Buy Tickets Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlanVisit;