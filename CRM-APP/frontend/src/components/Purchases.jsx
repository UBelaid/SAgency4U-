import { useState, useEffect } from "react";
import axios from "axios";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [formData, setFormData] = useState({
    product_id: "",
    supplier_id: "",
    quantity: "",
    purchase_date: "",
    price: "",
  });
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(res.data);
    } catch (err) {
      setError(
        "Failed to fetch purchases: " +
          (err.response?.data?.error || err.message)
      );
      console.error("Fetch purchases error:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/purchases/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const res = await axios.get(
        "http://localhost:5000/api/purchases/suppliers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
        ? `http://localhost:5000/api/purchases/${editingId}`
        : "http://localhost:5000/api/purchases";
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
      fetchPurchases();
      setFormData({
        product_id: "",
        supplier_id: "",
        quantity: "",
        purchase_date: "",
        price: "",
      });
      setEditingId(null);
    } catch (err) {
      setError(
        "Failed to save purchase: " + (err.response?.data?.error || err.message)
      );
      console.error("Save purchase error:", err.response?.data || err);
    }
  };

  const handleEdit = (purchase) => {
    setFormData({
      product_id: purchase.product_id,
      supplier_id: purchase.supplier_id,
      quantity: purchase.quantity,
      purchase_date: purchase.purchase_date,
      price: purchase.price,
    });
    setEditingId(purchase.id);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPurchases();
    } catch (err) {
      setError(
        "Failed to delete purchase: " +
          (err.response?.data?.error || err.message)
      );
      console.error("Delete purchase error:", err.response?.data || err);
    }
  };

  return (
    <div className="mt-4">
      <h2>Purchases</h2>
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
              name="purchase_date"
              className="form-control"
              value={formData.purchase_date}
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
              {editingId ? "Update" : "Add"} Purchase
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
            <th>Purchase Date</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id}>
              <td>
                {products.find((p) => p.id === purchase.product_id)?.name ||
                  "Unknown"}
              </td>
              <td>
                {suppliers.find((s) => s.id === purchase.supplier_id)?.name ||
                  "Unknown"}
              </td>
              <td>{purchase.quantity}</td>
              <td>{purchase.purchase_date}</td>
              <td>{purchase.price}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(purchase)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(purchase.id)}
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

export default Purchases;
