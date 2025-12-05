import React, { useState } from "react";
import Swal from "sweetalert2";
import { usersData } from "../components/Sample";
import modules from "../services/Permission";

const EditUserRoles = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [form, setForm] = useState({
    role: "",
    permissions: {},
  });

  // ================================
  // SELECT USER
  // ================================
  const handleSelectUser = (id) => {
    const user = usersData.find((u) => u.id === Number(id));

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

  // ================================
  // SAVE
  // ================================
  const handleSave = () => {
    Swal.fire({
      title: "Simpan?",
      text: "Update role & permissions?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        console.log("UPDATED DATA:", form);

        Swal.fire("Berhasil!", "Data user telah diupdate.", "success");
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
            {usersData.map((u) => (
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
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="seller_owner">Seller Owner</option>
                <option value="seller_admin">Seller Admin</option>
                <option value="seller_staff">Seller Staff</option>
                <option value="seller_inventory">Seller Inventory</option>
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
                          <input
                            type="checkbox"
                            checked={form.permissions?.[m.key]?.[act] || false}
                            onChange={() => handlePermissionChange(m.key, act)}
                          />
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
