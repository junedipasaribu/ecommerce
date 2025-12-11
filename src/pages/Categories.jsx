// src/pages/Categories.jsx
import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import categoriesService from "../services/categories";
import { useAuth } from "../context/AuthContext";
import { hasPerm } from "../utils/hasPermission";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Categories() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        let mounted = true;
        categoriesService.getAll().then((list) => {
            if (mounted) setCategories(list || []);
        });
        return () => (mounted = false);
    }, []);

    const { user: authUser } = useAuth();
    const canCreate = hasPerm(authUser, "product", "create");
    const canUpdate = hasPerm(authUser, "product", "update");
    const canDelete = hasPerm(authUser, "product", "delete");

    // search & pagination
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 10;

    // modal / edit state
    const [editing, setEditing] = useState(null);
    const [showAdd, setShowAdd] = useState(false);

    // filter hasil search
    const filtered = useMemo(() => {
        const lower = q.trim().toLowerCase();
        if (!lower) return categories;

        return categories.filter(
            (c) =>
                c.name.toLowerCase().includes(lower) ||
                (c.description && c.description.toLowerCase().includes(lower))
        );
    }, [categories, q]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const current = filtered.slice((page - 1) * perPage, page * perPage);

    // delete
    const confirmDelete = (id) => {
        const cat = categories.find((c) => c.id === id);
        Swal.fire({
            title: "Are you sure?",
            text: `Delete "${cat?.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
        }).then((res) => {
            if (res.isConfirmed) {
                categoriesService
                    .remove(id)
                    .then(() => {
                        setCategories((prev) => prev.filter((c) => c.id !== id));
                        Swal.fire("Deleted", "Category removed", "success");
                    })
                    .catch((err) =>
                        Swal.fire("Error", err.message || "Failed to delete", "error")
                    );
            }
        });
    };

    // open edit modal
    const openEdit = (c) => setEditing({ ...c });

    // save edit
    const saveEdit = () => {
        if (!editing.name.trim()) {
            Swal.fire("Validation", "Category name is required", "warning");
            return;
        }

        categoriesService
            .update(editing)
            .then((updated) => {
                setCategories((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                );
                setEditing(null);
                Swal.fire("Saved", "Category updated", "success");
            })
            .catch((err) =>
                Swal.fire("Error", err.message || "Failed to update", "error")
            );
    };

    // open add modal
    const openAdd = () => setShowAdd(true);

    // add category
    const addCategory = (ev) => {
        ev.preventDefault();
        const f = ev.target;

        const name = f.name.value.trim();
        const description = f.description.value.trim();

        if (!name) {
            Swal.fire("Validation", "Category name is required", "warning");
            return;
        }

        const payload = { name, description };

        categoriesService
            .create(payload)
            .then((created) => {
                setCategories((prev) => [...prev, created]);
                setShowAdd(false);
                Swal.fire("Added", "Category created", "success");
                f.reset();
            })
            .catch((err) =>
                Swal.fire("Error", err.message || "Failed to create", "error")
            );
    };

    return (
        <div className="container-fluid py-4">
            {/* HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
                <h3 className="fw-bold">Categories</h3>

                <div className="d-flex flex-column flex-md-row gap-2">
                    <input
                        className="form-control form-control-sm"
                        placeholder="Search category name or description..."
                        style={{ minWidth: 220 }}
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setPage(1);
                        }}
                    />

                    <button
                        className="btn btn-primary btn-sm px-3 py-1 d-flex align-items-center"
                        onClick={openAdd}
                        disabled={!canCreate}
                        title={
                            !canCreate
                                ? "You don't have permission to add categories"
                                : undefined
                        }
                    >
                        <i className="bi bi-plus-lg me-1" />
                        Add
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "60px" }}>No</th>
                                    <th style={{ minWidth: "200px" }}>Category Name</th>
                                    <th style={{ minWidth: "300px" }}>Description</th>
                                    <th style={{ width: 190 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {current.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-muted">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    current.map((c, idx) => (
                                        <tr key={c.id}>
                                            <td className="text-nowrap">
                                                {(page - 1) * perPage + idx + 1}
                                            </td>
                                            <td className="text-nowrap">{c.name}</td>
                                            <td>{c.description || "-"}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary me-2"
                                                    onClick={() => openEdit(c)}
                                                    disabled={!canUpdate}
                                                    title={
                                                        !canUpdate
                                                            ? "You don't have permission to edit categories"
                                                            : undefined
                                                    }
                                                >
                                                    <i className="bi bi-pencil me-1" /> Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => confirmDelete(c.id)}
                                                    disabled={!canDelete}
                                                    title={
                                                        !canDelete
                                                            ? "You don't have permission to delete categories"
                                                            : undefined
                                                    }
                                                >
                                                    <i className="bi bi-trash me-1" /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* PAGINATION */}
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        Showing {(page - 1) * perPage + (current.length ? 1 : 0)} –{" "}
                        {(page - 1) * perPage + current.length} of {filtered.length} entries
                    </small>

                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${page === 1 && "disabled"}`}>
                                <button className="page-link" onClick={() => setPage(1)}>
                                    «
                                </button>
                            </li>

                            <li className={`page-item ${page === 1 && "disabled"}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    ‹
                                </button>
                            </li>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <li
                                    key={n}
                                    className={`page-item ${n === page ? "active" : ""}`}
                                >
                                    <button className="page-link" onClick={() => setPage(n)}>
                                        {n}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${page === totalPages && "disabled"}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    ›
                                </button>
                            </li>

                            <li className={`page-item ${page === totalPages && "disabled"}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setPage(totalPages)}
                                >
                                    »
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editing && (
                <div className="modal show d-block" style={{ background: "#0004" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>Edit Category</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setEditing(null)}
                                />
                            </div>

                            <div className="modal-body">
                                <div className="mb-2">
                                    <label>Category Name</label>
                                    <input
                                        className="form-control"
                                        value={editing.name}
                                        onChange={(e) =>
                                            setEditing((s) => ({ ...s, name: e.target.value }))
                                        }
                                    />
                                </div>

                                <div className="mb-2">
                                    <label>Description</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={editing.description || ""}
                                        onChange={(e) =>
                                            setEditing((s) => ({ ...s, description: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setEditing(null)}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={saveEdit}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MODAL */}
            {showAdd && (
                <div className="modal show d-block" style={{ background: "#0004" }}>
                    <div className="modal-dialog">
                        <form className="modal-content" onSubmit={addCategory}>
                            <div className="modal-header">
                                <h5>Add Category</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowAdd(false)}
                                    type="button"
                                />
                            </div>

                            <div className="modal-body">
                                <div className="mb-2">
                                    <label>Category Name</label>
                                    <input name="name" className="form-control" required />
                                </div>

                                <div className="mb-2">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        className="form-control"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={() => setShowAdd(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-primary" type="submit">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
