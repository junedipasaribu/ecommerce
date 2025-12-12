import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../services/orderService";

function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data || response || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Gagal memuat daftar order");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING_PAYMENT: { color: "warning", text: "Menunggu Pembayaran" },
      PAID: { color: "primary", text: "Telah Dibayar" },
      PROCESSING: { color: "info", text: "Diproses" },
      SHIPPING: { color: "primary", text: "Dikirim" },
      DELIVERED: { color: "success", text: "Terkirim" },
      CANCELLED: { color: "danger", text: "Dibatalkan" },
      CANCELLED_AUTO: { color: "danger", text: "Tidak ada Pembayaran" },
      COMPLETED: { color: "success", text: "Terkirim" },
      CANCELLED_BY_USER: { color: "danger", text: "Dibatalkan Oleh User" },
    };

    const badge = badges[status] || { color: "secondary", text: status };
    return <span className={`badge bg-${badge.color}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat daftar order...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fw-bold" style={{ color: "#0B3F7E" }}>
              <i className="bi bi-receipt me-2"></i>
              Daftar Order Saya
            </h1>
            <Link to="/" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Kembali Berbelanja
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th style={{ color: "#0B3F7E" }}>Order ID</th>
                        <th style={{ color: "#0B3F7E" }}>Tanggal</th>
                        <th style={{ color: "#0B3F7E" }}>Status</th>
                        <th style={{ color: "#0B3F7E" }}>Total</th>
                        <th style={{ color: "#0B3F7E" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id || order.orderId}>
                          <td>
                            <strong>
                              {order.orderCode || `ORD-${order.id}`}
                            </strong>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td className="fw-bold" style={{ color: "#F6921E" }}>
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td>
                            <Link
                              to={`/orders/${order.id || order.orderId}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-eye me-1"></i>
                              Detail
                            </Link>

                            {order.status === "PENDING_PAYMENT" && (
                              <Link
                                to={`/payment/${order.id || order.orderId}`}
                                className="btn btn-sm btn-warning ms-2"
                              >
                                <i className="bi bi-credit-card me-1"></i>
                                Bayar
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i
                  className="bi bi-receipt"
                  style={{ fontSize: "4rem", color: "#325A89" }}
                ></i>
              </div>
              <h4 className="mb-3" style={{ color: "#0B3F7E" }}>
                Belum Ada Order
              </h4>
              <p className="text-muted mb-4">
                Anda belum memiliki order. Mulai berbelanja sekarang!
              </p>
              <Link
                to="/"
                className="btn"
                style={{ backgroundColor: "#F6921E", color: "white" }}
              >
                <i className="bi bi-cart me-2"></i>
                Mulai Belanja
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
