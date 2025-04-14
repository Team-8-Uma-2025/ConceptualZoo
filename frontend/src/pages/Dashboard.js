// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Activity, Briefcase, Clipboard,
  AlertTriangle, Heart, Home, Package,
  Users, Bell, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import RevenueReport from "../components/RevenueReport";

// Extracted components for better organization
const DashboardModule = ({ module }) => (
  <Link to={module.link} className="block">
    <div
      className={`${module.color} text-white rounded-lg shadow-md p-6 transition hover:shadow-lg hover:scale-105`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold mb-2 font-['Mukta_Mahee'] flex items-center">
          {module.icon}
          {module.title}
        </h3>
        {module.badge && (
          <span className="inline-block px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
            {module.badge}
          </span>
        )}
      </div>
      <p className="text-white/80 text-sm font-['Lora']">
        {module.description}
      </p>
    </div>
  </Link>
);

const ExpandableSection = ({ title, icon, isExpanded, toggleFn, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={toggleFn}
    >
      <h2 className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
        {icon}
        {title}
      </h2>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
    {isExpanded && <div className="mt-4">{children}</div>}
  </div>
);

const PaginationControls = ({ currentPage, totalPages, goToPrevPage, goToNextPage, paginate }) => (
  <div className="flex items-center justify-center mt-6">
    <div className="flex items-center space-x-4">
      <button 
        onClick={goToPrevPage} 
        disabled={currentPage === 1}
        className={`p-2 rounded-full ${
          currentPage === 1 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-purple-100'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center space-x-1">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i + 1
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      
      <button 
        onClick={goToNextPage} 
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full ${
          currentPage === totalPages 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-purple-100'
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Data states
  const [staffMembers, setStaffMembers] = useState([]);
  const [sickAnimals, setSickAnimals] = useState([]);
  const [enclosures, setEnclosures] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [attractions, setAttractions] = useState([]);
  
  // Pagination states for staff directory
  const [currentPage, setCurrentPage] = useState(1);
  const [staffPerPage] = useState(7);

  // Function to determine module access based on user role
  const hasModuleAccess = (moduleType) => {
    if (!currentUser) return false;
    
    const { staffRole, staffType } = currentUser;
    
    // Define access rules in a more organized way
    const accessRules = {
      notifications: true, // All staff have access
      staffManagement: staffRole === 'Manager',
      sickAnimals: staffType === 'Vet' || (staffType === 'Zookeeper' && staffRole === 'Manager'), // zookeeper manager possibly
      enclosures: staffType === 'Zookeeper' || staffType === 'Vet',
      attractions: staffType === 'Zookeeper',
      giftShop: staffType === 'Gift Shop Clerk' || staffType === 'Admin',
      revenue: staffRole === 'Manager' && staffType === 'Admin',
      animalManagement: staffRole === 'Manager' && (staffType === 'Admin' || staffType === 'Zookeeper')
    };
    
    return accessRules[moduleType] || false;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || currentUser.role !== "staff") return;

      try {
        setLoading(true);

        // Fetch unread notifications (for all users)
        const notifResponse = await axios.get("/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUnreadNotifications(
          notifResponse.data.filter(n => !n.Acknowledged).length
        );

        // Fetch data based on access permissions
        if (hasModuleAccess('staffManagement')) {
          const staffResponse = await axios.get("/api/staff", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setStaffMembers(staffResponse.data);
        }

        if (hasModuleAccess('sickAnimals')) {
          const animalResponse = await axios.get("/api/animals", {
            params: { healthStatus: "Sick" },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setSickAnimals(animalResponse.data || []);
        }

        if (hasModuleAccess('enclosures')) {
          let enclosureUrl = "/api/enclosures";
          if (currentUser.staffType === "Zookeeper") {
            enclosureUrl = `/api/enclosures/staff/${currentUser.id}`;
          }

          const enclosureResponse = await axios.get(enclosureUrl, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setEnclosures(enclosureResponse.data || []);
        }
        
        // Fetch attractions data (for Zookeepers and Managers)
        if (hasModuleAccess('attractions')) {
          try {
            // For zookeepers, fetch only their assigned attractions
            if (currentUser.staffType === "Zookeeper" && currentUser.staffRole !== "Manager") {
              // First get all attractions to check assignments
              const allAttractionsResponse = await axios.get("/api/attractions", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              });
              
              if (allAttractionsResponse.data) {
                // Create an array to store assigned attractions
                const assignedAttractions = [];
                
                // Check each attraction to see if the current staff is assigned to it
                for (const attraction of allAttractionsResponse.data) {
                  try {
                    // Get assigned staff for this attraction
                    const staffResponse = await axios.get(`/api/attractions/${attraction.AttractionID}/assigned-staff`, {
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    });
                    
                    // Check if current user is in the assigned staff
                    const isAssigned = staffResponse.data.some(staff => 
                      staff.StaffID === currentUser.id
                    );
                    
                    // If current staff is assigned, add to the assigned attractions list
                    if (isAssigned) {
                      assignedAttractions.push(attraction);
                    }
                    
                    // Alternatively, if the attraction StaffID matches the current user's ID
                    if (attraction.StaffID === currentUser.id) {
                      // Make sure we don't add duplicates
                      if (!assignedAttractions.some(a => a.AttractionID === attraction.AttractionID)) {
                        assignedAttractions.push(attraction);
                      }
                    }
                  } catch (err) {
                    console.error(`Error checking assignments for attraction ${attraction.AttractionID}:`, err);
                  }
                }
                
                // Set the attractions state with only the assigned attractions
                setAttractions(assignedAttractions);
              }
            } else {
              // For managers, fetch all attractions
              const attractionsResponse = await axios.get("/api/attractions", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              });
              
              setAttractions(attractionsResponse.data || []);
            }
          } catch (err) {
            console.error("Failed to fetch attractions data:", err);
            setAttractions([]);
          }
        }
        
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Unable to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      if (section === 'staff') {
        setCurrentPage(1);
      }
    }
  };

  // Define all possible dashboard modules
  const getDashboardModules = () => {
    const moduleDefinitions = [
      {
        id: 'notifications',
        title: "Messages",
        icon: <Bell size={20} className="mr-2" />,
        description: "Check notifications and communications",
        link: "/dashboard/messages",
        color: "bg-indigo-600",
        badge: unreadNotifications > 0 ? unreadNotifications : null,
      },
      {
        id: 'staffManagement',
        title: "Staff Management",
        icon: <Users size={20} className="mr-2" />,
        description: "Manage staff members and assignments",
        link: "/dashboard/staff",
        color: "bg-purple-600",
      },
      {
        id: 'enclosures',
        title: currentUser?.staffType === "Zookeeper" ? "Assigned Enclosures" : "Enclosure Management",
        icon: <Home size={20} className="mr-2" />,
        description: "Manage enclosures and their animals",
        link: "/dashboard/enclosures",
        color: "bg-green-600",
      },
      {
        id: 'attractions',
        title: currentUser?.staffType === "Zookeeper" ? "Assigned Attractions" : "Attraction Management",
        icon: <Calendar size={20} className="mr-2" />,
        description: 'View and manage zoo attractions',
        link: '/dashboard/attractions',
        color: 'bg-rose-600'
      },
      {
        id: 'giftShop',
        title: "Gift Shop Management",
        icon: <Package size={20} className="mr-2" />,
        description: "Manage products, inventory, and sales",
        link: "/dashboard/gift-shop",
        color: "bg-emerald-600",
      },
      {
        id: 'animalManagement',
        title: "Animal Management",
        icon: <Users size={20} className="mr-2" />,
        description: "View and manage all animals",
        link: "/dashboard/animals",
        color: "bg-yellow-600",
      }
    ];
    
    // Filter modules based on user access
    return moduleDefinitions.filter(module => hasModuleAccess(module.id));
  };

  // Pagination logic for staff directory
  const indexOfLastStaff = currentPage * staffPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffPerPage;
  const currentStaff = staffMembers.slice(indexOfFirstStaff, indexOfLastStaff);
  const totalPages = Math.ceil(staffMembers.length / staffPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (!currentUser || currentUser.role !== 'staff') {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 font-['Lora']">
            Access denied. This page is only for zoo staff members.
          </p>
        </div>
      </div>
    );
  }

  const availableModules = getDashboardModules();
  const gridColsClass = availableModules.length === 1 
    ? "grid-cols-1" 
    : availableModules.length === 2 
      ? "grid-cols-1 md:grid-cols-2" 
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  // Helper function to format date
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Roboto_Flex']">
            Staff Dashboard
          </h1>
          <p className="text-gray-600 font-['Lora']">
            Welcome back,{" "}
            <span className="font-semibold">{currentUser.name}</span> |
            <span className="ml-2">
              {currentUser.staffType} {currentUser.staffRole}
            </span>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            {/* Dashboard Modules Grid */}
            <div className={`grid gap-6 mb-8 ${gridColsClass}`}>
              {availableModules.map((module, index) => (
                <DashboardModule key={module.id} module={module} />
              ))}
            </div>

            {/* Sick Animals Section (Vets and Managers) */}
            {hasModuleAccess('sickAnimals') && sickAnimals.length > 0 && (
              <ExpandableSection
                title="Animals Requiring Attention"
                icon={<AlertTriangle size={24} className="mr-2 text-red-500" />}
                isExpanded={expandedSection === "sickAnimals"}
                toggleFn={() => toggleSection("sickAnimals")}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EnclosureID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checkup</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sickAnimals.map((animal) => (
                        <tr key={animal.AnimalID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.AnimalID}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{animal.EnclosureID}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.Name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.Species}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(animal.LastVetCheckup).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/dashboard/animals/${animal.AnimalID}`} className="text-green-600 hover:text-green-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ExpandableSection>
            )}

            {/* Enclosures Section (Zookeepers and Managers) */}
            {hasModuleAccess('enclosures') && enclosures.length > 0 && (
              <ExpandableSection
                title={currentUser.staffType === "Zookeeper" ? "Your Assigned Enclosures" : "Enclosures Overview"}
                icon={<Home size={24} className="mr-2 text-green-600" />}
                isExpanded={expandedSection === "enclosures"}
                toggleFn={() => toggleSection("enclosures")}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {enclosures.map((enclosure) => (
                        <tr key={enclosure.EnclosureID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enclosure.EnclosureID}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{enclosure.Name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enclosure.Type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enclosure.Location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enclosure.Capacity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/dashboard/enclosures/${enclosure.EnclosureID}`} className="text-green-600 hover:text-green-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ExpandableSection>
            )}
            
            {/* Attractions Section (Zookeepers and Managers) */}
            {hasModuleAccess('attractions') && attractions.length > 0 && (
              <ExpandableSection
                title={currentUser.staffType === "Zookeeper" ? "Your Assigned Attractions" : "Attractions Overview"}
                icon={<Calendar size={24} className="mr-2 text-rose-600" />}
                isExpanded={expandedSection === "attractions"}
                toggleFn={() => toggleSection("attractions")}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attractions.map((attraction) => (
                        <tr key={attraction.AttractionID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attraction.AttractionID}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attraction.Title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attraction.Location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attraction.StartTimeStamp ? formatDateTime(attraction.StartTimeStamp) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {attraction.EndTimeStamp ? formatDateTime(attraction.EndTimeStamp) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/dashboard/attractions/${attraction.AttractionID}`} className="text-green-600 hover:text-green-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ExpandableSection>
            )}

            {/* Staff List (Managers Only) with Pagination */}
            {hasModuleAccess('staffManagement') && staffMembers.length > 0 && (
              <ExpandableSection
                title="Staff Directory"
                icon={<Users size={24} className="mr-2 text-purple-600" />}
                isExpanded={expandedSection === "staff"}
                toggleFn={() => toggleSection("staff")}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentStaff.map((staff) => (
                        <tr key={staff.Staff}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.Staff}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.Name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.Role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.StaffType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/dashboard/staff/${staff.Staff}`} className="text-green-600 hover:text-green-900 mr-3">View</Link>
                            <Link to={`/dashboard/staff/${staff.Staff}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <PaginationControls 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      goToPrevPage={goToPrevPage}
                      goToNextPage={goToNextPage}
                      paginate={paginate}
                    />
                  )}
                  
                  {/* Showing entries info */}
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    Showing {indexOfFirstStaff + 1} to {Math.min(indexOfLastStaff, staffMembers.length)} of {staffMembers.length} staff members
                  </div>
                </div>
              </ExpandableSection>
            )}

            {/* Ticket Revenue Section (Admin Managers Only) */}
            {hasModuleAccess('revenue') && (
              <ExpandableSection
                title="Ticket Revenue Report"
                icon={<Activity size={24} className="mr-2 text-green-600" />}
                isExpanded={expandedSection === "revenue"}
                toggleFn={() => toggleSection("revenue")}
              >
                <div className="mt-6">
                  <RevenueReport />
                </div>
              </ExpandableSection>
            )}

            {/*Animal Management Section (Managers Only) */}
            {hasModuleAccess('animalManagement')}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;