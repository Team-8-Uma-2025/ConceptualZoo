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
  Download,
  PieChart,
  BarChart,
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
  const [timeGrouping, setTimeGrouping] = useState("daily"); // "daily", "weekly", "monthly"
  const [profitMargin, setProfitMargin] = useState(30); // Default profit margin percentage
  const [showProfitColumn, setShowProfitColumn] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

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

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
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

    // Apply client-side filtering if needed
    // Filter by minimum revenue (redundant if server already did this, but kept for flexibility)
    if (minimumRevenue && !isNaN(parseFloat(minimumRevenue))) {
      const minAmount = parseFloat(minimumRevenue);
      filtered = filtered.filter(
        (item) => parseFloat(item.TotalRevenue) >= minAmount
      );
    }

    // Apply client-side category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((item) => item.Category === categoryFilter);
    }

    // Apply client-side product name filter
    if (productNameFilter) {
      filtered = filtered.filter((item) =>
        item.ProductName.toLowerCase().includes(productNameFilter.toLowerCase())
      );
    }

    // Apply client-side shop filter
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

  const handleSort = (key) => {
    // If clicking the same key, toggle direction
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    setSortConfig({ key, direction });

    // Re-apply filters with new sort config
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
    if (revenueData.totals && typeof revenueData.totals.revenue === "number") {
      return revenueData.totals.revenue.toFixed(2);
    }

    return (
      filteredData.summary
        ?.reduce((total, item) => total + Number(item.TotalRevenue), 0)
        .toFixed(2) || "0.00"
    );
  };

  const calculateEstimatedProfit = (revenue) => {
    return ((Number(revenue) * profitMargin) / 100).toFixed(2);
  };

  const handleExport = () => {
    if (filteredData.details.length === 0) {
      alert("No data to export");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    // Headers
    const headers = [
      "Date",
      "Gift Shop",
      "Product",
      "Category",
      "Quantity",
      "Unit Price",
      "Revenue",
    ];
    if (showProfitColumn) headers.push("Est. Profit");

    csvContent += headers.join(",") + "\n";

    // Data rows
    filteredData.details.forEach((item) => {
      const unitPrice = item.UnitPrice
        ? Number(item.UnitPrice).toFixed(2)
        : (Number(item.TotalRevenue) / Number(item.Quantity)).toFixed(2);

      const row = [
        new Date(item.Date).toLocaleDateString(),
        item.GiftShopName,
        `"${item.ProductName.replace(/"/g, '""')}"`, // Escape quotes in CSV
        item.Category || "Uncategorized",
        item.Quantity,
        unitPrice,
        Number(item.TotalRevenue).toFixed(2),
      ];

      if (showProfitColumn) {
        row.push(calculateEstimatedProfit(item.TotalRevenue));
      }

      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `gift_shop_revenue_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Filter Controls with improved UI */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold font-['Mukta_Mahee'] flex items-center">
            <Filter size={20} className="mr-2 text-green-700" />
            Gift Shop Revenue Report
          </h3>
          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center text-sm"
            >
              <RefreshCw size={14} className="mr-1" />
              Reset
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center text-sm"
              >
                <Download size={14} className="mr-1" />
                Export
              </button>
              {showExportOptions && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Options
                    </label>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="profit-column"
                        checked={showProfitColumn}
                        onChange={() => setShowProfitColumn(!showProfitColumn)}
                        className="mr-2"
                      />
                      <label htmlFor="profit-column" className="text-sm">
                        Include profit estimate
                      </label>
                    </div>
                    {showProfitColumn && (
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">
                          Profit Margin %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={profitMargin}
                          onChange={(e) =>
                            setProfitMargin(Number(e.target.value))
                          }
                          className="w-full p-1 text-sm border rounded"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleExport}
                      className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Date Range with improved calendar icons */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex flex-row gap-2">
              <div className="relative flex-1">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="pl-10 border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Start Date"
                />
              </div>
              <span className="self-center text-gray-500">to</span>
              <div className="relative flex-1">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="pl-10 border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Time Grouping selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Grouping
            </label>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-md">
              {["daily", "weekly", "monthly"].map((option) => (
                <button
                  key={option}
                  onClick={() => setTimeGrouping(option)}
                  className={`flex-1 px-2 py-1 text-sm rounded ${
                    timeGrouping === option
                      ? "bg-white shadow-sm font-medium"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
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

          {/* Rest of the filters with consistent styling */}
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
        </div>

        <button
          onClick={generateReport}
          className="w-full px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
        >
          <Filter size={16} className="mr-2" />
          Generate Report
        </button>
      </div>

      {showReport ? (
        <>
          {/* Report View Toggle with improved UI */}
          <div className="flex mb-4 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <button
              className={`flex-1 py-3 flex items-center justify-center transition-colors ${
                activeView === "summary"
                  ? "bg-green-50 text-green-700 font-semibold border-b-2 border-green-700"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("summary")}
            >
              <PieChart size={18} className="mr-2" />
              Summary View
            </button>
            <button
              className={`flex-1 py-3 flex items-center justify-center transition-colors ${
                activeView === "details"
                  ? "bg-green-50 text-green-700 font-semibold border-b-2 border-green-700"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("details")}
            >
              <BarChart size={18} className="mr-2" />
              Detailed View
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8 bg-white p-6 rounded-lg shadow-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-4 shadow-md">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          ) : activeView === "summary" ? (
            <>
              {/* Revenue Summary Section with enhanced visuals */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-700 font-['Mukta_Mahee'] mb-2 md:mb-0">
                    Revenue Summary
                  </h3>

                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-bold text-green-700 font-['Roboto_Flex']">
                      <DollarSign size={28} className="inline mb-1" />
                      {calculateTotalRevenue()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {revenueData.totals?.quantity ||
                        filteredData.details.reduce(
                          (sum, item) => sum + Number(item.Quantity),
                          0
                        )}{" "}
                      items sold
                    </span>
                  </div>
                </div>

                {/* Enhanced Category Summary Cards */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredData.summary?.length > 0 ? (
                    filteredData.summary.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <h4 className="text-lg font-medium text-gray-800 font-['Mukta_Mahee'] mb-3">
                          {item.Category || "Uncategorized"}
                        </h4>
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-gray-600 font-['Lora']">
                            Quantity:
                          </span>
                          <span className="font-semibold">
                            {item.TotalQuantity}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1 text-sm">
                          <span className="text-gray-600 font-['Lora']">
                            Revenue:
                          </span>
                          <span className="font-semibold">
                            ${Number(item.TotalRevenue).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="bg-green-500 h-full"
                              style={{
                                width: `${
                                  (item.TotalRevenue /
                                    calculateTotalRevenue()) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-right mt-1 text-gray-500">
                            {(
                              (Number(item.TotalRevenue) /
                                Number(calculateTotalRevenue())) *
                              100
                            ).toFixed(1)}
                            % of total
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6 text-gray-500">
                      No data available for the selected filters.
                    </div>
                  )}
                </div>

                {/* Top Selling Products Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-700 font-['Mukta_Mahee'] mb-4 border-b pb-2">
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
                          {filteredData.topProducts.map((product, index) => (
                            <tr key={index}>
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
            /* Detailed Report Section with Unit Price Column */
            <div className="bg-white p-6 rounded-lg shadow-md">
              <>
                <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee'] flex justify-between">
                  <span>
                    Detailed Revenue Report
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredData.details?.length || 0} records)
                    </span>
                  </span>
                </h3>

                {!filteredData.details || filteredData.details.length === 0 ? (
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("TotalRevenue")}
                          >
                            Revenue{" "}
                            {sortConfig.key === "TotalRevenue" &&
                              (sortConfig.direction === "asc" ? "↑" : "↓")}
                          </th>
                          {showProfitColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Est. Profit ({profitMargin}%)
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.details.map((item, index) => {
                          const unitPrice = item.UnitPrice
                            ? Number(item.UnitPrice).toFixed(2)
                            : (
                                Number(item.TotalRevenue) /
                                Number(item.Quantity)
                              ).toFixed(2);
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.Quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {unitPrice}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${Number(item.TotalRevenue).toFixed(2)}
                              </td>
                              {showProfitColumn && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${calculateEstimatedProfit(item.TotalRevenue)}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default GiftShopRevenueReport;
