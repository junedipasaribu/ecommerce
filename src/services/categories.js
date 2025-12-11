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

const getAll = async () => {
    try {
        const res = await api.get("/categories");
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const getById = async (id) => {
    try {
        const res = await api.get(`/admin/categories/${id}`);
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const create = async (category) => {
    try {
        const payload = {
            name: category.categoryName || category.name,
            description: category.categoryDescription || category.description || "",
        };
        const res = await api.post(`/admin/categories`, payload);
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const update = async (category) => {
    try {
        const id = category.id;
        const payload = {
            name: category.categoryName || category.name,
            description: category.categoryDescription || category.description || "",
        };
        const res = await api.put(`/admin/categories/${id}`, payload);
        return extractData(res);
    } catch (err) {
        handleError(err);
    }
};

const remove = async (id) => {
    try {
        await api.delete(`/admin/categories/${id}`);
        return true;
    } catch (err) {
        handleError(err);
    }
};

export default {
    getAll,
    getById,
    create,
    update,
    remove,
};
