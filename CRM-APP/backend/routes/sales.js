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
      "SELECT * FROM sales WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: "Failed to fetch sales" });
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
    const { product_id, supplier_id, quantity, sale_date, price } = req.body;
    if (!product_id || !supplier_id || !quantity || !sale_date || !price) {
      return res.status(400).json({
        error:
          "Product ID, supplier ID, quantity, sale date, and price are required",
      });
    }
    connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO sales (user_id, product_id, supplier_id, quantity, sale_date, price) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, product_id, supplier_id, quantity, sale_date, price]
    );
    res
      .status(201)
      .json({ message: "Sale added successfully", id: result.insertId });
  } catch (error) {
    console.error("Error adding sale:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error: "Failed to add sale: " + (error.sqlMessage || "Unknown error"),
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
    const { product_id, supplier_id, quantity, sale_date, price } = req.body;
    if (!product_id || !supplier_id || !quantity || !sale_date || !price) {
      return res.status(400).json({
        error:
          "Product ID, supplier ID, quantity, sale date, and price are required",
      });
    }
    connection = await pool.getConnection();
    const [sale] = await connection.query(
      "SELECT * FROM sales WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (sale.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query(
      "UPDATE sales SET product_id = ?, supplier_id = ?, quantity = ?, sale_date = ?, price = ? WHERE id = ?",
      [product_id, supplier_id, quantity, sale_date, price, id]
    );
    res.json({ message: "Sale updated successfully" });
  } catch (error) {
    console.error("Error updating sale:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to update sale: " + (error.sqlMessage || "Unknown error"),
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
    const [sale] = await connection.query(
      "SELECT * FROM sales WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (sale.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    await connection.query("DELETE FROM sales WHERE id = ?", [id]);
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error.sqlMessage || error);
    res
      .status(500)
      .json({
        error:
          "Failed to delete sale: " + (error.sqlMessage || "Unknown error"),
      });
  } finally {
    if (connection) connection.release();
  }
});

router.get("/products", async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT id, name FROM products WHERE user_id = ?",
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

router.get("/suppliers", async (req, res) => {
  let connection;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT id, name FROM suppliers WHERE user_id = ?",
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

module.exports = router;
