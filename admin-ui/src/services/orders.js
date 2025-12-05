// Mock orders service. Seeds from `ordersData` and persists to localStorage.
import { ordersData } from "../components/Sample";

const STORAGE_KEY = "mock_orders";

const delay = (ms = 150) => new Promise((res) => setTimeout(res, ms));

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return JSON.parse(JSON.stringify(ordersData || []));
};

const writeStorage = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
};

const getAll = async () => {
  await delay();
  return readStorage();
};

const getById = async (id) => {
  await delay();
  const list = readStorage();
  return list.find((o) => o.id === id) || null;
};

const create = async (order) => {
  await delay();
  const list = readStorage();
  const newItem = { ...order, id: Date.now() };
  list.push(newItem);
  writeStorage(list);
  return newItem;
};

const update = async (order) => {
  await delay();
  const list = readStorage();
  const idx = list.findIndex((o) => o.id === order.id);
  if (idx === -1) throw new Error("Order not found");
  list[idx] = { ...list[idx], ...order };
  writeStorage(list);
  return list[idx];
};

const remove = async (id) => {
  await delay();
  let list = readStorage();
  list = list.filter((o) => o.id !== id);
  writeStorage(list);
  return true;
};

export default { getAll, getById, create, update, remove };
