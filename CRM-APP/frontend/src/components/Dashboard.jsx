import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Clients from "./Clients";
import Suppliers from "./Suppliers";
import Products from "./Products";
import Purchases from "./Purchases";
import Sales from "./Sales";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-2 d-none d-md-block bg-light sidebar">
          <div className="sidebar-sticky pt-3">
            <h5 className="text-center">CRM Dashboard</h5>
            <ul className="nav flex-column">
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/dashboard/clients"
                  activeClassName="active"
                >
                  Clients
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/dashboard/suppliers"
                  activeClassName="active"
                >
                  Suppliers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/dashboard/products"
                  activeClassName="active"
                >
                  Products
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/dashboard/purchases"
                  activeClassName="active"
                >
                  Purchases
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/dashboard/sales"
                  activeClassName="active"
                >
                  Sales
                </NavLink>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
          <Routes>
            <Route path="clients" element={<Clients />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="products" element={<Products />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="sales" element={<Sales />} />
            <Route path="/" element={<Clients />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
