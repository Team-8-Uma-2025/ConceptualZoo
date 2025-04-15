// routes/inventory.routes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");

module.exports = (pool) => {
  // Get all inventory with product details (staff only)
  router.get("/", authenticateToken, async (req, res) => {
    try {
      // Check that user is staff
      if (req.user.role !== "staff") {
        return res
          .status(403)
          .json({ error: "Unauthorized. Staff access only." });
      }

      const [rows] = await pool.query(`
        SELECT i.InventoryID, i.GiftShopID, g.GiftShopName, i.ProductID, 
               p.Name AS ProductName, p.Description, p.Price, p.Category, 
               i.ProductQuantityInStock
        FROM inventory i
        JOIN products p ON i.ProductID = p.ProductID
        JOIN giftshops g ON i.GiftShopID = g.GiftShopID
        ORDER BY g.GiftShopName, p.Name
      `);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // Get inventory for a specific gift shop (public)
  router.get("/shop/:id", async (req, res) => {
    try {
      const shopId = req.params.id;

      const [rows] = await pool.query(
        `
        SELECT i.InventoryID, i.ProductID, p.Name AS ProductName, 
               p.Description, p.Price, p.Category, i.ProductQuantityInStock
        FROM inventory i
        JOIN products p ON i.ProductID = p.ProductID
        WHERE i.GiftShopID = ? AND p.availability = 1
        ORDER BY p.Name
      `,
        [shopId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // Update inventory quantity (manager only)
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      // Check that user is a staff member who is either:
      // 1. A Gift Shop Clerk with Manager role, OR
      // 2. Any staff with Manager role
      if (
        req.user.role !== "staff" ||
        !(
          req.user.staffRole === "Manager" &&
          (req.user.staffType === "Gift Shop Clerk" ||
            req.user.staffType === "Admin")
        )
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized. Manager access only." });
      }

      const inventoryId = req.params.id;
      const { ProductQuantityInStock } = req.body;

      // Validate input
      if (ProductQuantityInStock === undefined) {
        return res.status(400).json({ error: "Product quantity is required" });
      }

      // Update inventory
      const [result] = await pool.query(
        "UPDATE inventory SET ProductQuantityInStock = ? WHERE InventoryID = ?",
        [ProductQuantityInStock, inventoryId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Inventory item not found" });
      }

      res.json({ message: "Inventory updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update inventory" });
    }
  });

  // Add product to inventory (manager only)
  router.post("/", authenticateToken, async (req, res) => {
    try {
      // Check that user is a staff member who is either:
      // 1. A Gift Shop Clerk with Manager role, OR
      // 2. Any staff with Manager role
      if (
        req.user.role !== "staff" ||
        !(
          req.user.staffRole === "Manager" &&
          (req.user.staffType === "Gift Shop Clerk" ||
            req.user.staffType === "Admin")
        )
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized. Manager access only." });
      }

      const { GiftShopID, ProductID, ProductQuantityInStock } = req.body;

      // Validate input
      if (!GiftShopID || !ProductID || ProductQuantityInStock === undefined) {
        return res
          .status(400)
          .json({
            error:
              "GiftShopID, ProductID, and ProductQuantityInStock are required",
          });
      }

      // Check if the product already exists in the inventory for this gift shop
      const [existingCheck] = await pool.query(
        "SELECT * FROM inventory WHERE GiftShopID = ? AND ProductID = ?",
        [GiftShopID, ProductID]
      );

      if (existingCheck.length > 0) {
        return res
          .status(400)
          .json({
            error: "This product is already in inventory for this gift shop",
          });
      }

      // Add to inventory
      const [result] = await pool.query(
        "INSERT INTO inventory (GiftShopID, ProductID, ProductQuantityInStock) VALUES (?, ?, ?)",
        [GiftShopID, ProductID, ProductQuantityInStock]
      );

      res.status(201).json({
        message: "Product added to inventory successfully",
        inventoryId: result.insertId,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to add product to inventory" });
    }
  });

  // Remove product from inventory (manager only)
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      // Check that user is a staff member who is either:
      // 1. A Gift Shop Clerk with Manager role, OR
      // 2. Any staff with Manager role
      if (
        req.user.role !== "staff" ||
        !(
          req.user.staffRole === "Manager" &&
          (req.user.staffType === "Gift Shop Clerk" ||
            req.user.staffType === "Admin")
        )
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized. Manager access only." });
      }

      const inventoryId = req.params.id;

      // Check if inventory item exists
      const [inventoryCheck] = await pool.query(
        "SELECT * FROM inventory WHERE InventoryID = ?",
        [inventoryId]
      );
      if (inventoryCheck.length === 0) {
        return res.status(404).json({ error: "Inventory item not found" });
      }

      // Remove from inventory
      await pool.query("DELETE FROM inventory WHERE InventoryID = ?", [
        inventoryId,
      ]);

      res.json({ message: "Product removed from inventory successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove from inventory" });
    }
  });

  return router;
};
