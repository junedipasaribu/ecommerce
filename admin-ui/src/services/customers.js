// Mock customers service. Seeds from `customersData` and persists to localStorage.
import { customersData } from "../components/Sample";

const STORAGE_KEY = "mock_customers";

const delay = (ms = 120) => new Promise((res) => setTimeout(res, ms));

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return JSON.parse(JSON.stringify(customersData || []));
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
  return list.find((c) => c.id === id) || null;
};

const create = async (customer) => {
  await delay();
  const list = readStorage();
  const newItem = { ...customer, id: Date.now() };
  list.push(newItem);
  writeStorage(list);
  return newItem;
};

const update = async (customer) => {
  await delay();
  const list = readStorage();
  const idx = list.findIndex((c) => c.id === customer.id);
  if (idx === -1) throw new Error("Customer not found");
  list[idx] = { ...list[idx], ...customer };
  writeStorage(list);
  return list[idx];
};

const remove = async (id) => {
  await delay();
  let list = readStorage();
  list = list.filter((c) => c.id !== id);
  writeStorage(list);
  return true;
};

export default { getAll, getById, create, update, remove };
