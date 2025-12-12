// src/pages/OrderDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";

function OrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from location state first (if coming from payment success)
      if (location.state?.order) {
        setOrder(location.state.order);
      } else {
        // Fetch from API
        const response = await orderService.getOrderById(orderId);
        setOrder(response.data || response);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Gagal memuat detail order. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    navigate(`/payment/${orderId}`, {
      state: { order },
    });
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan order ini?"))
      return;

    try {
      setProcessing(true);
      await orderService.cancelOrder(orderId, "Dibatalkan oleh pengguna");
      alert("Order berhasil dibatalkan");
      fetchOrderDetails(); // Refresh data
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Gagal membatalkan order");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_PAYMENT: {
        color: "warning",
        text: "Menunggu Pembayaran",
        icon: "bi-clock",
      },
      PAID: {
        color: "success",
        text: "Telah Dibayar",
        icon: "bi-check-circle",
      },
      PROCESSING: { color: "info", text: "Sedang Diproses", icon: "bi-gear" },
      SHIPPED: { color: "primary", text: "Dikirim", icon: "bi-truck" },
      DELIVERED: {
        color: "success",
        text: "Terkirim",
        icon: "bi-check-circle-fill",
      },
      CANCELLED: { color: "danger", text: "Dibatalkan", icon: "bi-x-circle" },
    };

    const config = statusConfig[status] || {
      color: "secondary",
      text: status,
      icon: "bi-question-circle",
    };

    return (
      <span className={`badge bg-${config.color} d-flex align-items-center`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat detail order...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <Link to="/orders" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Kembali ke Daftar Order
              </Link>
            </div>
            <h1 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
              Detail Order
            </h1>
          </div>

          {/* Success Alert from Payment */}
          {location.state?.paymentSuccess && (
            <div className="alert alert-success alert-dismissible fade show mb-4">
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-check-circle-fill me-2"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <div>
                  <h5 className="mb-1">Pembayaran Berhasil!</h5>
                  <p className="mb-0">
                    Pembayaran untuk order ini telah berhasil diproses. Order
                    sedang diproses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {order ? (
            <>
              {/* Order Summary Card */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
                        <i className="bi bi-info-circle me-2"></i>
                        Informasi Order
                      </h5>
                      <div className="mb-3">
                        <small className="text-muted d-block">Order ID</small>
                        <h5 className="fw-bold">
                          {order.orderCode || `ORD-${orderId}`}
                        </h5>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Tanggal Order
                        </small>
                        <strong>{formatDate(order.createdAt)}</strong>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Status Order
                        </small>
                        <div className="mt-1">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h5 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
                        <i className="bi bi-credit-card me-2"></i>
                        Informasi Pembayaran
                      </h5>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Metode Pembayaran
                        </small>
                        <strong>
                          {order.paymentMethod === "KFA_PAY"
                            ? "KFA Pay"
                            : order.paymentMethod === "BANK_TRANSFER"
                            ? "Bank Transfer"
                            : order.paymentMethod === "CREDIT_CARD"
                            ? "Kartu Kredit"
                            : order.paymentMethod === "COD"
                            ? "Bayar di Tempat"
                            : order.paymentMethod}
                        </strong>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block">
                          Total Pembayaran
                        </small>
                        <h3
                          className="fw-bold mb-0"
                          style={{ color: "#F6921E" }}
                        >
                          {formatCurrency(order.totalAmount)}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 flex-wrap mt-4 pt-4 border-top">
                    {order.status === "PENDING_PAYMENT" && (
                      <button
                        onClick={handlePayNow}
                        className="btn"
                        style={{ backgroundColor: "#F6921E", color: "white" }}
                        disabled={processing}
                      >
                        <i className="bi bi-credit-card me-2"></i>
                        Bayar Sekarang
                      </button>
                    )}

                    {order.status === "PENDING_PAYMENT" && (
                      <button
                        onClick={handleCancelOrder}
                        className="btn btn-outline-danger"
                        disabled={processing}
                      >
                        {processing ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                          <i className="bi bi-x-circle me-2"></i>
                        )}
                        Batalkan Order
                      </button>
                    )}

                    <button className="btn btn-outline-primary">
                      <i className="bi bi-printer me-2"></i>
                      Cetak Invoice
                    </button>

                    {/* <Link to="/help" className="btn btn-outline-secondary">
                      <i className="bi bi-chat me-2"></i>
                      Butuh Bantuan?
                    </Link> */}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                    <i className="bi bi-cart-check me-2"></i>
                    Detail Produk
                  </h5>
                </div>
                <div className="card-body">
                  {order.items && order.items.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Produk</th>
                            <th className="text-center">Harga</th>
                            <th className="text-center">Jumlah</th>
                            <th className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="rounded me-3"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded bg-light d-flex align-items-center justify-content-center me-3"
                                      style={{ width: "50px", height: "50px" }}
                                    >
                                      <i className="bi bi-box text-muted"></i>
                                    </div>
                                  )}
                                  <div>
                                    <h6 className="mb-0">{item.name}</h6>
                                    {item.description && (
                                      <small className="text-muted">
                                        {item.description}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="text-center align-middle">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="text-center align-middle">
                                <span className="badge bg-secondary">
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="text-end align-middle fw-bold">
                                {formatCurrency(
                                  item.subtotal || item.price * item.quantity
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold">
                              Subtotal
                            </td>
                            <td className="text-end fw-bold">
                              {formatCurrency(
                                order.subtotal || order.totalAmount
                              )}
                            </td>
                          </tr>
                          {order.ppn && (
                            <tr>
                              <td colSpan="3" className="text-end">
                                PPN (11%)
                              </td>
                              <td className="text-end">
                                {formatCurrency(order.ppn)}
                              </td>
                            </tr>
                          )}
                          {order.shippingCost && (
                            <tr>
                              <td colSpan="3" className="text-end">
                                Biaya Pengiriman
                              </td>
                              <td className="text-end">
                                {formatCurrency(order.shippingCost)}
                              </td>
                            </tr>
                          )}
                          <tr className="table-active">
                            <td colSpan="3" className="text-end fw-bold fs-5">
                              Total
                            </td>
                            <td
                              className="text-end fw-bold fs-5"
                              style={{ color: "#F6921E" }}
                            >
                              {formatCurrency(order.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        Tidak ada item dalam order ini
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Information */}
              {order.shippingAddress && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                      <i className="bi bi-truck me-2"></i>
                      Informasi Pengiriman
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <h6 className="fw-bold">Alamat Pengiriman</h6>
                        <p className="mb-1">
                          <strong>{order.shippingAddress.receiver}</strong>
                        </p>
                        <p className="mb-1">{order.shippingAddress.phone}</p>
                        <p className="mb-1">
                          {order.shippingAddress.fullAddress}
                        </p>
                        <p className="mb-0">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.province}{" "}
                          {order.shippingAddress.postalCode}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="fw-bold">Informasi Kurir</h6>
                        <p className="mb-1">
                          <strong>Kurir:</strong> {order.courier || "JNE"}
                        </p>
                        <p className="mb-1">
                          <strong>Biaya:</strong>{" "}
                          {formatCurrency(order.shippingCost || 0)}
                        </p>
                        <p className="mb-0">
                          <strong>Estimasi:</strong> 2-3 hari kerja
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Tracking Timeline */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3">
                  <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                    <i className="bi bi-clock-history me-2"></i>
                    Lacak Status Order
                  </h5>
                </div>
                <div className="card-body">
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-icon bg-success">
                        <i className="bi bi-cart-check"></i>
                      </div>
                      <div className="timeline-content">
                        <h6>Order Dibuat</h6>
                        <p className="text-muted mb-0">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {order.status !== "PENDING_PAYMENT" && (
                      <div className="timeline-item">
                        <div className="timeline-icon bg-success">
                          <i className="bi bi-credit-card"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Pembayaran Berhasil</h6>
                          <p className="text-muted mb-0">
                            {order.updatedAt
                              ? formatDate(order.updatedAt)
                              : "Sedang diproses"}
                          </p>
                        </div>
                      </div>
                    )}

                    {(order.status === "PROCESSING" ||
                      order.status === "SHIPPED" ||
                      order.status === "DELIVERED") && (
                      <div className="timeline-item">
                        <div className="timeline-icon bg-info">
                          <i className="bi bi-gear"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Order Diproses</h6>
                          <p className="text-muted mb-0">
                            Pesanan sedang dipersiapkan
                          </p>
                        </div>
                      </div>
                    )}

                    {(order.status === "SHIPPED" ||
                      order.status === "DELIVERED") && (
                      <div className="timeline-item">
                        <div className="timeline-icon bg-primary">
                          <i className="bi bi-truck"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Dikirim</h6>
                          <p className="text-muted mb-0">
                            Pesanan telah dikirim via {order.courier || "JNE"}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === "DELIVERED" && (
                      <div className="timeline-item">
                        <div className="timeline-icon bg-success">
                          <i className="bi bi-check-circle"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Terkirim</h6>
                          <p className="text-muted mb-0">
                            Pesanan telah sampai di tujuan
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === "CANCELLED" && (
                      <div className="timeline-item">
                        <div className="timeline-icon bg-danger">
                          <i className="bi bi-x-circle"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Dibatalkan</h6>
                          <p className="text-muted mb-0">
                            Order telah dibatalkan
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i
                  className="bi bi-receipt"
                  style={{ fontSize: "4rem", color: "#325A89" }}
                ></i>
              </div>
              <h4 className="mb-3" style={{ color: "#0B3F7E" }}>
                Order Tidak Ditemukan
              </h4>
              <p className="text-muted mb-4">
                Order dengan ID #{orderId} tidak ditemukan atau telah dihapus.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Link to="/orders" className="btn btn-primary">
                  <i className="bi bi-receipt me-2"></i>
                  Lihat Order Lainnya
                </Link>
                <Link to="/" className="btn btn-outline-primary">
                  <i className="bi bi-house-door me-2"></i>
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
