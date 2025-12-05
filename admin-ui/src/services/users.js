// Mock users service. Seeds from `usersData` in development and persists changes
// to localStorage under the key `mock_users`. Replace implementations with
// `api` calls when backend is available.

import { usersData } from "../components/Sample";

const STORAGE_KEY = "mock_users";

const delay = (ms = 150) => new Promise((res) => setTimeout(res, ms));

const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  // fallback: clone sample data
  return JSON.parse(JSON.stringify(usersData || []));
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
  return list.find((u) => u.id === id) || null;
};

const create = async (user) => {
  await delay();
  const list = readStorage();
  const newUser = { ...user, id: Date.now() };
  list.push(newUser);
  writeStorage(list);
  return newUser;
};

const update = async (user) => {
  await delay();
  const list = readStorage();
  const idx = list.findIndex((u) => u.id === user.id);
  if (idx === -1) throw new Error("User not found");
  list[idx] = { ...list[idx], ...user };
  writeStorage(list);
  return list[idx];
};

const remove = async (id) => {
  await delay();
  let list = readStorage();
  list = list.filter((u) => u.id !== id);
  writeStorage(list);
  return true;
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
