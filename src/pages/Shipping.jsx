import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ordersService from "../services/orders";
import shippingService from "../services/shipping";
import { useAuth } from "../context/AuthContext";
import { hasPerm } from "../utils/hasPermission";

export default function ShippingPage() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalCourier, setModalCourier] = useState("");
  const [modalTracking, setModalTracking] = useState("");

  const { user: authUser } = useAuth();
  const canUpdate = hasPerm(authUser, "shipping", "update");

  // Helper function to check if order can be cancelled
  const canCancelOrder = (status) => {
    const nonCancellableStatuses = ['SHIPPING', 'PAID', 'COMPLETED', 'EXPIRED', 'CANCELLED_BY_ADMIN'];
    return !nonCancellableStatuses.includes(status);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    const confirm = await Swal.fire({
      title: "Cancel Order",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel Order",
      cancelButtonText: "No, Keep Order",
      confirmButtonColor: "#dc3545",
    });

    if (confirm.isConfirmed) {
      try {
        await ordersService.cancelOrder(orderId);
        Swal.fire("Success", "Order cancelled successfully", "success");
        // Refresh data
        loadData();
      } catch (err) {
        Swal.fire("Error", "Failed to cancel order: " + err.message, "error");
      }
    }
  };

  // Helper function to merge orders with shipping data
  const mergeOrdersWithShipping = async (ordersList) => {
    try {
      const shippingList = await shippingService.getAllShipping();
      
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

      return ordersList;
    }
  };

  // Helper function to get courier name
  const getCourierName = (shipping) => {
    return shipping.courierName || shipping.courier_name || shipping.courier || 
           shipping.shipping || shipping.shippingMethod || shipping.delivery || 
           shipping.deliveryMethod || shipping.shippingCourier || "-";
  };

  // Helper function to get tracking number
  const getTrackingNumber = (shipping) => {
    return shipping.trackingNumber || shipping.tracking_number || shipping.resi || 
           shipping.trackingNo || shipping.tracking || shipping.awb || "-";
  };

  // Helper function to get customer name
  const getCustomerName = (shipping) => {
    return shipping.customerName || shipping.customer_name || shipping.customer || "N/A";
  };



  // Helper function for status color (same as Orders page)
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

  // Helper function for status label (same as Orders page)
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

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        const ordersList = await ordersService.getAll();
        const mergedData = await mergeOrdersWithShipping(ordersList);
        
        if (mounted) setOrders(mergedData || []);
      } catch (error) {
        console.error("Error loading data:", error);
        if (mounted) {
          Swal.fire("Error", "Failed to load data: " + error.message, "error");
        }
      }
    };
    
    loadData();
    return () => (mounted = false);
  }, []);

  const handleAddTracking = (order) => {
    if (!canUpdate) return Swal.fire("Forbidden", "No permission", "warning");
    
    setSelectedOrder(order);
    setModalCourier("");
    setModalTracking("");
    setShowModal(true);
  };

  const handleSaveTracking = async () => {
    if (!modalCourier || !modalTracking) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }

    const orderId = parseInt(selectedOrder.orderId || selectedOrder.id);
    const shippingData = {
      orderId: orderId,
      courier: modalCourier,
      trackingNumber: modalTracking
    };

    try {
      await shippingService.addTracking(shippingData);
      
      // Refresh data from backend and merge with shipping data
      const refreshedOrders = await ordersService.getAll();
      const mergedData = await mergeOrdersWithShipping(refreshedOrders);
      setOrders(mergedData || []);
      
      setShowModal(false);
      Swal.fire("Success", "Tracking updated successfully", "success");
    } catch (error) {
      console.error("Add tracking error:", error);
      const errorMsg = error?.response?.data?.message || error.message || "Failed to update";
      Swal.fire("Error", "Failed to update: " + errorMsg, "error");
    }
  };

  const handleStatusUpdate = (shipping) => {
    Swal.fire({
      title: "Update Order Status",
      input: "select",
      inputOptions: {
        Pending: "Pending Payment",
        Paid: "Paid", 
        Processing: "Processing",
        Shipped: "Shipping",
        Delivered: "Completed",
        Cancelled: "Cancelled",
        Expired: "Expired",
      },
      inputPlaceholder: "Select new status",
      showCancelButton: true,
      confirmButtonText: "Update Status",
      cancelButtonText: "Cancel",
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      if (!canUpdate) return Swal.fire("Forbidden", "No permission", "warning");

      try {
        const orderId = shipping.orderId || shipping.id;
        await ordersService.updateStatus(orderId, res.value);
        
        // Refresh data from backend and merge with shipping data
        const refreshedOrders = await ordersService.getAll();
        const mergedData = await mergeOrdersWithShipping(refreshedOrders);
        setOrders(mergedData || []);
        
        Swal.fire("Success", "Status updated successfully", "success");
      } catch (error) {
        console.error("Update status error:", error);
        Swal.fire("Error", "Update failed: " + error.message, "error");
      }
    });
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
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  // ensure current page is within range when data changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const current = filtered.slice((page - 1) * perPage, page * perPage);

  const handleViewDetail = (shipping) => {
    const statusColor = getStatusColor(shipping.status);

    let html = `
      <div style="text-align:left">
        <p><b>Order Code:</b> ${shipping.orderCode || shipping.orderId || shipping.id}</p>
        <p><b>Customer:</b> ${getCustomerName(shipping)}</p>
        <p><b>Address:</b> ${shipping.address || shipping.customerAddress || "N/A"}</p>
        <p><b>Courier Name:</b> ${getCourierName(shipping)}</p>
        <p><b>Tracking Number:</b> ${getTrackingNumber(shipping)}</p>
        <p><b>Order Status:</b> 
          <span style="color:${statusColor}; font-weight:bold;">
            ${getStatusLabel(shipping.status)}
          </span>
        </p>
        <p><b>Payment Method:</b> ${shipping.paymentMethod || "N/A"}</p>
        <p><b>Total Amount:</b> Rp ${(shipping.totalAmount || 0).toLocaleString()}</p>
        <p><b>Created At:</b> ${shipping.createdAt ? new Date(shipping.createdAt).toLocaleString() : "N/A"}</p>
      </div>
    `;

    Swal.fire({ 
      title: "Shipping Detail", 
      html, 
      width: 600,
      icon: "info"
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
        <h3 className="fw-bold">Shipping Management</h3>

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
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Order Code</th>
                  <th>Order Status</th>
                  <th>Courier Name</th>
                  <th>No. Tracking</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((shipping, idx) => (
                  <tr key={shipping.orderId || shipping.id}>
                    <td>{(page - 1) * perPage + idx + 1}</td>
                    <td>{shipping.orderCode}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: getStatusColor(shipping.status),
                        }}
                      >
                        {getStatusLabel(shipping.status)}
                      </span>
                    </td>
                    <td>{getCourierName(shipping)}</td>
                    <td>{getTrackingNumber(shipping)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleViewDetail(shipping)}
                      >
                        Detail
                      </button>

                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleAddTracking(shipping)}
                        disabled={!canUpdate}
                      >
                        Add Tracking
                      </button>

                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleStatusUpdate(shipping)}
                        disabled={!canUpdate}
                      >
                        Update Status
                      </button>

                      {canCancelOrder(shipping.status) && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelOrder(shipping.orderId || shipping.id)}
                          disabled={!canUpdate}
                          title={
                            !canUpdate
                              ? "You don't have permission to cancel orders"
                              : "Cancel this order"
                          }
                        >
                          Cancel Order
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {current.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-3">
                      No data found
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

      {/* Bootstrap Modal for Add Tracking */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} 
           style={{ display: showModal ? 'block' : 'none' }}
           tabIndex="-1" 
           role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Tracking Number</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
                aria-label="Close">
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="orderInfo" className="form-label">Order Information</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="orderInfo"
                  value={selectedOrder ? `${selectedOrder.orderCode || selectedOrder.orderId || selectedOrder.id}` : ''}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label htmlFor="courierSelect" className="form-label">Courier</label>
                <select 
                  className="form-select" 
                  id="courierSelect"
                  value={modalCourier}
                  onChange={(e) => setModalCourier(e.target.value)}
                >
                  <option value="">Select Courier</option>
                  <option value="JNE">GO KFA</option>
                  <option value="JNE">JNE</option>
                  <option value="TIKI">TIKI</option>
                  <option value="POS">POS Indonesia</option>
                  <option value="J&T">J&T Express</option>
                  <option value="SiCepat">SiCepat</option>
                  <option value="AnterAja">AnterAja</option>
                  <option value="Ninja">Ninja Express</option>
                  <option value="Lion">Lion Parcel</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="trackingInput" className="form-label">Tracking Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="trackingInput"
                  placeholder="Enter tracking number"
                  value={modalTracking}
                  onChange={(e) => setModalTracking(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSaveTracking}
                disabled={!modalCourier || !modalTracking}
              >
                Save Tracking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}
