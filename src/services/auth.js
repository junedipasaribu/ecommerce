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

const login = async (email, password) => {
    try {
        const res = await api.post("/auth/login", { email, password });
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const register = async (userData) => {
    try {
        const res = await api.post("/auth/register", userData);
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const logout = async () => {
    try {
        const res = await api.post("/auth/logout");
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

export default {
    login,
    register,
    logout,
};
