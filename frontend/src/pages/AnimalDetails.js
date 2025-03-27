// Example of how to integrate the components into an existing page
// src/pages/AnimalList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AnimalCard from '../components/AnimalCard';

const AnimalList = () => {
  const { currentUser } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        // If user is a zookeeper, fetch their assigned animals
        // otherwise fetch all animals or based on enclosure
        const response = await axios.get('/api/animals', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAnimals(response.data);
      } catch (err) {
        console.error('Failed to fetch animals:', err);
        setError('Unable to load animals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-['Roboto_Flex']">Animals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map(animal => (
          <AnimalCard key={animal.AnimalID} animal={animal} />
        ))}
      </div>
    </div>
  );
};

export default AnimalList;