import RoleDefaults from "../services/RoleDefaults";

const mergePerms = (base = {}, override = {}) => {
  const out = { ...base };
  Object.keys(override || {}).forEach((k) => {
    out[k] = { ...(out[k] || {}), ...(override[k] || {}) };
  });
  return out;
};

export const hasPerm = (user, moduleKey, action) => {
  if (!user) return false;

  // Start from role defaults
  // normalize role key: accept string or object
  let roleKey = user.role;
  if (typeof roleKey === "object" && roleKey !== null) {
    roleKey =
      roleKey.key || roleKey.name || roleKey.role || roleKey.id || undefined;
  }
  // some APIs return roles as array
  if (!roleKey && Array.isArray(user.roles) && user.roles.length > 0) {
    const r = user.roles[0];
    roleKey = typeof r === "string" ? r : r.key || r.name || r.role || r.id;
  }

  if (typeof roleKey === "string") roleKey = roleKey.toLowerCase().trim();

  const rolePerms = RoleDefaults.getRolePermissions
    ? RoleDefaults.getRolePermissions(roleKey)
    : {};

  // Merge user-specific overrides (if any)
  const effective = mergePerms(rolePerms, user.permissions || {});

  return !!(effective && effective[moduleKey] && effective[moduleKey][action]);
};

export const canManageUsers = (user) => {
  if (!user) return false;
  let role = user.role;
  if (typeof role === "object" && role !== null)
    role = role.key || role.name || role.role;
  if (Array.isArray(role)) role = role[0];
  if (typeof role === "string") role = role.toLowerCase().trim();
  return ["admin"].includes(role);
};

export default { hasPerm, canManageUsers };
