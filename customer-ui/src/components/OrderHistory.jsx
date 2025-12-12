import "../styling/OrderHistory.css";
import { useState } from "react";

function OrderHistory() {
  // State untuk filter status
  const [activeFilter, setActiveFilter] = useState("all");

  // Data sample order history
  const orders = [
    {
      id: "ORD-2024-00123",
      date: "15 Jan 2024",
      status: "completed",
      statusText: "Selesai",
      items: [
        {
          id: 1,
          name: "Laptop Gaming Pro",
          price: 14999000,
          qty: 1,
          image: "https://via.placeholder.com/80",
        },
        {
          id: 2,
          name: "Mouse Wireless",
          price: 450000,
          qty: 2,
          image: "https://via.placeholder.com/80",
        },
      ],
      total: 15899000,
      shipping: "JNE Express",
      trackingNumber: "JNE1234567890",
      paymentMethod: "Bank Transfer",
      note: "Pesanan diterima dengan baik, packing rapi",
    },
    {
      id: "ORD-2024-00124",
      date: "18 Jan 2024",
      status: "shipped",
      statusText: "Dikirim",
      items: [
        {
          id: 3,
          name: "Smartphone Flagship",
          price: 8999000,
          qty: 1,
          image: "https://via.placeholder.com/80",
        },
      ],
      total: 8999000,
      shipping: "SiCepat",
      trackingNumber: "SICEPAT987654321",
      paymentMethod: "Credit Card",
      note: "Sedang dalam perjalanan",
    },
    {
      id: "ORD-2024-00125",
      date: "20 Jan 2024",
      status: "processing",
      statusText: "Sedang Dikemas",
      items: [
        {
          id: 4,
          name: "Headphone Wireless",
          price: 2499000,
          qty: 1,
          image: "https://via.placeholder.com/80",
        },
        {
          id: 5,
          name: "Charger Fast",
          price: 350000,
          qty: 1,
          image: "https://via.placeholder.com/80",
        },
      ],
      total: 2849000,
      shipping: "J&T Express",
      trackingNumber: "JT123456789",
      paymentMethod: "E-Wallet",
      note: "Pesanan sedang diproses",
    },
    {
      id: "ORD-2024-00126",
      date: "22 Jan 2024",
      status: "pending",
      statusText: "Belum Bayar",
      items: [
        {
          id: 6,
          name: "Smart Watch",
          price: 6999000,
          qty: 1,
          image: "https://via.placeholder.com/80",
        },
      ],
      total: 6999000,
      shipping: "Tiki",
      trackingNumber: null,
      paymentMethod: "Bank Transfer",
      note: "Menunggu pembayaran",
    },
    {
      id: "ORD-2024-00127",
      date: "25 Jan 2024",
      status: "cancelled",
      statusText: "Dibatalkan",
      items: [
        {
          id: 7,
          name: "Kamera Mirrorless",
          price: 12999000,
          qty: 1,
          image: "https://via.placeholder.com/80",
        },
      ],
      total: 12999000,
      shipping: "JNE Express",
      trackingNumber: null,
      paymentMethod: "Credit Card",
      note: "Dibatalkan oleh pembeli",
    },
    {
      id: "ORD-2024-00128",
      date: "28 Jan 2024",
      status: "completed",
      statusText: "Selesai",
      items: [
        {
          id: 8,
          name: "Sepatu Running",
          price: 1299000,
          qty: 1,
          image: "https://via.placeholder.com/80",
        },
        {
          id: 9,
          name: "Kaos Olahraga",
          price: 250000,
          qty: 3,
          image: "https://via.placeholder.com/80",
        },
      ],
      total: 2049000,
      shipping: "GoSend",
      trackingNumber: "GOSEND123456",
      paymentMethod: "E-Wallet",
      note: "Pesanan sudah diterima",
    },
  ];

  // Filter status options
  const statusFilters = [
    { id: "all", label: "Semua Pesanan", count: orders.length },
    {
      id: "pending",
      label: "Belum Bayar",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      id: "processing",
      label: "Sedang Dikemas",
      count: orders.filter((o) => o.status === "processing").length,
    },
    {
      id: "shipped",
      label: "Dikirim",
      count: orders.filter((o) => o.status === "shipped").length,
    },
    {
      id: "completed",
      label: "Selesai",
      count: orders.filter((o) => o.status === "completed").length,
    },
    {
      id: "cancelled",
      label: "Dibatalkan",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

  // Filter orders berdasarkan status aktif
  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  // Fungsi untuk mendapatkan status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "shipped":
        return "bg-info";
      case "processing":
        return "bg-warning";
      case "pending":
        return "bg-secondary";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="fw-bold mb-2">Riwayat Pesanan</h1>
              <p className="text-muted mb-0">
                Kelola dan lacak pesanan Anda di satu tempat
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary">
                <i className="bi bi-download me-2"></i>
                Export
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "#f6921e", borderColor: "#f6921e" }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Pesan Baru
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="row g-3 mb-4">
            <div className="col-md-2 col-sm-4 col-6">
              <div className="card border-0 shadow-sm text-center py-3">
                <div className="card-body">
                  <h3 className="fw-bold text-primary mb-1">{orders.length}</h3>
                  <p className="text-muted small mb-0">Total Pesanan</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-4 col-6">
              <div className="card border-0 shadow-sm text-center py-3">
                <div className="card-body">
                  <h3 className="fw-bold text-success mb-1">
                    {orders.filter((o) => o.status === "completed").length}
                  </h3>
                  <p className="text-muted small mb-0">Selesai</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-4 col-6">
              <div className="card border-0 shadow-sm text-center py-3">
                <div className="card-body">
                  <h3 className="fw-bold text-warning mb-1">
                    {orders.filter((o) => o.status === "processing").length}
                  </h3>
                  <p className="text-muted small mb-0">Diproses</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-4 col-6">
              <div className="card border-0 shadow-sm text-center py-3">
                <div className="card-body">
                  <h3 className="fw-bold text-info mb-1">
                    {orders.filter((o) => o.status === "shipped").length}
                  </h3>
                  <p className="text-muted small mb-0">Dikirim</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-4 col-6">
              <div className="card border-0 shadow-sm text-center py-3">
                <div className="card-body">
                  <h3 className="fw-bold text-secondary mb-1">
                    {orders.filter((o) => o.status === "pending").length}
                  </h3>
                  <p className="text-muted small mb-0">Belum Bayar</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-4 col-6">
              <div className="card border-0 shadow-sm text-center py-3">
                <div className="card-body">
                  <h3 className="fw-bold text-danger mb-1">
                    {orders.filter((o) => o.status === "cancelled").length}
                  </h3>
                  <p className="text-muted small mb-0">Dibatalkan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-3">
              <div className="d-flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`btn ${
                      activeFilter === filter.id
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } d-flex align-items-center`}
                    style={{
                      background:
                        activeFilter === filter.id ? "#f6921e" : "transparent",
                      borderColor: "#f6921e",
                      color: activeFilter === filter.id ? "white" : "#f6921e",
                    }}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.label}
                    <span
                      className={`badge ${
                        activeFilter === filter.id
                          ? "bg-light text-dark"
                          : "bg-primary"
                      } ms-2`}
                    >
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="row">
        <div className="col-12">
          {filteredOrders.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <i className="bi bi-receipt display-4 text-muted mb-3 d-block"></i>
                <h5 className="fw-bold mb-2">Tidak ada pesanan</h5>
                <p className="text-muted mb-4">
                  Tidak ada pesanan dengan status "
                  {statusFilters.find((f) => f.id === activeFilter)?.label}"
                </p>
                <button
                  className="btn btn-primary"
                  style={{ background: "#f6921e", borderColor: "#f6921e" }}
                  onClick={() => setActiveFilter("all")}
                >
                  Lihat Semua Pesanan
                </button>
              </div>
            </div>
          ) : (
            <div className="order-list">
              {filteredOrders.map((order) => (
                <div key={order.id} className="card shadow-sm border-0 mb-4">
                  {/* Order Header */}
                  <div className="card-header bg-white border-bottom py-3">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <span
                              className={`badge ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              {order.statusText}
                            </span>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">Order #{order.id}</h6>
                            <small className="text-muted">
                              Tanggal: {order.date}
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 text-md-end">
                        <div className="d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2">
                          <span className="fw-bold text-primary">
                            Total: {formatRupiah(order.total)}
                          </span>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-eye me-1"></i>
                              Detail
                            </button>
                            {order.status === "pending" && (
                              <button className="btn btn-sm btn-success">
                                <i className="bi bi-credit-card me-1"></i>
                                Bayar
                              </button>
                            )}
                            {order.status === "shipped" && (
                              <button className="btn btn-sm btn-info">
                                <i className="bi bi-truck me-1"></i>
                                Lacak
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th className="text-start">Produk Pesanan</th>
                            <th className="text-center">Harga Satuan</th>
                            <th className="text-center">Kuantitas</th>
                            <th className="text-center">Total Harga</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      width="60"
                                      height="60"
                                      className="rounded object-fit-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="fw-medium">{item.name}</div>
                                    <small className="text-muted">
                                      SKU: {item.id}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center align-middle">
                                {formatRupiah(item.price)}
                              </td>
                              <td className="text-center align-middle">
                                <span className="badge bg-light text-dark border">
                                  {item.qty}
                                </span>
                              </td>
                              <td className="text-center align-middle fw-bold">
                                {formatRupiah(item.price * item.qty)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Order Details */}
                    <div className="row mt-4">
                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-body p-3">
                            <h6 className="fw-bold mb-3">Detail Pengiriman</h6>
                            <div className="row small">
                              <div className="col-6 mb-2">
                                <span className="text-muted">Kurir:</span>
                              </div>
                              <div className="col-6 mb-2">
                                <span className="fw-medium">
                                  {order.shipping}
                                </span>
                              </div>
                              <div className="col-6 mb-2">
                                <span className="text-muted">No. Resi:</span>
                              </div>
                              <div className="col-6 mb-2">
                                {order.trackingNumber ? (
                                  <span className="fw-medium text-primary">
                                    {order.trackingNumber}
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </div>
                              <div className="col-6">
                                <span className="text-muted">
                                  Metode Bayar:
                                </span>
                              </div>
                              <div className="col-6">
                                <span className="fw-medium">
                                  {order.paymentMethod}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-body p-3">
                            <h6 className="fw-bold mb-3">Keterangan</h6>
                            <p className="mb-0">{order.note}</p>
                            {order.status === "cancelled" && (
                              <div className="mt-2">
                                <button className="btn btn-sm btn-outline-danger">
                                  <i className="bi bi-arrow-clockwise me-1"></i>
                                  Pesan Ulang
                                </button>
                              </div>
                            )}
                            {order.status === "completed" && (
                              <div className="mt-2">
                                <button className="btn btn-sm btn-outline-success me-2">
                                  <i className="bi bi-star me-1"></i>
                                  Beri Rating
                                </button>
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="bi bi-cart-plus me-1"></i>
                                  Beli Lagi
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="card-footer bg-white border-top py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Klik "Detail" untuk informasi lengkap
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-printer me-1"></i>
                          Cetak Invoice
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="bi bi-chat-dots me-1"></i>
                          Hubungi CS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex justify-content-center">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  <li className="page-item disabled">
                    <a className="page-link" href="#" tabIndex="-1">
                      <i className="bi bi-chevron-left"></i>
                    </a>
                  </li>
                  <li className="page-item active">
                    <a className="page-link" href="#">
                      1
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      2
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      3
                    </a>
                  </li>
                  <li className="page-item">
                    <span className="page-link">...</span>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      10
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      <i className="bi bi-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
