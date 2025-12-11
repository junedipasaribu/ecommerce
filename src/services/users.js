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

// ===== USER PROFILE ENDPOINTS (Self-access) =====

// Get current user profile
const getProfile = async () => {
  try {
    const res = await api.get("/users/profile");
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

// Update current user profile
const updateProfile = async (profileData) => {
  try {
    const res = await api.put("/users/profile", profileData);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

// Change password
const changePassword = async (passwordData) => {
  try {
    const res = await api.put("/users/profile/password", passwordData);
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

// ===== ADMIN USER MANAGEMENT ENDPOINTS =====

// Get all users (Admin only)
const getAll = async () => {
  try {
    const res = await api.get("/admin/users");
    return extractData(res);
  } catch (err) {
    // Fallback to alternative endpoints if main endpoint fails
    if (err?.response?.status === 404 || err?.response?.status === 403) {
      try {
        const res = await api.get("/users/admin/all");
        return extractData(res);
      } catch (err2) {
        return [];
      }
    }
    handleError(err);
  }
};

// Get user by ID (Admin only)
const getById = async (id) => {
  try {
    const res = await api.get(`/admin/users/${id}`);
    return extractData(res);
  } catch (err) {
    // Fallback to alternative endpoint
    try {
      const res = await api.get(`/users/${id}`);
      return extractData(res);
    } catch (err2) {
      handleError(err);
    }
  }
};

// Create new user (Admin only)
const create = async (userData) => {
  try {
    const res = await api.post("/admin/users", userData);
    return extractData(res);
  } catch (err) {
    // Fallback to alternative endpoint
    try {
      const res = await api.post("/users/create", userData);
      return extractData(res);
    } catch (err2) {
      handleError(err);
    }
  }
};

// Update user (Admin only)
const update = async (id, userData) => {
  try {
    const res = await api.put(`/admin/users/${id}`, userData);
    return extractData(res);
  } catch (err) {
    // Fallback to alternative endpoint
    try {
      const res = await api.put(`/users/update/${id}`, userData);
      return extractData(res);
    } catch (err2) {
      handleError(err);
    }
  }
};

// Delete user (Admin only)
const remove = async (id) => {
  try {
    await api.delete(`/admin/users/${id}`);
    return true;
  } catch (err) {
    // Fallback to alternative endpoint
    try {
      await api.delete(`/users/hapus/${id}`);
      return true;
    } catch (err2) {
      handleError(err);
    }
  }
};

// Get user statistics (Admin only)
const getStats = async () => {
  try {
    const res = await api.get("/admin/users/stats");
    return extractData(res);
  } catch (err) {
    // Return fallback stats if endpoint not available
    return {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      regularUsers: 0,
      newUsersThisMonth: 0
    };
  }
};

// Search users (Admin only)
const search = async (query, filters = {}) => {
  try {
    const params = { query, ...filters };
    const res = await api.get("/admin/users/search", { params });
    return extractData(res);
  } catch (err) {
    // Fallback to getAll and filter locally
    try {
      const allUsers = await getAll();
      const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.role.toLowerCase().includes(query.toLowerCase())
      );
      return filtered;
    } catch (err2) {
      handleError(err);
    }
  }
};

// Bulk operations (Admin only)
const bulkUpdate = async (userIds, updateData) => {
  try {
    const res = await api.put("/admin/users/bulk", {
      userIds,
      updateData
    });
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

const bulkDelete = async (userIds) => {
  try {
    const res = await api.delete("/admin/users/bulk", {
      data: { userIds }
    });
    return extractData(res);
  } catch (err) {
    handleError(err);
  }
};

// Legacy methods for backward compatibility
const updateLegacy = async (user) => {
  try {
    const id = user.id;
    return await update(id, user);
  } catch (err) {
    handleError(err);
  }
};

export default {
  // Profile management (self-access)
  getProfile,
  updateProfile,
  changePassword,
  
  // Admin user management
  getAll,
  getById,
  create,
  update,
  remove,
  getStats,
  search,
  bulkUpdate,
  bulkDelete,
  
  // Legacy compatibility
  update: updateLegacy, // Keep old signature for existing code
};
