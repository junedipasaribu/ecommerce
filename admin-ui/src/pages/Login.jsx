import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Role-based landing: send users to a page based on their role
      // Default to dashboard `/` for admins / superadmin
      const roleLanding = (userRole) => {
        switch (userRole) {
          case "seller_owner":
          case "seller_admin":
          case "seller_staff":
            return "/orders";
          case "seller_inventory":
            return "/products";
          case "admin":
          case "superadmin":
          default:
            return "/";
        }
      };

      // try to find logged-in user from localStorage (AuthContext sets it there)
      let landed = "/";
      try {
        const raw = localStorage.getItem("auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          const role = parsed?.user?.role;
          landed = roleLanding(role);
        }
      } catch (e) {
        landed = "/";
      }

      navigate(landed, { replace: true });
    } catch (err) {
      Swal.fire("Login Failed", err.message || "Invalid credentials", "error");
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-between"
      style={{ minHeight: "100vh", backgroundColor: "#153B77" }}
    >
      {/* MAIN CONTENT */}
      <div className="container-fluid d-flex justify-content-center align-items-center flex-grow-1">
        <div className="row w-100 d-flex justify-content-center align-items-center">
          {/* LEFT SECTION */}
          <div className="col-md-6 text-white text-center px-5">
            <h2 className="fw-bold">KF APPS</h2>
            <h3 className="fw-bold">Mini E-Commerce</h3>

            <p className="mt-4">powered by :</p>
            <h6>Underground Innovation Engineers.</h6>
            {/* 
            <div className="mt-4">
              <img
                src={cacing}
                alt="Logo"
                width="110"
                height="110"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div> */}
          </div>

          {/* RIGHT SECTION LOGIN CARD */}
          <div className="col-md-4">
            <div
              className="bg-white p-4 shadow rounded"
              style={{ minWidth: "350px" }}
            >
              <h5
                className="fw-bold mb-4 text-center"
                style={{ color: "#153B77" }}
              >
                Login
              </h5>

              <form onSubmit={handleSubmit}>
                {/* Email */}

                <div className="position-relative mb-3">
                  <input
                    type="text"
                    className="form-control pe-5"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <i
                    className="bi bi-envelope email-icon"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "18px",
                      color: "#6c757d",
                      pointerEvents: "none",
                    }}
                  ></i>
                </div>

                {/* Password */}
                <div className="position-relative mb-3">
                  <input
                    type="password"
                    className="form-control mb-2"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <i
                    className="bi bi-person person-icon"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "18px",
                      color: "#6c757d",
                      pointerEvents: "none",
                    }}
                  ></i>
                </div>
                <small style={{ color: "#153B77", cursor: "pointer" }}>
                  Lupa Password?
                </small>

                <button
                  type="submit"
                  className="btn w-100 mt-3 text-white fw-bold"
                  style={{ backgroundColor: "#E39A3B" }}
                >
                  Log In
                </button>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">Not registered? </small>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                  className="text-decoration-none"
                  style={{ color: "#153B77" }}
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer
        className="text-center py-2 text-white fw-semibold"
        style={{ backgroundColor: "#E39A3B" }}
      >
        © Tim 5 Cacing Capston Project 2025. Hak Cipta Dilindungi
      </footer>
    </div>
  );
}
