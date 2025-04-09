import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  DollarSign,
  Filter,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({ details: [], summary: [] });
  const [filteredData, setFilteredData] = useState({
    details: [],
    summary: [],
  });
  const [error, setError] = useState(null);

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState("All");
  const [itemNameFilter, setItemNameFilter] = useState("");
  const [minimumAmount, setMinimumAmount] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "Date",
    direction: "desc",
  });
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (showReport) {
      fetchRevenueData();
    }
  }, [showReport]);

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
      applyFilters(response.data);
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

  const applyFilters = (data = revenueData) => {
    let filtered = [...data.details];

    // Filter by purchase type
    if (purchaseTypeFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.PurchaseType === purchaseTypeFilter
      );
    }

    // Filter by item name (case insensitive)
    if (itemNameFilter) {
      filtered = filtered.filter((item) =>
        item.ItemName.toLowerCase().includes(itemNameFilter.toLowerCase())
      );
    }

    // Filter by minimum amount
    if (minimumAmount && !isNaN(parseFloat(minimumAmount))) {
      const minAmount = parseFloat(minimumAmount);
      filtered = filtered.filter(
        (item) => parseFloat(item.TotalRevenue) >= minAmount
      );
    }

    // Sort the data
    filtered.sort((a, b) => {
      if (sortConfig.key === "Date") {
        // Date sorting
        const dateA = new Date(a.Date);
        const dateB = new Date(b.Date);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === "TotalRevenue") {
        // Numeric sorting for revenue
        return sortConfig.direction === "asc"
          ? parseFloat(a.TotalRevenue) - parseFloat(b.TotalRevenue)
          : parseFloat(b.TotalRevenue) - parseFloat(a.TotalRevenue);
      } else if (sortConfig.key === "Quantity") {
        // Numeric sorting for quantity
        return sortConfig.direction === "asc"
          ? a.Quantity - b.Quantity
          : b.Quantity - a.Quantity;
      } else {
        // String sorting for other fields
        const valueA = a[sortConfig.key]?.toString().toLowerCase() || "";
        const valueB = b[sortConfig.key]?.toString().toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    // Recalculate summary based on filtered data
    const summary = calculateSummary(filtered);

    setFilteredData({
      details: filtered,
      summary: summary,
    });
  };

  const calculateSummary = (details) => {
    // Group by purchase type and calculate totals
    const summaryMap = details.reduce((acc, item) => {
      const key = item.PurchaseType;
      if (!acc[key]) {
        acc[key] = {
          PurchaseType: key,
          TotalQuantity: 0,
          TotalRevenue: 0,
        };
      }

      acc[key].TotalQuantity += parseInt(item.Quantity);
      acc[key].TotalRevenue += parseFloat(item.TotalRevenue);

      return acc;
    }, {});

    return Object.values(summaryMap);
  };

  const handleSort = (key) => {
    // If clicking the same key, toggle direction
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    setSortConfig({ key, direction });

    // Re-apply filters with new sort config
    const newSortConfig = { key, direction };
    let filtered = [...filteredData.details];

    filtered.sort((a, b) => {
      if (key === "Date") {
        const dateA = new Date(a.Date);
        const dateB = new Date(b.Date);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      } else if (key === "TotalRevenue") {
        return direction === "asc"
          ? parseFloat(a.TotalRevenue) - parseFloat(b.TotalRevenue)
          : parseFloat(b.TotalRevenue) - parseFloat(a.TotalRevenue);
      } else if (key === "Quantity") {
        return direction === "asc"
          ? a.Quantity - b.Quantity
          : b.Quantity - a.Quantity;
      } else {
        const valueA = a[key]?.toString().toLowerCase() || "";
        const valueB = b[key]?.toString().toLowerCase() || "";
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    setFilteredData({
      ...filteredData,
      details: filtered,
    });
  };

  const resetFilters = () => {
    setPurchaseTypeFilter("All");
    setItemNameFilter("");
    setMinimumAmount("");
    setSortConfig({
      key: "Date",
      direction: "desc",
    });

    if (revenueData.details) {
      applyFilters(revenueData);
    }
  };

  const generateReport = () => {
    setShowReport(true);
  };

  // Download CSV functionality removed

  const calculateTotalRevenue = () => {
    return (
      filteredData.summary
        ?.reduce((total, item) => total + Number(item.TotalRevenue), 0)
        .toFixed(2) || "0.00"
    );
  };

  // Get unique purchase types for filter dropdown
  const getUniquePurchaseTypes = () => {
    if (!revenueData.details || revenueData.details.length === 0) return [];

    const types = new Set(revenueData.details.map((item) => item.PurchaseType));
    return ["All", ...Array.from(types)];
  };

  // Get unique item names for filter dropdown
  const getUniqueItemNames = () => {
    if (!revenueData.details || revenueData.details.length === 0) return [];

    return [...new Set(revenueData.details.map((item) => item.ItemName))];
  };

  // Group by date for better display
  const groupedByDate =
    filteredData.details?.reduce((acc, item) => {
      if (!acc[item.Date]) {
        acc[item.Date] = [];
      }
      acc[item.Date].push(item);
      return acc;
    }, {}) || {};

  return (
    <div>
      {/* Filter Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee'] flex items-center">
          <Filter size={20} className="mr-2 text-gray-500" />
          Revenue Report Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="border border-gray-300 rounded px-3 py-2 flex-1"
                placeholder="Start Date"
              />
              <span className="self-center">to</span>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="border border-gray-300 rounded px-3 py-2 flex-1"
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Purchase Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Type
            </label>
            <select
              value={purchaseTypeFilter}
              onChange={(e) => setPurchaseTypeFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              {getUniquePurchaseTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={itemNameFilter}
              onChange={(e) => setItemNameFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              list="itemNameOptions"
              placeholder="Filter by item name"
            />
            <datalist id="itemNameOptions">
              {getUniqueItemNames().map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          {/* Minimum Amount Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Revenue ($)
            </label>
            <input
              type="number"
              value={minimumAmount}
              onChange={(e) => setMinimumAmount(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholder="Min revenue amount"
              min="0"
              step="0.01"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex">
              <select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="border border-gray-300 rounded-l px-3 py-2 flex-1"
              >
                <option value="Date">Date</option>
                <option value="PurchaseType">Purchase Type</option>
                <option value="ItemName">Item Name</option>
                <option value="Quantity">Quantity</option>
                <option value="TotalRevenue">Revenue</option>
              </select>
              <button
                onClick={() => handleSort(sortConfig.key)}
                className="bg-gray-100 border border-l-0 border-gray-300 rounded-r px-3 flex items-center"
                title={
                  sortConfig.direction === "asc"
                    ? "Sort Descending"
                    : "Sort Ascending"
                }
              >
                <ArrowUpDown
                  size={16}
                  className={
                    sortConfig.direction === "asc" ? "transform rotate-180" : ""
                  }
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Reset Filters
          </button>

          <button
            onClick={generateReport}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {showReport ? (
        <>
          {/* Summary Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700 font-['Mukta_Mahee']">
                Revenue Summary
              </h3>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-green-700 font-['Roboto_Flex']">
                  <DollarSign size={24} className="inline" />
                  {calculateTotalRevenue()}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredData.summary?.map((item) => (
                <div
                  key={item.PurchaseType}
                  className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500"
                >
                  <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                    {item.PurchaseType}
                  </h4>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600 font-['Lora']">
                      Quantity:
                    </span>
                    <span className="font-semibold">{item.TotalQuantity}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600 font-['Lora']">
                      Revenue:
                    </span>
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee']">
                Detailed Revenue Report
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredData.details.length} records)
                </span>
              </h3>

              {filteredData.details.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No records found matching your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("Date")}
                        >
                          Date{" "}
                          {sortConfig.key === "Date" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("PurchaseType")}
                        >
                          Type{" "}
                          {sortConfig.key === "PurchaseType" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("ItemName")}
                        >
                          Item{" "}
                          {sortConfig.key === "ItemName" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("Quantity")}
                        >
                          Quantity{" "}
                          {sortConfig.key === "Quantity" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("TotalRevenue")}
                        >
                          Revenue{" "}
                          {sortConfig.key === "TotalRevenue" &&
                            (sortConfig.direction === "asc" ? "↑" : "↓")}
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
          )}
        </>
      ) : (
        <div className="bg-gray-50 p-12 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 flex items-center mx-auto"
          >
            <Filter size={16} className="mr-2" />
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
};

export default RevenueReport;
