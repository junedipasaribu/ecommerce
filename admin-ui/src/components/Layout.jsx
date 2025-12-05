import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom";
import { hasPerm } from "../utils/hasPermission";

const UserGreeting = () => {
  const { user, logout } = useAuth();

  const name = user?.name || "Admin";
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

  return (
    <>
      <h6 className="m-0 me-3 text-muted">Welcome, {name}</h6>

      <div className="dropdown">
        <a
          href="#"
          className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle"
          id="topUserDropdown"
          data-bs-toggle="dropdown"
        >
          <img
            src={avatar}
            alt="avatar"
            width="36"
            height="36"
            className="rounded-circle me-2"
          />
        </a>

        <ul className="dropdown-menu dropdown-menu-end shadow">
          <li>
            <a className="dropdown-item" href="#">
              <i className="bi bi-person me-2"></i> Profile
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              <i className="bi bi-gear me-2"></i> Settings
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => logout()}
            >
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

const Layout = () => {
  const [open, setOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();

  // AUTO CLOSE DROPDOWN SAAT PINDAH HALAMAN
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", background: "#f8f9fc" }}
    >
      {/* SIDEBAR */}
      <div
        className="bg-white shadow-sm"
        style={{
          width: open ? "240px" : "70px",
          transition: "0.3s",
          borderRight: "1px solid #e5e7eb",
          position: "fixed",
          height: "100vh",
          zIndex: 99,
        }}
      >
        {/* LOGO */}
        <div className="p-3 border-bottom">
          <h5
            className="fw-bold m-0"
            style={{ opacity: open ? 1 : 0, transition: "0.3s" }}
          >
            🏥 KF APPS
          </h5>
        </div>

        {/* MENU */}
        <ul className="list-unstyled mt-3 px-2">
          <li className="mb-2">
            {(() => {
              const { user } = useAuth();
              const canRead = hasPerm(user, "dashboard", "read");
              return (
                <Link
                  to="/"
                  onClick={(e) => !canRead && e.preventDefault()}
                  className="d-flex align-items-center p-2 rounded text-decoration-none"
                  style={{ color: "#374151", opacity: canRead ? 1 : 0.65 }}
                >
                  <i className="bi bi-grid fs-5"></i>
                  <span
                    className="ms-3"
                    style={{ display: open ? "block" : "none" }}
                  >
                    Dashboard
                  </span>
                </Link>
              );
            })()}
          </li>

          <li className="mb-2">
            {(() => {
              const { user } = useAuth();
              const canRead = hasPerm(user, "product", "read");
              return (
                <Link
                  to="/products"
                  onClick={(e) => !canRead && e.preventDefault()}
                  className="d-flex align-items-center p-2 rounded text-decoration-none"
                  style={{ color: "#374151", opacity: canRead ? 1 : 0.65 }}
                >
                  <i className="bi bi-box-seam fs-5"></i>
                  <span
                    className="ms-3"
                    style={{ display: open ? "block" : "none" }}
                  >
                    Products
                  </span>
                </Link>
              );
            })()}
          </li>

          <li className="mb-2">
            {(() => {
              const { user } = useAuth();
              const canRead = hasPerm(user, "order", "read");
              return (
                <Link
                  to="/orders"
                  onClick={(e) => !canRead && e.preventDefault()}
                  className="d-flex align-items-center p-2 rounded text-decoration-none"
                  style={{ color: "#374151", opacity: canRead ? 1 : 0.65 }}
                >
                  <i className="bi bi-cart-check fs-5"></i>
                  <span
                    className="ms-3"
                    style={{ display: open ? "block" : "none" }}
                  >
                    Orders
                  </span>
                </Link>
              );
            })()}
          </li>

          <li className="mb-2">
            {(() => {
              const { user } = useAuth();
              const canRead = hasPerm(user, "report", "read");
              return (
                <Link
                  to="/reports"
                  onClick={(e) => !canRead && e.preventDefault()}
                  className="d-flex align-items-center p-2 rounded text-decoration-none"
                  style={{ color: "#374151", opacity: canRead ? 1 : 0.65 }}
                >
                  <i className="bi bi-bar-chart fs-5"></i>
                  <span
                    className="ms-3"
                    style={{ display: open ? "block" : "none" }}
                  >
                    Reports
                  </span>
                </Link>
              );
            })()}
          </li>

          <li className="mb-2">
            <Link
              to="/customers"
              className="d-flex align-items-center p-2 rounded text-decoration-none"
              style={{ color: "#374151" }}
            >
              <i className="bi bi-people fs-5"></i>
              <span
                className="ms-3"
                style={{ display: open ? "block" : "none" }}
              >
                Customers
              </span>
            </Link>
          </li>

          {/* USER MANAGEMENT DROPDOWN */}
          <li className="mb-2">
            <div>
              <button
                className="d-flex align-items-center p-2 rounded text-decoration-none w-100 bg-transparent border-0"
                style={{ color: "#374151" }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <i className="bi bi-person fs-5"></i>

                <span
                  className="ms-3"
                  style={{ display: open ? "block" : "none" }}
                >
                  Users Management
                </span>

                <i
                  className="bi bi-chevron-down ms-auto"
                  style={{
                    display: open ? "block" : "none",
                    transition: "0.2s",
                    fontSize: "0.8rem",
                    transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                ></i>
              </button>

              {userMenuOpen && open && (
                <div className="ms-4 mt-2">
                  <ul className="list-unstyled">
                    <li>
                      <Link
                        to="/users"
                        className="d-flex align-items-center p-2 rounded text-decoration-none"
                        style={{ color: "#4B5563" }}
                      >
                        <i className="bi bi-person-lines-fill"></i>
                        <span className="ms-2">Daftar User</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/users/roles"
                        className="d-flex align-items-center p-2 rounded text-decoration-none"
                        style={{ color: "#4B5563" }}
                      >
                        <i className="bi bi-shield-lock"></i>
                        <span className="ms-2">Edit User Roles</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: open ? "240px" : "70px",
          transition: "0.3s",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {/* TOP NAVBAR */}
        <nav
          className="navbar navbar-light bg-white shadow-sm px-4 d-flex justify-content-between"
          style={{ height: "65px" }}
        >
          {/* Toggle Sidebar */}
          <button className="btn btn-light" onClick={() => setOpen(!open)}>
            <i className="bi bi-list fs-4"></i>
          </button>

          {/* Right user section */}
          <div className="d-flex align-items-center">
            <UserGreeting />
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="p-4 flex-grow-1">
          <Outlet />
        </div>
        {/* FOOTER */}
        <footer className="bg-light py-3 text-center border-top">
          <small className="text-muted">
            © Tim 5 Cacing Capston Project 2025. Hak Cipta Dilindungi
          </small>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
