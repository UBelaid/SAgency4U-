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
      "SELECT * FROM suppliers WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
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
    const { name, contact, email, phone, address } = req.body;
    if (!name || !contact) {
      return res.status(400).json({ error: "Name and contact are required" });
    }
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO suppliers (user_id, name, contact, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, contact, email || null, phone || null, address || null]
    );
    res
      .status(201)
      .json({ message: "Supplier added successfully", id: result.insertId });
  } catch (error) {
    console.error("Error adding supplier:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to add supplier: " + (error.sqlMessage || "Unknown error"),
      });
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
    const { name, contact, email, phone, address } = req.body;
    if (!name || !contact) {
      return res.status(400).json({ error: "Name and contact are required" });
    }
    connection = await pool.getConnection();
    const [supplier] = await connection.query(
      "SELECT * FROM suppliers WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (supplier.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query(
      "UPDATE suppliers SET name = ?, contact = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, contact, email || null, phone || null, address || null, id]
    );
    res.json({ message: "Supplier updated successfully" });
  } catch (error) {
    console.error("Error updating supplier:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to update supplier: " + (error.sqlMessage || "Unknown error"),
      });
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
    const [supplier] = await connection.query(
      "SELECT * FROM suppliers WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (supplier.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query("DELETE FROM suppliers WHERE id = ?", [id]);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to delete supplier: " + (error.sqlMessage || "Unknown error"),
      });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
