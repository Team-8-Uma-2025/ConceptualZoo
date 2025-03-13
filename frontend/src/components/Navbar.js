// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-black/80 text-white p-4 fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
            <span className="text-white mr-2"> <img src='/logos/Logo.svg' alt="WildWood Logo"/> </span> 
          </span>
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6 font-['Mukta_Mahee']">
          <Link to="/plan-visit" className="hover:text-green-300 transition duration-300">Plan Your Visit</Link>
          <Link to="/animals" className="hover:text-green-300 transition duration-300">Animals</Link>
          <Link to="/attractions" className="hover:text-green-300 transition duration-300">Attractions</Link>
          
          {/* Auth Items */}
          {isAuthenticated ? (
            <div className="relative ml-4">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center bg-green-700 hover:bg-green-600 transition-colors duration-300 py-2 px-4 rounded text-white"
              >
                <User size={18} className="mr-2" />
                <span className="hidden sm:inline mr-1">
                  {currentUser.role === 'visitor' 
                    ? `${currentUser.firstName}` 
                    : `${currentUser.name}`}
                </span>
                <ChevronDown size={16} />
              </button>
              
              {/* Using conditional rendering instead of CSS hidden/block for better control */}
              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  {currentUser.role === 'visitor' && (
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                  )}

                  {currentUser.role === 'staff' && (
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Staff Dashboard
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-green-100 transition duration-150 border-t border-gray-100"
                  >
                    <span className="flex items-center">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-white bg-green-700 hover:bg-green-600 transition-colors duration-300 py-2 px-4 rounded flex items-center"
            >
              <User size={18} className="mr-2" />
              <span>Login</span>
            </Link>
          )}
          
          {/* Buy Tickets - Always visible and prominent */}
          <Link 
            to="/tickets" 
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition duration-300 ml-2"
          >
            BUY TICKETS
          </Link>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden pt-4 pb-2 font-['Mukta_Mahee']">
          <Link to="/plan-visit" className="block py-2 px-4 hover:bg-green-700 transition duration-300">Plan Your Visit</Link>
          <Link to="/animals" className="block py-2 px-4 hover:bg-green-700 transition duration-300">Animals</Link>
          <Link to="/attractions" className="block py-2 px-4 hover:bg-green-700 transition duration-300">Attractions</Link>
          <Link to="/tickets" className="block py-2 px-4 bg-green-600 hover:bg-green-500 transition duration-300 font-bold mt-2 mb-2">BUY TICKETS</Link>
          
          {/* Auth Items for Mobile */}
          <div className="border-t border-gray-700 my-2"></div>
          
          {isAuthenticated ? (
            <>
              <div className="px-4 py-2 text-green-300 font-bold">
                {currentUser.role === 'visitor' 
                  ? `Hello, ${currentUser.firstName}` 
                  : `Hello, ${currentUser.name}`}
              </div>
              
              {currentUser.role === 'visitor' && (
                <Link 
                  to="/profile" 
                  className="block py-2 px-4 hover:bg-green-700 transition duration-300 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} className="mr-2" />
                  My Profile
                </Link>
              )}

              {currentUser.role === 'staff' && (
                <Link 
                  to="/dashboard" 
                  className="block py-2 px-4 hover:bg-green-700 transition duration-300 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} className="mr-2" />
                  Staff Dashboard
                </Link>
              )}
              
              <button 
                onClick={handleLogout}
                className="block w-full text-left py-2 px-4 hover:bg-green-700 transition duration-300 flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block py-2 px-4 hover:bg-green-700 transition duration-300 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} className="mr-2" />
                Login
              </Link>
              <Link 
                to="/register" 
                className="block py-2 px-4 hover:bg-green-700 transition duration-300"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;