// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, Mail, UserPlus, User as UserIcon } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Form validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.username.trim() || !formData.password.trim()) {
      setFormError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/');
    } catch (err) {
      // Error is handled in AuthContext and displayed below
      console.error('Registration error:', err);
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
          <div className="bg-green-700 text-white py-5 px-6">
            <h2 className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
              <UserPlus size={24} className="mr-2" />
              Create an Account
            </h2>
            <p className="text-green-100 text-sm mt-1 font-['Lora']">
              Join Wild Wood Zoo to purchase tickets and more
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
                  htmlFor="firstName" 
                  className="block text-gray-700 font-medium mb-2 font-['Mukta_Mahee'] flex items-center"
                >
                  <UserIcon size={18} className="mr-2" />
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="lastName" 
                  className="block text-gray-700 font-medium mb-2 font-['Mukta_Mahee'] flex items-center"
                >
                  <UserIcon size={18} className="mr-2" />
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="username" 
                  className="block text-gray-700 font-medium mb-2 font-['Mukta_Mahee'] flex items-center"
                >
                  <Mail size={18} className="mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
              </div>
              
              <div className="mb-4">
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
                  name="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (6+ characters)"
                />
              </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-gray-700 font-medium mb-2 font-['Mukta_Mahee'] flex items-center"
                >
                  <Key size={18} className="mr-2" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 font-['Mukta_Mahee'] flex items-center justify-center"
              >
                <UserPlus size={20} className="mr-2" />
                Create Account
              </button>
            </form>
            
            <div className="mt-6 text-center font-['Lora']">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-green-700 hover:text-green-600 font-semibold">
                  Login here
                </Link>
              </p>
              <p className="text-sm text-gray-500 mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;