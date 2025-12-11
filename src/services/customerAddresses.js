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
    const res = await api.get("/addresses");
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const getById = async (addressId) => {
  try {
    const res = await api.get(`/addresses/${addressId}`);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const create = async (address) => {
  try {
    const res = await api.post("/addresses", address);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const update = async (address) => {
  try {
    const addressId = address.id;
    const res = await api.put(`/addresses/${addressId}`, address);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const remove = async (addressId) => {
  try {
    await api.delete(`/addresses/${addressId}`);
    return true;
  } catch (err) {
    handleError(err);
  }
};

const setPrimary = async (addressId) => {
  try {
    const res = await api.patch(`/addresses/${addressId}/primary`);
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
  remove,
  setPrimary,
};