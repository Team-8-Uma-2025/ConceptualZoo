// src/components/InfoBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const InfoBar = () => {
  return (
    <div className="bg-white shadow-md w-full">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex items-center justify-center py-4 px-2 border-b sm:border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span>🕒</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Today's Hours</p>
              <p className="text-sm text-gray-700 font-['Mukta_Mahee']">9am - 5pm</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-4 px-2 border-b sm:border-b md:border-b-0 md:border-r border-gray-200">
          <Link to="/tickets" className="flex items-center space-x-3 hover:text-green-700 transition duration-300">
            <div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span>🎟️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Get Tickets</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center justify-center py-4 px-2 border-b sm:border-b-0 sm:border-r md:border-r border-gray-200">
          <Link to="/zoo-map" className="flex items-center space-x-3 hover:text-green-700 transition duration-300">
            <div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span>🗺️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Zoo Map</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center justify-center py-4 px-2">
          <Link to="/membership" className="flex items-center space-x-3 hover:text-green-700 transition duration-300">
            <div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span>⭐</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Membership</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InfoBar;