// src/pages/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="mb-6 text-5xl">🚫</div>
        <h1 className="text-4xl font-bold mb-4 text-red-700 font-['Roboto_Flex']">Access Denied</h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl font-['Lora']">
          You don't have permission to access this page. Please contact an administrator if you believe this is a mistake.
        </p>
        <Link 
          to="/" 
          className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 font-['Mukta_Mahee']"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;