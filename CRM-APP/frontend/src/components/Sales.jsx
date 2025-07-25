import { useState, useEffect } from "react";
import axios from "axios";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    product_id: "",
    supplier_id: "",
    quantity: "",
    sale_date: "",
    price: "",
  });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(res.data);
    } catch (err) {
      setError(
        "Failed to fetch sales: " + (err.response?.data?.error || err.message)
      );
      console.error("Fetch sales error:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/sales/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      setError(
        "Failed to fetch products: " +
          (err.response?.data?.error || err.message)
      );
      console.error("Fetch products error:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/sales/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(res.data);
    } catch (err) {
      setError(
        "Failed to fetch suppliers: " +
          (err.response?.data?.error || err.message)
      );
      console.error("Fetch suppliers error:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingId
        ? `http://localhost:5000/api/sales/${editingId}`
        : "http://localhost:5000/api/sales";
      const method = editingId ? "put" : "post";
      await axios[method](
        url,
        {
          ...formData,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchSales();
      setFormData({
        product_id: "",
        supplier_id: "",
        quantity: "",
        sale_date: "",
        price: "",
      });
      setEditingId(null);
    } catch (err) {
      setError(
        "Failed to save sale: " + (err.response?.data?.error || err.message)
      );
      console.error("Save sale error:", err.response?.data || err);
    }
  };

  const handleEdit = (sale) => {
    setFormData({
      product_id: sale.product_id,
      supplier_id: sale.supplier_id,
      quantity: sale.quantity,
      sale_date: sale.sale_date,
      price: sale.price,
    });
    setEditingId(sale.id);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSales();
    } catch (err) {
      setError(
        "Failed to delete sale: " + (err.response?.data?.error || err.message)
      );
      console.error("Delete sale error:", err.response?.data || err);
    }
  };

  return (
    <div className="mt-4">
      <h2>Sales</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <select
              name="product_id"
              className="form-control"
              value={formData.product_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              name="supplier_id"
              className="form-control"
              value={formData.supplier_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              name="quantity"
              className="form-control"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              name="sale_date"
              className="form-control"
              value={formData.sale_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              step="0.01"
              name="price"
              className="form-control"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              {editingId ? "Update" : "Add"} Sale
            </button>
          </div>
        </div>
      </form>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Product</th>
            <th>Supplier</th>
            <th>Quantity</th>
            <th>Sale Date</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>
                {products.find((p) => p.id === sale.product_id)?.name ||
                  "Unknown"}
              </td>
              <td>
                {suppliers.find((s) => s.id === sale.supplier_id)?.name ||
                  "Unknown"}
              </td>
              <td>{sale.quantity}</td>
              <td>{sale.sale_date}</td>
              <td>{sale.price}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(sale)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(sale.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Sales;
