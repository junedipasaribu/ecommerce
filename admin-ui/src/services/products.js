// Mock products service. Seeds from `productsData` and persists to localStorage.
import { productsData } from "../components/Sample";

const STORAGE_KEY = "mock_products";

const delay = (ms = 120) => new Promise((res) => setTimeout(res, ms));

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return JSON.parse(JSON.stringify(productsData || []));
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
  return list.find((p) => p.id === id) || null;
};

const create = async (product) => {
  await delay();
  const list = readStorage();
  const newItem = { ...product, id: Date.now() };
  list.push(newItem);
  writeStorage(list);
  return newItem;
};

const update = async (product) => {
  await delay();
  const list = readStorage();
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx === -1) throw new Error("Product not found");
  list[idx] = { ...list[idx], ...product };
  writeStorage(list);
  return list[idx];
};

const remove = async (id) => {
  await delay();
  let list = readStorage();
  list = list.filter((p) => p.id !== id);
  writeStorage(list);
  return true;
};

export default { getAll, getById, create, update, remove };
