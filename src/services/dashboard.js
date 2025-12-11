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

// ===== NEW DASHBOARD ENDPOINTS =====

// 1. Dashboard Overview - Complete dashboard data
const getOverview = async (fromDate, toDate) => {
    try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        
        const res = await api.get("/dashboard/overview", { params });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// 2. Revenue Data for Charts
const getRevenue = async (fromDate, toDate, period = "daily") => {
    try {
        const params = { period };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        
        const res = await api.get("/dashboard/revenue", { params });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// 3. Orders by Status Statistics
const getOrdersByStatus = async (fromDate, toDate) => {
    try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        
        const res = await api.get("/dashboard/orders-by-status", { params });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// 4. Top Products
const getTopProducts = async (fromDate, toDate, limit = 10) => {
    try {
        const params = { limit };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        
        const res = await api.get("/dashboard/top-products", { params });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// 5. Top Categories
const getTopCategories = async (fromDate, toDate, limit = 10) => {
    try {
        const params = { limit };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        
        const res = await api.get("/dashboard/top-categories", { params });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// 6. Recent Orders
const getRecentOrders = async (limit = 10) => {
    try {
        const res = await api.get("/dashboard/recent-orders", {
            params: { limit }
        });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// 7. Complete Dashboard - All data in one request
const getComplete = async (fromDate, toDate) => {
    try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        
        const res = await api.get("/dashboard/complete", { params });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// ===== LEGACY ENDPOINTS (for backward compatibility) =====

const getMetrics = async () => {
    try {
        const res = await api.get("/dashboard/metrics");
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const getRevenueByDay = async (startDate, endDate) => {
    try {
        const res = await api.get("/dashboard/revenue-by-day", {
            params: { startDate, endDate },
        });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const getOrderStatusCounts = async () => {
    try {
        const res = await api.get("/dashboard/order-status-counts");
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

// Admin dashboard endpoint
const getAdminDashboard = async () => {
    try {
        const res = await api.get("/admin/dashboard");
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const getAdminMetrics = async () => {
    try {
        const res = await api.get("/admin/dashboard/metrics");
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const getAdminAnalytics = async (period = "monthly") => {
    try {
        const res = await api.get("/admin/dashboard/analytics", {
            params: { period }
        });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

export default {
    // New Dashboard API
    getOverview,
    getRevenue,
    getOrdersByStatus,
    getTopProducts,
    getTopCategories,
    getRecentOrders,
    getComplete,
    
    // Legacy API (for backward compatibility)
    getMetrics,
    getRevenueByDay,
    getOrderStatusCounts,
    getAdminDashboard,
    getAdminMetrics,
    getAdminAnalytics,
};
