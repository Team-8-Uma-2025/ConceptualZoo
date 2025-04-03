// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Activity, Briefcase, Clipboard,
  AlertTriangle, Heart, Home, Package,
  Users, Bell, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import RevenueReport from "../components/RevenueReport";

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
  
  // Pagination states for staff directory
  const [currentPage, setCurrentPage] = useState(1);
  const [staffPerPage] = useState(7); // Number of staff members to display per page

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || currentUser.role !== "staff") return;

      try {
        setLoading(true);

        // Fetch unread notifications
        const notifResponse = await axios.get("/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const unreadCount = notifResponse.data.filter(
          (n) => !n.Acknowledged
        ).length;
        setUnreadNotifications(unreadCount);

        // Different data based on staff type
        if (currentUser.staffRole === "Manager") {
          // Fetch staff members for managers
          const staffResponse = await axios.get("/api/staff", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setStaffMembers(staffResponse.data);
        }

        if (
          currentUser.staffType === "Vet" ||
          currentUser.staffRole === "Manager"
        ) {
          // Fetch sick animals for vets and managers
          const animalResponse = await axios.get("/api/animals", {
            params: { healthStatus: "Sick" },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setSickAnimals(animalResponse.data || []);
        }

        if (
          currentUser.staffType === "Zookeeper" ||
          currentUser.staffRole === "Manager"
        ) {
          // Fetch enclosures for zookeepers and managers
          let enclosureUrl = "/api/enclosures";
          if (currentUser.staffType === "Zookeeper") {
            enclosureUrl = `/api/enclosures/staff/${currentUser.id}`;
          }

          const enclosureResponse = await axios.get(enclosureUrl, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setEnclosures(enclosureResponse.data || []);
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

  // Function to toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      // Reset to first page when expanding staff directory
      if (section === 'staff') {
        setCurrentPage(1);
      }
    }
  };

  // Dashboard modules based on staff role
  const getDashboardModules = () => {
    const commonModules = [
      {
        title: "Messages",
        icon: <Bell size={20} className="mr-2" />,
        description: "Check notifications and communications",
        link: "/dashboard/messages",
        color: "bg-indigo-600",
        badge: unreadNotifications > 0 ? unreadNotifications : null,
      },
    ];

    // Role-specific modules
    const roleSpecificModules = {
      Manager: [
        {
          title: "Staff Management",
          icon: <Users size={20} className="mr-2" />,
          description: "Manage staff members and assignments",
          link: "/dashboard/staff",
          color: "bg-purple-600",
        },
      ],
    };
    
    const staffTypeModules = {
      Zookeeper: [
        {
          title: "Assigned Enclosures",
          icon: <Home size={20} className="mr-2" />,
          description: "Manage enclosures and their animals",
          link: "/dashboard/enclosures",
          color: "bg-green-600",
        },
        {
          title: 'Attraction Information',
          icon: <Home size={20} className="mr-2" />,
          description: 'View and edit attraction information',
          link: '/dashboard/attractions',
          color: 'bg-rose-600'
        }
      ],
      'Vet': [
        {
          title: 'Enclosure Information',
          icon: <Home size={20} className="mr-2" />,
          description: 'View and edit enclosure information',
          link: '/dashboard/enclosures',
          color: 'bg-cyan-600'
        }
      ],
      "Gift Shop Clerk": [
        {
          title: "Inventory Management",
          icon: <Package size={20} className="mr-2" />,
          description: "Manage product inventory and stock levels",
          link: "/dashboard/inventory",
          color: "bg-cyan-600",
        },
        {
          title: "Sales",
          icon: <Briefcase size={20} className="mr-2" />,
          description: "Track sales and transactions",
          link: "/dashboard/sales",
          color: "bg-slate-600",
        },
        {
          title: "Gift Shop Management",
          icon: <Package size={20} className="mr-2" />,
          description: "Manage products, inventory, and sales",
          link: "/dashboard/gift-shop",
          color: "bg-emerald-600",
        },
      ],
    };

    // Get modules specific to the user's role
    const userRoleModules = roleSpecificModules[currentUser.staffRole] || [];
    const userTypeModules = staffTypeModules[currentUser.staffType] || [];

    return [...commonModules, ...userRoleModules, ...userTypeModules];
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
            {/* Dashboard Modules */}
            <div
              className={`grid gap-6 mb-8 ${
                // If only 1 module, take full width
                getDashboardModules().length === 1
                  ? "grid-cols-1"
                  : // If 2 modules, 2 columns on medium and up
                  getDashboardModules().length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : // Otherwise use the original responsive grid
                    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {getDashboardModules().map((module, index) => (
                <Link to={module.link} key={index} className="block">
                  <div
                    className={`${
                      module.color
                    } text-white rounded-lg shadow-md p-6 transition
                    ${
                      // Adjust hover effect based on number of modules
                      getDashboardModules().length === 1
                        ? "hover:shadow-lg hover:scale-[1.02]" // Subtle scale for single module
                        : getDashboardModules().length === 2
                        ? "hover:shadow-lg hover:scale-[1.03]" // Medium scale for two modules
                        : "hover:shadow-lg hover:scale-105" // Original scale for 3+ modules
                    }`}
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
              ))}
            </div>

            {/* Dynamic Content Sections Based on Role */}
            {/* Sick Animals Section (Vets and Managers) */}
            {(currentUser.staffType === "Vet" ||
              currentUser.staffRole === "Manager") &&
              sickAnimals.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection("sickAnimals")}
                  >
                    <h2 className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
                      <AlertTriangle size={24} className="mr-2 text-red-500" />
                      Animals Requiring Attention
                    </h2>
                    {expandedSection === "sickAnimals" ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>

                  {expandedSection === "sickAnimals" && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              EnclosureID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Species
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Checkup
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sickAnimals.map((animal) => (
                            <tr key={animal.AnimalID}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {animal.AnimalID}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {animal.EnclosureID}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {animal.Name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {animal.Species}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  animal.LastVetCheckup
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                  to={`/dashboard/animals/${animal.AnimalID}`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            {/* Enclosures Section (Zookeepers and Managers) */}
            {(currentUser.staffType === "Zookeeper" ||
              currentUser.staffRole === "Manager") &&
              enclosures.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleSection("enclosures")}
                  >
                    <h2 className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
                      <Home size={24} className="mr-2 text-green-600" />
                      {currentUser.staffType === "Zookeeper"
                        ? "Your Assigned Enclosures"
                        : "Enclosures Overview"}
                    </h2>
                    {expandedSection === "enclosures" ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>

                  {expandedSection === "enclosures" && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {enclosures.map((enclosure) => (
                            <tr key={enclosure.EnclosureID}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {enclosure.EnclosureID}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {enclosure.Name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {enclosure.Type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {enclosure.Location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {enclosure.Capacity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  to={`/dashboard/enclosures/${enclosure.EnclosureID}`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            {/* Staff List (Managers Only) with Pagination */}
            {currentUser.staffRole === 'Manager' && staffMembers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("staff")}
                >
                  <h2 className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
                    <Users size={24} className="mr-2 text-purple-600" />
                    Staff Directory
                  </h2>
                  {expandedSection === "staff" ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>

                {expandedSection === 'staff' && (
                  <div className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentStaff.map((staff) => (
                            <tr key={staff.Staff}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {staff.Staff}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {staff.Name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {staff.Role}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {staff.StaffType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  to={`/dashboard/staff/${staff.Staff}`}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  View
                                </Link>
                                <Link
                                  to={`/dashboard/staff/${staff.Staff}/edit`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
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
                            {/* Page numbers */}
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
                    )}
                    
                    {/* Showing entries info */}
                    <div className="mt-4 text-sm text-gray-500 text-center">
                      Showing {indexOfFirstStaff + 1} to {Math.min(indexOfLastStaff, staffMembers.length)} of {staffMembers.length} staff members
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ticket Revenue Section (Managers Only) */}
            {currentUser.staffRole === "Manager" && currentUser.staffType === 'Admin' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("revenue")}
                >
                  <h2 className="text-2xl font-bold font-['Roboto_Flex'] flex items-center">
                    <Activity size={24} className="mr-2 text-green-600" />
                    Ticket Revenue Report
                  </h2>
                  {expandedSection === "revenue" ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>

                {expandedSection === "revenue" && (
                  <div className="mt-6">
                    <RevenueReport />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;