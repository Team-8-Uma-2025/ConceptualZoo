import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";

const TransactionHistory = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await axios.get("/api/shop/transactions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setTransactions(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError(
          "Unable to load your purchase history. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  const toggleTransaction = (transactionId) => {
    if (expandedTransaction === transactionId) {
      setExpandedTransaction(null);
    } else {
      setExpandedTransaction(transactionId);
    }
  };

  // Format price to always show 2 decimal places
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 font-['Mukta_Mahee'] flex items-center">
          <ShoppingBag size={20} className="mr-2" />
          Purchase History
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
          <ShoppingBag size={20} className="mr-2" />
          Purchase History
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
        <ShoppingBag size={20} className="mr-2" />
        Purchase History
      </h3>

      {transactions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4 font-['Lora']">
            You haven't made any purchases yet.
          </p>
          <a
            href="/gift-shop"
            className="text-green-700 hover:text-green-600 underline font-['Mukta_Mahee']"
          >
            Visit the Gift Shop
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.transactionId}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleTransaction(transaction.transactionId)}
              >
                <div>
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.datetime).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="font-medium text-gray-800">
                    {transaction.giftShopName}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-green-700 mr-3">
                    ${formatPrice(transaction.totalPaid)}
                  </span>
                  {expandedTransaction === transaction.transactionId ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div>

              {expandedTransaction === transaction.transactionId && (
                <div className="p-4 border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Item
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Qty
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transaction.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {item.productName}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                              ${formatPrice(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              ${formatPrice(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td
                            colSpan="3"
                            className="px-3 py-2 text-right font-medium text-gray-700"
                          >
                            Total:
                          </td>
                          <td className="px-3 py-2 font-bold text-green-700 text-right">
                            ${formatPrice(transaction.totalPaid)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 flex items-center">
                    <CreditCard size={14} className="mr-2" />
                    <span>Transaction #{transaction.transactionId}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
