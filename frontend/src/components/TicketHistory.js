import React, { useState, useEffect } from "react";
import { Ticket, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TicketHistory = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/tickets/visitor/${currentUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        const data = await response.json();

        // Handle the response with fallbacks
        const regularTickets = data?.regularTickets || [];
        const addonTickets = data?.addonTickets || [];

        setTickets(regularTickets);
        setAddons(addonTickets);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Unable to load your ticket history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [currentUser]);

  const toggleDate = (date) => {
    if (expandedDate === date) {
      setExpandedDate(null);
    } else {
      setExpandedDate(date);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group tickets by date
  const groupTicketsByDate = () => {
    const grouped = {};

    // Group regular tickets
    tickets.forEach((ticket) => {
      const dateKey = formatDate(ticket.StartDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: new Date(ticket.StartDate),
          tickets: [],
        };
      }
      grouped[dateKey].tickets.push({
        ...ticket,
        type: "regular",
      });
    });

    // Add addons to their respective dates
    addons.forEach((addon) => {
      const dateKey = formatDate(addon.StartDate);
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: new Date(addon.StartDate),
          tickets: [],
        };
      }
      grouped[dateKey].tickets.push({
        ...addon,
        type: "addon",
      });
    });

    // Convert to array and sort by date (newest first)
    return Object.entries(grouped)
      .map(([dateKey, data]) => ({
        dateKey,
        ...data,
      }))
      .sort((a, b) => b.date - a.date);
  };

  const groupedDates = groupTicketsByDate();

  // Format price to always show 2 decimal places
  const formatPrice = (price) => {
    if (!price) return "0.00";
    return Number(price).toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 font-['Mukta_Mahee'] flex items-center">
          <Ticket size={20} className="mr-2" />
          Your Tickets
        </h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 font-['Mukta_Mahee'] flex items-center">
          <Ticket size={20} className="mr-2" />
          Your Tickets
        </h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 font-['Mukta_Mahee'] flex items-center">
        <Ticket size={20} className="mr-2" />
        Your Tickets
      </h3>

      {groupedDates.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4 font-['Lora']">
            You haven't purchased any tickets yet.
          </p>
          <a
            href="/tickets"
            className="text-green-700 hover:text-green-600 underline font-['Mukta_Mahee']"
          >
            Buy Tickets
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedDates.map((dateGroup) => (
            <div
              key={dateGroup.dateKey}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleDate(dateGroup.dateKey)}
              >
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-500 mr-2" />
                  <span className="font-medium text-gray-800">
                    {dateGroup.dateKey}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full mr-3">
                    {dateGroup.tickets.length}{" "}
                    {dateGroup.tickets.length === 1 ? "Ticket" : "Tickets"}
                  </span>
                  {expandedDate === dateGroup.dateKey ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div>

              {expandedDate === dateGroup.dateKey && (
                <div className="p-4 border-t border-gray-200 divide-y divide-gray-100">
                  {dateGroup.tickets.map((ticket, index) => (
                    <div key={index} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800 font-['Mukta_Mahee']">
                            {ticket.type === "regular"
                              ? `${ticket.TicketType} Ticket`
                              : `Add-on: ${ticket.Description}`}
                          </div>
                          <div className="text-sm text-gray-600 font-['Lora']">
                            Price: ${formatPrice(ticket.Price)}
                          </div>
                          {ticket.addons && ticket.addons !== "None" && (
                            <div className="text-sm text-gray-600 font-['Lora']">
                              Includes: {ticket.addons}
                            </div>
                          )}
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketHistory;
