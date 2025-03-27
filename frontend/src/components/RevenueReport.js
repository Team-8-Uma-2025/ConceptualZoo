import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, DollarSign, Filter } from "lucide-react";

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({ details: [], summary: [] });
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await axios.get(
        `/api/tickets/revenue?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setRevenueData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch revenue data:", err);
      setError("Failed to load revenue data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalRevenue = () => {
    return (
      revenueData.summary
        ?.reduce((total, item) => total + Number(item.TotalRevenue), 0)
        .toFixed(2) || "0.00"
    );
  };

  // Group by date for better display
  const groupedByDate =
    revenueData.details?.reduce((acc, item) => {
      if (!acc[item.Date]) {
        acc[item.Date] = [];
      }
      acc[item.Date].push(item);
      return acc;
    }, {}) || {};

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center">
          <Calendar size={18} className="mr-2 text-gray-500" />
          <span className="font-['Mukta_Mahee'] mr-2">Date Range:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <span className="self-center">to</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-700 font-['Mukta_Mahee']">
            Revenue Summary
          </h3>
          <div className="text-2xl font-bold text-green-700 font-['Roboto_Flex']">
            <DollarSign size={24} className="inline" />
            {calculateTotalRevenue()}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {revenueData.summary?.map((item) => (
            <div
              key={item.PurchaseType}
              className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500"
            >
              <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                {item.PurchaseType}
              </h4>
              <div className="flex justify-between mt-2">
                <span className="text-gray-600 font-['Lora']">Quantity:</span>
                <span className="font-semibold">{item.TotalQuantity}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-600 font-['Lora']">Revenue:</span>
                <span className="font-semibold">
                  ${Number(item.TotalRevenue).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Report Section */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(groupedByDate)
                .sort((a, b) => new Date(b) - new Date(a))
                .map((date) => (
                  <React.Fragment key={date}>
                    {groupedByDate[date].map((item, idx) => (
                      <tr
                        key={`${date}-${item.PurchaseType}-${item.ItemName}`}
                        className={
                          idx === 0 ? "border-t-2 border-gray-300" : ""
                        }
                      >
                        {idx === 0 ? (
                          <td
                            rowSpan={groupedByDate[date].length}
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top"
                          >
                            {new Date(date).toLocaleDateString()}
                          </td>
                        ) : null}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.PurchaseType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.ItemName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.Quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${Number(item.TotalRevenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RevenueReport;
