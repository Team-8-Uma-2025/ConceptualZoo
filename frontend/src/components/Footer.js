// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 font-['Roboto_Flex']">WILD WOOD</h3>
            <p className="text-gray-400 mb-4 font-['Lora']">
              Explore the wonders of wildlife in the heart of Manhattan.
            </p>
            <div className="flex space-x-4">
              <a href="/" className="text-white hover:text-green-400 transition duration-300">
                <span>📱</span>
              </a>
              <a href="/" className="text-white hover:text-green-400 transition duration-300">
                <span>📷</span>
              </a>
              <a href="/" className="text-white hover:text-green-400 transition duration-300">
                <span>🐦</span>
              </a>
              <a href="/" className="text-white hover:text-green-400 transition duration-300">
                <span>📺</span>
              </a>
            </div>
            <div>
              <p className="text-green-400 mt-4 font-['Mukta_Mahee']">
                <Link 
                  className="opacity-70 hover:opacity-100 transition duration-200" 
                  to='/staff-login'
                >
                  Employee Login
                </Link> 
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 font-['Mukta_Mahee']">Visit</h3>
            <ul className="space-y-2 font-['Mukta_Mahee']">
              <li><Link to="/plan-visit" className="text-gray-400 hover:text-white transition duration-300">Plan Your Visit</Link></li>
              <li><Link to="/tickets" className="text-gray-400 hover:text-white transition duration-300">Buy Tickets</Link></li>
              <li><Link to="/zoo-map" className="text-gray-400 hover:text-white transition duration-300">Zoo Map</Link></li>
              <li><Link to="/hours" className="text-gray-400 hover:text-white transition duration-300">Hours & Directions</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 font-['Mukta_Mahee']">Explore</h3>
            <ul className="space-y-2 font-['Mukta_Mahee']">
              <li><Link to="/animals" className="text-gray-400 hover:text-white transition duration-300">Animals</Link></li>
              <li><Link to="/attractions" className="text-gray-400 hover:text-white transition duration-300">Attractions</Link></li>
              <li><Link to="/events" className="text-gray-400 hover:text-white transition duration-300">Events</Link></li>
              <li><Link to="/education" className="text-gray-400 hover:text-white transition duration-300">Education</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 font-['Mukta_Mahee']">Support</h3>
            <ul className="space-y-2 font-['Mukta_Mahee']">
              <li><Link to="/membership" className="text-gray-400 hover:text-white transition duration-300">Membership</Link></li>
              <li><Link to="/donate" className="text-gray-400 hover:text-white transition duration-300">Donate</Link></li>
              <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition duration-300">Volunteer</Link></li>
              <li><Link to="/conservation" className="text-gray-400 hover:text-white transition duration-300">Conservation</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm font-['Lora']">
            © {new Date().getFullYear()} Wild Wood Zoo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;