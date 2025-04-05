// src/App.js
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Animals from "./pages/Animals";
import VisitorAnimalView from "./pages/VisitorAnimalView"
import Attractions from "./pages/Attractions";
import PlanVisit from "./pages/PlanVisit";
import Tickets from "./pages/Tickets";
import Membership from "./pages/Membership";
import ZooMap from "./pages/ZooMap";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StaffLogin from "./pages/StaffLogin";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import Messages from "./pages/Messages";
import EnclosureList from "./pages/EnclosureList";
import EnclosureDetails from "./pages/EnclosureDetails";
import AnimalDetails from "./pages/AnimalDetails";
import GiftShop from "./pages/GiftShop";
import AttractionDetails from './pages/AttractionDetails'
import GiftShopManagement from "./pages/GiftShopManagement";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Styles
import "./index.css";

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
          <Route path="/enclosures/:id" element={<VisitorAnimalView />} />
          <Route path="/plan-visit" element={<PlanVisit />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/zoo-map" element={<ZooMap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/gift-shop" element={<GiftShop />} />

          {/*javier routes */}
          <Route path="/enclosure-list" element={<EnclosureList />} />

          {/* Protected visitor routes */}
          <Route element={<ProtectedRoute requiredRole="visitor" />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected staff routes */}
          <Route element={<ProtectedRoute requiredRole="staff" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/animals" element={<Dashboard />} />
            <Route path="/dashboard/enclosures/:id" element={<EnclosureDetails />} /> 
            <Route path="/dashboard/enclosures" element={<EnclosureDetails />} /> 
            <Route path="/dashboard/test1" element={<AnimalDetails />} /> 
            <Route path="/dashboard/attractions" element={<AttractionDetails />} />
            <Route path="/dashboard/attractions/:id" element={<AttractionDetails />} />
            <Route path="/dashboard/gift-shop" element={<GiftShopManagement />} />

            {/* Additional staff routes will go here */}
          </Route>

          {/* Additional staff routes will go here */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
