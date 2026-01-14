const express = require("express");
const router = express.Router();
const db = require("../db");

/* =====================
   REGISTER API
===================== */
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "User already exists or DB error" });
    }
    res.json({ message: "User registered successfully" });
  });
});

/* =====================
   LOGIN API
===================== */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";
  db.query(sql, [email, password], (err, result) => {
    if (result.length > 0) {
      res.json({
        id: result[0].id,
        name: result[0].name,
        email: result[0].email
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

module.exports = router;
