import { useState, useEffect } from "react";
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
    
    const loadData = async () => {
      try {       
        const ordersList = await ordersService.getAll();
        

        
        if (mounted) setOrders(ordersList || []);
        
        const productsList = await productsService.getAll();
        if (mounted) setProducts(productsList || []);
      } catch (error) {
        if (mounted) {
          Swal.fire("Error", "Failed to load data: " + error.message, "error");
        }
      }
    };
    
    loadData();
    return () => (mounted = false);
  }, []);

  const { user: authUser } = useAuth();
  const canReadOrders = hasPerm(authUser, "order", "read");
  const canUpdateOrders = hasPerm(authUser, "order", "update");

  // Helper function to check if order can be cancelled
  const canCancelOrder = (status) => {
    const nonCancellableStatuses = ['SHIPPING', 'PAID', 'COMPLETED', 'EXPIRED', 'CANCELLED_BY_ADMIN'];
    return !nonCancellableStatuses.includes(status);
  };

  // Helper function to get customer name
  const getCustomerName = (order) => {
    // Quick return for direct name fields
    if (order.customerName) return order.customerName;
    if (order.customer_name) return order.customer_name;
    if (order.customer) return order.customer;
    if (order.userName) return order.userName;
    if (order.user_name) return order.user_name;
    if (order.name) return order.name;
    
    // Check for nested user object
    if (order.user) {
      if (order.user.name) return order.user.name;
      if (order.user.username) return order.user.username;
      if (order.user.fullName) return order.user.fullName;
    }
    
    // Fallback: create a mock name based on order ID for development
    const orderId = order.id || order.orderId || order.orderCode;
    if (orderId) {
      return `Customer ${orderId}`;
    }
    
    return "N/A";
  };

  // ============================
  // INPUT / EDIT RESI
  // ============================
  const handleInputResi = (order) => {
    Swal.fire({
      title: "Input No Tracking",
      input: "text",
      inputValue: order.resi || "",
      inputPlaceholder: "entri",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        if (!canUpdateOrders)
          return Swal.fire("Forbidden", "No Access", "warning");

        ordersService
          .update({ ...order, resi: res.value })
          .then((updated) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
            Swal.fire("Success!", "Saved.", "success");
          })
          .catch((err) =>
            Swal.fire("Error", err.message || "Something Wrong", "error")
          );
      }
    });
  };

  // helper: map status -> color for display
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "PENDING_PAYMENT":
      case "PENDING":
        return "orange";
      case "PAID":
        return "purple";
      case "PROCESSING":
        return "dodgerblue";
      case "SHIPPING":
      case "SHIPPED":
        return "teal";
      case "COMPLETED":
      case "DELIVERED":
        return "green";
      case "CANCELLED_BY_USER":
      case "CANCELLED_BY_ADMIN":
      case "CANCELLED":
        return "red";
      case "EXPIRED":
        return "gray";
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
        PENDING_PAYMENT: "Pending Payment",
        PAID: "Paid", 
        PROCESSING: "Processing",
        SHIPPING: "Shipping",
        COMPLETED: "Completed",
        CANCELLED_BY_ADMIN: "Cancelled by Admin",
        EXPIRED: "Expired",
      },
      inputPlaceholder: "Select status",
      showCancelButton: true,
      confirmButtonText: "Update Status",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        if (!canUpdateOrders)
          return Swal.fire("Forbidden", "No Access.", "warning");

        const order = orders.find((x) => x.id === orderId || x.orderId === orderId);
        if (!order) {
          console.error("Order not found for ID:", orderId);
          return Swal.fire("Error", "Order not found", "error");
        }

        const actualOrderId = order.orderId || order.id;


        // Use the new updateStatus method
        ordersService
          .updateStatus(actualOrderId, result.value)
          .then(async (updated) => {
            // Refresh data from backend to get latest status
            try {
              const refreshedOrders = await ordersService.getAll();
              setOrders(refreshedOrders || []);
              Swal.fire("Updated!", "Status updated successfully.", "success");
            } catch (refreshError) {
              // Fallback: update local state if refresh fails
              setOrders((prev) =>
                prev.map((p) => 
                  (p.id === actualOrderId || p.orderId === actualOrderId) 
                    ? { ...p, status: result.value }
                    : p
                )
              );
              Swal.fire("Updated!", "Status updated successfully.", "success");
            }
          })
          .catch((err) => {
            console.error("Status update error:", err);
            Swal.fire("Error", err.message || "Something wrong", "error");
          });
      }
    });
  };

  // =====================
  // CANCEL ORDER
  // =====================
  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Cancel Order",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it"
    });

    if (result.isConfirmed) {
      if (!canUpdateOrders) {
        return Swal.fire("Forbidden", "No Access", "warning");
      }

      try {
        await ordersService.cancelOrder(orderId);
        
        // Refresh data from backend to get latest status
        try {
          const refreshedOrders = await ordersService.getAll();
          setOrders(refreshedOrders || []);
        } catch (refreshError) {
          // Fallback: update local state if refresh fails
          setOrders((prev) =>
            prev.map((order) =>
              (order.id === orderId || order.orderId === orderId)
                ? { ...order, status: "Cancelled" }
                : order
            )
          );
        }
        
        Swal.fire("Cancelled!", "Order has been cancelled.", "success");
      } catch (error) {
        console.error("Cancel order error:", error);
        Swal.fire("Error", error.message || "Failed to cancel order", "error");
      }
    }
  };

  // =====================
  // VIEW DETAIL
  // =====================
  const handleViewDetail = (order) => {
    const statusColor = getStatusColor(order.status);

    let html = `
      <div style="text-align:left">
        <p><b>Order Code:</b> ${order.orderCode || order.orderId || order.id}</p>
        <p><b>Courier:</b> ${order.courierName || order.courier_name || order.courier || 
                                      order.shipping || order.shippingMethod || order.delivery || 
                                      order.deliveryMethod || order.shippingCourier || "N/A"}</p>

        <p><b>Order Status:</b> 
          <span style="color:${statusColor}; font-weight:bold;">
            ${order.status}
          </span>
        </p>
        <p><b>Payment Method:</b> ${order.paymentMethod}</p>
        <hr/>
        <h5>Items:</h5>
    `;

    order.items.forEach((i) => {
      const product = products.find((p) => p.id === i.productId);
      html += `
        <p><b>${product ? product.name : "Unknown Product"}</b> - 
        Qty: ${i.quantity} × Rp ${i.price.toLocaleString()}</p>`;
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
    let csv = "OrderID,Customer Name,Order Status,Courier Name,Payment Method,Total\n";

    orders.forEach((o) => {
      const total = o.totalAmount || (o.items ? o.items.reduce((sum, i) => sum + (i.qty || i.quantity) * i.price, 0) : 0);
      const customerName = getCustomerName(o);
      const courierName = o.courierName || o.courier_name || o.courier || 
                          o.shipping || o.shippingMethod || o.delivery || 
                          o.deliveryMethod || o.shippingCourier || "No courier data";
      csv += `${o.orderCode || o.orderId || o.id},${customerName},${o.status},${courierName},${o.paymentMethod || "N/A"},${total}\n`;
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
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "PENDING_PAYMENT":
      case "PENDING":
        return "Pending Payment";
      case "PAID":
        return "Paid";
      case "PROCESSING":
        return "Processing";
      case "SHIPPING":
      case "SHIPPED":
        return "Shipping";
      case "COMPLETED":
      case "DELIVERED":
        return "Completed";
      case "CANCELLED_BY_USER":
      case "CANCELLED_BY_ADMIN":
      case "CANCELLED":
        return "Cancelled";
      case "EXPIRED":
        return "Expired";
      default:
        return status || "Unknown";
    }
  };

  // counts per status for badges
  const statusCounts = orders.reduce((acc, o) => {
    const status = o.status?.toUpperCase() || "UNKNOWN";
    // Map backend status to frontend filter keys
    let filterKey = status;
    if (status === "PENDING") filterKey = "PENDING_PAYMENT";
    if (status === "SHIPPED") filterKey = "SHIPPING";
    if (status === "DELIVERED") filterKey = "COMPLETED";
    if (status === "CANCELLED") filterKey = "CANCELLED_BY_ADMIN";
    
    acc[filterKey] = (acc[filterKey] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  // filtered list and pagination
  const filtered = orders.filter((o) => {
    if (filterStatus && filterStatus !== "all") {
      const orderStatus = o.status?.toUpperCase();
      // Map backend status to frontend filter keys for comparison
      let mappedStatus = orderStatus;
      if (orderStatus === "PENDING") mappedStatus = "PENDING_PAYMENT";
      if (orderStatus === "SHIPPED") mappedStatus = "SHIPPING";
      if (orderStatus === "DELIVERED") mappedStatus = "COMPLETED";
      if (orderStatus === "CANCELLED") mappedStatus = "CANCELLED_BY_ADMIN";
      
      if (mappedStatus !== filterStatus.toUpperCase()) {
        return false;
      }
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const customerName = getCustomerName(o).toLowerCase();
      return (
        String(o.orderCode || o.orderId || o.id || "")
          .toLowerCase()
          .includes(q) ||
        customerName.includes(q) ||
        String(o.status || "")
          .toLowerCase()
          .includes(q) ||
        String(o.courierName || o.courier_name || o.courier || 
               o.shipping || o.shippingMethod || o.delivery || 
               o.deliveryMethod || o.shippingCourier || "")
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
              { key: "PENDING_PAYMENT", label: "Pending Payment" },
              { key: "PAID", label: "Paid" },
              { key: "PROCESSING", label: "Processing" },
              { key: "SHIPPING", label: "Shipping" },
              { key: "COMPLETED", label: "Completed" },
              { key: "CANCELLED_BY_USER", label: "Cancelled by User" },
              { key: "CANCELLED_BY_ADMIN", label: "Cancelled by Admin" },
              { key: "EXPIRED", label: "Expired" },
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
                  <th>Order Code</th>
                  <th>Total Amount</th>
                  <th>Order Status</th>
                  <th>Courier Name</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((order, index) => {
                  const total = order.totalAmount || 
                    (order.items ? order.items.reduce((sum, i) => sum + (i.qty || i.quantity) * i.price, 0) : 0);

                  // Create unique key combining multiple possible identifiers
                  const uniqueKey = `${order.id || order.orderId || index}-${order.orderCode || 'no-code'}-${index}`;

                  return (
                    <tr key={uniqueKey}>
                      <td>{(page - 1) * perPage + index + 1}</td>
                      <td>
                        {order.orderCode || order.orderId || order.id}
                      </td>
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
                        {order.courierName || order.courier_name || order.courier || 
                         order.shipping || order.shippingMethod || order.delivery || 
                         order.deliveryMethod || order.shippingCourier || (
                          <span className="text-muted">No courier data</span>
                        )}
                      </td>

                      <td>{order.paymentMethod || "N/A"}</td>

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

                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleChangeStatus(order.orderId || order.id)}
                          disabled={!canUpdateOrders}
                          title={
                            !canUpdateOrders
                              ? "You don't have permission to update orders"
                              : undefined
                          }
                        >
                          Change Status
                        </button>

                        {canCancelOrder(order.status) && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancelOrder(order.orderId || order.id)}
                            disabled={!canUpdateOrders}
                            title={
                              !canUpdateOrders
                                ? "You don't have permission to cancel orders"
                                : undefined
                            }
                          >
                            Cancel
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
