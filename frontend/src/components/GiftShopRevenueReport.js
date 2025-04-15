import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [activeView, setActiveView] = useState("summary");

  useEffect(() => {
    if (showReport) {
      fetchRevenueData();
    }
  }, [showReport]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add filtering parameters
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

      // Handle the response data
      setRevenueData(response.data);
      applyFilters(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch gift shop revenue data:", err);
      setError(
        `Failed to load revenue data: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data = revenueData) => {
    if (!data.details || !data.summary || !data.topProducts) {
      // If we're missing data, just use what we have
      setFilteredData({
        details: data.details || [],
        summary: data.summary || [],
        topProducts: data.topProducts || [],
      });
      return;
    }

    let filtered = [...data.details];

    // Apply filters
    if (minimumRevenue && !isNaN(parseFloat(minimumRevenue))) {
      const minAmount = parseFloat(minimumRevenue);
      filtered = filtered.filter(
        (item) => parseFloat(item.TotalRevenue) >= minAmount
      );
    }

    if (categoryFilter !== "All") {
      filtered = filtered.filter((item) => item.Category === categoryFilter);
    }

    if (productNameFilter) {
      filtered = filtered.filter((item) =>
        item.ProductName.toLowerCase().includes(productNameFilter.toLowerCase())
      );
    }

    if (giftShopFilter) {
      filtered = filtered.filter(
        (item) => String(item.GiftShopID) === String(giftShopFilter)
      );
    }

    setFilteredData({
      details: filtered,
      summary: data.summary,
      topProducts: data.topProducts,
    });
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalRevenue = () => {
    return (
      filteredData.summary
        ?.reduce((total, item) => total + Number(item.TotalRevenue), 0)
        .toFixed(2) || "0.00"
    );
  };

  const generateReport = () => {
    setShowReport(true);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Filter Controls */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Gift Shop Revenue Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Reset Filters
          </button>
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Display */}
      {showReport && (
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div>
              {/* Total Revenue Summary */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Total Revenue</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-green-700">
                    ${calculateTotalRevenue()}
                  </span>
                </div>
              </div>

              {/* Revenue by Category */}
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Revenue by Category
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredData.summary.map((category, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <h4 className="font-semibold mb-2">
                        {category.Category || "Uncategorized"}
                      </h4>
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-bold text-green-700">
                          ${Number(category.TotalRevenue).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Quantity Sold:</span>
                        <span>{category.TotalQuantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Top Selling Products
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Product Name</th>
                      <th className="border p-2 text-left">Category</th>
                      <th className="border p-2 text-right">Quantity Sold</th>
                      <th className="border p-2 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2">{product.ProductName}</td>
                        <td className="border p-2">{product.Category}</td>
                        <td className="border p-2 text-right">
                          {product.TotalSold}
                        </td>
                        <td className="border p-2 text-right">
                          ${Number(product.TotalRevenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GiftShopRevenueReport;
