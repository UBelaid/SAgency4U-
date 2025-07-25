const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

router.get("/", async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM clients WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  } finally {
    if (connection) connection.release();
  }
});

router.post("/", async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { name, email, phone, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO clients (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)",
      [userId, name, email, phone || null, address || null]
    );
    res
      .status(201)
      .json({ message: "Client added successfully", id: result.insertId });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ error: "Failed to add client" });
  } finally {
    if (connection) connection.release();
  }
});

router.put("/:id", async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    connection = await pool.getConnection();
    const [client] = await connection.query(
      "SELECT * FROM clients WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (client.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query(
      "UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone || null, address || null, id]
    );
    res.json({ message: "Client updated successfully" });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  } finally {
    if (connection) connection.release();
  }
});

router.delete("/:id", async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { id } = req.params;
    connection = await pool.getConnection();
    const [client] = await connection.query(
      "SELECT * FROM clients WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (client.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query("DELETE FROM clients WHERE id = ?", [id]);
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
