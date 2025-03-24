// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        // Only managers can see all staff
        if (currentUser.staffRole === 'Manager') {
          const response = await axios.get('/api/staff');
          setStaffMembers(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch staff data:', err);
        setError('Unable to load staff data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'staff') {
      fetchStaffData();
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'staff') {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 font-['Lora']">Access denied. This page is only for zoo staff members.</p>
        </div>
      </div>
    );
  }

  // Dashboard modules based on staff role
  const getDashboardModules = () => {
    const commonModules = [
      {
        title: 'My Schedule',
        icon: '📅',
        description: 'View your upcoming shifts and assignments',
        link: '/dashboard/schedule',
        color: 'bg-blue-600'
      },
      {
        title: 'Messages',
        icon: '✉️',
        description: 'Check internal communications',
        link: '/dashboard/messages',
        color: 'bg-indigo-600'
      },
      {
        title: 'Enclosure Information',
        icon: '🐒',
        description: 'View and edit(if applicable) enclosure information',
        link: '/enclosure-details',
        color: 'bg-cyan-600'
      }
    ];

    // Role-specific modules
    const roleSpecificModules = {
      'Manager': [
        {
          title: 'Staff Management',
          icon: '👥',
          description: 'Manage staff members and assignments',
          link: '/dashboard/staff',
          color: 'bg-purple-600'
        },
        {
          title: 'Reports',
          icon: '📊',
          description: 'View analytics and generate reports',
          link: '/dashboard/reports',
          color: 'bg-pink-600'
        }
      ],
      'Zookeeper': [
        {
          title: 'Animal Care',
          icon: '🦁',
          description: 'Manage animal feeding and health records',
          link: '/dashboard/animals',
          color: 'bg-yellow-600'
        },
        {
          title: 'Enclosures',
          icon: '🏞️',
          description: 'Monitor enclosure conditions',
          link: '/dashboard/enclosures',
          color: 'bg-green-600'
        }
      ],
      'Veterinarian': [
        {
          title: 'Health Records',
          icon: '🩺',
          description: 'Access and update animal health information',
          link: '/dashboard/health',
          color: 'bg-red-600'
        },
        {
          title: 'Treatments',
          icon: '💉',
          description: 'Schedule and record animal treatments',
          link: '/dashboard/treatments',
          color: 'bg-orange-600'
        }
      ],
      'Maintenance': [
        {
          title: 'Maintenance Requests',
          icon: '🔧',
          description: 'View and manage pending maintenance tasks',
          link: '/dashboard/maintenance',
          color: 'bg-slate-600'
        },
        {
          title: 'Equipment',
          icon: '🔨',
          description: 'Track equipment inventory and status',
          link: '/dashboard/equipment',
          color: 'bg-cyan-600'
        }
      ]
    };

    // Get modules specific to the user's role
    const userRoleModules = roleSpecificModules[currentUser.staffRole] || [];
    
    return [...commonModules, ...userRoleModules];
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Roboto_Flex']">Staff Dashboard</h1>
          <p className="text-gray-600 font-['Lora']">
            Welcome back, <span className="font-semibold">{currentUser.name}</span> | 
            <span className="ml-2">{currentUser.staffRole}</span>
          </p>
        </div>

        {/* Dashboard Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getDashboardModules().map((module, index) => (
            <Link to={module.link} key={index} className="block">
              <div className={`${module.color} text-white rounded-lg shadow-md p-6 transition transform hover:scale-105 hover:shadow-lg`}>
                <div className="text-3xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-semibold mb-2 font-['Mukta_Mahee']">{module.title}</h3>
                <p className="text-white/80 text-sm font-['Lora']">{module.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Staff List (Managers Only) */}
        {currentUser.staffRole === 'Manager' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 font-['Roboto_Flex']">Staff Directory</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
              </div>
            ) : error ? (
              <p className="text-red-600 text-center py-4 font-['Lora']">{error}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Mukta_Mahee']">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Mukta_Mahee']">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Mukta_Mahee']">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Mukta_Mahee']">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 font-['Lora']">
                    {staffMembers.map((staff) => (
                      <tr key={staff.StaffID}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{staff.Staff}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{staff.Name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{staff.Role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            to={`/dashboard/staff/${staff.StaffID}`} 
                            className="text-green-600 hover:text-green-900 mr-3 font-['Mukta_Mahee']"
                          >
                            View
                          </Link>
                          <Link 
                            to={`/dashboard/staff/${staff.StaffID}/edit`} 
                            className="text-blue-600 hover:text-blue-900 font-['Mukta_Mahee']"
                          >
                            Edit
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
      </div>
    </div>
  );
};

export default Dashboard;