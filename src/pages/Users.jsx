import React, { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  // Auto-refresh function
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      
      const [usersList, stats] = await Promise.all([
        usersService.getAll(),
        usersService.getStats().catch(() => null) // Stats are optional
      ]);
      

      
      setUsers(usersList || []);
      setUserStats(stats);
    } catch (err) {
      Swal.fire("Error", "Failed to load users: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const { user: authUser } = useAuth();
  const canManage = canManageUsers(authUser);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPerm, setShowPerm] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    role: "user",
    permissions: {},
  });

  const roles = ["admin", "user"];

  // ROLE → DEFAULT PERMISSION (backend only supports `admin` and `user`)
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

    if (role && role.toUpperCase() === "ADMIN") {
      modules.forEach((m) => {
        perms[m.key] = { create: true, read: true, update: true, delete: true };
      });
    } else {
      // default 'user' gets read-only access to common modules
      modules.forEach((m) => {
        perms[m.key] = {
          create: false,
          read: true,
          update: false,
          delete: false,
        };
      });
      // but ensure sensitive modules are disabled for users
      if (perms.user)
        perms.user = {
          create: false,
          read: false,
          update: false,
          delete: false,
        };
      if (perms.settings)
        perms.settings = {
          create: false,
          read: false,
          update: false,
          delete: false,
        };
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
      role: "user",
      permissions: generateRolePermissions("user"),
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
      setShowAdd(false);
      Swal.fire("Success", "User berhasil ditambahkan!", "success");
      // Auto refresh after successful creation
      await loadUsers();
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
      const updated = await usersService.update(form.id, form);
      setShowEdit(false);
      Swal.fire("Updated", "User berhasil diperbarui", "success");
      // Auto refresh after successful update
      await loadUsers();
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

  const savePermissions = async () => {
    if (!canManage)
      return Swal.fire("Forbidden", "Anda tidak punya akses.", "warning");

    try {
      await usersService.update(form.id, form);
      setShowPerm(false);
      Swal.fire("Success", "Permissions saved!", "success");
      // Auto refresh after successful permission update
      await loadUsers();
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal simpan permissions", "error");
    }
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
        Swal.fire("Deleted", "User berhasil dihapus", "success");
        // Auto refresh after successful deletion
        await loadUsers();
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
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* ========= TITLE & STATS ========= */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 className="fw-bold">Users Management</h3>
          {userStats && (
            <div className="d-flex gap-3 mt-2">
              <small className="text-muted">
                <i className="bi bi-people me-1"></i>
                Total: <span className="fw-bold">{userStats.totalUsers || users.length}</span>
              </small>
              <small className="text-muted">
                <i className="bi bi-person-check me-1"></i>
                Active: <span className="fw-bold">{userStats.activeUsers || 0}</span>
              </small>
              <small className="text-muted">
                <i className="bi bi-shield-check me-1"></i>
                Admins: <span className="fw-bold">{userStats.adminUsers || users.filter(u => u.role === 'admin').length}</span>
              </small>
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary btn-sm" 
            onClick={loadUsers}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''} me-1`}></i>
            Refresh
          </button>
          
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

          <button className="btn btn-primary" onClick={openAddModal} disabled={!canManage}>
            <i className="bi bi-plus-lg me-1"></i> Add User
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading users...
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    {search ? `No users found for "${search}"` : "No users available"}
                  </td>
                </tr>
              ) : (
                current.map((user, i) => (
                  <tr key={user.id}>
                    <td>{(page - 1) * perPage + i + 1}</td>
                    <td>
                      <div className="fw-medium">{user.name}</div>
                      {user.createdAt && (
                        <small className="text-muted">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${
                        user.role === 'admin' ? 'bg-danger' : 
                        user.role === 'user' ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {countPermissions(user.permissions) > 0 ? (
                        <span className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          {countPermissions(user.permissions)} permissions
                        </span>
                      ) : (
                        <span className="text-muted">
                          <i className="bi bi-x-circle me-1"></i>
                          No permissions
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => openEditModal(user)}
                          disabled={!canManage}
                          title="Edit User"
                        >
                          <i className="bi bi-pencil" />
                        </button>

                        <button
                          className="btn btn-outline-primary"
                          onClick={() => openPermModal(user)}
                          disabled={!canManage}
                          title="Manage Permissions"
                        >
                          <i className="bi bi-shield-lock" />
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          onClick={() => deleteUser(user.id)}
                          disabled={!canManage || user.id === authUser?.id}
                          title={user.id === authUser?.id ? "Cannot delete yourself" : "Delete User"}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
                <h5 className="modal-title">Add New User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAdd(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="user@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Role *</label>
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
                    required
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <div className="form-text">
                    Admin memiliki akses penuh, User memiliki akses terbatas
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!canManage || !form.name || !form.email}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Create User
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
                <h5 className="modal-title">Edit User - {form.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEdit(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="user@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Role *</label>
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
                    required
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <div className="form-text">
                    Mengubah role akan mereset permissions ke default
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={!canManage || !form.name || !form.email}
                >
                  <i className="bi bi-check-lg me-1"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
