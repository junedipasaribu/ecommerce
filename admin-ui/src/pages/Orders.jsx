import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ordersService from "../services/orders";
import { useAuth } from "../context/AuthContext";
import { hasPerm } from "../utils/hasPermission";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  // Helper function to merge orders with shipping data (same as Shipping page)
  const mergeOrdersWithShipping = async (ordersList) => {
    try {
      const shippingService = await import("../services/shipping");
      const shippingList = await shippingService.default.getAllShipping();
      
      return ordersList.map(order => {
        const shipping = shippingList.find(s => 
          s.orderId === order.orderId || 
          s.orderId === order.id ||
          s.orderCode === order.orderCode
        );
        
        return {
          ...order,
          trackingNumber: shipping?.trackingNumber || shipping?.tracking_number || shipping?.resi || order.trackingNumber,
          courierName: shipping?.courierName || shipping?.courier_name || shipping?.courier || order.courierName,
          shippingStatus: shipping?.shippingStatus || shipping?.status
        };
      });
    } catch (shippingError) {
      // If shipping service fails, return original orders
      return ordersList;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {       
        const ordersList = await ordersService.getAll();
        
        // Merge with shipping data to get updated courier and tracking info
        const mergedData = await mergeOrdersWithShipping(ordersList);
        
        if (mounted) setOrders(mergedData || []);
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
    const nonCancellableStatuses = ['PAID', 'SHIPPING', 'SHIPPED', 'COMPLETED', 'DELIVERED', 'EXPIRED', 'CANCELLED_BY_ADMIN'];
    const normalizedStatus = status?.toUpperCase();
    return !nonCancellableStatuses.includes(normalizedStatus);
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
        
        // Refresh data from backend and merge with shipping data
        try {
          const refreshedOrders = await ordersService.getAll();
          const mergedData = await mergeOrdersWithShipping(refreshedOrders);
          setOrders(mergedData || []);
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
        <p><b>Customer:</b> ${getCustomerName(order)}</p>
        <p><b>Address:</b> ${order.address || order.customerAddress || "N/A"}</p>
        <p><b>Courier Name:</b> ${order.courierName || order.courier_name || order.courier || 
                                      order.shipping || order.shippingMethod || order.delivery || 
                                      order.deliveryMethod || order.shippingCourier || "N/A"}</p>
        <p><b>Tracking Number:</b> ${order.trackingNumber || order.tracking_number || order.resi || "N/A"}</p>
        <p><b>Order Status:</b> 
          <span style="color:${statusColor}; font-weight:bold;">
            ${getStatusLabel(order.status)}
          </span>
        </p>
        <p><b>Payment Method:</b> ${order.paymentMethod || "N/A"}</p>
        <p><b>Total Amount:</b> Rp ${(order.totalAmount || 0).toLocaleString()}</p>
        <p><b>Created At:</b> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
      </div>
    `;

    Swal.fire({ 
      title: "Order Detail", 
      html, 
      width: 600,
      icon: "info"
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
      <div className="mb-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0 text-dark">Orders</h3>
          
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "280px" }}>
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                className="form-control border-start-0"
                placeholder="Search orders, status..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <button className="btn btn-outline-success btn-sm d-flex align-items-center" onClick={exportCSV}>
              <i className="bi bi-download me-1" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
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
                <span className="me-1">{t.label}</span>
                <span className="badge bg-white text-secondary border">
                  {statusCounts[t.key] || 0}
                </span>
              </button>
            );
          })}
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
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleViewDetail(order)}
                          disabled={!canReadOrders}
                          title={
                            !canReadOrders
                              ? "You don't have permission to view orders"
                              : undefined
                          }
                        >
                          <i className="bi bi-eye me-1" /> View Detail
                        </button>
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
