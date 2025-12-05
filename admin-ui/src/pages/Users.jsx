import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import usersService from "../services/users";
import modules from "../services/Permission";
import { useAuth } from "../context/AuthContext";
import { canManageUsers } from "../utils/hasPermission";

export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    usersService.getAll().then((list) => mounted && setUsers(list || []));
    return () => (mounted = false);
  }, []);

  const { user: authUser } = useAuth();
  const canManage = canManageUsers(authUser);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPerm, setShowPerm] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    role: "seller_staff",
    permissions: {},
  });

  const roles = [
    "superadmin",
    "admin",
    "seller_owner",
    "seller_admin",
    "seller_staff",
    "seller_inventory",
  ];

  // ROLE → DEFAULT PERMISSION
  const generateRolePermissions = (role) => {
    const perms = {};

    modules.forEach((m) => {
      perms[m.key] = {
        create: false,
        read: false,
        update: false,
        delete: false,
      };
    });

    switch (role) {
      case "superadmin":
        modules.forEach((m) => {
          perms[m.key] = {
            create: true,
            read: true,
            update: true,
            delete: true,
          };
        });
        break;

      case "admin":
        modules.forEach((m) => {
          perms[m.key] = {
            create: false,
            read: true,
            update: true,
            delete: false,
          };
        });
        break;

      case "seller_owner":
        modules.forEach((m) => {
          perms[m.key] = {
            create: false,
            read: true,
            update: false,
            delete: false,
          };
        });
        break;

      case "seller_admin":
        perms["product"] = {
          create: true,
          read: true,
          update: true,
          delete: true,
        };
        perms["order"] = {
          create: true,
          read: true,
          update: true,
          delete: true,
        };
        break;

      case "seller_staff":
        perms["order"] = {
          create: true,
          read: true,
          update: false,
          delete: false,
        };
        break;

      case "seller_inventory":
        perms["product"] = {
          read: true,
          update: true,
          create: false,
          delete: false,
        };
        break;

      default:
        break;
    }

    return perms;
  };

  // SEARCH
  const filtered = users.filter((u) => {
    const key = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(key) ||
      u.email.toLowerCase().includes(key) ||
      u.role.toLowerCase().includes(key)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  // ADD USER
  const openAddModal = () => {
    setForm({
      id: "",
      name: "",
      email: "",
      role: "seller_staff",
      permissions: generateRolePermissions("seller_staff"),
    });
    setShowAdd(true);
  };

  const submitAdd = async (e) => {
    e.preventDefault();

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return Swal.fire(
        "Invalid Email",
        "Email harus format yang valid.",
        "warning"
      );
    }

    if (!canManage)
      return Swal.fire("Forbidden", "Anda tidak punya akses.", "warning");

    try {
      const created = await usersService.create({ ...form });
      setUsers((prev) => [...prev, created]);
      setShowAdd(false);
      Swal.fire("Success", "User berhasil ditambahkan!", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal menambahkan user", "error");
    }
  };

  // EDIT USER
  const openEditModal = (user) => {
    setForm(user);
    setShowEdit(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return Swal.fire("Invalid Email", "Format email tidak valid", "warning");
    }

    if (!canManage)
      return Swal.fire("Forbidden", "Anda tidak punya akses.", "warning");

    try {
      const updated = await usersService.update(form);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setShowEdit(false);
      Swal.fire("Updated", "User berhasil diperbarui", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal update user", "error");
    }
  };

  // OPEN PERMISSION MODAL
  const openPermModal = (user) => {
    setForm(user);
    setShowPerm(true);
  };

  const togglePermission = (module, action) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module]?.[action],
        },
      },
    }));
  };

  const savePermissions = () => {
    if (!canManage)
      return Swal.fire("Forbidden", "Anda tidak punya akses.", "warning");

    usersService
      .update(form)
      .then((updated) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
        setShowPerm(false);
        Swal.fire("Success", "Permissions saved!", "success");
      })
      .catch((err) =>
        Swal.fire("Error", err.message || "Gagal simpan permissions", "error")
      );
  };

  // DELETE USER
  const deleteUser = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus user?",
      text: "Data tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      if (!canManage)
        return Swal.fire("Forbidden", "Anda tidak punya akses.", "warning");

      try {
        await usersService.remove(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        Swal.fire("Deleted", "User berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Error", err.message || "Gagal hapus user", "error");
      }
    }
  };

  const countPermissions = (perm) => {
    if (!perm) return 0;
    let total = 0;
    Object.values(perm).forEach((p) => {
      Object.values(p).forEach((v) => v && total++);
    });
    return total;
  };

  return (
    <div className="container-fluid py-4">
      {/* ========= TITLE & SEARCH ========= */}
      <div className="d-flex justify-content-between mb-3">
        <h3 className="fw-bold">Users</h3>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Cari user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: 250 }}
          />

          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="bi bi-plus-lg me-1"></i> Add
          </button>
        </div>
      </div>

      {/* ========= TABLE ========= */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "60px" }}>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
                <th style={{ width: 300 }}>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {current.map((user, i) => (
                <tr key={user.id}>
                  <td>{(page - 1) * perPage + i + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td style={{ fontWeight: 600 }}>{user.role}</td>
                  <td>
                    {countPermissions(user.permissions) > 0
                      ? `${countPermissions(user.permissions)} permissions`
                      : "No permissions"}
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => openEditModal(user)}
                      disabled={!canManage}
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => openPermModal(user)}
                      disabled={!canManage}
                    >
                      <i className="bi bi-shield-lock" /> Permissions
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteUser(user.id)}
                      disabled={!canManage}
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========= PAGINATION ========= */}
        <div className="card-footer d-flex justify-content-between">
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

      {/* ========= ADD USER MODAL ========= */}
      {showAdd && (
        <div
          className="modal fade show d-block"
          style={{ background: "#0005" }}
        >
          <div className="modal-dialog">
            <form onSubmit={submitAdd} className="modal-content">
              <div className="modal-header">
                <h5>Add User</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowAdd(false)}
                />
              </div>

              <div className="modal-body">
                <label>Nama Lengkap</label>
                <input
                  className="form-control mb-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <label>Email</label>
                <input
                  className="form-control mb-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <label>Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                      permissions: generateRolePermissions(e.target.value),
                    })
                  }
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={!canManage}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========= PERMISSION MODAL ========= */}
      {showPerm && (
        <div
          className="modal fade show d-block"
          style={{ background: "#0005" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Permissions — {form.name}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowPerm(false)}
                />
              </div>

              <div className="modal-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th className="text-center">Create</th>
                      <th className="text-center">Read</th>
                      <th className="text-center">Update</th>
                      <th className="text-center">Delete</th>
                    </tr>
                  </thead>

                  <tbody>
                    {modules.map((m) => (
                      <tr key={m.key}>
                        <td>{m.name}</td>
                        {["create", "read", "update", "delete"].map((act) => (
                          <td className="text-center" key={act}>
                            <input
                              type="checkbox"
                              checked={
                                form.permissions?.[m.key]?.[act] || false
                              }
                              onChange={() => togglePermission(m.key, act)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPerm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={savePermissions}
                  disabled={!canManage}
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========= EDIT USER MODAL ========= */}
      {showEdit && (
        <div
          className="modal fade show d-block"
          style={{ background: "#0005" }}
        >
          <div className="modal-dialog">
            <form onSubmit={submitEdit} className="modal-content">
              <div className="modal-header">
                <h5>Edit User</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEdit(false)}
                />
              </div>

              <div className="modal-body">
                <label>Nama Lengkap</label>
                <input
                  className="form-control mb-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <label>Email</label>
                <input
                  className="form-control mb-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <label>Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                      permissions: generateRolePermissions(e.target.value),
                    })
                  }
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-success" disabled={!canManage}>
                  Save Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
