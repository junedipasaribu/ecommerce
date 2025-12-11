// src/pages/Products.jsx
import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import productsService from "../services/products";
import categoriesService from "../services/categories";
import { useAuth } from "../context/AuthContext";
import { hasPerm } from "../utils/hasPermission";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    
    // Load products and categories
    Promise.all([
      productsService.getAll(),
      categoriesService.getAll()
    ]).then(([productsList, categoriesList]) => {
      if (mounted) {
        setProducts(productsList || []);
        setCategories(categoriesList || []);
      }
    }).catch((err) => {
      if (mounted) {
        Swal.fire("Error", "Failed to load data: " + err.message, "error");
      }
    });
    
    return () => (mounted = false);
  }, []);

  const { user: authUser } = useAuth();
  const canCreate = hasPerm(authUser, "product", "create");
  const canUpdate = hasPerm(authUser, "product", "update");
  const canDelete = hasPerm(authUser, "product", "delete");

  // Promo helpers (keperluan render list / edit; tidak digunakan pada add)
  const isPromoActive = (promo) => {
    try {
      if (!promo || !promo.enabled) return false;
      if (!promo.startDate || !promo.endDate) return false;
      const now = new Date();
      const start = new Date(promo.startDate + "T00:00:00");
      const end = new Date(promo.endDate + "T23:59:59");
      return now >= start && now <= end;
    } catch (e) {
      return false;
    }
  };

  const getPromoPrice = (product) => {
    const promo = product?.promo;
    if (!promo || !isPromoActive(promo)) return product.price;
    const value = Number(promo.value || 0);
    if (promo.type === "percent") {
      const discounted = Math.round(product.price * (1 - value / 100));
      return Math.max(0, discounted);
    }
    // fixed
    return Math.max(0, product.price - value);
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId || !categories.length) return "-";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

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
    if (!lower) return products;

    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const category = (p.categoryName && p.categoryName.toLowerCase()) || "";
      return name.includes(lower) || category.includes(lower);
    });
  }, [products, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  // delete
  const confirmDelete = (id) => {
    const prod = products.find((p) => p.id === id);
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${prod?.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then((res) => {
      if (res.isConfirmed) {
        productsService
          .remove(id)
          .then(() => {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            Swal.fire("Deleted", "Product removed", "success");
          })
          .catch((err) =>
            Swal.fire("Error", err.message || "Failed to delete", "error")
          );
      }
    });
  };

  // open edit modal
  const openEdit = (p) => setEditing({ ...p });

  // save edit
  const saveEdit = () => {
    if (!editing.name.trim()) {
      Swal.fire("Validation", "Name is required", "warning");
      return;
    }
    
    if (!editing.categoryId) {
      Swal.fire("Validation", "Category is required", "warning");
      return;
    }

    // promo validation (keperluan edit)
    if (editing.promo?.enabled) {
      const { startDate, endDate, type, value } = editing.promo;
      if (!startDate || !endDate) {
        Swal.fire(
          "Validation",
          "Promo start and end dates are required",
          "warning"
        );
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        Swal.fire("Validation", "Promo start must be before end", "warning");
        return;
      }
      if (!value || Number(value) <= 0) {
        Swal.fire("Validation", "Promo value must be > 0", "warning");
        return;
      }
      if (type === "percent" && (Number(value) <= 0 || Number(value) > 100)) {
        Swal.fire(
          "Validation",
          "Percent promo must be between 1 and 100",
          "warning"
        );
        return;
      }
    }
    productsService
      .update(editing)
      .then((updated) => {
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setEditing(null);
        Swal.fire("Saved", "Product updated", "success");
      })
      .catch((err) =>
        Swal.fire("Error", err.message || "Failed to update", "error")
      );
  };

  // open add modal
  const openAdd = () => setShowAdd(true);

  // add product
  const addProduct = (ev) => {
    ev.preventDefault();
    const f = ev.target;

    const name = f.name.value.trim();
    const description = f.description.value.trim();
    const price = Number(f.price.value || 0);
    const stock = Number(f.stock.value || 0);
    const imageUrl = f.imageUrl.value.trim();
    const categoryId = Number(f.categoryId.value);

    if (!name) {
      Swal.fire("Validation", "Name is required", "warning");
      return; 
    }

    if (!categoryId) {
      Swal.fire("Validation", "Category is required", "warning");
      return;
    }

    const payload = { 
      name, 
      description, 
      price, 
      stock, 
      imageUrl,
      categoryId 
    };

    productsService
      .create(payload)
      .then((created) => {
        setProducts((prev) => [...prev, created]);
        setShowAdd(false);
        Swal.fire("Added", "Product created", "success");
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
        <h3 className="fw-bold">Products</h3>

        <div className="d-flex flex-column flex-md-row gap-2">
          <input
            className="form-control form-control-sm"
            placeholder="Search name or category..."
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
                ? "You don't have permission to add products"
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
                  <th style={{ minWidth: "200px" }}>Name</th>
                  <th style={{ minWidth: "160px" }}>Category</th>
                  <th style={{ width: 140 }}>Price</th>
                  <th style={{ width: 100 }}>Stock</th>
                  <th style={{ width: 190 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {current.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  current.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="text-nowrap">
                        {(page - 1) * perPage + idx + 1}
                      </td>
                      <td className="text-nowrap">{p.name}</td>
                      <td className="text-nowrap">{p.categoryName || getCategoryName(p.categoryId)}</td>
                        <td className="text-nowrap">
                          {isPromoActive(p.promo) ? (
                            <div className="d-flex align-items-center">
                              <div className="text-muted small text-decoration-line-through me-2">
                                Rp {p.price.toLocaleString()}
                              </div>
                              <div className="fw-bold text-danger">
                                Rp {getPromoPrice(p).toLocaleString()}
                              </div>
                              <span
                                className="badge bg-warning text-dark ms-2"
                                title={
                                  p.promo
                                    ? `${p.promo.startDate} → ${p.promo.endDate}`
                                    : "Promo"
                                }
                              >
                                Promo
                              </span>
                            </div>
                          ) : (
                            <>Rp {p.price.toLocaleString()}</>
                          )}
                        </td>
                        <td className="text-nowrap">{p.stock}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => openEdit(p)}
                            disabled={!canUpdate}
                            title={
                              !canUpdate
                                ? "You don't have permission to edit products"
                                : undefined
                            }
                          >
                            <i className="bi bi-pencil me-1" /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmDelete(p.id)}
                            disabled={!canDelete}
                            title={
                              !canDelete
                                ? "You don't have permission to delete products"
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
        {/* PAGINATION (sesuai Volt) */}
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
                <h5>Edit Product</h5>
                <button
                  className="btn-close"
                  onClick={() => setEditing(null)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-2">
                  <label>Name</label>
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

                <div className="mb-2">
                  <label>Category *</label>
                  <select
                    className="form-select"
                    value={editing.categoryId || ""}
                    onChange={(e) =>
                      setEditing((s) => ({
                        ...s,
                        categoryId: Number(e.target.value),
                      }))
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    Choose a category for this product
                  </small>
                </div>

                <div className="mb-2">
                  <label>Image URL</label>
                  <input
                    className="form-control"
                    value={editing.imageUrl || ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, imageUrl: e.target.value }))
                    }
                    placeholder="image.jpg"
                  />
                </div>

                <div className="row g-2">
                  <div className="col">
                    <label>Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing((s) => ({
                          ...s,
                          price: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className="col">
                    <label>Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editing.stock}
                      onChange={(e) =>
                        setEditing((s) => ({
                          ...s,
                          stock: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-3 border-top pt-3">
                  <label className="form-label">Promotion (optional)</label>

                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="promoEnabled"
                      checked={!!editing.promo?.enabled}
                      onChange={(e) =>
                        setEditing((s) => ({
                          ...s,
                          promo: {
                            ...(s.promo || {}),
                            enabled: e.target.checked,
                          },
                        }))
                      }
                    />
                    <label className="form-check-label" htmlFor="promoEnabled">
                      Enable promo
                    </label>
                  </div>

                  <div className="row g-2">
                    <div className="col-4">
                      <label>Type</label>
                      <select
                        className="form-select"
                        value={editing.promo?.type || "percent"}
                        onChange={(e) =>
                          setEditing((s) => ({
                            ...s,
                            promo: { ...(s.promo || {}), type: e.target.value },
                          }))
                        }
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (Rp)</option>
                      </select>
                    </div>

                    <div className="col-4">
                      <label>Value</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editing.promo?.value ?? ""}
                        onChange={(e) =>
                          setEditing((s) => ({
                            ...s,
                            promo: {
                              ...(s.promo || {}),
                              value: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="col-4">
                      <label>Start</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editing.promo?.startDate || ""}
                        onChange={(e) =>
                          setEditing((s) => ({
                            ...s,
                            promo: {
                              ...(s.promo || {}),
                              startDate: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="col-4 mt-2">
                      <label>End</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editing.promo?.endDate || ""}
                        onChange={(e) =>
                          setEditing((s) => ({
                            ...s,
                            promo: {
                              ...(s.promo || {}),
                              endDate: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
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
            <form className="modal-content" onSubmit={addProduct}>
              <div className="modal-header">
                <h5>Add Product</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowAdd(false)}
                  type="button"
                />
              </div>

              <div className="modal-body">
                <div className="mb-2">
                  <label>Name</label>
                  <input name="name" className="form-control" required />
                </div>

                <div className="mb-2">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    className="form-control" 
                    rows={3}
                    placeholder="Product description..."
                  />
                </div>

                <div className="mb-2">
                  <label>Category *</label>
                  <select
                    name="categoryId"
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    Choose a category for this product
                  </small>
                </div>

                <div className="mb-2">
                  <label>Image URL</label>
                  <input 
                    name="imageUrl" 
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="row g-2">
                  <div className="col">
                    <label>Price</label>
                    <input
                      name="price"
                      type="number"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col">
                    <label>Stock</label>
                    <input
                      name="stock"
                      type="number"
                      className="form-control"
                      required
                    />
                  </div>
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
