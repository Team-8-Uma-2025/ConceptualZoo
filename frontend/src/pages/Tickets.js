// src/pages/Tickets.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Tickets = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [visitDate, setVisitDate] = useState("");
  const [tickets, setTickets] = useState({
    adult: 0,
    child: 0,
    senior: 0,
  });
  const [addons, setAddons] = useState({
    feeding: false,
    guidedTour: false,
    animalEncounter: false,
    parking: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const ticketPrices = {
    adult: 24.99,
    child: 16.99,
    senior: 19.99,
    feeding: 5.99,
    guidedTour: 12.99,
    animalEncounter: 25.99,
    parking: 15.0,
  };

  // Early check: if the current user is a Manager or Staff, show an access-denied message.
  if (currentUser && (currentUser.role === "Manager" || currentUser.role === "Staff")) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h1 className="text-3xl font-bold text-gray-800">Access Denied</h1>
          <p className="mt-4 text-gray-600">
            Managers and Staff are not permitted to purchase tickets.
            Please log in with a visitor account.
          </p>
        </div>
      </div>
    );
  }

  const handleTicketChange = (type, value) => {
    if (value < 0) value = 0;
    setTickets({
      ...tickets,
      [type]: value,
    });
  };

  const handleAddonToggle = (type) => {
    setAddons({
      ...addons,
      [type]: !addons[type],
    });
  };

  const getTotalPrice = () => {
    let total = 0;
    total += tickets.adult * ticketPrices.adult;
    total += tickets.child * ticketPrices.child;
    total += tickets.senior * ticketPrices.senior;

    if (addons.feeding) total += ticketPrices.feeding;
    if (addons.guidedTour) total += ticketPrices.guidedTour;
    if (addons.animalEncounter) total += ticketPrices.animalEncounter;
    if (addons.parking) total += ticketPrices.parking;

    return total.toFixed(2);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleCheckout = async () => {
    // Check if the selected visit date is in the past
    const selectedDate = new Date(visitDate + "T00:00:00Z");
    const today = new Date(new Date().toISOString().split("T")[0] + "T00:00:00Z");

    if (selectedDate < today) {
      setErrorMessage("You cannot purchase tickets for a past date. Please select today's date or a future date.");
      return;
    }

    if (!currentUser) {
      navigate("/login");
      return;
    }

    // If no tickets selected, show error
    if (tickets.adult + tickets.child + tickets.senior === 0) {
      setErrorMessage("Please select at least one ticket");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Format the date properly - ISO format for consistency
      const formattedVisitDate = new Date(visitDate).toISOString().split("T")[0];

      // Purchase tickets
      const response = await axios.post(
        "/api/tickets/purchase",
        {
          tickets,
          addons,
          visitDate: formattedVisitDate,
        },
        { headers: getAuthHeader() }
      );
      console.log("Purchase response:", response.data);

      // Navigate to profile page or success page
      navigate("/profile", {
        state: {
          purchaseSuccess: true,
          message: "Your tickets were purchased successfully!",
        },
      });
    } catch (err) {
      console.error("Error purchasing tickets:", err.response?.data || err.message);
      setErrorMessage(
        err.response?.data?.error ||
          "Failed to purchase tickets. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Page Header */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="/background/tree_bg.webp"
          alt="Buy Tickets Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">
            Buy Tickets
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 font-['Roboto_Flex']">
            Select Your Tickets
          </h2>

          <div className="mb-8">
            <label className="block text-lg font-semibold mb-2 text-gray-700 font-['Mukta_Mahee']">
              Select Visit Date
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 font-['Mukta_Mahee']">
              Ticket Types
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    Adult (13-64)
                  </h4>
                  <p className="text-gray-600 font-['Lora']">
                    ${ticketPrices.adult.toFixed(2)} per ticket
                  </p>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-l-lg text-xl"
                    onClick={() =>
                      handleTicketChange("adult", tickets.adult - 1)
                    }
                  >
                    -
                  </button>
                  <span className="bg-white px-6 py-1 border-t border-b border-gray-200 text-center">
                    {tickets.adult}
                  </span>
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-r-lg text-xl"
                    onClick={() =>
                      handleTicketChange("adult", tickets.adult + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    Child (3-12)
                  </h4>
                  <p className="text-gray-600 font-['Lora']">
                    ${ticketPrices.child.toFixed(2)} per ticket
                  </p>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-l-lg text-xl"
                    onClick={() =>
                      handleTicketChange("child", tickets.child - 1)
                    }
                  >
                    -
                  </button>
                  <span className="bg-white px-6 py-1 border-t border-b border-gray-200 text-center">
                    {tickets.child}
                  </span>
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-r-lg text-xl"
                    onClick={() =>
                      handleTicketChange("child", tickets.child + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    Senior (65+)
                  </h4>
                  <p className="text-gray-600 font-['Lora']">
                    ${ticketPrices.senior.toFixed(2)} per ticket
                  </p>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-l-lg text-xl"
                    onClick={() =>
                      handleTicketChange("senior", tickets.senior - 1)
                    }
                  >
                    -
                  </button>
                  <span className="bg-white px-6 py-1 border-t border-b border-gray-200 text-center">
                    {tickets.senior}
                  </span>
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-r-lg text-xl"
                    onClick={() =>
                      handleTicketChange("senior", tickets.senior + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 font-['Mukta_Mahee']">
              Add-ons
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    Animal Feeding Experience
                  </h4>
                  <p className="text-gray-600 font-['Lora']">
                    ${ticketPrices.feeding.toFixed(2)}
                  </p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="feeding"
                    checked={addons.feeding}
                    onChange={() => handleAddonToggle("feeding")}
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    Guided Zoo Tour
                  </h4>
                  <p className="text-gray-600 font-['Lora']">
                    ${ticketPrices.guidedTour.toFixed(2)}
                  </p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="guidedTour"
                    checked={addons.guidedTour}
                    onChange={() => handleAddonToggle("guidedTour")}
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    Animal Encounter
                  </h4>
                  <p className="text-gray-600 font-['Lora']">
                    ${ticketPrices.animalEncounter.toFixed(2)}
                  </p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="animalEncounter"
                    checked={addons.animalEncounter}
                    onChange={() => handleAddonToggle("animalEncounter")}
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    Parking Pass
                  </h4>
                  <p className="text-gray-600 font-['Lora']">
                    ${ticketPrices.parking.toFixed(2)}
                  </p>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="parking"
                    checked={addons.parking}
                    onChange={() => handleAddonToggle("parking")}
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold text-gray-800 font-['Mukta_Mahee']">
                Total:
              </span>
              <span className="text-2xl font-bold text-green-700 font-['Roboto_Flex']">
                ${getTotalPrice()}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg w-full transition duration-300 text-lg font-['Mukta_Mahee']"
              disabled={
                !visitDate ||
                tickets.adult + tickets.child + tickets.senior === 0 ||
                isProcessing
              }
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
