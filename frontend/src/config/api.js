const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://conceptual-zoo-wildwood-be.vercel.app'
  : 'http://localhost:5000';

export default API_URL;