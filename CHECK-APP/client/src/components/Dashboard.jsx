import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Clients from "./Clients";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg`}
      >
        <div className="p-6">
          <div className="flex items-center mb-8">
            <img
              src="https://via.placeholder.com/40" // Replace with your logo URL or local asset
              alt="Logo"
              className="w-10 h-10 mr-2"
            />
            <h2 className="text-2xl font-semibold tracking-tight">Check App</h2>
          </div>
          <button
            className="md:hidden p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
            onClick={() => setIsSidebarOpen(false)}
          >
            Close
          </button>
        </div>
        <nav className="mt-2">
          <Link
            to="/dashboard/clients"
            className="block px-6 py-3 text-sm font-medium hover:bg-gray-800 transition"
            onClick={() => setIsSidebarOpen(false)}
          >
            Clients
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <button
          className="md:hidden mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          onClick={() => setIsSidebarOpen(true)}
        >
          Menu
        </button>
        <Routes>
          <Route path="/clients" element={<Clients />} />
          <Route
            path="/"
            element={
              <div className="text-gray-600">
                Select a section from the sidebar
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
