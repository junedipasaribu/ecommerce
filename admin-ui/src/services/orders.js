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

const getAll = async () => {
  try {
    const res = await api.get("/orders/admin/all");
    const data = extractData(res);
    

    
    return data;
  } catch (err) {
    handleError(err);
  }
};

const getById = async (id) => {
  try {
    const res = await api.get(`/orders/admin/${id}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const create = async (order) => {
  try {
    const res = await api.post(`/orders/checkout`, order);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const update = async (order) => {
  try {
    const id = order.id;
    const res = await api.patch(`/orders/admin/${id}`, order);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const updateStatus = async (orderId, status) => {
  try {
    const res = await api.patch(`/orders/admin/${orderId}/status`, { status });
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const remove = async (id) => {
  try {
    await api.patch(`/orders/cancel/${id}`);
    return true;
  } catch (err) {
    handleError(err);
  }
};

const completeOrder = async (orderId) => {
  try {
    const res = await api.patch(`/orders/completed/${orderId}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const cancelOrder = async (orderId) => {
  try {
    const res = await api.patch(`/orders/admin/${orderId}/cancel`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
  completeOrder,
  cancelOrder,
};
