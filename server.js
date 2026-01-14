const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); 

// 🔹 MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mohana@123",   // ← your MySQL password
  database: "event_booking"
});

// 🔹 Connect DB
db.connect(err => {
  if (err) {
    console.error("Database connection failed ❌", err);
  } else {
    console.log("Database connected successfully ✅");
  }
});


db.query("USE event_booking", (err) => {
  if (err) console.log("DB select error", err);
  else console.log("Using event_booking database");
});

// 🔹 TEST API
app.get("/", (req, res) => {
  res.send("Event Booking Backend is running 🚀");
});

// 🔹 Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
// 🔹 USER REGISTRATION API
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "All fields are required"
    });
  }

  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')";

  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    res.json({
      success: true,
      message: "Registration successful"
    });
  });
});

app.get("/api/events", (req, res) => {
  const sql = "SELECT * FROM events";

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(result);
  });
});

// Book an event
app.post("/api/bookings", (req, res) => {
  const { user_id, event_id } = req.body;

  const sql = `
    INSERT INTO booking (user_id, event_id, booking_date)
    VALUES (?, ?, CURDATE())
  `;

  db.query(sql, [user_id, event_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Booking failed"
      });
    }

    res.json({
      success: true,
      message: "Booking successful"
    });
  });
});

// GET SINGLE EVENT BY ID (IMPORTANT FOR VIEW DETAILS)
app.get("/api/events/:id", (req, res) => {
  const eventId = req.params.id;

  const sql = `
    SELECT event_id, event_name, event_date, location, price
    FROM events
    WHERE event_id = ?
  `;

  db.query(sql, [eventId], (err, results) => {
    if (err) {
      console.error("Error fetching event:", err);
      return res.status(500).json({ success: false });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json(results[0]);
  });
});

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=? AND role='admin'";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    res.json({
      message: "Admin login successful",
      admin: result[0]
    });
  });
});
// backend API
app.get("/api/admin/users", (req, res) => {
  db.query("SELECT user_id, name, email, role FROM users", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/api/admin/events", (req, res) => {
  db.query("SELECT * FROM events", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});
app.get("/api/admin/bookings", (req, res) => {
  const sql = `
    SELECT
      b.booking_id,
      u.name AS user_name,
      u.email,
      e.event_name,
      e.event_date,
      e.location,
      e.price
    FROM booking b
    JOIN users u ON b.user_id = u.user_id
    JOIN events e ON b.event_id = e.event_id
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});


app.get("/api/debug/booking", (req, res) => {
  db.query("SELECT * FROM booking", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});
db.query("SELECT DATABASE() AS db", (err, result) => {
  if (err) console.log(err);
  else console.log("Connected DB:", result[0].db);
});

app.get("/api/debug/tables", (req, res) => {
  db.query("SHOW TABLES", (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});
// ADMIN DELETE EVENT
app.delete("/api/admin/events/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM events WHERE event_id = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.affectedRows === 0) {
        return res.json({ message: "No event found" });
      }

      res.json({ message: "Event deleted by admin" });
    }
  );
});
app.get("/api/bookings/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      b.booking_id,
      e.event_name,
      e.event_date,
      e.location,
      e.price
    FROM booking b
    JOIN events e ON b.event_id = e.event_id
    WHERE b.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql =
    "SELECT user_id, role FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Login SQL error:", err);
      return res.status(500).json({ success: false });
    }

    if (results.length === 0) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      user_id: results[0].user_id,
      role: results[0].role
    });
  });
});
// GET SINGLE EVENT BY ID (IMPORTANT FOR VIEW DETAILS)
app.get("/api/events/:id", (req, res) => {
  const eventId = req.params.id;

  const sql = `
    SELECT event_id, event_name, event_date, location, price
    FROM events
    WHERE event_id = ?
  `;

  db.query(sql, [eventId], (err, results) => {
    if (err) {
      console.error("Error fetching event:", err);
      return res.status(500).json({ success: false });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json(results[0]);
  });
});
// ADD EVENT (Organizer)
app.post("/api/events", (req, res) => {
  const { event_name, event_date, location, price } = req.body;

  const sql =
    "INSERT INTO events (event_name, event_date, location, price) VALUES (?, ?, ?, ?)";

  db.query(sql, [event_name, event_date, location, price], err => {
    if (err) return res.json({ message: "Error adding event" });

    res.json({ message: "Event added successfully" });
  });
});


// DELETE booking
app.delete("/api/bookings/:id", (req, res) => {
  const bookingId = req.params.id;

  const sql = "DELETE FROM booking WHERE booking_id = ?";

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});
// DELETE EVENT (Organizer)
app.delete("/api/events/:id", (req, res) => {
  const eventId = req.params.id;

  const sql = "DELETE FROM events WHERE event_id = ?";
  db.query(sql, [eventId], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ success: false });
    }

    res.json({ success: true });
  });
});

