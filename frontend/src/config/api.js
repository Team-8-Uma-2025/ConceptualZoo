// Create this file to centralize API URL configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // In production, the API will be at the same domain
  : 'http://localhost:5000/api'; // In development, point to your local backend

export default API_URL;