// routes/ticket.routes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");

module.exports = (pool) => {
  // Get all ticket types
  router.get("/types", async (req, res) => {
    try {
      const types = [
        { type: "Adult", price: 24.99 },
        { type: "Child", price: 16.99 },
        { type: "Senior", price: 19.99 },
      ];

      res.json(types);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch ticket types" });
    }
  });

  // Purchase ticket
  router.post("/purchase", authenticateToken, async (req, res) => {
    try {
      const { tickets, addons, visitDate } = req.body;
      const visitorId = req.user.id;
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      try {
        const purchasedTickets = [];
        // Process regular tickets
        for (const type in tickets) {
          if (tickets[type] > 0) {
            let price;
            switch (type) {
              case "adult":
                price = 24.99;
                break;
              case "child":
                price = 16.99;
                break;
              case "senior":
                price = 19.99;
                break;
              default:
                price = 0;
            }
            const ticketType = type.charAt(0).toUpperCase() + type.slice(1);
            for (let i = 0; i < tickets[type]; i++) {
              const startDate = new Date(visitDate);
              const endDate = new Date(visitDate);
              endDate.setDate(endDate.getDate() + 1);
              const [result] = await connection.query(
                "INSERT INTO tickets (VisitorID, TicketType, Price, EnclosureAccess, StartDate, EndDate, Used) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [visitorId, ticketType, price, "None", startDate, endDate, 0]
              );
              purchasedTickets.push({
                id: result.insertId,
                type: ticketType,
                access: "None",
                price,
              });
            }
          }
        }
        // Process addons (if any user explicitly selects them)
        for (const addon in addons) {
          if (addons[addon]) {
            let price, accessType;
            switch (addon) {
              case "feeding":
                price = 5.99;
                accessType = "Animal Feeding Experience";
                break;
              case "guidedTour":
                price = 12.99;
                accessType = "Guided Zoo Tour";
                break;
              case "animalEncounter":
                price = 25.99;
                accessType = "Animal Encounter";
                break;
              case "parking":
                price = 15.0;
                accessType = "Parking Pass";
                break;
              default:
                continue;
            }
            const startDate = new Date(visitDate);
            const endDate = new Date(visitDate);
            endDate.setDate(endDate.getDate() + 1);
            const [result] = await connection.query(
              "INSERT INTO tickets (VisitorID, TicketType, Price, EnclosureAccess, StartDate, EndDate, Used) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [visitorId, "Addon", price, accessType, startDate, endDate, 0]
            );
            purchasedTickets.push({
              id: result.insertId,
              type: "Addon: " + accessType,
              access: accessType,
              price,
            });
          }
        }
        await connection.commit();
        res.status(201).json({
          message: "Tickets purchased successfully",
          tickets: purchasedTickets,
        });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to purchase tickets" });
    }
  });

  // Get visitor's tickets
  router.get("/visitor/:id", authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;

      // Ensure user is accessing their own tickets or is staff
      if (req.user.id !== parseInt(visitorId) && req.user.role !== "staff") {
        return res
          .status(403)
          .json({ error: "Unauthorized to view these tickets" });
      }

      const [tickets] = await pool.query(
        "SELECT * FROM tickets WHERE VisitorID = ? ORDER BY StartDate DESC",
        [visitorId]
      );

      res.json(tickets);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  // Validate ticket
  router.post("/validate/:id", authenticateToken, async (req, res) => {
    try {
      // TODO: Implement ticket validation
      // Check that user is staff
      const ticketId = req.params.id;

      res.json({ message: `This endpoint will validate ticket ${ticketId}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to validate ticket" });
    }
  });

  return router;
};
