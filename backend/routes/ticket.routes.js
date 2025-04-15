// routes/ticket.routes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");

module.exports = (pool) => {

  router.get("/use/:id", async (req, res) => {
    const id = req.params.id;
    
    // Respond with a minimal HTML page that uses JavaScript (fetch) to call the POST endpoint.
    res.send(`
      <html>
        <head>
          <title>Activating Ticket</title>
        </head>
        <body>
          <p id="message">Activating your ticket, please wait...</p>
          <script>
            // Use fetch to send a POST request to update the ticket status.
            fetch("/api/tickets/use/${id}", { method: "POST" })
              .then(response => response.json())
              .then(data => {
                // Display the success (or error) message on the page
                document.getElementById("message").innerText = data.message || "Ticket marked as used.";
              })
              .catch(err => {
                document.getElementById("message").innerText = "Error marking ticket as used.";
              });
          </script>
        </body>
      </html>
    `);
  });


  // Mark a ticket (and its associated add-ons) as used
router.post("/use/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // First update the ticket if it is still Valid.
    const [ticketUpdateResult] = await pool.query(
      "UPDATE tickets SET Used = ? WHERE TicketID = ? AND Used = ?",
      ["Used", id, "Valid"]
    );

    if (ticketUpdateResult.affectedRows === 0) {
      return res.status(400).json({ error: "Ticket not found or already used." });
    }
    
    // Retrieve the PurchaseID for the ticket we just updated.
    const [rows] = await pool.query(
      "SELECT PurchaseID FROM tickets WHERE TicketID = ?",
      [id]
    );
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "PurchaseID not found for ticket." });
    }
    
    const purchaseID = rows[0].PurchaseID;
    
    // Update all addons associated with this PurchaseID that are still Valid.
    const [addonUpdateResult] = await pool.query(
      "UPDATE addons SET Used = ? WHERE PurchaseID = ? AND Used = ?",
      ["Used", purchaseID, "Valid"]
    );

    res.json({ message: "Ticket and associated add-ons marked as used." });
  } catch (err) {
    console.error("Error marking ticket (and add-ons) as used:", err);
    res.status(500).json({ error: "Failed to mark ticket as used." });
  }
});


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
      const purchaseID = Date.now();
  
      // Parse the visitDate as a UTC date.
      const selectedDate = new Date(visitDate + "T00:00:00Z");
      const today = new Date();
      // Convert today's date to a UTC date string for comparison
      const todayString = today.toISOString().split("T")[0];
      const todayDate = new Date(todayString + "T00:00:00Z");
  
      // Validate that the selected visit date is not in the past.
      if (selectedDate < todayDate) {
        return res.status(400).json({
          error: "You cannot purchase tickets for a past date. Please select today's date or a future date."
        });
      }
  
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
              const startDate = new Date(visitDate + "T00:00:00Z"); // this represents 2025-04-25 00:00:00 UTC
              const startDateString = startDate.toISOString().split("T")[0];
  
              const endDate = new Date(startDate);
              const endDateString = endDate.toISOString().split("T")[0];
  
              const [result] = await connection.query(
                "INSERT INTO tickets (PurchaseID, VisitorID, TicketType, Price, EnclosureAccess, StartDate, EndDate, Used) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [purchaseID, visitorId, ticketType, price, "None", startDateString, endDateString, "Valid"]
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
  
        // Process add-ons similarly by ensuring proper UTC parsing:
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
            const startDateAddon = new Date(visitDate + "T00:00:00Z");
            const startDateAddonString = startDateAddon.toISOString().split("T")[0];
            const endDateAddon = new Date(startDateAddon);
            const endDateAddonString = endDateAddon.toISOString().split("T")[0];
    
            const [result] = await connection.query(
              "INSERT INTO addons (PurchaseID, VisitorID, Type, Price, Description, StartDate, EndDate, Used) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [purchaseID, visitorId, addon, price, accessType, startDateAddonString, endDateAddonString, "Valid"]
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
      const addonsByPurchase = {};
      addonRecords.forEach((addon) => {
        // Ensure the addon record has a PurchaseID property.
        if (!addon.PurchaseID) return;
        if (!addonsByPurchase[addon.PurchaseID]) {
          addonsByPurchase[addon.PurchaseID] = [];
        }
        addonsByPurchase[addon.PurchaseID].push(addon.Description);
      });
      
      // Attach the correct addon information to each ticket based on PurchaseID.
      const ticketsWithAddons = regularTickets.map((ticket) => {
        const purchaseID = ticket.PurchaseID; // This should be available from your INSERT results.
        const ticketAddons = addonsByPurchase[purchaseID] || [];
        return {
          ...ticket,
          addons: ticketAddons.length > 0 ? ticketAddons.join(", ") : "None",
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

  // Get revenue reports (managers only) - Enhanced with additional filters
  router.get("/revenue", authenticateToken, async (req, res) => {
    try {
      // Check that user is manager
      if (req.user.role !== "staff" || req.user.staffRole !== "Manager") {
        return res
          .status(403)
          .json({ error: "Unauthorized. Manager access only." });
      }

      // Expanded filter options
      const {
        startDate,
        endDate,
        purchaseType,
        itemName,
        minAmount,
        maxAmount,
        sortBy,
        sortDirection,
      } = req.query;

      let query = "SELECT * FROM TicketRevenueSummary";
      const whereConditions = [];
      const params = [];

      // Date range filters
      if (startDate) {
        whereConditions.push("Date >= ?");
        params.push(startDate);
      }

      if (endDate) {
        whereConditions.push("Date <= ?");
        params.push(endDate);
      }

      // Purchase type filter
      if (purchaseType && purchaseType !== "All") {
        whereConditions.push("PurchaseType = ?");
        params.push(purchaseType);
      }

      // Item name filter (using LIKE for partial matches)
      if (itemName) {
        whereConditions.push("ItemName LIKE ?");
        params.push(`%${itemName}%`);
      }

      // Revenue amount filters
      if (minAmount && !isNaN(parseFloat(minAmount))) {
        whereConditions.push("TotalRevenue >= ?");
        params.push(parseFloat(minAmount));
      }

      if (maxAmount && !isNaN(parseFloat(maxAmount))) {
        whereConditions.push("TotalRevenue <= ?");
        params.push(parseFloat(maxAmount));
      }

      // Add WHERE clause if we have conditions
      if (whereConditions.length > 0) {
        query += " WHERE " + whereConditions.join(" AND ");
      }

      // Sorting
      if (sortBy) {
        const validColumns = [
          "Date",
          "PurchaseType",
          "ItemName",
          "Quantity",
          "TotalRevenue",
        ];
        const column = validColumns.includes(sortBy) ? sortBy : "Date";
        const direction =
          sortDirection && sortDirection.toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";

        query += ` ORDER BY ${column} ${direction}`;
      } else {
        query += " ORDER BY Date DESC";
      }

      const [data] = await pool.query(query, params);

      // Build the summary query with the same filters
      let summaryQuery = `
        SELECT 
          PurchaseType,
          SUM(Quantity) as TotalQuantity,
          SUM(TotalRevenue) as TotalRevenue
        FROM TicketRevenueSummary
      `;

      if (whereConditions.length > 0) {
        summaryQuery += " WHERE " + whereConditions.join(" AND ");
      }

      summaryQuery += " GROUP BY PurchaseType";

      const [totals] = await pool.query(summaryQuery, params);

      // Return metadata about available filters
      const [uniquePurchaseTypes] = await pool.query(
        "SELECT DISTINCT PurchaseType FROM TicketRevenueSummary"
      );

      const [uniqueItemNames] = await pool.query(
        "SELECT DISTINCT ItemName FROM TicketRevenueSummary"
      );

      res.json({
        details: data,
        summary: totals,
        metadata: {
          purchaseTypes: uniquePurchaseTypes.map((item) => item.PurchaseType),
          itemNames: uniqueItemNames.map((item) => item.ItemName),
          totalCount: data.length,
          filteredCount: data.length,
        },
      });
    } catch (err) {
      console.error("Error in /revenue:", err);
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  return router;
};
