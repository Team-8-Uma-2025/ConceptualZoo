// src/pages/GiftShopManagement.js
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  AlertTriangle,
  Package,
  Store,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  DollarSign,
  BarChart2,
} from "lucide-react";
import GiftShopRevenueReport from "../components/GiftShopRevenueReport";

const GiftShopManagement = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [expandedSection, setExpandedSection] = useState("");

  // Products state
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Product form state
  const [productForm, setProductForm] = useState({
    Name: "",
    Description: "",
    Price: "",
    Category: "",
  });

  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);
  const [giftShops, setGiftShops] = useState([]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [isEditingInventory, setIsEditingInventory] = useState(false);
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);

  // Inventory form state
  const [inventoryForm, setInventoryForm] = useState({
    GiftShopID: "",
    ProductID: "",
    ProductQuantityInStock: "",
  });

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [filterShopId, setFilterShopId] = useState("");

  // Categories options
  const categories = [
    "Apparel",
    "Toys",
    "Souvenirs",
    "Books",
    "Home Decor",
    "Accessories",
  ];

  // Helper function to format price - improved version
  const formatPrice = (price) => {
    // Handle null, undefined, or empty string
    if (price === null || price === undefined || price === "") {
      return "0.00";
    }

    // Try to convert to number, handling string and other formats
    let numPrice;
    try {
      // Remove any non-numeric characters except decimal point
      if (typeof price === "string") {
        numPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
      } else {
        numPrice = Number(price);
      }
    } catch (e) {
      return "0.00";
    }

    // Check if it's a valid number
    if (isNaN(numPrice)) {
      return "0.00";
    }

    return numPrice.toFixed(2);
  };

  useEffect(() => {
    // Fetch gift shops for inventory management
    const fetchGiftShops = async () => {
      try {
        const response = await axios.get("/api/shop/shops");
        setGiftShops(response.data);
      } catch (err) {
        console.error("Failed to fetch gift shops:", err);
      }
    };

    fetchGiftShops();
  }, []);

  const fetchProducts = useCallback(async () => {
    setProductLoading(true);
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
      setProductError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProductError("Unable to load products. Please try again later.");
    } finally {
      setProductLoading(false);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const response = await axios.get("/api/inventory", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInventory(response.data);
      setInventoryError(null);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setInventoryError("Unable to load inventory. Please try again later.");
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const endpoint = filterShopId
        ? `/api/shop/transactions?giftShopId=${filterShopId}`
        : "/api/shop/transactions";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(response.data);
      setTransactionsError(null);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTransactionsError(
        "Unable to load transactions. Please try again later."
      );
    } finally {
      setTransactionsLoading(false);
    }
  }, [filterShopId]);

  useEffect(() => {
    // Load data based on active tab
    if (activeTab === "products") {
      fetchProducts();
    } else if (activeTab === "inventory") {
      fetchInventory();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    }
  }, [activeTab, fetchProducts, fetchInventory, fetchTransactions]);

  const handleToggleSection = (section) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  // Product form handlers
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: name === "Price" ? parseFloat(value) : value,
    });
  };

  const initProductForm = (product = null) => {
    if (product) {
      setProductForm({
        Name: product.Name,
        Description: product.Description || "",
        Price: product.Price,
        Category: product.Category,
      });
    } else {
      setProductForm({
        Name: "",
        Description: "",
        Price: "",
        Category: "",
      });
    }
  };

  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setIsEditingProduct(false);
    setSelectedProduct(null);
    initProductForm();
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditingProduct(true);
    setIsAddingProduct(false);
    initProductForm(product);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      fetchProducts();
      setSelectedProduct(null);
      setIsEditingProduct(false);
      setIsAddingProduct(false);
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert(
        "Failed to delete product: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!productForm.Name || !productForm.Price || !productForm.Category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (isAddingProduct) {
        await axios.post("/api/products", productForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else if (isEditingProduct && selectedProduct) {
        await axios.put(
          `/api/products/${selectedProduct.ProductID}`,
          productForm,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      // Refresh products list
      fetchProducts();

      // Reset form and state
      setIsAddingProduct(false);
      setIsEditingProduct(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Failed to save product:", err);
      alert(
        "Failed to save product: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const cancelProductEdit = () => {
    setIsAddingProduct(false);
    setIsEditingProduct(false);
    setSelectedProduct(null);
  };

  // Inventory form handlers
  const handleInventoryFormChange = (e) => {
    const { name, value } = e.target;
    setInventoryForm({
      ...inventoryForm,
      [name]: name === "ProductQuantityInStock" ? parseInt(value) : value,
    });
  };

  const initInventoryForm = (item = null) => {
    if (item) {
      setInventoryForm({
        GiftShopID: item.GiftShopID,
        ProductID: item.ProductID,
        ProductQuantityInStock: item.ProductQuantityInStock,
      });
    } else {
      setInventoryForm({
        GiftShopID: giftShops.length > 0 ? giftShops[0].GiftShopID : "",
        ProductID: "",
        ProductQuantityInStock: "",
      });
    }
  };

  const handleAddToInventory = () => {
    setIsAddingToInventory(true);
    setIsEditingInventory(false);
    setSelectedInventoryItem(null);
    initInventoryForm();
  };

  const handleEditInventory = (item) => {
    setSelectedInventoryItem(item);
    setIsEditingInventory(true);
    setIsAddingToInventory(false);
    initInventoryForm(item);
  };

  const handleDeleteFromInventory = async (inventoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this product from inventory?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/inventory/${inventoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      fetchInventory();
      setSelectedInventoryItem(null);
      setIsEditingInventory(false);
      setIsAddingToInventory(false);
    } catch (err) {
      console.error("Failed to remove from inventory:", err);
      alert(
        "Failed to remove from inventory: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (
      !inventoryForm.GiftShopID ||
      !inventoryForm.ProductID ||
      inventoryForm.ProductQuantityInStock === ""
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (isAddingToInventory) {
        await axios.post("/api/inventory", inventoryForm, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else if (isEditingInventory && selectedInventoryItem) {
        await axios.put(
          `/api/inventory/${selectedInventoryItem.InventoryID}`,
          {
            ProductQuantityInStock: inventoryForm.ProductQuantityInStock,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      // Refresh inventory list
      fetchInventory();

      // Reset form and state
      setIsAddingToInventory(false);
      setIsEditingInventory(false);
      setSelectedInventoryItem(null);
    } catch (err) {
      console.error("Failed to update inventory:", err);
      alert(
        "Failed to update inventory: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const cancelInventoryEdit = () => {
    setIsAddingToInventory(false);
    setIsEditingInventory(false);
    setSelectedInventoryItem(null);
  };

  // Filter products by search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.Description &&
        product.Description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      filterCategory === "All" || product.Category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Check if user has permission to manage gift shop
  if (
    !currentUser ||
    currentUser.role !== "staff" ||
    (currentUser.staffType !== "Gift Shop Clerk" &&
      currentUser.staffRole !== "Manager")
  ) {
    return (
      <div className="bg-gray-100 min-h-screen pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-lg text-red-600 font-['Lora']">
            Access denied. This page is only for Gift Shop managers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Roboto_Flex']">
            Gift Shop Management
          </h1>
          <p className="text-gray-600 font-['Lora']">
            Manage products, inventory, and view sales transactions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium text-sm font-['Mukta_Mahee'] flex items-center ${
                activeTab === "products"
                  ? "text-green-700 border-b-2 border-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("products")}
            >
              <Package size={18} className="mr-2" />
              Products
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm font-['Mukta_Mahee'] flex items-center ${
                activeTab === "inventory"
                  ? "text-green-700 border-b-2 border-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("inventory")}
            >
              <Store size={18} className="mr-2" />
              Inventory
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm font-['Mukta_Mahee'] flex items-center ${
                activeTab === "transactions"
                  ? "text-green-700 border-b-2 border-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              <DollarSign size={18} className="mr-2" />
              Transactions
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm font-['Mukta_Mahee'] flex items-center ${
                activeTab === "reports"
                  ? "text-green-700 border-b-2 border-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("reports")}
            >
              <BarChart2 size={18} className="mr-2" />
              Revenue Reports
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-['Roboto_Flex']">
                  Product Management
                </h2>
                <button
                  onClick={handleAddProduct}
                  className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition font-['Mukta_Mahee'] flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add New Product
                </button>
              </div>

              {/* Product Form (Add/Edit) */}
              {(isAddingProduct || isEditingProduct) && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee']">
                    {isAddingProduct ? "Add New Product" : "Edit Product"}
                  </h3>
                  <form onSubmit={handleProductSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name*
                        </label>
                        <input
                          type="text"
                          name="Name"
                          value={productForm.Name}
                          onChange={handleProductFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price ($)*
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="Price"
                          value={productForm.Price}
                          onChange={handleProductFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category*
                        </label>
                        <select
                          name="Category"
                          value={productForm.Category}
                          onChange={handleProductFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="Description"
                          value={productForm.Description}
                          onChange={handleProductFormChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={cancelProductEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-['Mukta_Mahee']"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 font-['Mukta_Mahee']"
                      >
                        {isAddingProduct ? "Add Product" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Filter and Search */}
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div className="flex items-center mb-4 md:mb-0">
                  <label className="mr-2 text-gray-700 font-['Mukta_Mahee']">
                    Category:
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64"
                  />
                </div>
              </div>

              {/* Products Table */}
              {productLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
              ) : productError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {productError}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-['Lora']">
                    No products found.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.ProductID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.ProductID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {product.Name}
                            </div>
                            {product.Description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.Description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.Category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${formatPrice(product.Price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteProduct(product.ProductID)
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-['Roboto_Flex']">
                  Inventory Management
                </h2>
                <button
                  onClick={handleAddToInventory}
                  className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition font-['Mukta_Mahee'] flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Product to Inventory
                </button>
              </div>

              {/* Inventory Form (Add/Edit) */}
              {(isAddingToInventory || isEditingInventory) && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 font-['Mukta_Mahee']">
                    {isAddingToInventory
                      ? "Add Product to Inventory"
                      : "Update Inventory"}
                  </h3>
                  <form onSubmit={handleInventorySubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gift Shop*
                        </label>
                        <select
                          name="GiftShopID"
                          value={inventoryForm.GiftShopID}
                          onChange={handleInventoryFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={isEditingInventory}
                          required
                        >
                          <option value="">Select a gift shop</option>
                          {giftShops.map((shop) => (
                            <option
                              key={shop.GiftShopID}
                              value={shop.GiftShopID}
                            >
                              {shop.GiftShopName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product*
                        </label>
                        <select
                          name="ProductID"
                          value={inventoryForm.ProductID}
                          onChange={handleInventoryFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={isEditingInventory}
                          required
                        >
                          <option value="">Select a product</option>
                          {products.map((product) => (
                            <option
                              key={product.ProductID}
                              value={product.ProductID}
                            >
                              {product.Name} - ${formatPrice(product.Price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity in Stock*
                        </label>
                        <input
                          type="number"
                          min="0"
                          name="ProductQuantityInStock"
                          value={inventoryForm.ProductQuantityInStock}
                          onChange={handleInventoryFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={cancelInventoryEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-['Mukta_Mahee']"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 font-['Mukta_Mahee']"
                      >
                        {isAddingToInventory
                          ? "Add to Inventory"
                          : "Update Quantity"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Inventory Table */}
              {inventoryLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
              ) : inventoryError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {inventoryError}
                </div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-['Lora']">
                    No inventory items found.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Gift Shop
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item) => (
                        <tr
                          key={item.InventoryID}
                          className={
                            item.ProductQuantityInStock < 10 ? "bg-red-50" : ""
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.InventoryID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.GiftShopName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.ProductName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${formatPrice(item.Price)} - {item.Category}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              item.ProductQuantityInStock < 10
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {item.ProductQuantityInStock}
                            {item.ProductQuantityInStock < 10 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Low Stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditInventory(item)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Quantity"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteFromInventory(item.InventoryID)
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Remove from Inventory"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-['Roboto_Flex']">
                  Sales Transactions
                </h2>

                {/* Gift Shop Filter */}
                <div>
                  <select
                    value={filterShopId}
                    onChange={(e) => {
                      setFilterShopId(e.target.value);
                      // Fetch transactions with new filter
                      fetchTransactions(e.target.value);
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Gift Shops</option>
                    {giftShops.map((shop) => (
                      <option key={shop.GiftShopID} value={shop.GiftShopID}>
                        {shop.GiftShopName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transactions List */}
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
              ) : transactionsError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {transactionsError}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-['Lora']">
                    No transactions found.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.transactionId}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="bg-gray-50 px-6 py-4 flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          handleToggleSection(
                            `transaction-${transaction.transactionId}`
                          )
                        }
                      >
                        <div>
                          <div className="font-semibold text-gray-700">
                            Transaction #{transaction.transactionId}
                            {transaction.visitorName && (
                              <span className="ml-2 text-sm font-normal text-gray-500">
                                - Customer: {transaction.visitorName}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.datetime).toLocaleString()} |{" "}
                            {transaction.giftShopName}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="font-bold text-green-700 mr-3">
                            ${formatPrice(transaction.totalPaid)}
                          </span>
                          {expandedSection ===
                          `transaction-${transaction.transactionId}` ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>
                      </div>

                      {expandedSection ===
                        `transaction-${transaction.transactionId}` && (
                        <div className="p-6 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Items Purchased:
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Product
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Quantity
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Unit Price
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Subtotal
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {transaction.items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {item.productName}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      ${formatPrice(item.unitPrice)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                      ${formatPrice(item.subtotal)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-gray-50">
                                  <td
                                    colSpan="3"
                                    className="px-4 py-2 text-right font-semibold text-gray-700"
                                  >
                                    Total:
                                  </td>
                                  <td className="px-4 py-2 font-bold text-green-700">
                                    ${formatPrice(transaction.totalPaid)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 font-['Roboto_Flex']">
              Gift Shop Revenue Reports
            </h2>
            <GiftShopRevenueReport />
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftShopManagement;
