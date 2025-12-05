// src/services/RoleDefaults.js
// Default permission sets for common ecommerce roles.
// Permissions are simple objects per module with create/read/update/delete booleans.

const modules = [
  "dashboard",
  "product",
  "order",
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

const roles = {
  superadmin: modules.reduce((acc, m) => ({ ...acc, [m]: fullPerm() }), {}),

  admin: modules.reduce((acc, m) => ({ ...acc, [m]: fullPerm() }), {}),

  finance: {
    dashboard: readOnly(),
    product: readOnly(),
    order: readOnly(),
    customer: readOnly(),
    promotion: none(),
    coupon: none(),
    seller: none(),
    inventory: none(),
    shipment: readOnly(),
    returns: readOnly(),
    review: none(),
    report: readOnly(),
    finance: fullPerm(),
    settings: none(),
    user: none(),
  },

  seller_owner: {
    dashboard: readOnly(),
    product: fullPerm(),
    order: { create: false, read: true, update: true, delete: false },
    customer: readOnly(),
    promotion: { create: true, read: true, update: true, delete: true },
    coupon: { create: true, read: true, update: true, delete: true },
    seller: fullPerm(),
    inventory: fullPerm(),
    shipment: { create: false, read: true, update: true, delete: false },
    returns: { create: false, read: true, update: true, delete: false },
    review: readOnly(),
    report: readOnly(),
    finance: readOnly(),
    settings: none(),
    user: none(),
  },

  seller_staff: {
    dashboard: readOnly(),
    product: { create: false, read: true, update: true, delete: false },
    order: { create: false, read: true, update: true, delete: false },
    customer: readOnly(),
    promotion: none(),
    coupon: none(),
    seller: readOnly(),
    inventory: { create: false, read: true, update: true, delete: false },
    shipment: { create: false, read: true, update: false, delete: false },
    returns: { create: false, read: true, update: false, delete: false },
    review: readOnly(),
    report: none(),
    finance: none(),
    settings: none(),
    user: none(),
  },

  warehouse: {
    dashboard: readOnly(),
    product: readOnly(),
    order: { create: false, read: true, update: true, delete: false },
    customer: readOnly(),
    promotion: none(),
    coupon: none(),
    seller: none(),
    inventory: fullPerm(),
    shipment: fullPerm(),
    returns: fullPerm(),
    review: none(),
    report: readOnly(),
    finance: none(),
    settings: none(),
    user: none(),
  },

  marketing: {
    dashboard: readOnly(),
    product: readOnly(),
    order: readOnly(),
    customer: readOnly(),
    promotion: fullPerm(),
    coupon: fullPerm(),
    seller: none(),
    inventory: none(),
    shipment: none(),
    returns: none(),
    review: readOnly(),
    report: readOnly(),
    finance: none(),
    settings: none(),
    user: none(),
  },

  support: {
    dashboard: readOnly(),
    product: readOnly(),
    order: { create: false, read: true, update: true, delete: false },
    customer: fullPerm(),
    promotion: none(),
    coupon: none(),
    seller: none(),
    inventory: none(),
    shipment: readOnly(),
    returns: fullPerm(),
    review: readOnly(),
    report: none(),
    finance: none(),
    settings: none(),
    user: none(),
  },

  viewer: modules.reduce((acc, m) => ({ ...acc, [m]: readOnly() }), {}),
};

export const getRolePermissions = (roleKey) => {
  return roles[roleKey] || {};
};

export const listRoles = () => [
  { key: "superadmin", name: "Super Admin" },
  { key: "admin", name: "Admin" },
  { key: "finance", name: "Finance" },
  { key: "seller_owner", name: "Seller Owner" },
  { key: "seller_staff", name: "Seller Staff" },
  { key: "warehouse", name: "Warehouse" },
  { key: "marketing", name: "Marketing" },
  { key: "support", name: "Support" },
  { key: "viewer", name: "Viewer" },
];

export default { getRolePermissions, listRoles };
