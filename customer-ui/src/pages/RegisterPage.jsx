import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import cacing from "../assets/images/cacing.png";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const goToLogin = () => {
    navigate("/login");
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9]{10,13}$/.test(formData.phone)) {
      newErrors.phone = "Nomor telepon harus 10-13 digit angka";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    } else if (formData.username.length < 4) {
      newErrors.username = "Username minimal 4 karakter";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      // Submit form data
      console.log("Form submitted:", formData);
      alert("Pendaftaran berhasil! Silakan cek email untuk verifikasi.");
      // Redirect atau reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      });
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-between"
      style={{ minHeight: "100vh", backgroundColor: "#153B77" }}
    >
      {/* MAIN CONTENT */}
      <div className="container-fluid d-flex justify-content-center align-items-center flex-grow-1 py-4">
        <div className="row w-100 d-flex justify-content-center align-items-center">
          {/* LEFT SECTION */}
          <div className="col-md-6 text-white text-center px-5 d-none d-md-block">
            <h2 className="fw-bold">KF APPS</h2>
            <h3 className="fw-bold">Mini E-Commerce</h3>

            <div className="mt-5">
              <h4 className="fw-bold mb-4">Bergabung Bersama Kami</h4>
              <p className="mb-4">
                Dapatkan akses ke berbagai produk eksklusif, promo spesial, dan
                pengalaman belanja yang menyenangkan.
              </p>
              <ul className="list-unstyled text-start d-inline-block">
                <li className="mb-3">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  Akses ke produk eksklusif
                </li>
                <li className="mb-3">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  Notifikasi promo langsung
                </li>
                <li className="mb-3">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  Riwayat transaksi tersimpan
                </li>
                <li>
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  Support 24/7
                </li>
              </ul>
            </div>

            <div className="mt-5">
              <img
                src={cacing}
                alt="Logo"
                width="110"
                height="110"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <p className="mt-3">powered by :</p>
              <h6>Underground Innovation Engineers.</h6>
            </div>
          </div>

          {/* RIGHT SECTION REGISTER CARD */}
          <div className="col-md-6 col-lg-5">
            <div
              className="bg-white p-4 shadow rounded"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              <h5
                className="fw-bold mb-4 text-center"
                style={{ color: "#153B77" }}
              >
                <i className="bi bi-person-plus me-2"></i>
                Daftar Akun Baru
              </h5>

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      className={`form-control ${
                        errors.fullName ? "is-invalid" : ""
                      }`}
                      placeholder="Masukkan nama lengkap"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">{errors.fullName}</div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      placeholder="contoh@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    Nomor Telepon <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-phone"></i>
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      placeholder="0812 3456 7890"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    Username <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-at"></i>
                    </span>
                    <input
                      type="text"
                      name="username"
                      className={`form-control ${
                        errors.username ? "is-invalid" : ""
                      }`}
                      placeholder="Pilih username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>
                  <small className="text-muted">Minimal 4 karakter</small>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      name="password"
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      placeholder="Buat password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                  <small className="text-muted">Minimal 6 karakter</small>
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    Konfirmasi Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control ${
                        errors.confirmPassword ? "is-invalid" : ""
                      }`}
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        errors.agreeTerms ? "is-invalid" : ""
                      }`}
                      type="checkbox"
                      name="agreeTerms"
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor="agreeTerms"
                    >
                      Saya menyetujui{" "}
                      <a
                        href="#"
                        className="text-decoration-none"
                        style={{ color: "#153B77" }}
                      >
                        Syarat & Ketentuan
                      </a>{" "}
                      dan{" "}
                      <a
                        href="#"
                        className="text-decoration-none"
                        style={{ color: "#153B77" }}
                      >
                        Kebijakan Privasi
                      </a>{" "}
                      <span className="text-danger">*</span>
                    </label>
                    {errors.agreeTerms && (
                      <div className="text-danger small mt-1">
                        {errors.agreeTerms}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn w-100 text-white fw-bold py-2"
                  style={{ backgroundColor: "#E39A3B" }}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Daftar Sekarang
                </button>

                {/* Login Link */}
                <div className="text-center mt-3">
                  <small className="text-muted">Sudah punya akun? </small>
                  <button
                    className="btn btn-link text-decoration-none"
                    style={{ color: "#153B77" }}
                    onClick={goToLogin}
                  >
                    Masuk di sini
                  </button>
                </div>

                {/* Divider */}
                <div className="position-relative my-4">
                  <hr />
                  <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    Atau daftar dengan
                  </span>
                </div>

                {/* Social Login */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                    >
                      <i className="bi bi-google me-2"></i>
                      Google
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                    >
                      <i className="bi bi-facebook me-2"></i>
                      Facebook
                    </button>
                  </div>
                </div>
              </form>
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

export default RegisterPage;
