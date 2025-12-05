import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import cacing from "../assets/images/cacing.png";

function LoginPage() {
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

            <div className="mt-4">
              <img
                src={cacing}
                alt="Logo"
                width="110"
                height="110"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
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

              {/* Username */}
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Username"
              />

              {/* Password */}
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Password"
              />

              <small style={{ color: "#153B77", cursor: "pointer" }}>
                Lupa Password?
              </small>

              <button
                className="btn w-100 mt-3 text-white fw-bold"
                style={{ backgroundColor: "#E39A3B" }}
              >
                Log In
              </button>

              <div className="text-center mt-2">
                <small className="text-muted">Not registered? </small>
                <a
                  href="#"
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

export default LoginPage;
