import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  ShoppingCart,
  Package,
  Store,
  CreditCard,
  X,
  Plus,
  Minus,
} from "lucide-react";

const GiftShop = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [giftShops, setGiftShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Credit card state for checkout
  const [cardNumber, setCardNumber] = useState("");

  // Categories for filtering
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = [
    "All",
    "Apparel",
    "Toys",
    "Souvenirs",
    "Books",
    "Home Decor",
    "Accessories",
  ];

  // Helper function to format price
  const safeFormatPrice = (price) => {
    if (typeof price === "string") {
      return parseFloat(price).toFixed(2);
    }
    if (typeof price === "number") {
      return price.toFixed(2);
    }
    return "0.00"; // Fallback for null or undefined
  };

  useEffect(() => {
    // Fetch all gift shops
    const fetchGiftShops = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/shop/shops");
        setGiftShops(response.data);

        // Default select first shop
        if (response.data.length > 0 && !selectedShop) {
          setSelectedShop(response.data[0]);
          fetchProducts(response.data[0].GiftShopID);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch gift shops:", err);
        setError("Unable to load gift shops. Please try again later.");
        setLoading(false);
      }
    };

    fetchGiftShops();
  }, []);

  const fetchProducts = async (shopId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/inventory/shop/${shopId}`);
      console.log("Products from API:", response.data);
      if (response.data && response.data.length > 0) {
        console.log("First product price:", response.data[0].Price);
        console.log("First product price type:", typeof response.data[0].Price);
      }
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Unable to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (shop) => {
    setSelectedShop(shop);
    fetchProducts(shop.GiftShopID);
    // Clear cart when changing shops
    setCart({});
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const currentQty = prev[product.ProductID]?.quantity || 0;

      // Check if adding one more would exceed inventory
      if (currentQty + 1 > product.ProductQuantityInStock) {
        alert(`Sorry, only ${product.ProductQuantityInStock} in stock!`);
        return prev;
      }

      return {
        ...prev,
        [product.ProductID]: {
          ...product,
          quantity: currentQty + 1,
        },
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId].quantity > 1) {
        updated[productId].quantity -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const removeItemFromCart = (productId) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const getCartTotal = () => {
    return Object.values(cart)
      .reduce((total, item) => {
        // Ensure we're working with numbers
        const price =
          typeof item.Price === "string" ? parseFloat(item.Price) : item.Price;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce(
      (count, item) => count + item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate("/login", { state: { from: "/gift-shop" } });
      return;
    }

    if (!cardNumber.trim()) {
      alert("Please enter your credit card number");
      return;
    }

    // Format cart items for the API
    const products = Object.values(cart).map((item) => ({
      productId: item.ProductID,
      quantity: item.quantity,
    }));

    setIsProcessing(true);
    try {
      const response = await axios.post(
        "/api/shop/purchase",
        {
          giftShopId: selectedShop.GiftShopID,
          products,
          cardNumber,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Show success message briefly
      setCheckoutSuccess(true);

      // Clear cart
      setCart({});

      // Redirect to visitor profile page
      setTimeout(() => {
        navigate("/profile", {
          state: {
            message: "Your purchase has been completed successfully!",
            purchaseSuccess: true,
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Checkout failed:", err);
      alert(err.response?.data?.error || "Checkout failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.Category === selectedCategory);

  console.log("Filtered products before render:", filteredProducts);
  if (filteredProducts.length > 0) {
    console.log("First product price type:", typeof filteredProducts[0].Price);
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-20">
      {/* Page Header */}
      <div className="relative h-80 overflow-hidden">
        <img
          src="/background/tree_bg.png"
          alt="Gift Shop Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-5xl text-white font-bold font-['Roboto_Flex']">
            Gift Shop
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success message */}
        {checkoutSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">
              {" "}
              Your purchase has been completed. Redirecting to your profile...
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content area - 70% width on desktop */}
          <div className="md:w-3/4">
            {/* Shop selector */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 font-['Roboto_Flex']">
                Select a Gift Shop
              </h2>
              <div className="flex overflow-x-auto pb-2 space-x-4">
                {giftShops.map((shop) => (
                  <button
                    key={shop.GiftShopID}
                    onClick={() => handleShopChange(shop)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg transition font-['Mukta_Mahee'] ${
                      selectedShop?.GiftShopID === shop.GiftShopID
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <Store size={16} className="mr-2" />
                      {shop.GiftShopName}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 font-['Roboto_Flex']">
                Filter by Category
              </h2>
              <div className="flex overflow-x-auto pb-2 space-x-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition font-['Mukta_Mahee'] ${
                      selectedCategory === category
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Products display */}
            {!loading && !error && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 font-['Roboto_Flex']">
                  {selectedShop?.GiftShopName} - Available Products
                </h2>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-700 font-['Lora']">
                      {selectedCategory === "All"
                        ? "No products available in this shop."
                        : `No ${selectedCategory} products available in this shop.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.ProductID}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <div className="p-6 flex flex-col h-full">
                          <div className="flex-grow">
                            <h3 className="text-xl font-semibold mb-2 text-gray-800 font-['Mukta_Mahee']">
                              {product.ProductName}
                            </h3>
                            <p className="text-gray-600 mb-4 font-['Lora']">
                              {product.Description ||
                                "No description available."}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-green-700 font-bold font-['Roboto_Flex']">
                                ${safeFormatPrice(product.Price)}
                              </span>
                              <span className="text-sm text-gray-500 font-['Mukta_Mahee']">
                                {product.ProductQuantityInStock > 10
                                  ? "In Stock"
                                  : product.ProductQuantityInStock > 0
                                  ? `Only ${product.ProductQuantityInStock} left`
                                  : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.ProductQuantityInStock < 1}
                            className={`w-full py-2 px-4 rounded font-['Mukta_Mahee'] flex items-center justify-center ${
                              product.ProductQuantityInStock < 1
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-700 text-white hover:bg-green-600 transition duration-300"
                            }`}
                          >
                            <ShoppingCart size={16} className="mr-2" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shopping Cart Sidebar - 30% width on desktop */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md sticky top-24">
              <div className="bg-green-700 text-white px-4 py-3 rounded-t-lg">
                <h2 className="text-xl font-bold font-['Mukta_Mahee'] flex items-center">
                  <ShoppingCart size={20} className="mr-2" />
                  Shopping Cart
                  {getCartCount() > 0 && (
                    <span className="ml-2 bg-white text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {getCartCount()}
                    </span>
                  )}
                </h2>
              </div>

              <div className="p-4">
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-['Lora']">
                      Your cart is empty.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {Object.values(cart).map((item) => (
                        <div
                          key={item.ProductID}
                          className="border rounded-lg p-3 flex flex-col"
                        >
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800 font-['Mukta_Mahee']">
                              {item.ProductName}
                            </h3>
                            <button
                              onClick={() => removeItemFromCart(item.ProductID)}
                              className="text-red-600 hover:bg-red-100 p-1 rounded-full"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="flex justify-between mt-2">
                            <div className="text-gray-500 font-['Lora']">
                              ${safeFormatPrice(item.Price)} x {item.quantity}
                            </div>
                            <div className="font-semibold font-['Mukta_Mahee']">
                              ${safeFormatPrice(item.Price * item.quantity)}
                            </div>
                          </div>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => removeFromCart(item.ProductID)}
                              className="p-1 bg-gray-200 rounded-l-md hover:bg-gray-300"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 bg-gray-100 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="p-1 bg-gray-200 rounded-r-md hover:bg-gray-300"
                              disabled={
                                item.quantity >= item.ProductQuantityInStock
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-xl font-semibold mb-4">
                        <span className="font-['Mukta_Mahee']">Total:</span>
                        <span className="font-['Roboto_Flex']">
                          ${getCartTotal()}
                        </span>
                      </div>

                      {/* Credit card input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-['Mukta_Mahee']">
                          Credit Card Number
                        </label>
                        <div className="flex items-center">
                          <CreditCard
                            size={16}
                            className="text-gray-400 mr-2"
                          />
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 font-['Mukta_Mahee'] flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} className="mr-2" />
                            GO TO CHECKOUT
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftShop;
