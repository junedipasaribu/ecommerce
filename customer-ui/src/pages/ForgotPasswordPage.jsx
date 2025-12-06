import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import cacing from "../assets/images/cacing.png";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetData, setResetData] = useState({
    newPassword: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [resetErrors, setResetErrors] = useState({});

  // Step 1: Request Reset
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    // Simulate API call
    console.log("Request reset password for:", email);
    setError("");
    setIsSubmitted(true);
    // In real app, send email with verification code
  };

  // Step 2: Reset Password
  const handleResetSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    if (!resetData.verificationCode.trim()) {
      errors.verificationCode = "Kode verifikasi wajib diisi";
    }

    if (!resetData.newPassword) {
      errors.newPassword = "Password baru wajib diisi";
    } else if (resetData.newPassword.length < 6) {
      errors.newPassword = "Password minimal 6 karakter";
    }

    if (!resetData.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (resetData.newPassword !== resetData.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    if (Object.keys(errors).length > 0) {
      setResetErrors(errors);
      return;
    }

    // Simulate reset password
    console.log("Reset password with:", resetData);
    setIsResetting(true);

    // Simulate success
    setTimeout(() => {
      alert("Password berhasil direset! Silakan login dengan password baru.");
      // Redirect to login
      window.location.href = "/login";
    }, 1000);
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData({
      ...resetData,
      [name]: value,
    });

    if (resetErrors[name]) {
      setResetErrors({
        ...resetErrors,
        [name]: "",
      });
    }
  };

  const handleResendCode = () => {
    console.log("Resend verification code to:", email);
    alert("Kode verifikasi baru telah dikirim ke email Anda.");
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
              <h4 className="fw-bold mb-4">Lupa Password?</h4>
              <p className="mb-4">
                Jangan khawatir! Kami akan membantu Anda mendapatkan akses
                kembali ke akun Anda dengan mudah dan aman.
              </p>
              <div className="text-start d-inline-block">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning rounded-circle p-2 me-3">
                    <i className="bi bi-1-circle-fill text-dark"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold">Masukkan Email</h6>
                    <small>Isi email terdaftar Anda</small>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning rounded-circle p-2 me-3">
                    <i className="bi bi-2-circle-fill text-dark"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold">Verifikasi Kode</h6>
                    <small>Cek email untuk kode verifikasi</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-warning rounded-circle p-2 me-3">
                    <i className="bi bi-3-circle-fill text-dark"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold">Reset Password</h6>
                    <small>Buat password baru yang aman</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <img
                src={cacing}
                alt="Logo"
                width="90"
                height="90"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <p className="mt-3">powered by :</p>
              <h6>Underground Innovation Engineers.</h6>
            </div>
          </div>

          {/* RIGHT SECTION FORGOT PASSWORD CARD */}
          <div className="col-md-6 col-lg-5">
            <div
              className="bg-white p-4 shadow rounded"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              {!isSubmitted ? (
                // Step 1: Request Reset
                <>
                  <h5
                    className="fw-bold mb-4 text-center"
                    style={{ color: "#153B77" }}
                  >
                    <i className="bi bi-key me-2"></i>
                    Lupa Password
                  </h5>

                  <p className="text-muted text-center mb-4">
                    Masukkan email yang terdaftar. Kami akan mengirimkan
                    instruksi untuk mereset password Anda.
                  </p>

                  <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="mb-4">
                      <label
                        className="form-label small fw-medium"
                        style={{ color: "#153B77" }}
                      >
                        Email Terdaftar <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className={`form-control ${
                            error ? "is-invalid" : ""
                          }`}
                          placeholder="contoh@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                        />
                        {error && (
                          <div className="invalid-feedback">{error}</div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn w-100 text-white fw-bold py-2 mb-3"
                      style={{ backgroundColor: "#E39A3B" }}
                    >
                      <i className="bi bi-send me-2"></i>
                      Kirim Instruksi
                    </button>

                    {/* Back to Login */}
                    <div className="text-center">
                      <a
                        href="/login"
                        className="text-decoration-none d-flex align-items-center justify-content-center"
                        style={{ color: "#153B77" }}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Kembali ke Halaman Login
                      </a>
                    </div>
                  </form>
                </>
              ) : (
                // Step 2: Reset Password Form
                <>
                  <div className="text-center mb-4">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3">
                      <i className="bi bi-shield-lock text-primary fs-3"></i>
                    </div>
                    <h5 className="fw-bold mb-2" style={{ color: "#153B77" }}>
                      Reset Password
                    </h5>
                    <p className="text-muted small mb-4">
                      Kami telah mengirimkan kode verifikasi ke{" "}
                      <strong>{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleResetSubmit}>
                    {/* Verification Code */}
                    <div className="mb-3">
                      <label
                        className="form-label small fw-medium"
                        style={{ color: "#153B77" }}
                      >
                        Kode Verifikasi <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-shield-check"></i>
                        </span>
                        <input
                          type="text"
                          name="verificationCode"
                          className={`form-control ${
                            resetErrors.verificationCode ? "is-invalid" : ""
                          }`}
                          placeholder="Masukkan 6 digit kode"
                          value={resetData.verificationCode}
                          onChange={handleResetChange}
                          maxLength="6"
                        />
                        {resetErrors.verificationCode && (
                          <div className="invalid-feedback">
                            {resetErrors.verificationCode}
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">
                          Cek email atau folder spam
                        </small>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none"
                          style={{ color: "#153B77" }}
                          onClick={handleResendCode}
                        >
                          <small>Kirim ulang kode</small>
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label
                        className="form-label small fw-medium"
                        style={{ color: "#153B77" }}
                      >
                        Password Baru <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type="password"
                          name="newPassword"
                          className={`form-control ${
                            resetErrors.newPassword ? "is-invalid" : ""
                          }`}
                          placeholder="Password baru minimal 6 karakter"
                          value={resetData.newPassword}
                          onChange={handleResetChange}
                        />
                        {resetErrors.newPassword && (
                          <div className="invalid-feedback">
                            {resetErrors.newPassword}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="mb-4">
                      <label
                        className="form-label small fw-medium"
                        style={{ color: "#153B77" }}
                      >
                        Konfirmasi Password Baru{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type="password"
                          name="confirmPassword"
                          className={`form-control ${
                            resetErrors.confirmPassword ? "is-invalid" : ""
                          }`}
                          placeholder="Ulangi password baru"
                          value={resetData.confirmPassword}
                          onChange={handleResetChange}
                        />
                        {resetErrors.confirmPassword && (
                          <div className="invalid-feedback">
                            {resetErrors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="mb-4">
                      <small
                        className="d-block mb-2 fw-medium"
                        style={{ color: "#153B77" }}
                      >
                        Kekuatan Password:
                      </small>
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${Math.min(
                              (resetData.newPassword.length / 12) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {resetData.newPassword.length < 6
                          ? "Terlalu pendek"
                          : resetData.newPassword.length < 10
                          ? "Cukup kuat"
                          : "Sangat kuat"}
                      </small>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn w-100 text-white fw-bold py-2 mb-3"
                      style={{ backgroundColor: "#E39A3B" }}
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Reset Password
                        </>
                      )}
                    </button>

                    {/* Back to Request */}
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none p-0"
                        style={{ color: "#153B77" }}
                        onClick={() => setIsSubmitted(false)}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Kembali ke langkah sebelumnya
                      </button>
                    </div>
                  </form>
                </>
              )}
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

export default ForgotPasswordPage;
