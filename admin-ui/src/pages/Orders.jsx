import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ordersService from "../services/orders";
import productsService from "../services/products";
import { useAuth } from "../context/AuthContext";
import { hasPerm } from "../utils/hasPermission";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let mounted = true;
    ordersService.getAll().then((list) => mounted && setOrders(list || []));
    productsService.getAll().then((list) => mounted && setProducts(list || []));
    return () => (mounted = false);
  }, []);

  const { user: authUser } = useAuth();
  const canReadOrders = hasPerm(authUser, "order", "read");
  const canUpdateOrders = hasPerm(authUser, "order", "update");

  // ============================
  // INPUT / EDIT RESI
  // ============================
  const handleInputResi = (order) => {
    Swal.fire({
      title: "Input Nomor Resi",
      input: "text",
      inputValue: order.resi || "",
      inputPlaceholder: "Masukkan nomor resi...",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        if (!canUpdateOrders)
          return Swal.fire("Forbidden", "Anda tidak punya akses.", "warning");

        ordersService
          .update({ ...order, resi: res.value })
          .then((updated) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
            Swal.fire("Berhasil!", "Nomor resi berhasil disimpan.", "success");
          })
          .catch((err) =>
            Swal.fire("Error", err.message || "Gagal simpan resi", "error")
          );
      }
    });
  };

  // helper: map status -> color for display
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "paid":
        return "purple";
      case "process":
        return "dodgerblue";
      case "shipping":
        return "teal";
      case "success":
        return "green";
      case "returned":
      case "refunded":
      case "canceled":
        return "red";
      default:
        return "gray";
    }
  };

  // =====================
  // CHANGE STATUS
  // =====================
  const handleChangeStatus = (orderId) => {
    Swal.fire({
      title: "Change Status",
      input: "select",
      inputOptions: {
        pending: "Pending",
        paid: "Paid",
        process: "Process",
        shipping: "Shipping",
        success: "Delivered",
        returned: "Returned",
        refunded: "Refunded",
        canceled: "Canceled",
      },
      inputPlaceholder: "Select status",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        if (!canUpdateOrders)
          return Swal.fire("Forbidden", "Anda tidak punya akses.", "warning");

        const o = orders.find((x) => x.orderId === orderId);
        if (!o) return;
        ordersService
          .update({ ...o, status: result.value })
          .then((updated) => {
            setOrders((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            Swal.fire("Updated!", "Status updated successfully.", "success");
          })
          .catch((err) =>
            Swal.fire("Error", err.message || "Gagal update status", "error")
          );
      }
    });
  };

  // =====================
  // VIEW DETAIL
  // =====================
  const handleViewDetail = (order) => {
    const statusColor = getStatusColor(order.status);

    let html = `
      <div style="text-align:left">
        <p><b>Invoice:</b> ${order.invoiceNumber}</p>
        <p><b>Customer:</b> ${order.customer}</p>
        <p><b>Alamat:</b> ${order.alamat}</p>
        <p><b>No HP:</b> ${order.noHp}</p>

        <p><b>Status:</b> 
          <span style="color:${statusColor}; font-weight:bold;">
            ${order.status}
          </span>
          <button id="btnStatus" 
            style="margin-left:10px; padding:3px 8px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">
            Change
          </button>
        </p>

        <p><b>Nomor Resi:</b> ${order.resi || "-"}
          <button id="btnResi" 
            style="margin-left:10px; padding:3px 8px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">
            Input / Edit Resi
          </button>
        </p>

        <p><b>Metode Pembayaran:</b> ${order.paymentMethod}</p>
        <hr/>
        <h5>Items:</h5>
    `;

    order.items.forEach((i) => {
      const product = products.find((p) => p.id === i.productId);
      html += `
        <p><b>${product ? product.name : "Unknown Product"}</b> - 
        Qty: ${i.qty} × Rp ${i.price.toLocaleString()}</p>`;
    });

    html += `</div>`;

    Swal.fire({
      title: `Order Detail: ${order.orderId}`,
      html,
      icon: "info",
      width: 620,
      didOpen: () => {
        Swal.getPopup()
          .querySelector("#btnStatus")
          ?.addEventListener("click", () => handleChangeStatus(order.orderId));

        Swal.getPopup()
          .querySelector("#btnResi")
          ?.addEventListener("click", () => handleInputResi(order));
      },
    });
  };

  // =====================
  // EXPORT TO CSV
  // =====================
  const exportCSV = () => {
    let csv = "OrderID,Customer,Status,Payment,Resi,Total\n";

    orders.forEach((o) => {
      const total = o.items.reduce((sum, i) => sum + i.qty * i.price, 0);
      csv += `${o.orderId},${o.customer},${o.status},${o.paymentMethod},${
        o.resi || "-"
      },${total}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  // helper: map internal status -> friendly label
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "paid":
        return "Paid";
      case "process":
        return "Processing";
      case "shipping":
        return "Shipping";
      case "success":
        return "Delivered";
      case "returned":
        return "Returned";
      case "refunded":
        return "Refunded";
      case "canceled":
        return "Canceled";
      default:
        return status;
    }
  };

  // counts per status for badges
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  // filtered list and pagination
  const filtered = orders.filter((o) => {
    if (filterStatus && filterStatus !== "all" && o.status !== filterStatus)
      return false;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      return (
        String(o.orderId || "")
          .toLowerCase()
          .includes(q) ||
        String(o.customer || "")
          .toLowerCase()
          .includes(q) ||
        String(o.status || "")
          .toLowerCase()
          .includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  // ensure current page is within range when data changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const current = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
        <h3 className="fw-bold">Orders</h3>

        <div className="d-flex gap-2 align-items-center">
          <div className="d-flex flex-row flex-wrap gap-2 me-2">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "process", label: "Processing" },
              { key: "paid", label: "Paid" },
              { key: "shipping", label: "Shipping" },
              { key: "success", label: "Delivered" },
              { key: "returned", label: "Returned" },
              { key: "refunded", label: "Refunded" },
              { key: "canceled", label: "Canceled" },
            ].map((t) => {
              const active = filterStatus === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  className={`btn btn-sm rounded-pill ${
                    active ? "btn-primary text-white" : "btn-outline-secondary"
                  }`}
                  onClick={() => {
                    setFilterStatus(t.key);
                    setPage(1);
                  }}
                >
                  <span className="me-2">{t.label}</span>
                  <span className="badge bg-white text-secondary border">
                    {statusCounts[t.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <button className="btn btn-outline-success" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-bordered">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Resi</th>
                  <th>Pembayaran</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {current.map((order, index) => {
                  const total = order.items.reduce(
                    (sum, i) => sum + i.qty * i.price,
                    0
                  );

                  return (
                    <tr key={order.orderId}>
                      <td>{(page - 1) * perPage + index + 1}</td>
                      <td>{order.orderId}</td>
                      <td>{order.customer}</td>
                      <td>Rp {total.toLocaleString()}</td>

                      <td>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: getStatusColor(order.status),
                          }}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      <td>
                        {order.resi || (
                          <span className="text-muted">- belum ada</span>
                        )}
                      </td>

                      <td>{order.paymentMethod}</td>

                      <td>
                        <button
                          className="btn btn-sm btn-secondary me-2"
                          onClick={() => handleViewDetail(order)}
                          disabled={!canReadOrders}
                          title={
                            !canReadOrders
                              ? "You don't have permission to view orders"
                              : undefined
                          }
                        >
                          View
                        </button>

                        {(order.status === "process" ||
                          order.status === "paid" ||
                          order.status === "shipping") && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleInputResi(order)}
                            disabled={!canUpdateOrders}
                            title={
                              !canUpdateOrders
                                ? "You don't have permission to update orders"
                                : undefined
                            }
                          >
                            Input Resi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {current.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-3">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="card-footer d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Showing {(page - 1) * perPage + (current.length ? 1 : 0)} -{" "}
            {(page - 1) * perPage + current.length} of {filtered.length} entries
          </small>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(1)}>
                  «
                </button>
              </li>

              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li
                  key={n}
                  className={`page-item ${n === page ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setPage(n)}>
                    {n}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </li>

              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(totalPages)}
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
