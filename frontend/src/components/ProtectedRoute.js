// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  requiredRole, 
  redirectPath = '/login' 
}) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading indicator while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to the login page with the return url
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated and has the required role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;