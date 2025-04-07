import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  DollarSign,
  Filter,
  ArrowUpDown,
  RefreshCw,
  BarChart2,
  ShoppingBag,
} from "lucide-react";

const GiftShopRevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    details: [],
    summary: [],
    topProducts: [],
    metadata: {
      giftShops: [],
      categories: [],
      productNames: [],
    },
    totals: {
      revenue: 0,
      quantity: 0,
    },
  });
  const [filteredData, setFilteredData] = useState({
    details: [],
    summary: [],
    topProducts: [],
  });
  const [error, setError] = useState(null);

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [giftShopFilter, setGiftShopFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [productNameFilter, setProductNameFilter] = useState("");
  const [minimumRevenue, setMinimumRevenue] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "Date",
    direction: "desc",
  });
  const [showReport, setShowReport] = useState(false);
  const [activeView, setActiveView] = useState("summary"); // "summary" or "details"

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
      if (giftShopFilter) params.append("giftShopId", giftShopFilter);
      if (categoryFilter !== "All") params.append("category", categoryFilter);
      if (productNameFilter) params.append("productName", productNameFilter);
      if (minimumRevenue) params.append("minRevenue", minimumRevenue);

      // Add sorting parameters
      params.append("sortBy", sortConfig.key);
      params.append("sortDirection", sortConfig.direction);

      const response = await axios.get(
        `/api/shop/revenue?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setRevenueData(response.data);
      applyFilters(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch gift shop revenue data:", err);
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
    let topProducts = [...(data.topProducts || [])];

    // Apply client-side filtering if needed
    // Filter by minimum revenue (redundant if server already did this, but kept for flexibility)
    if (minimumRevenue && !isNaN(parseFloat(minimumRevenue))) {
      const minAmount = parseFloat(minimumRevenue);
      filtered = filtered.filter(
        (item) => parseFloat(item.TotalRevenue) >= minAmount
      );
    }

    // Sort the data
    filtered.sort((a, b) => {
      if (sortConfig.key === "Date") {
        const dateA = new Date(a.Date);
        const dateB = new Date(b.Date);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === "TotalRevenue") {
        return sortConfig.direction === "asc"
          ? parseFloat(a.TotalRevenue) - parseFloat(b.TotalRevenue)
          : parseFloat(b.TotalRevenue) - parseFloat(a.TotalRevenue);
      } else if (sortConfig.key === "Quantity") {
        return sortConfig.direction === "asc"
          ? a.Quantity - b.Quantity
          : b.Quantity - a.Quantity;
      } else {
        const valueA = a[sortConfig.key]?.toString().toLowerCase() || "";
        const valueB = b[sortConfig.key]?.toString().toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    // Calculate summary based on filtered data
    const summary = calculateSummary(filtered);

    setFilteredData({
      details: filtered,
      summary: summary,
      topProducts: topProducts,
    });
  };

  const calculateSummary = (details) => {
    // Group by category and calculate totals
    const summaryMap = details.reduce((acc, item) => {
      const key = item.Category || "Uncategorized";
      if (!acc[key]) {
        acc[key] = {
          Category: key,
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
    setDateRange({ startDate: "", endDate: "" });
    setGiftShopFilter("");
    setCategoryFilter("All");
    setProductNameFilter("");
    setMinimumRevenue("");
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

  const calculateTotalRevenue = () => {
    return (
      revenueData.totals?.revenue?.toFixed(2) ||
      filteredData.summary
        ?.reduce((total, item) => total + Number(item.TotalRevenue), 0)
        .toFixed(2) ||
      "0.00"
    );
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
          Gift Shop Revenue Report Filters
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

          {/* Gift Shop Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gift Shop
            </label>
            <select
              value={giftShopFilter}
              onChange={(e) => setGiftShopFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="">All Gift Shops</option>
              {revenueData.metadata?.giftShops?.map((shop) => (
                <option key={shop.GiftShopID} value={shop.GiftShopID}>
                  {shop.GiftShopName}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="All">All Categories</option>
              {revenueData.metadata?.categories?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={productNameFilter}
              onChange={(e) => setProductNameFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
              list="productNameOptions"
              placeholder="Filter by product name"
            />
            <datalist id="productNameOptions">
              {revenueData.metadata?.productNames?.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          {/* Minimum Revenue Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Revenue ($)
            </label>
            <input
              type="number"
              value={minimumRevenue}
              onChange={(e) => setMinimumRevenue(e.target.value)}
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
                <option value="GiftShopName">Gift Shop</option>
                <option value="ProductName">Product Name</option>
                <option value="Category">Category</option>
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
          {/* Report View Toggle */}
          <div className="flex mb-4 bg-white rounded-lg shadow overflow-hidden">
            <button
              className={`flex-1 py-3 flex items-center justify-center ${
                activeView === "summary"
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("summary")}
            >
              <BarChart2 size={18} className="mr-2" />
              Summary View
            </button>
            <button
              className={`flex-1 py-3 flex items-center justify-center ${
                activeView === "details"
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("details")}
            >
              <ShoppingBag size={18} className="mr-2" />
              Detailed View
            </button>
          </div>

          {activeView === "summary" ? (
            <>
              {/* Revenue Summary Section */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700 font-['Mukta_Mahee']">
                    Revenue Summary
                  </h3>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-700 font-['Roboto_Flex']">
                      <DollarSign size={24} className="inline" />
                      {calculateTotalRevenue()}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({revenueData.totals?.quantity || 0} items sold)
                    </span>
                  </div>
                </div>

                {/* Category Summary Cards */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredData.summary?.map((item) => (
                    <div
                      key={item.Category}
                      className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500"
                    >
                      <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee']">
                        {item.Category}
                      </h4>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-600 font-['Lora']">
                          Quantity:
                        </span>
                        <span className="font-semibold">
                          {item.TotalQuantity}
                        </span>
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

                {/* Top Selling Products Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-700 font-['Mukta_Mahee'] mb-4">
                    Top Selling Products
                  </h3>

                  {filteredData.topProducts?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity Sold
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Revenue
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredData.topProducts.map((product) => (
                            <tr key={product.ProductName}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.ProductName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.Category || "Uncategorized"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.TotalSold}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${Number(product.TotalRevenue).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No top selling products data available.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Detailed Report Section */
            <div className="bg-white p-6 rounded-lg shadow-md">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              ) : (
                <>
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
                              onClick={() => handleSort("GiftShopName")}
                            >
                              Gift Shop{" "}
                              {sortConfig.key === "GiftShopName" &&
                                (sortConfig.direction === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort("ProductName")}
                            >
                              Product{" "}
                              {sortConfig.key === "ProductName" &&
                                (sortConfig.direction === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort("Category")}
                            >
                              Category{" "}
                              {sortConfig.key === "Category" &&
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
                          {filteredData.details.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {new Date(item.Date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.GiftShopName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.ProductName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.Category || "Uncategorized"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.Quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${Number(item.TotalRevenue).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 p-12 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <h3 className="text-xl font-semibold mb-2 text-gray-700 font-['Mukta_Mahee']">
            Set your filters and generate the report
          </h3>
          <p className="text-gray-500 mb-4">
            Configure the date range and filters above, then click 'Generate
            Report' to view the results.
          </p>
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

export default GiftShopRevenueReport;
