import React, { useState } from "react";
import Swal from "sweetalert2";
import usersService from "../services/users";
import { useNavigate } from "react-router-dom";

const roles = [
  "superadmin",
  "admin",
  "seller_owner",
  "seller_admin",
  "seller_staff",
  "seller_inventory",
];

// ROLE → DEFAULT PERMISSION (copied from Users.add behavior)
const generateRolePermissions = (role) => {
  const modules = [
    "dashboard",
    "product",
    "order",
    "purchase",
    "expense",
    "report",
    "user",
  ];
  const perms = {};

  modules.forEach((m) => {
    perms[m] = { create: false, read: false, update: false, delete: false };
  });

  switch (role) {
    case "superadmin":
      modules.forEach((m) => {
        perms[m] = { create: true, read: true, update: true, delete: true };
      });
      break;
    case "admin":
      modules.forEach((m) => {
        perms[m] = { create: false, read: true, update: true, delete: false };
      });
      break;
    case "seller_owner":
      modules.forEach((m) => {
        perms[m] = { create: false, read: true, update: false, delete: false };
      });
      break;
    case "seller_admin":
      perms["product"] = {
        create: true,
        read: true,
        update: true,
        delete: true,
      };
      perms["order"] = { create: true, read: true, update: true, delete: true };
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

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "seller_staff",
    permissions: generateRolePermissions("seller_staff"),
  });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return Swal.fire(
        "Invalid Email",
        "Email harus format yang valid.",
        "warning"
      );
    }

    try {
      const payload = { ...form };
      payload.permissions = generateRolePermissions(form.role);
      await usersService.create(payload);
      Swal.fire(
        "Success",
        "Registration successful. You can now login.",
        "success"
      );
      navigate("/login", { replace: true });
    } catch (err) {
      Swal.fire("Error", err.message || "Registration failed", "error");
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-between"
      style={{ minHeight: "100vh", backgroundColor: "#153B77" }}
    >
      <div className="container-fluid d-flex justify-content-center align-items-center flex-grow-1">
        <div className="row w-100 d-flex justify-content-center align-items-center">
          {/* LEFT BRANDING */}
          <div className="col-md-6 text-white text-center px-5 d-none d-md-block">
            <h2 className="fw-bold">KF APPS</h2>
            <h3 className="fw-bold">Mini E-Commerce</h3>

            <p className="mt-4">powered by :</p>
            <h6>Underground Innovation Engineers.</h6>
          </div>

          {/* RIGHT CARD */}
          <div className="col-md-4">
            <div
              className="bg-white p-4 shadow rounded"
              style={{ minWidth: "350px" }}
            >
              <h5
                className="fw-bold mb-3 text-center"
                style={{ color: "#153B77" }}
              >
                Register
              </h5>

              <form onSubmit={submit}>
                <input
                  className="form-control mb-2"
                  placeholder="Nama"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                  className="form-control mb-2"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <select
                  className="form-select mb-3"
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
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <div className="d-grid gap-2">
                  <button
                    className="btn text-white fw-bold"
                    style={{ backgroundColor: "#E39A3B" }}
                    type="submit"
                  >
                    Register
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Already have an account?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    style={{ color: "#153B77" }}
                  >
                    Login
                  </a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        className="text-center py-2 text-white fw-semibold"
        style={{ backgroundColor: "#E39A3B" }}
      >
        © Tim 5 Cacing Capston Project 2025. Hak Cipta Dilindungi
      </footer>
    </div>
  );
}
