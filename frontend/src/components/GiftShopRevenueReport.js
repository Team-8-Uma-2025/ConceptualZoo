import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  DollarSign,
  Filter,
  ArrowUpDown,
  RefreshCw,
  BarChart2,
  ChevronDown,
  ChevronUp,
  PieChart,
  Store,
  ShoppingBag,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

const GiftShopRevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    details: [],
    summary: [],
    topProducts: [],
    metadata: { giftShops: [], categories: [], productNames: [] },
    totals: { revenue: 0, quantity: 0 },
  });
  const [filteredData, setFilteredData] = useState({
    details: [],
    summary: [],
    topProducts: [],
    metadata: { giftShops: [], categories: [], productNames: [] },
    totals: { revenue: 0, quantity: 0 },
  });
  const [error, setError] = useState(null);

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [giftShopFilter, setGiftShopFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productNameFilter, setProductNameFilter] = useState("");
  const [minimumAmount, setMinimumAmount] = useState("");
  const [maximumAmount, setMaximumAmount] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "Date",
    direction: "desc",
  });
  const [showReport, setShowReport] = useState(false);
  const [activeChart, setActiveChart] = useState("shop"); // shop, category, product
  const [expandedSection, setExpandedSection] = useState(null);
  const [profitMargin, setProfitMargin] = useState(30); // Default profit margin percentage
  const [showProfitColumn, setShowProfitColumn] = useState(false);

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FCBF49",
    "#F77F00",
    "#D62828",
    "#003049",
    "#606C38",
    "#283618",
    "#DDA15E",
    "#BC6C25",
    "#3D405B",
  ];

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
      if (categoryFilter) params.append("category", categoryFilter);
      if (productNameFilter) params.append("productName", productNameFilter);
      if (minimumAmount) params.append("minRevenue", minimumAmount);
      if (maximumAmount) params.append("maxRevenue", maximumAmount);
      if (sortConfig.key) params.append("sortBy", sortConfig.key);
      if (sortConfig.direction)
        params.append("sortDirection", sortConfig.direction);

      const response = await axios.get(
        `/api/shop/revenue?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Log the response data to understand its structure
      console.log("Revenue data response:", response.data);

      // Ensure data has the expected structure
      const processedData = {
        details: response.data.details || [],
        summary: response.data.summary || [],
        topProducts: response.data.topProducts || [],
        metadata: {
          giftShops: response.data.metadata?.giftShops || [],
          categories: response.data.metadata?.categories || [],
          productNames: response.data.metadata?.productNames || [],
        },
        totals: {
          revenue: response.data.totals?.revenue || 0,
          quantity: response.data.totals?.quantity || 0,
        },
      };

      setRevenueData(processedData);
      setFilteredData(processedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch revenue data:", err);
      setError(`Failed to load revenue data: ${err.message}`);
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

  const handleSort = (key) => {
    // If clicking the same key, toggle direction
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setDateRange({
      startDate: "",
      endDate: "",
    });
    setGiftShopFilter("");
    setCategoryFilter("");
    setProductNameFilter("");
    setMinimumAmount("");
    setMaximumAmount("");
    setSortConfig({
      key: "Date",
      direction: "desc",
    });
  };

  const generateReport = () => {
    if (showReport) {
      // If report is already showing, fetch new data with current filters
      fetchRevenueData();
      // Optional: Show loading state while fetching
      setLoading(true);
    } else {
      // First time showing report
      setShowReport(true);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate estimated profit based on revenue and profit margin
  const calculateEstimatedProfit = (revenue) => {
    if (!revenue) return "0.00";
    return ((Number(revenue) * profitMargin) / 100).toFixed(2);
  };

  // Prepare data for the charts - with additional safety checks
  const prepareChartData = () => {
    // Revenue by gift shop
    const shopData = [];
    const byShop = {};

    if (Array.isArray(filteredData.details)) {
      filteredData.details.forEach((item) => {
        if (!item) return;
        const shop = item.GiftShopName || "Unknown";
        if (!byShop[shop]) {
          byShop[shop] = {
            name: shop,
            revenue: 0,
            quantity: 0,
          };
        }
        byShop[shop].revenue += parseFloat(item.TotalRevenue || 0);
        byShop[shop].quantity += parseInt(item.Quantity || 0, 10);
      });
    }

    Object.values(byShop).forEach((shop) => {
      shopData.push(shop);
    });

    // Revenue by category
    const categoryData = [];
    const byCategory = {};

    if (Array.isArray(filteredData.details)) {
      filteredData.details.forEach((item) => {
        if (!item) return;
        const category = item.Category || "Uncategorized";
        if (!byCategory[category]) {
          byCategory[category] = {
            name: category,
            revenue: 0,
            quantity: 0,
          };
        }
        byCategory[category].revenue += parseFloat(item.TotalRevenue || 0);
        byCategory[category].quantity += parseInt(item.Quantity || 0, 10);
      });
    }

    Object.values(byCategory).forEach((category) => {
      categoryData.push(category);
    });

    // Top products - ensure array is available
    const productData = Array.isArray(filteredData.topProducts)
      ? filteredData.topProducts.map((product) => ({
          ...product,
          // Ensure all required properties exist
          ProductName: product.ProductName || "Unknown",
          TotalSold: product.TotalSold || 0,
          TotalRevenue: product.TotalRevenue || 0,
          Category: product.Category || "Uncategorized",
        }))
      : [];

    return {
      shopData,
      categoryData,
      productData,
    };
  };

  const chartData = prepareChartData();

  return (
    <div>
      {/* Filter Controls */}
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Date Range with improved calendar icons */}
          <div>
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

          {/* Gift Shop Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gift Shop
            </label>
            <div className="relative">
              <Store
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <select
                value={giftShopFilter}
                onChange={(e) => setGiftShopFilter(e.target.value)}
                className="pl-10 border border-gray-300 rounded px-3 py-2 w-full appearance-none"
              >
                <option value="">All Gift Shops</option>
                {revenueData.metadata?.giftShops?.map((shop) => (
                  <option key={shop.GiftShopID} value={shop.GiftShopID}>
                    {shop.GiftShopName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
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
              <option value="">All Categories</option>
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
              Revenue Range ($)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minimumAmount}
                onChange={(e) => setMinimumAmount(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                placeholder="Min"
                min="0"
                step="0.01"
              />
              <span>to</span>
              <input
                type="number"
                value={maximumAmount}
                onChange={(e) => setMaximumAmount(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
                placeholder="Max"
                min="0"
                step="0.01"
              />
            </div>
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

      {/* Error message shown if there's an error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showReport ? (
        loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <span className="ml-3 text-gray-600">Loading report data...</span>
          </div>
        ) : (
          <>
            {/* Overall Summary Box - Enhanced with better visual hierarchy */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 font-['Mukta_Mahee'] mb-3 md:mb-0">
                  Gift Shop Revenue Summary
                </h3>

                <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
                  <div className="text-3xl font-bold text-green-700 font-['Roboto_Flex'] flex items-center">
                    <DollarSign size={24} className="inline" />
                    {formatCurrency(filteredData.totals?.revenue || 0)}
                  </div>
                  <div className="text-green-600 text-sm mt-1 font-medium">
                    Total Revenue
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-lg font-medium text-gray-800 font-['Mukta_Mahee'] mb-2">
                    Total Units Sold
                  </div>
                  <div className="text-2xl font-semibold text-gray-700">
                    {filteredData.totals?.quantity || 0}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-lg font-medium text-gray-800 font-['Mukta_Mahee'] mb-2">
                    Avg Sale Value
                  </div>
                  <div className="text-2xl font-semibold text-gray-700">
                    {filteredData.totals?.quantity &&
                    filteredData.totals?.quantity > 0
                      ? formatCurrency(
                          filteredData.totals.revenue /
                            filteredData.totals.quantity
                        )
                      : "$0.00"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-lg font-medium text-gray-800 font-['Mukta_Mahee'] mb-2">
                    Shops Contributing
                  </div>
                  <div className="text-2xl font-semibold text-gray-700">
                    {chartData.shopData.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section - Only show if we have data */}
            {(chartData.shopData.length > 0 ||
              chartData.categoryData.length > 0 ||
              chartData.productData.length > 0) && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 font-['Mukta_Mahee']">
                    Revenue Visualization
                  </h3>

                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      className={`px-4 py-2 text-sm ${
                        activeChart === "shop"
                          ? "bg-green-700 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setActiveChart("shop")}
                    >
                      By Shop
                    </button>
                    <button
                      className={`px-4 py-2 text-sm ${
                        activeChart === "category"
                          ? "bg-green-700 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setActiveChart("category")}
                    >
                      By Category
                    </button>
                    <button
                      className={`px-4 py-2 text-sm ${
                        activeChart === "product"
                          ? "bg-green-700 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setActiveChart("product")}
                    >
                      Top Products
                    </button>
                  </div>
                </div>

                {/* The Chart */}
                <div className="h-96">
                  {activeChart === "shop" && chartData.shopData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                      <div className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData.shopData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 70,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={70}
                              interval={0}
                            />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              labelFormatter={(label) => `Gift Shop: ${label}`}
                            />
                            <Legend />
                            <Bar
                              dataKey="revenue"
                              name="Revenue"
                              fill="#0088FE"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={chartData.shopData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="revenue"
                              nameKey="name"
                            >
                              {chartData.shopData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {activeChart === "category" &&
                    chartData.categoryData.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <div className="h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData.categoryData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 70,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                interval={0}
                              />
                              <YAxis />
                              <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={(label) => `Category: ${label}`}
                              />
                              <Legend />
                              <Bar
                                dataKey="revenue"
                                name="Revenue"
                                fill="#00C49F"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={chartData.categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="revenue"
                                nameKey="name"
                              >
                                {chartData.categoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => formatCurrency(value)}
                              />
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                  {activeChart === "product" &&
                    chartData.productData.length > 0 && (
                      <div className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData.productData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 70,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="ProductName"
                              angle={-45}
                              textAnchor="end"
                              height={70}
                              interval={0}
                            />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => formatCurrency(value)}
                              labelFormatter={(label) => `Product: ${label}`}
                            />
                            <Legend />
                            <Bar
                              dataKey="TotalRevenue"
                              name="Revenue"
                              fill="#FFBB28"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                  {/* Show message if no data for the selected chart type */}
                  {((activeChart === "shop" &&
                    chartData.shopData.length === 0) ||
                    (activeChart === "category" &&
                      chartData.categoryData.length === 0) ||
                    (activeChart === "product" &&
                      chartData.productData.length === 0)) && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <BarChart2 size={48} className="text-gray-300 mb-3" />
                      <p className="text-gray-500">
                        No data available for this chart type
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top Products Section with enhanced UI */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("topProducts")}
              >
                <h3 className="text-xl font-semibold mb-0 text-gray-800 font-['Mukta_Mahee'] flex items-center">
                  <ShoppingBag size={20} className="mr-2 text-green-700" />
                  Top Selling Products
                </h3>
                <div className="bg-gray-100 rounded-full p-1">
                  {expandedSection === "topProducts" ? (
                    <ChevronUp size={20} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                  )}
                </div>
              </div>

              {expandedSection === "topProducts" && (
                <div className="mt-4 overflow-x-auto">
                  {chartData.categoryData &&
                  chartData.categoryData.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Units Sold
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % of Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chartData.categoryData.map((category, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {category.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {category.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                              {formatCurrency(category.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {filteredData.totals &&
                              filteredData.totals.revenue > 0
                                ? (
                                    (category.revenue /
                                      filteredData.totals.revenue) *
                                    100
                                  ).toFixed(1) + "%"
                                : "0%"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No category data available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Detailed Transactions Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("detailedData")}
              >
                <h3 className="text-xl font-semibold mb-0 text-gray-800 font-['Mukta_Mahee'] flex items-center">
                  <PieChart size={20} className="mr-2 text-green-700" />
                  Detailed Revenue Data
                </h3>
                <div className="bg-gray-100 rounded-full p-1">
                  {expandedSection === "detailedData" ? (
                    <ChevronUp size={20} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                  )}
                </div>
              </div>

              {expandedSection === "detailedData" && (
                <div className="mt-4 overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                    </div>
                  ) : filteredData.details &&
                    filteredData.details.length > 0 ? (
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
                            onClick={() => handleSort("UnitPrice")}
                          >
                            Unit Price{" "}
                            {sortConfig.key === "UnitPrice" &&
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
                          {showProfitColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Est. Profit
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.details.map((item, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.Date
                                ? new Date(item.Date).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.GiftShopName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.ProductName || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.Category || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.Quantity || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.UnitPrice || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">
                              {formatCurrency(item.TotalRevenue || 0)}
                            </td>
                            {showProfitColumn && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(
                                  calculateEstimatedProfit(item.TotalRevenue)
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No revenue data available for the selected filters.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )
      ) : (
        <div className="bg-gray-50 p-12 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <BarChart2 size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-700 font-['Mukta_Mahee']">
            Generate your Gift Shop Revenue Report
          </h3>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Select your filtering options above and click "Generate Report" to
            view detailed revenue information and analytics for all gift shops.
          </p>
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 flex items-center mx-auto shadow-sm"
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
