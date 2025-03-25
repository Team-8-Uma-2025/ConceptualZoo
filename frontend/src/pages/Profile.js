// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]); // Initialize as empty array
  const [addons, setAddons] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [notification, setNotification] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/tickets/visitor/${currentUser.id}`
        );

        // Check if we got the expected response format
        console.log("Ticket response:", response.data); // For debugging

        // Handle the response carefully, with fallbacks
        const regularTickets = response.data?.regularTickets || [];
        const addonTickets = response.data?.addonTickets || [];

        setTickets(regularTickets);
        setAddons(addonTickets);
        setError(null);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError("Failed to load ticket information");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTickets();
    }

    // Clear notification after 5 seconds
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, notification]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group tickets (regular and add-on) by date (using StartDate)
  const groupedTickets = {};
  tickets.forEach((ticket) => {
    const dateKey = formatDate(ticket.StartDate);
    if (!groupedTickets[dateKey]) {
      groupedTickets[dateKey] = { regular: [], addons: [] };
    }
    groupedTickets[dateKey].regular.push(ticket);
  });
  addons.forEach((ticket) => {
    const dateKey = formatDate(ticket.StartDate);
    if (!groupedTickets[dateKey]) {
      groupedTickets[dateKey] = { regular: [], addons: [] };
    }
    groupedTickets[dateKey].addons.push(ticket);
  });

  // Get sorted dates in descending order
  const sortedDates = Object.keys(groupedTickets).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (!currentUser) {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-gray-700 font-['Lora']">
            Please login to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      {/* Show notification if present */}
      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {notification}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-green-700 text-white py-6 px-8">
            <h2 className="text-3xl font-bold font-['Roboto_Flex']">
              My Profile
            </h2>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* User Information */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee']">
                    Personal Information
                  </h3>

                  <div className="space-y-4 font-['Lora']">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="text-gray-800">{currentUser.firstName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="text-gray-800">{currentUser.lastName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="text-gray-800">{currentUser.username}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Membership Status</p>
                      <p className="text-gray-800">
                        {currentUser.membership
                          ? "Active Member"
                          : "No Membership"}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded transition duration-300 text-sm font-['Mukta_Mahee']">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets and Membership */}
              <div className="md:col-span-2">
                {/* Membership Card (if the user has membership) */}
                {currentUser.membership ? (
                  <div className="bg-green-800 text-white rounded-lg p-6 shadow-md mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-1 font-['Mukta_Mahee']">
                          Wild Wood Zoo Membership
                        </h3>
                        <p className="text-sm opacity-90 font-['Lora']">
                          Valid until: December 31, 2025
                        </p>
                      </div>
                      <div className="text-4xl">🦁</div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-700">
                      <p className="text-lg font-['Mukta_Mahee']">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-sm opacity-90 font-['Lora']">
                        Member ID: {1000 + currentUser.id}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 shadow-sm mb-6 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-2 font-['Mukta_Mahee']">
                      Enhance Your Experience
                    </h3>
                    <p className="text-gray-700 mb-4 font-['Lora']">
                      Become a member to enjoy unlimited access, special
                      discounts, and exclusive events!
                    </p>
                    <button className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded transition duration-300 font-['Mukta_Mahee']">
                      Become a Member
                    </button>
                  </div>
                )}

                {/* Recent Tickets */}
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee']">
                    Your Tickets
                  </h3>

                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                    </div>
                  ) : error ? (
                    <p className="text-red-600 text-center py-4 font-['Lora']">
                      {error}
                    </p>
                  ) : sortedDates.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4 font-['Lora']">
                        You haven't purchased any tickets yet.
                      </p>
                      <Link
                        to="/tickets"
                        className="text-green-700 hover:text-green-600 underline font-['Mukta_Mahee']"
                      >
                        Buy Tickets
                      </Link>
                    </div>
                  ) : (
                    sortedDates.map((date) => {
                      const group = groupedTickets[date];
                      return (
                        <div key={date} className="mb-8">
                          <h4 className="text-xl font-bold mb-4">{date}</h4>
                          {/* Display regular tickets for this date */}
                          {group.regular.map((ticket) => (
                            <div
                              key={ticket.TicketID}
                              className="border border-gray-200 rounded-md p-4 mb-2"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-gray-800 font-['Mukta_Mahee']">
                                    {ticket.TicketType} Ticket
                                  </p>
                                  <p className="text-sm text-gray-600 font-['Lora']">
                                    Valid: {formatDate(ticket.StartDate)}
                                  </p>
                                  <p className="text-sm text-gray-600 font-['Lora']">
                                    Price: $
                                    {parseFloat(ticket.Price).toFixed(2)}
                                  </p>
                                  <p className="text-sm text-gray-600 font-['Lora']">
                                    Add-on: {ticket.addons}
                                  </p>
                                </div>
                                <div>
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                      ticket.Used
                                        ? "bg-gray-100 text-gray-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {ticket.Used ? "Used" : "Valid"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {/* Display add-on tickets for this date */}
                          {group.addons.map((addon) => (
                            <div
                              key={addon.TicketID}
                              className="border border-gray-200 rounded-md p-4 mb-2 ml-4"
                            >
                              {/* Addon content */}
                            </div>
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
