// routes/shop.routes.js
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

  return router;
};
