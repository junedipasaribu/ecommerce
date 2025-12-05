import React, { useState } from "react";
import Swal from "sweetalert2";
import { ordersData, productsData } from "../components/Sample";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orders, setOrders] = useState(ordersData);

  // =====================
  // SEARCH FILTER
  // =====================
  const filtered = orders.filter((o) => {
    const key = search.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(key) ||
      o.customer.toLowerCase().includes(key) ||
      o.status.toLowerCase().includes(key) ||
      o.paymentMethod.toLowerCase().includes(key)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice((page - 1) * perPage, page * perPage);

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
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === order.orderId ? { ...o, resi: res.value } : o
          )
        );

        Swal.fire("Berhasil!", "Nomor resi berhasil disimpan.", "success");
      }
    });
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
        process: "Process",
        success: "Success",
        canceled: "Canceled",
        paid: "Paid",
      },
      inputPlaceholder: "Select status",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId ? { ...o, status: result.value } : o
          )
        );

        Swal.fire("Updated!", "Status updated successfully.", "success");
      }
    });
  };

  // =====================
  // VIEW DETAIL
  // =====================
  const handleViewDetail = (order) => {
    const statusColor =
      order.status === "pending"
        ? "orange"
        : order.status === "process"
          ? "dodgerblue"
          : order.status === "success"
            ? "green"
            : order.status === "paid"
              ? "purple"
              : "red";

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
      const product = productsData.find((p) => p.id === i.productId);
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
        Swal.getPopup().querySelector("#btnStatus")
          ?.addEventListener("click", () => handleChangeStatus(order.orderId));

        Swal.getPopup().querySelector("#btnResi")
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
      csv += `${o.orderId},${o.customer},${o.status},${o.paymentMethod},${o.resi || "-"
        },${total}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
        <h3 className="fw-bold">Orders</h3>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            style={{ width: "260px" }}
            placeholder="Search ID, customer, status..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <button className="btn btn-success" onClick={exportCSV}>
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
                            color:
                              order.status === "pending"
                                ? "orange"
                                : order.status === "process"
                                  ? "dodgerblue"
                                  : order.status === "success"
                                    ? "green"
                                    : order.status === "paid"
                                      ? "purple"
                                      : "red",
                          }}
                        >
                          {order.status}
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
                        >
                          View
                        </button>

                        {(order.status === "process" ||
                          order.status === "paid") && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleInputResi(order)}
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
