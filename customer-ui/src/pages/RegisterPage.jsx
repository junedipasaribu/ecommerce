import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import cacing from "../assets/images/cacing.png";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const goToLogin = () => {
    navigate("/login");
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    pin: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "pin") {
      if (/^\d*$/.test(value) && value.length <= 6) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else if (name === "phone") {
      // Validasi phone number (hanya angka)
      if (/^\d*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    // Clear error ketika user mulai mengetik
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Clear global error
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password harus mengandung huruf besar, kecil, dan angka";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (formData.phone.length < 10 || formData.phone.length > 13) {
      newErrors.phone = "Nomor telepon harus 10-13 digit";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Alamat wajib diisi";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Alamat terlalu pendek, minimal 10 karakter";
    }

    if (!formData.pin.trim()) {
      newErrors.pin = "PIN wajib diisi";
    } else if (formData.pin.length !== 6) {
      newErrors.pin = "PIN harus 6 digit angka";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setSuccess(false);

    // Validasi form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      // Prepare payload sesuai dengan format yang diharapkan backend
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        pin: formData.pin, // Pastikan ini 6 digit
      };

      console.log("📤 Mengirim data registrasi:", {
        ...payload,
        password: "***",
        pin: "***",
      });

      // Kirim ke backend menggunakan authService
      const response = await authService.registUser(payload);

      console.log("✅ Response dari backend:", response);

      if (response && response.success !== false) {
        // Registration successful
        setSuccess(true);

        // Auto-redirect ke login setelah 3 detik
        setTimeout(() => {
          navigate("/login", {
            state: {
              registrationSuccess: true,
              email: formData.email,
            },
          });
        }, 3000);

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          pin: "",
          agreeTerms: false,
        });
        setErrors({});
      } else {
        // Backend mengembalikan error
        setError(response?.message || "Registrasi gagal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("❌ Error during registration:", error);

      // Handle different types of errors
      let errorMessage = "Terjadi kesalahan saat registrasi";

      if (error.response) {
        // Error dari backend
        const backendError = error.response.data;
        console.log("Backend error details:", backendError);

        if (backendError.message) {
          errorMessage = backendError.message;
        } else if (backendError.error) {
          errorMessage = backendError.error;
        } else if (backendError.errors) {
          // Handle validation errors from backend
          const firstError = Object.values(backendError.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (error.response.status === 409) {
          errorMessage =
            "Email sudah terdaftar. Silakan gunakan email lain atau login.";
        } else if (error.response.status === 400) {
          errorMessage = "Data tidak valid. Silakan periksa kembali.";
        }
      } else if (error.request) {
        // No response from server
        errorMessage =
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format PIN input display
  const displayPin = formData.pin.replace(/\d/g, "•");

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
                <li className="mb-3">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  Pembayaran mudah dengan PIN
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

              {/* Success Message */}
              {success && (
                <div
                  className="alert alert-success alert-dismissible fade show mb-4"
                  role="alert"
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <div>
                      <h6 className="mb-1">Registrasi Berhasil!</h6>
                      <p className="mb-0 small">
                        Akun Anda telah berhasil dibuat. Anda akan diarahkan ke
                        halaman login dalam 3 detik.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show mb-4"
                  role="alert"
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>
                      <h6 className="mb-1">Registrasi Gagal</h6>
                      <p className="mb-0 small">{error}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

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
                      name="name"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
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
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
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
                      placeholder="Buat password yang kuat"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                  <small className="text-muted">
                    Minimal 6 karakter, mengandung huruf besar, kecil, dan angka
                  </small>
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
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="13"
                      disabled={loading}
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>
                  <small className="text-muted">Contoh: 081234567890</small>
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    Alamat Lengkap <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <textarea
                      name="address"
                      className={`form-control ${
                        errors.address ? "is-invalid" : ""
                      }`}
                      placeholder="Masukkan alamat lengkap (jalan, kota, kode pos)"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      disabled={loading}
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>
                  <small className="text-muted">Minimal 10 karakter</small>
                </div>

                {/* PIN untuk Pembayaran */}
                <div className="mb-3">
                  <label
                    className="form-label small fw-medium"
                    style={{ color: "#153B77" }}
                  >
                    PIN Aplikasi (6 digit){" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type="password"
                      name="pin"
                      className={`form-control text-center ${
                        errors.pin ? "is-invalid" : ""
                      }`}
                      placeholder="••••••"
                      value={formData.pin}
                      onChange={handleChange}
                      maxLength="6"
                      style={{ letterSpacing: "3px" }}
                      disabled={loading}
                    />
                    {errors.pin && (
                      <div className="invalid-feedback">{errors.pin}</div>
                    )}
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      6 digit angka untuk pembayaran
                    </small>
                    <small className="text-muted">
                      {formData.pin.length}/6 digit
                      {formData.pin.length === 6 && " ✓"}
                    </small>
                  </div>

                  {/* PIN Preview */}
                  {formData.pin && (
                    <div className="mt-2">
                      <small className="text-muted d-block">Preview:</small>
                      <div className="d-flex justify-content-center gap-2 mt-1">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={index}
                            className={`border rounded text-center py-1 ${
                              index < formData.pin.length
                                ? "border-primary bg-light"
                                : "border-secondary"
                            }`}
                            style={{ width: "40px" }}
                          >
                            {index < formData.pin.length ? "•" : "–"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      disabled={loading}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor="agreeTerms"
                    >
                      Saya menyetujui{" "}
                      <a
                        href="/terms"
                        className="text-decoration-none"
                        style={{ color: "#153B77" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Syarat & Ketentuan
                      </a>{" "}
                      dan{" "}
                      <a
                        href="/privacy"
                        className="text-decoration-none"
                        style={{ color: "#153B77" }}
                        target="_blank"
                        rel="noopener noreferrer"
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
                  className="btn w-100 text-white fw-bold py-2 mb-3"
                  style={{ backgroundColor: "#E39A3B" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Daftar Sekarang
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <small className="text-muted">
                    Sudah punya akun?{" "}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ color: "#153B77" }}
                      onClick={goToLogin}
                      disabled={loading}
                    >
                      <b>Login di sini</b>
                    </button>
                  </small>
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
