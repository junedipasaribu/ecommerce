import React, { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import usersService from "../services/users";
import modules from "../services/Permission";
import RoleDefaults from "../services/RoleDefaults";

const EditUserRoles = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [form, setForm] = useState({
    role: "",
    permissions: {},
  });

  // Fetch users from API
  useEffect(() => {
    usersService
      .getAll()
      .then((data) => {
        setUsers(data || []);
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        Swal.fire("Error", "Failed to load users: " + err.message, "error");
      });
  }, []);

  // ================================
  // SELECT USER
  // ================================
  const handleSelectUser = (id) => {
    const user = users.find((u) => u.id === Number(id));

    setSelectedUserId(id);
    setForm({
      role: user.role,
      permissions: user.permissions || {}, // default jika kosong
    });
  };

  // ================================
  // CHANGE PERMISSION CHECKBOX
  // ================================
  const handlePermissionChange = (moduleKey, action) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [action]: !prev.permissions[moduleKey]?.[action],
        },
      },
    }));
  };

  // ================================
  // SELECT ALL PER MODULE
  // ================================
  const handleSelectAllInModule = (moduleKey, value) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          create: value,
          read: value,
          update: value,
          delete: value,
        },
      },
    }));
  };

  // ================================
  // SELECT ALL GLOBAL
  // ================================
  const handleSelectAllGlobal = (value) => {
    const newPerms = {};

    modules.forEach((m) => {
      newPerms[m.key] = {
        create: value,
        read: value,
        update: value,
        delete: value,
      };
    });

    setForm((prev) => ({
      ...prev,
      permissions: newPerms,
    }));
  };

  // compute role defaults for selected role so we can show overrides
  const roleDefaults = useMemo(() => {
    if (!form.role) return {};
    return RoleDefaults.getRolePermissions
      ? RoleDefaults.getRolePermissions(form.role)
      : {};
  }, [form.role]);

  const isOverridden = (moduleKey, action) => {
    // explicit override only when form.permissions contains a defined value for that action
    const formPerm = form.permissions?.[moduleKey]?.[action];
    if (typeof formPerm === "undefined") return false;
    const def = roleDefaults?.[moduleKey]?.[action];
    return formPerm !== def;
  };

  // ================================
  // APPLY ROLE DEFAULTS
  // ================================
  const handleApplyRoleDefaults = () => {
    if (!form.role) {
      Swal.fire("Pilih role", "Please select a role first", "warning");
      return;
    }

    const defaults = RoleDefaults.getRolePermissions
      ? RoleDefaults.getRolePermissions(form.role)
      : {};
    const hasExisting = Object.keys(form.permissions || {}).length > 0;
    const different =
      JSON.stringify(form.permissions || {}) !== JSON.stringify(defaults || {});

    if (hasExisting && different) {
      Swal.fire({
        title: "Overwrite existing permissions?",
        text: "Current permission edits will be replaced by the role defaults.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Overwrite",
        cancelButtonText: "Cancel",
      }).then((res) => {
        if (res.isConfirmed) {
          setForm((prev) => ({ ...prev, permissions: defaults }));
          Swal.fire(
            "Applied",
            "Role defaults applied to permissions",
            "success"
          );
        }
      });
      return;
    }

    setForm((prev) => ({ ...prev, permissions: defaults }));
    Swal.fire("Applied", "Role defaults applied to permissions", "success");
  };

  // ================================
  // SAVE
  // ================================
  const handleSave = () => {
    if (!selectedUserId) {
      Swal.fire("Error", "No user selected", "error");
      return;
    }

    Swal.fire({
      title: "Simpan?",
      text: "Update role & permissions?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        const userId = Number(selectedUserId);
        const payload = {
          role: form.role,
          permissions: form.permissions,
        };

        // Call API to update user
        usersService
          .update({ id: userId, ...payload })
          .then((updated) => {
            // Update local state
            setUsers((prev) =>
              prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
            );
            Swal.fire("Berhasil!", "Data user telah diupdate.", "success");
          })
          .catch((err) => {
            Swal.fire(
              "Error",
              err.message || "Failed to update user",
              "error"
            );
          });
      }
    });
  };

  // ================================
  // CANCEL
  // ================================
  const handleCancel = () => {
    Swal.fire({
      title: "Batalkan perubahan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((res) => {
      if (res.isConfirmed) {
        setSelectedUserId("");
        setForm({ role: "", permissions: {} });
      }
    });
  };

  return (
    <div className="card shadow border-0">
      <div className="card-header">
        <h5 className="mb-0">Edit User Roles</h5>
      </div>

      <div className="card-body">
        {/* SELECT USER */}
        <div className="mb-4">
          <label className="form-label fw-bold">Pilih User</label>
          <select
            className="form-select"
            value={selectedUserId}
            onChange={(e) => handleSelectUser(e.target.value)}
          >
            <option value="">-- Pilih User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        </div>

        {selectedUserId && (
          <>
            {/* ROLE */}
            <div className="mb-4">
              <label className="form-label fw-bold">Role</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {RoleDefaults.listRoles().map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECT ALL GLOBAL */}
            <button
              className="btn btn-sm btn-dark mb-3"
              onClick={() => handleSelectAllGlobal(true)}
            >
              Select All Permissions
            </button>
            <button
              className="btn btn-sm btn-outline-dark mb-3 ms-2"
              onClick={() => handleSelectAllGlobal(false)}
            >
              Unselect All
            </button>

            <button
              className="btn btn-sm btn-outline-primary mb-3 ms-2"
              onClick={handleApplyRoleDefaults}
              title="Populate permissions from the selected role"
            >
              Apply Role Defaults
            </button>

            {/* PERMISSIONS TABLE */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Module</th>
                    <th className="text-center">Create</th>
                    <th className="text-center">Read</th>
                    <th className="text-center">Update</th>
                    <th className="text-center">Delete</th>
                    <th className="text-center">All</th>
                  </tr>
                </thead>

                <tbody>
                  {modules.map((m) => (
                    <tr key={m.key}>
                      <td className="fw-bold">{m.name}</td>

                      {["create", "read", "update", "delete"].map((act) => (
                        <td key={act} className="text-center">
                          <div className="d-flex align-items-center justify-content-center">
                            <input
                              type="checkbox"
                              checked={
                                form.permissions?.[m.key]?.[act] || false
                              }
                              onChange={() =>
                                handlePermissionChange(m.key, act)
                              }
                            />
                            {isOverridden(m.key, act) && (
                              <span
                                className="badge bg-info text-dark ms-2 small"
                                title="Overridden (diff from role default)"
                              >
                                OVR
                              </span>
                            )}
                          </div>
                        </td>
                      ))}

                      {/* SELECT ALL PER MODULE */}
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={
                            form.permissions?.[m.key]?.create &&
                            form.permissions?.[m.key]?.read &&
                            form.permissions?.[m.key]?.update &&
                            form.permissions?.[m.key]?.delete
                          }
                          onChange={(e) =>
                            handleSelectAllInModule(m.key, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BUTTONS */}
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditUserRoles;
