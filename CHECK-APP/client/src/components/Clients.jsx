import { useState, useEffect } from "react";
import axios from "axios";

function Clients() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [message, setMessage] = useState("");

  const fetchClients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/clients", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClients(res.data);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Error fetching clients");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setMessage("Name and phone are required");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/clients",
        { name, phone },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setName("");
      setPhone("");
      fetchClients();
      setMessage("Client added successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error adding client");
    }
  };

  const handleEdit = (client) => {
    setEditId(client.id);
    setEditName(client.name);
    setEditPhone(client.phone);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName || !editPhone) {
      setMessage("Name and phone are required");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/clients/${editId}`,
        { name: editName, phone: editPhone },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setEditId(null);
      setEditName("");
      setEditPhone("");
      fetchClients();
      setMessage("Client updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error updating client");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axios.delete(`http://localhost:5000/clients/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchClients();
        setMessage("Client deleted successfully");
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setMessage(err.response?.data?.error || "Error deleting client");
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Clients</h2>
      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
      <form
        onSubmit={editId ? handleUpdate : handleAdd}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <input
          type="text"
          placeholder="Name"
          value={editId ? editName : name}
          onChange={(e) =>
            editId ? setEditName(e.target.value) : setName(e.target.value)
          }
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Phone"
          value={editId ? editPhone : phone}
          onChange={(e) =>
            editId ? setEditPhone(e.target.value) : setPhone(e.target.value)
          }
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {editId ? "Update" : "Add"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setEditName("");
              setEditPhone("");
            }}
            className="px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        )}
      </form>
      <input
        type="text"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-gray-700 font-medium">Name</th>
              <th className="p-3 text-left text-gray-700 font-medium">Phone</th>
              <th className="p-3 text-left text-gray-700 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{client.name}</td>
                <td className="p-3 border-b">{client.phone}</td>
                <td className="p-3 border-b">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Clients;
