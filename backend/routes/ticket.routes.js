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
      console.error("Error in /types:", err);
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

            // Insert into addons table instead of tickets table
            const [result] = await connection.query(
              "INSERT INTO addons (VisitorID, Type, Price, Description, StartDate, EndDate, Used) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [visitorId, addon, price, accessType, startDate, endDate, 0]
            );

            purchasedTickets.push({
              id: result.insertId,
              type: "Addon: " + accessType,
              access: accessType,
              price,
              isAddon: true,
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
        console.error("Transaction error in /purchase:", err);
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error("Error in /purchase:", err);
      res.status(500).json({ error: "Failed to purchase tickets" });
    }
  });

  //Update the visitor/:id route to fetch and combine data properly
  router.get("/visitor/:id", authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;

      // Only allow visitors to see their own tickets (or staff viewing)
      if (
        parseInt(req.user.id) !== parseInt(visitorId) &&
        req.user.role !== "staff"
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized access to ticket data" });
      }

      // Get regular tickets with proper error handling
      let regularTickets = [];
      try {
        [regularTickets] = await pool.query(
          "SELECT * FROM tickets WHERE VisitorID = ? ORDER BY StartDate DESC",
          [visitorId]
        );
      } catch (ticketErr) {
        console.error("Error fetching tickets:", ticketErr);
        // Continue execution rather than failing completely
        regularTickets = [];
      }

      // Get add-ons from addons table with proper error handling
      let addonRecords = [];
      try {
        [addonRecords] = await pool.query(
          "SELECT * FROM addons WHERE VisitorID = ? ORDER BY StartDate DESC",
          [visitorId]
        );
      } catch (addonErr) {
        console.error("Error fetching addons:", addonErr);
        // Continue execution rather than failing completely
        addonRecords = [];
      }

      // Group addons by date for easy lookup
      const addonsByDate = {};
      addonRecords.forEach((addon) => {
        if (!addon.StartDate) return; // Skip entries with missing dates

        const dateKey = new Date(addon.StartDate).toISOString().split("T")[0];
        if (!addonsByDate[dateKey]) {
          addonsByDate[dateKey] = [];
        }
        addonsByDate[dateKey].push(addon.Description);
      });

      // Add addon information to each ticket
      const ticketsWithAddons = regularTickets.map((ticket) => {
        if (!ticket.StartDate) return ticket; // Handle tickets without dates

        const ticketDate = new Date(ticket.StartDate)
          .toISOString()
          .split("T")[0];
        const addonsForTicket = addonsByDate[ticketDate] || [];

        return {
          ...ticket,
          addons:
            addonsForTicket.length > 0 ? addonsForTicket.join(", ") : "None",
        };
      });

      // Return empty arrays if no data found instead of failing
      res.json({
        regularTickets: ticketsWithAddons || [],
        addonTickets: addonRecords || [],
      });
    } catch (err) {
      console.error("Error in /visitor/:id:", err);
      // Don't fail with 500 - return empty data with 200 status
      res.json({
        regularTickets: [],
        addonTickets: [],
        error:
          "Failed to fetch tickets, but returning empty arrays to prevent UI error",
      });
    }
  });

  // Add a new route to get visitor's addons
  router.get("/visitor/:id/addons", authenticateToken, async (req, res) => {
    try {
      const visitorId = req.params.id;

      // Ensure user is accessing their own addons or is staff
      if (
        parseInt(req.user.id) !== parseInt(visitorId) &&
        req.user.role !== "staff"
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized to view these addons" });
      }

      const [addons] = await pool.query(
        "SELECT * FROM addons WHERE VisitorID = ? ORDER BY StartDate DESC",
        [visitorId]
      );

      res.json(addons);
    } catch (err) {
      console.error("Error in /visitor/:id/addons:", err);
      res.status(500).json({ error: "Failed to fetch addons" });
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
      console.error("Error in /validate/:id:", err);
      res.status(500).json({ error: "Failed to validate ticket" });
    }
  });

  // Get revenue reports (managers only)
  router.get("/revenue", authenticateToken, async (req, res) => {
    try {
      // Check that user is manager
      if (req.user.role !== "staff" || req.user.staffRole !== "Manager") {
        return res
          .status(403)
          .json({ error: "Unauthorized. Manager access only." });
      }

      // Optional date range filters
      const { startDate, endDate } = req.query;

      let query = "SELECT * FROM TicketRevenueSummary";
      const params = [];

      if (startDate && endDate) {
        query += " WHERE Date BETWEEN ? AND ?";
        params.push(startDate, endDate);
      } else if (startDate) {
        query += " WHERE Date >= ?";
        params.push(startDate);
      } else if (endDate) {
        query += " WHERE Date <= ?";
        params.push(endDate);
      }

      query += " ORDER BY Date DESC";

      const [data] = await pool.query(query, params);

      // Get total revenue summary
      const [totals] = await pool.query(
        `
        SELECT 
          PurchaseType,
          SUM(Quantity) as TotalQuantity,
          SUM(TotalRevenue) as TotalRevenue
        FROM TicketRevenueSummary
        ${startDate || endDate ? "WHERE " : ""}
        ${startDate ? "Date >= ? " : ""}
        ${startDate && endDate ? "AND " : ""}
        ${endDate ? "Date <= ? " : ""}
        GROUP BY PurchaseType
      `,
        params.filter(Boolean)
      );

      res.json({
        details: data,
        summary: totals,
      });
    } catch (err) {
      console.error("Error in /revenue:", err);
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  return router;
};
