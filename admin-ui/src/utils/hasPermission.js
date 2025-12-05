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
  const rolePerms = RoleDefaults.getRolePermissions
    ? RoleDefaults.getRolePermissions(user.role)
    : {};

  // Merge user-specific overrides (if any)
  const effective = mergePerms(rolePerms, user.permissions || {});

  return !!(effective && effective[moduleKey] && effective[moduleKey][action]);
};

export const canManageUsers = (user) => {
  if (!user) return false;
  return ["superadmin", "admin"].includes(user.role);
};

export default { hasPerm, canManageUsers };
