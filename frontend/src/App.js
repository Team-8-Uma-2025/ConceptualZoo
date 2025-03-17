// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Animals from './pages/Animals';
import Attractions from './pages/Attractions';
import PlanVisit from './pages/PlanVisit';
import Tickets from './pages/Tickets';
import Membership from './pages/Membership';
import ZooMap from './pages/ZooMap';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffLogin from './pages/StaffLogin';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import EnclosureList from './pages/EnclosureList'; //investigate why it doesnt work
import Test from './pages/Test'; // test to see if page renders

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Styles
import './index.css';

// ScrollToTop functionality
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// AppContent component that uses the router hooks
function AppContent() {
  // Add scroll to top behavior
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/attractions" element={<Attractions />} />
          <Route path="/plan-visit" element={<PlanVisit />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/zoo-map" element={<ZooMap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/*javier routes */}
          <Route path="/enclosure-list" element={<EnclosureList />} />
          <Route path="/test" element={<Test />} />
          
          {/* Protected visitor routes */}
          <Route element={<ProtectedRoute requiredRole="visitor" />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Protected staff routes */}
          <Route element={<ProtectedRoute requiredRole="staff" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Additional staff routes will go here */}
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;