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
  const [search, setSearch] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalCourier, setModalCourier] = useState("");
  const [modalTracking, setModalTracking] = useState("");
  
  // Status update modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusOrder, setSelectedStatusOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const { user: authUser } = useAuth();
  const canUpdate = hasPerm(authUser, "shipping", "update");

  // Helper function to check if order can be cancelled
  const canCancelOrder = (status) => {
    const nonCancellableStatuses = ['PAID', 'SHIPPING', 'SHIPPED', 'COMPLETED', 'DELIVERED', 'EXPIRED', 'CANCELLED_BY_ADMIN'];
    const normalizedStatus = status?.toUpperCase();
    return !nonCancellableStatuses.includes(normalizedStatus);
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
        const refreshedOrders = await ordersService.getAll();
        const mergedData = await mergeOrdersWithShipping(refreshedOrders);
        setOrders(mergedData || []);
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



  // Helper function to get unique courier names from orders
  const getUniqueCouriers = () => {
    const couriers = new Set();
    
    // Add default couriers
    const defaultCouriers = ["GO KFA","JNE"];
    defaultCouriers.forEach(courier => couriers.add(courier));
    
    // Add couriers from existing orders
    orders.forEach(order => {
      const courierName = getCourierName(order);
      if (courierName && courierName !== "-" && courierName !== "N/A") {
        couriers.add(courierName);
      }
    });
    
    return Array.from(couriers).sort();
  };

  const handleAddTracking = (order) => {
    if (!canUpdate) return Swal.fire("Forbidden", "No permission", "warning");
    
    setSelectedOrder(order);
    // Pre-fill courier if order already has one
    const existingCourier = getCourierName(order);
    setModalCourier(existingCourier && existingCourier !== "-" && existingCourier !== "N/A" ? existingCourier : "");
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
    if (!canUpdate) return Swal.fire("Forbidden", "No permission", "warning");
    
    setSelectedStatusOrder(shipping);
    setSelectedStatus("");
    setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedStatus) {
      Swal.fire("Error", "Please select a status", "error");
      return;
    }

    try {
      const orderId = selectedStatusOrder.orderId || selectedStatusOrder.id;
      await ordersService.updateStatus(orderId, selectedStatus);
      
      // Refresh data from backend and merge with shipping data
      const refreshedOrders = await ordersService.getAll();
      const mergedData = await mergeOrdersWithShipping(refreshedOrders);
      setOrders(mergedData || []);
      
      setShowStatusModal(false);
      Swal.fire("Success", "Status updated successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Update failed: " + error.message, "error");
    }
  };

  // =====================
  // EXPORT TO CSV
  // =====================
  const exportCSV = () => {
    let csv = "Order Code,Customer Name,Order Status,Courier Name,Tracking Number,Total Amount,Address\n";

    filtered.forEach((o) => {
      const customerName = getCustomerName(o);
      const courierName = getCourierName(o);
      const trackingNumber = getTrackingNumber(o);
      const total = o.totalAmount || 0;
      const address = (o.address || o.customerAddress || "N/A").replace(/"/g, '""'); // Escape quotes
      const orderCode = o.orderCode || o.orderId || o.id || "";
      const status = getStatusLabel(o.status);
      
      csv += `"${orderCode}","${customerName}","${status}","${courierName}","${trackingNumber}",${total},"${address}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shipping.csv";
    a.click();
    
    URL.revokeObjectURL(url);
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
    // Filter by status
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
    
    // Filter by search
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const customerName = getCustomerName(o).toLowerCase();
      const courierName = getCourierName(o).toLowerCase();
      const trackingNumber = getTrackingNumber(o).toLowerCase();
      const orderCode = String(o.orderCode || o.orderId || o.id || "").toLowerCase();
      const status = String(o.status || "").toLowerCase();
      
      return (
        orderCode.includes(q) ||
        customerName.includes(q) ||
        courierName.includes(q) ||
        trackingNumber.includes(q) ||
        status.includes(q)
      );
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
      <div className="mb-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0 text-dark">Shipping Management</h3>
          
          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "280px" }}>
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                className="form-control border-start-0"
                placeholder="Search orders, courier..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <button 
              className="btn btn-outline-success btn-sm d-flex align-items-center"
              onClick={exportCSV}
              title="Export shipping data to CSV"
            >
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
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleViewDetail(shipping)}
                      >
                        <i className="bi bi-eye me-1" />View Detail
                      </button>

                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleAddTracking(shipping)}
                        disabled={!canUpdate}
                      >
                       <i class="bi bi-truck"></i> Add Tracking
                      </button>

                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => handleStatusUpdate(shipping)}
                        disabled={!canUpdate}
                      >
                        <i class="bi bi-pc"></i>Update Status
                      </button>

                      {canCancelOrder(shipping.status) && (
                        <button
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={() => handleCancelOrder(shipping.orderId || shipping.id)}
                          disabled={!canUpdate}
                          title={
                            !canUpdate
                              ? "You don't have permission to cancel orders"
                              : "Cancel this order"
                          }
                        >
                         <i class="bi bi-x"></i> Cancel Order
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
                {selectedOrder && (
                  <div className="form-text">
                    Customer: {getCustomerName(selectedOrder)} | 
                    Current Courier: {getCourierName(selectedOrder)} | 
                    Current Tracking: {getTrackingNumber(selectedOrder)}
                  </div>
                )}
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
                  {getUniqueCouriers().map((courier, index) => (
                    <option key={index} value={courier}>{courier}</option>
                  ))}
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

      {/* Bootstrap Modal for Update Status */}
      <div className={`modal fade ${showStatusModal ? 'show' : ''}`} 
           style={{ display: showStatusModal ? 'block' : 'none' }}
           tabIndex="-1" 
           role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Order Status</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowStatusModal(false)}
                aria-label="Close">
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="orderStatusInfo" className="form-label">Order Information</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="orderStatusInfo"
                  value={selectedStatusOrder ? `${selectedStatusOrder.orderCode || selectedStatusOrder.orderId || selectedStatusOrder.id}` : ''}
                  disabled
                />
                {selectedStatusOrder && (
                  <div className="form-text">
                    Customer: {getCustomerName(selectedStatusOrder)} | 
                    Current Status: <span style={{ color: getStatusColor(selectedStatusOrder.status), fontWeight: 'bold' }}>
                      {getStatusLabel(selectedStatusOrder.status)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="statusSelect" className="form-label">New Status</label>
                <select 
                  className="form-select" 
                  id="statusSelect"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Select New Status</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPING">Shipping</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED_BY_ADMIN">Cancelled by Admin</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSaveStatus}
                disabled={!selectedStatus}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop for status modal */}
      {showStatusModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}
