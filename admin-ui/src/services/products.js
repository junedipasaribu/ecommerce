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
    const res = await api.get("/products");
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const getById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const create = async (product) => {
  try {
    const res = await api.post(`/products`, product);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const update = async (product) => {
  try {
    const id = product.id;
    const res = await api.put(`/products/${id}`, product);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const remove = async (id) => {
  try {
    await api.delete(`/products/${id}`);
    return true;
  } catch (err) {
    handleError(err);
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
