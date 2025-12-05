// src/pages/Products.jsx
import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { productsData as InitialProducts } from "../components/Sample";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Products() {
  // ambil data dari data.js
  const [products, setProducts] = useState(InitialProducts);

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

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
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
        setProducts((prev) => prev.filter((p) => p.id !== id));
        Swal.fire("Deleted", "Product removed", "success");
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

    setProducts((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    setEditing(null);
    Swal.fire("Saved", "Product updated", "success");
  };

  // open add modal
  const openAdd = () => setShowAdd(true);

  // add product
  const addProduct = (ev) => {
    ev.preventDefault();
    const f = ev.target;

    const name = f.name.value.trim();
    const price = Number(f.price.value || 0);
    const stock = Number(f.stock.value || 0);
    const category = f.category.value.trim();

    if (!name) {
      Swal.fire("Validation", "Name is required", "warning");
      return;
    }

    const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    setProducts((prev) => [...prev, { id, name, price, stock, category }]);

    setShowAdd(false);
    Swal.fire("Added", "Product created", "success");
    f.reset();
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
                  <th style={{ minWidth: "200px" }}>Nama</th>
                  <th style={{ minWidth: "160px" }}>Kategori</th>
                  <th style={{ width: 140 }}>Harga</th>
                  <th style={{ width: 100 }}>Stok</th>
                  <th style={{ width: 190 }}>Aksi</th>
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
                      <td className="text-nowrap">{p.category}</td>
                      <td className="text-nowrap">
                        Rp {p.price.toLocaleString()}
                      </td>
                      <td className="text-nowrap">{p.stock}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => openEdit(p)}
                        >
                          <i className="bi bi-pencil me-1" /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => confirmDelete(p.id)}
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
                  <label>Category</label>
                  <input
                    className="form-control"
                    value={editing.category}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, category: e.target.value }))
                    }
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
                  <input name="name" className="form-control" />
                </div>

                <div className="mb-2">
                  <label>Category</label>
                  <input name="category" className="form-control" />
                </div>

                <div className="row g-2">
                  <div className="col">
                    <label>Price</label>
                    <input
                      name="price"
                      type="number"
                      className="form-control"
                    />
                  </div>
                  <div className="col">
                    <label>Stock</label>
                    <input
                      name="stock"
                      type="number"
                      className="form-control"
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
