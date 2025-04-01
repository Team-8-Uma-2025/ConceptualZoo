// src/pages/StaffLogin.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Key, LogIn } from 'lucide-react';

const StaffLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, logout, error: authError } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Simple validation
    if (!username.trim() || !password.trim()) {
      setFormError('Please enter both username and password');
      return;
    }
    
    try {
      const user = await login(username, password);
      
      // Check if the logged in user is staff
      if (user.role !== 'staff') {
        logout();
        setFormError('Access denied. This login is for staff members only.');
        return;
      }
      
      // Redirect to the dashboard
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled in AuthContext and displayed below
      console.error('Login error:', err);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen pt-20 bg-opacity-90" 
         style={{
           backgroundImage: "url('/background/tree_bg.webp')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundBlendMode: "overlay"
         }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-800 text-white py-5 px-6">
            <h2 className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
              <User size={24} className="mr-2" />
              Staff Login
            </h2>
            <p className="text-green-100 text-sm mt-1 font-['Lora']">
              Authorized zoo personnel only
            </p>
          </div>
          
          <div className="p-6">
            {(formError || authError) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError || authError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label 
                  htmlFor="username" 
                  className="block text-gray-700 font-medium mb-2 font-['Mukta_Mahee'] flex items-center"
                >
                  <User size={18} className="mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your staff username"
                />
              </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="password" 
                  className="block text-gray-700 font-medium mb-2 font-['Mukta_Mahee'] flex items-center"
                >
                  <Key size={18} className="mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 font-['Mukta_Mahee'] flex items-center justify-center"
              >
                <LogIn size={20} className="mr-2" />
                Login to Staff Portal
              </button>
            </form>
            
            <div className="mt-6 text-center font-['Lora']">
              <p className="text-gray-600 text-sm">
                For technical assistance, please contact IT support.
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <a href="/" className="text-green-700 hover:text-green-600">
                  Return to main site
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;