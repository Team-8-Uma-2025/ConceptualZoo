const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");

module.exports = (pool) => {
  // Get all gift shops
  router.get("/shops", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM giftshops");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch gift shops" });
    }
  });

  // Process a purchase
  router.post("/purchase", authenticateToken, async (req, res) => {
    try {
      const { giftShopId, products, cardNumber } = req.body;
      const visitorId = req.user.id;

      // Validate input
      if (!giftShopId || !products || !products.length || !cardNumber) {
        return res
          .status(400)
          .json({ error: "Gift shop, products, and card number are required" });
      }

      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Calculate total
        let totalPaid = 0;

        // Validate each product and calculate total
        for (const item of products) {
          // Check product exists and is available
          const [productCheck] = await connection.query(
            "SELECT * FROM products WHERE ProductID = ? AND availability = 1",
            [item.productId]
          );

          if (productCheck.length === 0) {
            throw new Error(
              `Product ${item.productId} not found or not available`
            );
          }

          // Check inventory has enough stock
          const [inventoryCheck] = await connection.query(
            "SELECT * FROM inventory WHERE GiftShopID = ? AND ProductID = ? AND ProductQuantityInStock >= ?",
            [giftShopId, item.productId, item.quantity]
          );

          if (inventoryCheck.length === 0) {
            throw new Error(`Not enough stock for product ${item.productId}`);
          }

          // Add to total
          totalPaid += productCheck[0].Price * item.quantity;
        }

        // Create transaction record
        const [transactionResult] = await connection.query(
          "INSERT INTO transactions (VisitorID, GiftShopID, Datetime, TotalPaid, CardNumber) VALUES (?, ?, NOW(), ?, ?)",
          [visitorId, giftShopId, totalPaid, cardNumber]
        );

        const transactionId = transactionResult.insertId;

        // Create order records and update inventory
        for (const item of products) {
          // Create order record
          await connection.query(
            "INSERT INTO orders (VisitorID, TransactionID, ProductID, AmountBought) VALUES (?, ?, ?, ?)",
            [visitorId, transactionId, item.productId, item.quantity]
          );

          // Update inventory
          await connection.query(
            "UPDATE inventory SET ProductQuantityInStock = ProductQuantityInStock - ? WHERE GiftShopID = ? AND ProductID = ?",
            [item.quantity, giftShopId, item.productId]
          );
        }

        // Commit the transaction
        await connection.commit();

        res.status(201).json({
          message: "Purchase completed successfully",
          transactionId: transactionId,
          totalPaid: totalPaid,
        });
      } catch (err) {
        // Rollback in case of error
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: `Failed to process purchase: ${err.message}` });
    }
  });

  // Get transaction history (for visitor or manager)
  router.get("/transactions", authenticateToken, async (req, res) => {
    try {
      let query, params;

      // If user is a visitor, get only their transactions
      if (req.user.role === "visitor") {
        query = `
          SELECT t.TransactionID, t.Datetime, t.TotalPaid, g.GiftShopName,
                 o.ProductID, p.Name AS ProductName, o.AmountBought, p.Price
          FROM transactions t
          JOIN orders o ON t.TransactionID = o.TransactionID
          JOIN products p ON o.ProductID = p.ProductID
          JOIN giftshops g ON t.GiftShopID = g.GiftShopID
          WHERE t.VisitorID = ?
          ORDER BY t.Datetime DESC
        `;
        params = [req.user.id];
      }
      // If user is a manager, get all transactions or filter by gift shop
      else if (
        req.user.role === "staff" &&
        (req.user.staffType === "Gift Shop Clerk" ||
          req.user.staffRole === "Manager")
      ) {
        const { giftShopId } = req.query;

        if (giftShopId) {
          query = `
            SELECT t.TransactionID, t.VisitorID, v.firstName, v.lastName, t.Datetime, t.TotalPaid, g.GiftShopName,
                   o.ProductID, p.Name AS ProductName, o.AmountBought, p.Price
            FROM transactions t
            JOIN orders o ON t.TransactionID = o.TransactionID
            JOIN products p ON o.ProductID = p.ProductID
            JOIN giftshops g ON t.GiftShopID = g.GiftShopID
            LEFT JOIN visitors v ON t.VisitorID = v.VisitorID
            WHERE t.GiftShopID = ?
            ORDER BY t.Datetime DESC
          `;
          params = [giftShopId];
        } else {
          query = `
            SELECT t.TransactionID, t.VisitorID, v.firstName, v.lastName, t.Datetime, t.TotalPaid, g.GiftShopName,
                   o.ProductID, p.Name AS ProductName, o.AmountBought, p.Price
            FROM transactions t
            JOIN orders o ON t.TransactionID = o.TransactionID
            JOIN products p ON o.ProductID = p.ProductID
            JOIN giftshops g ON t.GiftShopID = g.GiftShopID
            LEFT JOIN visitors v ON t.VisitorID = v.VisitorID
            ORDER BY t.Datetime DESC
          `;
          params = [];
        }
      } else {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const [rows] = await pool.query(query, params);

      // Group by transaction
      const transactions = {};
      rows.forEach((row) => {
        if (!transactions[row.TransactionID]) {
          transactions[row.TransactionID] = {
            transactionId: row.TransactionID,
            datetime: row.Datetime,
            totalPaid: row.TotalPaid,
            giftShopName: row.GiftShopName,
            items: [],
          };

          // Add visitor info if available (for managers)
          if (row.VisitorID && row.firstName) {
            transactions[row.TransactionID].visitorId = row.VisitorID;
            transactions[
              row.TransactionID
            ].visitorName = `${row.firstName} ${row.lastName}`;
          }
        }

        transactions[row.TransactionID].items.push({
          productId: row.ProductID,
          productName: row.ProductName,
          quantity: row.AmountBought,
          unitPrice: row.Price,
          subtotal: row.Price * row.AmountBought,
        });
      });

      res.json(Object.values(transactions));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get transaction details by ID (for visitor or manager)
  router.get("/transactions/:id", authenticateToken, async (req, res) => {
    try {
      const transactionId = req.params.id;

      // First verify if the user has access to this transaction
      let accessQuery, accessParams;

      if (req.user.role === "visitor") {
        accessQuery =
          "SELECT * FROM transactions WHERE TransactionID = ? AND VisitorID = ?";
        accessParams = [transactionId, req.user.id];
      } else if (
        req.user.role === "staff" &&
        (req.user.staffType === "Gift Shop Clerk" ||
          req.user.staffRole === "Manager")
      ) {
        accessQuery = "SELECT * FROM transactions WHERE TransactionID = ?";
        accessParams = [transactionId];
      } else {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const [accessCheck] = await pool.query(accessQuery, accessParams);

      if (accessCheck.length === 0) {
        return res
          .status(404)
          .json({ error: "Transaction not found or access denied" });
      }

      // Get transaction details
      const [items] = await pool.query(
        `
        SELECT o.ProductID, p.Name AS ProductName, o.AmountBought AS quantity, p.Price AS unitPrice, 
               (p.Price * o.AmountBought) AS subtotal
        FROM orders o
        JOIN products p ON o.ProductID = p.ProductID
        WHERE o.TransactionID = ?
      `,
        [transactionId]
      );

      // Format response
      const transaction = {
        transactionId: parseInt(transactionId),
        datetime: accessCheck[0].Datetime,
        totalPaid: accessCheck[0].TotalPaid,
        giftShopId: accessCheck[0].GiftShopID,
        items: items,
      };

      res.json(transaction);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch transaction details" });
    }
  });

  // Get gift shop revenue reports (staff only)
  router.get("/revenue", authenticateToken, async (req, res) => {
    try {
      // Check user authorization
      if (
        !(
          req.user.role === "staff" &&
          (req.user.staffType === "Gift Shop Clerk" ||
            req.user.staffRole === "Manager" ||
            req.user.staffRole === "Admin")
        )
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized. Staff access only." });
      }

      // Get query parameters for filtering
      const {
        startDate,
        endDate,
        giftShopId,
        category,
        productName,
        minRevenue,
        maxRevenue,
        sortBy = "Date",
        sortDirection = "DESC",
      } = req.query;

      // Building WHERE conditions
      const whereConditions = [];
      const params = [];

      if (startDate) {
        whereConditions.push("Date >= ?");
        params.push(startDate);
      }

      if (endDate) {
        whereConditions.push("Date <= ?");
        params.push(endDate);
      }

      if (giftShopId) {
        whereConditions.push("GiftShopID = ?");
        params.push(giftShopId);
      }

      if (category) {
        whereConditions.push("Category = ?");
        params.push(category);
      }

      if (productName) {
        whereConditions.push("ProductName LIKE ?");
        params.push(`%${productName}%`);
      }

      if (minRevenue) {
        whereConditions.push("TotalRevenue >= ?");
        params.push(minRevenue);
      }

      if (maxRevenue) {
        whereConditions.push("TotalRevenue <= ?");
        params.push(maxRevenue);
      }

      // Create the WHERE clause
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";

      // Get detailed revenue data
      const detailsQuery = `
        SELECT 
          Date,
          GiftShopID,
          GiftShopName,
          ProductName,
          Category,
          SUM(Quantity) AS Quantity,
          UnitPrice,
          SUM(TotalRevenue) AS TotalRevenue
        FROM GiftShopRevenueSummary
        ${whereClause}
        GROUP BY Date, GiftShopID, ProductName, Category, UnitPrice
      `;

      // Apply sorting
      const validSortColumns = [
        "Date",
        "GiftShopName",
        "ProductName",
        "Quantity",
        "UnitPrice",
        "TotalRevenue",
        "Category",
      ];
      const column = validSortColumns.includes(sortBy) ? sortBy : "Date";
      const direction =
        sortDirection && sortDirection.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const finalDetailsQuery = `${detailsQuery} ORDER BY ${column} ${direction}`;

      const [details] = await pool.query(finalDetailsQuery, params);

      // Get summary by category
      const summaryQuery = `
        SELECT 
          Category,
          SUM(Quantity) AS TotalQuantity,
          SUM(TotalRevenue) AS TotalRevenue
        FROM GiftShopRevenueSummary
        ${whereClause}
        GROUP BY Category
      `;

      const [summary] = await pool.query(summaryQuery, params);

      // Get top selling products
      const topProductsQuery = `
        SELECT 
          ProductName,
          Category,
          SUM(Quantity) AS TotalSold,
          SUM(TotalRevenue) AS TotalRevenue
        FROM GiftShopRevenueSummary
        ${whereClause}
        GROUP BY ProductName, Category
        ORDER BY TotalSold DESC
        LIMIT 10
      `;

      const [topProducts] = await pool.query(topProductsQuery, params);

      // Get metadata for filters
      const [giftShops] = await pool.query(
        "SELECT GiftShopID, GiftShopName FROM giftshops"
      );
      const [categories] = await pool.query(
        "SELECT DISTINCT Category FROM products WHERE Category IS NOT NULL ORDER BY Category"
      );
      const [productNames] = await pool.query(
        "SELECT DISTINCT Name FROM products ORDER BY Name"
      );

      // Calculate overall totals
      const overallTotalRevenue = summary.reduce(
        (acc, item) => acc + parseFloat(item.TotalRevenue),
        0
      );
      const overallTotalQuantity = summary.reduce(
        (acc, item) => acc + parseInt(item.TotalQuantity),
        0
      );

      // Return the comprehensive report data
      res.json({
        details: details,
        summary: summary,
        topProducts: topProducts,
        metadata: {
          giftShops: giftShops,
          categories: categories.map((c) => c.Category),
          productNames: productNames.map((p) => p.Name),
        },
        totals: {
          revenue: overallTotalRevenue,
          quantity: overallTotalQuantity,
        },
      });
    } catch (err) {
      console.error("Error in revenue reporting:", err);
      res
        .status(500)
        .json({ error: "Failed to generate revenue report: " + err.message });
    }
  });

  return router;
};
