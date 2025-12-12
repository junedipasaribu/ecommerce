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

const processPayment = async (orderId, paymentData) => {
  try {
    const res = await api.post(`/payments/pay/${orderId}`, paymentData);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const getPaymentStatus = async (orderId) => {
  try {
    const res = await api.get(`/payments/status/${orderId}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const handleCallback = async (callbackData) => {
  try {
    const res = await api.post("/payments/callback", callbackData);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const getPaymentHistory = async () => {
  try {
    const res = await api.get("/payments/history");
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const cancelPayment = async (orderId) => {
  try {
    const res = await api.post(`/payments/cancel/${orderId}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

export default {
  processPayment,
  getPaymentStatus,
  handleCallback,
  getPaymentHistory,
  cancelPayment,
};