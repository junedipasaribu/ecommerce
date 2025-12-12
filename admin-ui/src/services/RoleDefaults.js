// src/services/RoleDefaults.js
// Default permission sets for common ecommerce roles.
// Permissions are simple objects per module with create/read/update/delete booleans.

const modules = [
  "dashboard",
  "product",
  "order",
  "shipping",
  "customer",
  "promotion",
  "coupon",
  "seller",
  "inventory",
  "shipment",
  "returns",
  "review",
  "report",
  "finance",
  "settings",
  "user",
];

const fullPerm = () => ({
  create: true,
  read: true,
  update: true,
  delete: true,
});
const readOnly = () => ({
  create: false,
  read: true,
  update: false,
  delete: false,
});
const none = () => ({
  create: false,
  read: false,
  update: false,
  delete: false,
});

// Restrict to two roles: `admin` and `user` to match backend.
const roles = {
  admin: modules.reduce((acc, m) => ({ ...acc, [m]: fullPerm() }), {}),

  // `user` gets read-only access to common modules but no user-management or settings.
  user: modules.reduce((acc, m) => ({ ...acc, [m]: readOnly() }), {}),
};

export const getRolePermissions = (roleKey) => {
  return roles[roleKey] || {};
};

export const listRoles = () => [
  { key: "admin", name: "Admin" },
  { key: "user", name: "User" },
];

export default { getRolePermissions, listRoles };
