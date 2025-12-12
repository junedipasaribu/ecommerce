// src/pages/PaymentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { paymentService } from "../services/paymentService";
import { orderService } from "../services/orderService";

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // State untuk data order
  const [order, setOrder] = useState(null);

  // ✅ PERBAIKAN: Hanya satu state untuk PIN
  const [pin, setPin] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  // State untuk UI
  const [showPin, setShowPin] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const MAX_PIN_ATTEMPTS = 3;

  // Fetch order details on mount
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching order details for:", orderId);

      // Get order details from location state or API
      if (location.state?.order) {
        console.log("✅ Using order from location state");
        setOrder(location.state.order);
      } else {
        // Fallback to API call
        console.log(`🌐 Calling API: /orders/my/${orderId}`);
        const orderResponse = await orderService.getOrderById(orderId);
        console.log("📦 API Response:", orderResponse);
        setOrder(orderResponse.data || orderResponse);
      }

      // Auto-generate payment reference if empty
      if (!paymentReference) {
        setPaymentReference(`PAY-${Date.now()}`);
      }
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      setError("Gagal memuat detail order. Silakan coba lagi.");

      // Mock data untuk development
      if (process.env.NODE_ENV === "development") {
        console.log("🛠️ Using mock data");
        setOrder({
          id: orderId,
          orderCode: `ORD-${orderId}`,
          status: "PENDING_PAYMENT",
          paymentMethod: "KFA_PAY",
          totalAmount: 48000,
          subtotal: 40000,
          ppn: 4000,
          shippingCost: 4000,
          courier: "JNE",
          createdAt: new Date().toISOString(),
        });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ PERBAIKAN: Handle PIN input change - Sederhana
  const handlePinChange = (e) => {
    const value = e.target.value;

    // Only allow numbers and limit to 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value);
    }
  };

  // Handle PIN key press untuk validasi
  const handlePinKeyDown = (e) => {
    // Only allow numbers and control keys
    if (
      !/^\d$/.test(e.key) &&
      ![
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  // Virtual keypad untuk input (opsional)
  const handleVirtualKeypad = (digit) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  // Clear PIN
  const handleClearPin = () => {
    setPin("");
  };

  // Backspace
  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!pin || pin.length !== 6) {
      setError("PIN harus 6 digit angka");
      return;
    }

    if (pinAttempts >= MAX_PIN_ATTEMPTS) {
      setError("Terlalu banyak percobaan PIN. Silakan coba lagi nanti.");
      return;
    }

    if (!order || !orderId) {
      setError("Data order tidak valid");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const paymentData = {
        paymentReference: paymentReference || `PAY-${Date.now()}`,
        pin: pin,
        orderId: orderId, // tambahkan orderId di payload jika diperlukan
      };

      console.log("💰 Processing payment for order:", orderId);
      console.log("📤 Payment data:", { ...paymentData, pin: "***" });

      // Panggil service
      const result = await paymentService.processPayment(orderId, paymentData);
      console.log("📥 Payment result:", result);

      // PERBAIKAN: Cek berdasarkan success flag
      if (result.success === true) {
        console.log("🎉 Payment successful!");
        setSuccess(true);

        // Update order status lokal
        const updatedOrder = {
          ...order,
          status: "PAID",
          paymentStatus: "SUCCESS",
          paymentDate: new Date().toISOString(),
          paymentReference: paymentData.paymentReference,
        };
        setOrder(updatedOrder);

        // Redirect setelah 3 detik
        setTimeout(() => {
          navigate(`/orders/${orderId}`, {
            state: {
              paymentSuccess: true,
              order: updatedOrder,
              paymentResponse: result.data,
            },
          });
        }, 3000);
      } else {
        // Payment gagal
        console.log("❌ Payment failed:", result.message);

        setPinAttempts((prev) => prev + 1);
        const attemptsLeft = MAX_PIN_ATTEMPTS - pinAttempts - 1;

        // Tampilkan pesan error
        const errorMessage =
          result.message || "PIN salah atau pembayaran gagal";
        setError(
          `${errorMessage}. Percobaan ${
            pinAttempts + 1
          } dari ${MAX_PIN_ATTEMPTS}. ${
            attemptsLeft > 0
              ? `Sisa percobaan: ${attemptsLeft}`
              : "Akun akan terkunci."
          }`
        );
        setPin(""); // Clear PIN
      }
    } catch (error) {
      // Error handling untuk exception yang tidak terduga
      console.error("🔥 Unexpected error:", error);

      setPinAttempts((prev) => prev + 1);
      setPin("");

      const attemptsLeft = MAX_PIN_ATTEMPTS - pinAttempts - 1;
      setError(
        `Terjadi kesalahan tak terduga. Percobaan ${
          pinAttempts + 1
        } dari ${MAX_PIN_ATTEMPTS}. ${
          attemptsLeft > 0 ? `Sisa percobaan: ${attemptsLeft}` : ""
        }`
      );
    } finally {
      setProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat data pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
              <i className="bi bi-credit-card me-2"></i>
              Pembayaran Order
            </h1>
            {order && (
              <p className="text-muted">Order #{order.orderCode || orderId}</p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div
              className="alert alert-success alert-dismissible fade show mb-4"
              role="alert"
            >
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-check-circle-fill me-2"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <div>
                  <h5 className="mb-1">Pembayaran Berhasil!</h5>
                  <p className="mb-0">
                    Pembayaran untuk order #{order?.orderCode || orderId} telah
                    berhasil diproses. Anda akan diarahkan ke halaman detail
                    order.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className={`alert ${
                pinAttempts >= MAX_PIN_ATTEMPTS
                  ? "alert-danger"
                  : "alert-warning"
              } mb-4`}
            >
              <div className="d-flex align-items-center">
                <i
                  className={`bi ${
                    pinAttempts >= MAX_PIN_ATTEMPTS
                      ? "bi-exclamation-triangle"
                      : "bi-exclamation-circle"
                  } me-2`}
                ></i>
                <div>
                  <strong>
                    {pinAttempts >= MAX_PIN_ATTEMPTS
                      ? "Akses Diblokir!"
                      : "Perhatian!"}
                  </strong>
                  <p className="mb-0 mt-1">{error}</p>
                  {pinAttempts >= MAX_PIN_ATTEMPTS && (
                    <small className="d-block mt-1">
                      Silakan hubungi customer service untuk membuka kembali
                      akses.
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row">
            {/* Left Column: Order Summary */}
            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                    <i className="bi bi-receipt me-2"></i>
                    Ringkasan Order
                  </h5>
                </div>

                <div className="card-body">
                  {order ? (
                    <>
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">Status</span>
                          <span
                            className={`badge ${
                              order.status === "PENDING_PAYMENT"
                                ? "bg-warning"
                                : order.status === "PAID"
                                ? "bg-success"
                                : order.status === "PROCESSING"
                                ? "bg-info"
                                : "bg-secondary"
                            }`}
                          >
                            {order.status === "PENDING_PAYMENT"
                              ? "Menunggu Pembayaran"
                              : order.status === "PAID"
                              ? "Telah Dibayar"
                              : order.status === "PROCESSING"
                              ? "Diproses"
                              : order.status}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Order ID</span>
                          <span className="fw-medium">
                            {order.orderCode || orderId}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Tanggal</span>
                          <span className="fw-medium">
                            {formatDate(order.createdAt || new Date())}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Metode Pembayaran</span>
                          <span className="fw-medium">
                            {order.paymentMethod === "KFA_PAY"
                              ? "KFA Pay"
                              : order.paymentMethod === "BANK_TRANSFER"
                              ? "Bank Transfer"
                              : order.paymentMethod === "CREDIT_CARD"
                              ? "Kartu Kredit"
                              : order.paymentMethod === "COD"
                              ? "Bayar di Tempat"
                              : order.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="border-top pt-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal</span>
                          <span>
                            {formatCurrency(
                              order.subtotal || order.totalAmount
                            )}
                          </span>
                        </div>

                        {order.ppn && (
                          <div className="d-flex justify-content-between mb-2">
                            <span>PPN (11%)</span>
                            <span>{formatCurrency(order.ppn)}</span>
                          </div>
                        )}

                        {order.shippingCost && (
                          <div className="d-flex justify-content-between mb-2">
                            <span>Biaya Pengiriman</span>
                            <span>{formatCurrency(order.shippingCost)}</span>
                          </div>
                        )}

                        <div className="d-flex justify-content-between fw-bold mt-3 pt-3 border-top">
                          <h5 className="mb-0">Total Pembayaran</h5>
                          <h4 className="mb-0" style={{ color: "#F6921E" }}>
                            {formatCurrency(order.totalAmount)}
                          </h4>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">Data order tidak ditemukan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Payment Form - DIPERBAIKI */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                    <i className="bi bi-lock me-2"></i>
                    Konfirmasi Pembayaran
                  </h5>
                </div>

                <div className="card-body">
                  <form onSubmit={handlePaymentSubmit}>
                    {/* Payment Reference */}
                    <div className="mb-4">
                      <label className="form-label fw-medium">
                        <i className="bi bi-tag me-1"></i>
                        Referensi Pembayaran
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="PAY-123456"
                        required
                        style={{ borderColor: "#325A89" }}
                      />
                      <small className="text-muted">
                        Referensi pembayaran Anda (bisa diubah)
                      </small>
                    </div>

                    {/* ✅ PERBAIKAN: PIN Input - Simple */}
                    <div className="mb-4">
                      <label className="form-label fw-medium d-flex justify-content-between">
                        <span>
                          <i className="bi bi-key me-1"></i>
                          PIN Pembayaran (6 digit)
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0"
                          onClick={() => setShowPin(!showPin)}
                        >
                          <i
                            className={`bi ${
                              showPin ? "bi-eye-slash" : "bi-eye"
                            }`}
                          ></i>
                          {showPin ? " Sembunyikan" : " Tampilkan"}
                        </button>
                      </label>

                      {/* PIN Input Field */}
                      <div className="mb-3">
                        <input
                          type={showPin ? "text" : "password"}
                          className="form-control text-center py-3"
                          value={pin}
                          onChange={handlePinChange}
                          onKeyDown={handlePinKeyDown}
                          maxLength={6}
                          placeholder="••••••"
                          style={{
                            fontSize: "1.5rem",
                            letterSpacing: "0.5rem",
                            borderColor: "#325A89",
                          }}
                          autoComplete="off"
                          required
                        />
                        <small className="text-muted d-block mt-1">
                          Masukkan 6 digit PIN Anda
                        </small>

                        {/* PIN Counter */}
                        <div className="text-end mt-1">
                          <small className="text-muted">
                            {pin.length}/6 digit
                          </small>
                        </div>
                      </div>

                      {/* Virtual Keypad (Optional) */}
                      {/* <div className="mb-3">
                        <div className="row g-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <div className="col-4" key={num}>
                              <button
                                type="button"
                                className="btn btn-outline-secondary w-100 py-3"
                                onClick={() =>
                                  handleVirtualKeypad(num.toString())
                                }
                                disabled={pin.length >= 6}
                              >
                                <span style={{ fontSize: "1.2rem" }}>
                                  {num}
                                </span>
                              </button>
                            </div>
                          ))}
                          <div className="col-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary w-100 py-3"
                              onClick={handleClearPin}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          </div>
                          <div className="col-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary w-100 py-3"
                              onClick={() => handleVirtualKeypad("0")}
                              disabled={pin.length >= 6}
                            >
                              <span style={{ fontSize: "1.2rem" }}>0</span>
                            </button>
                          </div>
                          <div className="col-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary w-100 py-3"
                              onClick={handleBackspace}
                            >
                              <i className="bi bi-backspace"></i>
                            </button>
                          </div>
                        </div>
                      </div> */}

                      {/* PIN Attempts Warning */}
                      {pinAttempts > 0 && (
                        <div
                          className={`alert ${
                            pinAttempts >= MAX_PIN_ATTEMPTS
                              ? "alert-danger"
                              : "alert-warning"
                          } py-2`}
                        >
                          <small>
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Percobaan: {pinAttempts}/{MAX_PIN_ATTEMPTS}
                          </small>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Info */}
                    {order?.paymentMethod === "KFA_PAY" && (
                      <div className="alert alert-info mb-4">
                        <div className="d-flex">
                          <i className="bi bi-info-circle me-2"></i>
                          <div>
                            <small>
                              <strong>Pembayaran dengan KFA Pay</strong>
                              <br />
                              PIN yang diminta adalah PIN akun KFA Anda yang
                              terdaftar.
                            </small>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="form-check mb-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="termsCheck"
                        required
                        style={{ borderColor: "#325A89" }}
                      />
                      <label className="form-check-label" htmlFor="termsCheck">
                        <small>
                          Saya menyetujui{" "}
                          <a href="/terms" style={{ color: "#0B3F7E" }}>
                            Syarat dan Ketentuan
                          </a>{" "}
                          pembayaran
                        </small>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-lg w-100"
                      disabled={
                        processing ||
                        pinAttempts >= MAX_PIN_ATTEMPTS ||
                        !order ||
                        pin.length !== 6
                      }
                      style={{
                        backgroundColor:
                          processing ||
                          pinAttempts >= MAX_PIN_ATTEMPTS ||
                          !order ||
                          pin.length !== 6
                            ? "#cccccc"
                            : "#F6921E",
                        borderColor: "#F6921E",
                        color: "white",
                        padding: "12px",
                      }}
                    >
                      {processing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Memproses Pembayaran...
                        </>
                      ) : pinAttempts >= MAX_PIN_ATTEMPTS ? (
                        <>
                          <i className="bi bi-lock me-2"></i>
                          Akses Terkunci
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Bayar {order ? formatCurrency(order.totalAmount) : ""}
                        </>
                      )}
                    </button>

                    {/* Cancel Button */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={() => navigate(-1)}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Kembali
                    </button>
                  </form>
                </div>
              </div>

              {/* Security Info */}
              <div
                className="card border-0 shadow-sm mt-3"
                style={{ backgroundColor: "#F8F9FA" }}
              >
                <div className="card-body">
                  <h6 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
                    <i className="bi bi-shield-check me-2"></i>
                    Keamanan Pembayaran
                  </h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <small>Transaksi aman & terenkripsi</small>
                    </li>
                    {/* <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <small>PIN tidak disimpan dalam bentuk plain text</small>
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <small>Notifikasi real-time</small>
                    </li>
                    <li>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <small>Garansi uang kembali 100%</small>
                    </li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Timer for Payment Expiry (Optional) */}
          {order?.status === "PENDING_PAYMENT" && (
            <div className="card border-warning mt-4">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center">
                  <i
                    className="bi bi-clock text-warning me-2"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                  <div>
                    <h6 className="mb-1" style={{ color: "#0B3F7E" }}>
                      Batas Waktu Pembayaran
                    </h6>
                    <p className="mb-0 text-muted">
                      Selesaikan pembayaran dalam <strong>24 jam</strong> untuk
                      menghindari pembatalan otomatis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
