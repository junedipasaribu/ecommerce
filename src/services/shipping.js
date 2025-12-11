import api from "./api";

const handleError = (err) => {
  const message = err?.response?.data?.message || err?.message || "Request failed";
  throw new Error(message);
};

const extractData = (response) => {
  if (response.data && response.data.data !== undefined) {
    return response.data.data;
  }
  return response.data;
};

// Admin endpoints
const addTracking = async (shippingData) => {
  try {
    const res = await api.post("/admin/shipping/add", shippingData);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const updateShippingStatus = async (orderId, status) => {
  try {
    const res = await api.patch("/admin/shipping/status", null, {
      params: { orderId, status },
    });
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

// Admin GET endpoints
const getAllShipping = async () => {
  try {
    const res = await api.get("/admin/shipping/all");
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const getShippingByOrderId = async (orderId) => {
  try {
    const res = await api.get(`/admin/shipping/${orderId}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const getShippingByTrackingNumber = async (trackingNumber) => {
  try {
    const res = await api.get(`/admin/shipping/track/${trackingNumber}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

// User endpoint
const getMyShipping = async (orderId) => {
  try {
    const res = await api.get(`/shipping/${orderId}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

// Dashboard endpoint
const getShippingStats = async () => {
  try {
    const res = await api.get("/admin/dashboard/shipping");
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

export default {
  getAllShipping,
  getShippingByOrderId,
  getShippingByTrackingNumber,
  addTracking,
  updateShippingStatus,
  getMyShipping,
  getShippingStats,
};
