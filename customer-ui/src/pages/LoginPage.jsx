import React from "react";
import cacing from "../assets/images/cacing.png";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useState } from "react";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToLand = () => {
    navigate("/");
  };

  const goToReg = () => {
    navigate("/register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.email));

      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
            <form onSubmit={handleSubmit}>
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

                {/* PERBAIKAN: Tambahkan error message */}
                {error && (
                  <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                  >
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError("")}
                    ></button>
                  </div>
                )}

                {/* Email Input */}
                <input
                  type="email"
                  name="email" // PERBAIKAN: Tambahkan name
                  id="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                {/* Password Input */}
                <input
                  type="password"
                  name="password" // PERBAIKAN: Tambahkan name
                  id="password"
                  className="form-control mb-2"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                {/* <small style={{ color: "#153B77", cursor: "pointer" }}>
                  Lupa Password?
                </small> */}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn w-100 mt-3 text-white fw-bold"
                  style={{ backgroundColor: "#E39A3B" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>

                <div className="text-center mt-2">
                  <small className="text-muted">Not registered? </small>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0 ms-1"
                    style={{ color: "#325A89" }}
                    onClick={goToReg}
                  >
                    Register
                  </button>
                </div>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none p-0"
                    style={{ color: "#325A89" }}
                    onClick={goToLand}
                  >
                    Kembali
                  </button>
                </div>
              </div>
            </form>
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
