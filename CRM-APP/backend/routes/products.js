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
      "SELECT * FROM products WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
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
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res
        .status(400)
        .json({ error: "Name, price, and stock are required" });
    }
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO products (user_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)",
      [userId, name, description || null, price, stock]
    );
    res
      .status(201)
      .json({ message: "Product added successfully", id: result.insertId });
  } catch (error) {
    console.error("Error adding product:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to add product: " + (error.sqlMessage || "Unknown error"),
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
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res
        .status(400)
        .json({ error: "Name, price, and stock are required" });
    }
    connection = await pool.getConnection();
    const [product] = await connection.query(
      "SELECT * FROM products WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (product.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query(
      "UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?",
      [name, description || null, price, stock, id]
    );
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to update product: " + (error.sqlMessage || "Unknown error"),
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
    const [product] = await connection.query(
      "SELECT * FROM products WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (product.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to delete product: " + (error.sqlMessage || "Unknown error"),
      });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
