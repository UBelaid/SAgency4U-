const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "check_app_db",
});

db.connect((err) => {
  if (err && err.code === "ER_BAD_DB_ERROR") {
    const conn = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    conn.query("CREATE DATABASE IF NOT EXISTS check_app_db", (err) => {
      if (err) throw err;
      conn.query("USE check_app_db", () => {
        conn.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
          )
        `);
        conn.query(`
          CREATE TABLE IF NOT EXISTS clients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL
          )
        `);
        conn.end();
        db.connect((err) => {
          if (err) throw err;
          console.log("MySQL Connected");
        });
      });
    });
  } else if (err) {
    throw err;
  } else {
    console.log("MySQL Connected");
  }
});

// Register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Registration failed: " + err.message });
        res.status(201).json({ message: "User registered" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(401).json({ error: "Invalid credentials" });
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );
      res.json({ token });
    }
  );
});

// Get clients
app.get("/clients", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    db.query("SELECT * FROM clients", (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to fetch clients: " + err.message });
      res.json(results);
    });
  });
});

// Add client
app.post("/clients", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    const { name, phone } = req.body;
    if (!name || !phone)
      return res.status(400).json({ error: "Name and phone are required" });
    db.query(
      "INSERT INTO clients (name, phone) VALUES (?, ?)",
      [name, phone],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Failed to add client: " + err.message });
        res.status(201).json({ message: "Client added" });
      }
    );
  });
});

// Update client
app.put("/clients/:id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    const { name, phone } = req.body;
    const { id } = req.params;
    if (!name || !phone)
      return res.status(400).json({ error: "Name and phone are required" });
    db.query(
      "UPDATE clients SET name = ?, phone = ? WHERE id = ?",
      [name, phone, id],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Failed to update client: " + err.message });
        res.json({ message: "Client updated" });
      }
    );
  });
});

// Delete client
app.delete("/clients/:id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    db.query("DELETE FROM clients WHERE id = ?", [id], (err) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to delete client: " + err.message });
      res.json({ message: "Client deleted" });
    });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
