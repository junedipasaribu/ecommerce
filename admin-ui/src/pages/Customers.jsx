import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import customersService from "../services/customers";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    let mounted = true;
    customersService.getAll().then((list) => mounted && setCustomers(list || []));
    return () => (mounted = false);
  }, []);

  // =====================
  // ADD CUSTOMER
  // =====================
  const openAdd = () => {
    Swal.fire({
      title: "Tambah Customer",
      html: `
        <input id="name" placeholder="Nama" type="text" class="swal2-input">
        <input id="alamat" placeholder="Alamat" type="text" class="swal2-input">
        <input id="phone" placeholder="No HP" type="text" class="swal2-input">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("name").value;
        const alamat = document.getElementById("alamat").value;
        const phone = document.getElementById("phone").value;

        if (!name || !alamat || !phone) {
          Swal.showValidationMessage("Semua field harus diisi!");
          return false;
        }

        return { name, alamat, phone };
      },
    }).then((res) => {
        if (res.isConfirmed) {
          customersService
            .create({ ...res.value })
            .then((created) => {
              setCustomers((prev) => [...prev, created]);
              Swal.fire("Berhasil!", "Customer berhasil ditambahkan.", "success");
            })
            .catch((err) => Swal.fire("Error", err.message || "Gagal tambah customer", "error"));
        }
    });
  };

  // =====================
  // SEARCH
  // =====================
  const filtered = customers.filter((c) => {
    const key = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(key) ||
      c.alamat.toLowerCase().includes(key) ||
      c.phone.toLowerCase().includes(key)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  // =====================
  // DELETE
  // =====================
  const handleDelete = (cust) => {
    Swal.fire({
      title: "Hapus Customer?",
      text: `Delete "${cust.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setCustomers((prev) => prev.filter((c) => c.id !== cust.id));
        Swal.fire("Dihapus!", "Data customer telah dihapus.", "success");
      }
    });
  };

  // =====================
  // EDIT
  // =====================
  const handleEdit = (cust) => {
    Swal.fire({
      title: "Edit Customer",
      html: `
        <input id="name" type="text" class="swal2-input" value="${cust.name}">
        <input id="alamat" type="text" class="swal2-input" value="${cust.alamat}">
        <input id="phone" type="text" class="swal2-input" value="${cust.phone}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          name: document.getElementById("name").value,
          alamat: document.getElementById("alamat").value,
          phone: document.getElementById("phone").value,
        };
      },
    }).then((result) => {
        if (result.isConfirmed) {
          customersService
            .update({ ...cust, ...result.value })
            .then((updated) => {
              setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
              Swal.fire("Updated", "Customer berhasil diupdate!", "success");
            })
            .catch((err) => Swal.fire("Error", err.message || "Gagal update customer", "error"));
        }
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">Customers</h3>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search nama, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {/* ==== TOMBOl ADD YANG SUDAH AKTIF ==== */}
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
                  <th>No</th>
                  <th>Customer</th>
                  <th>Alamat</th>
                  <th>No HP</th>
                  <th style={{ width: 190 }}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {current.map((cust, index) => (
                  <tr key={cust.id}>
                    <td>{(page - 1) * perPage + index + 1}</td>
                    <td>{cust.name}</td>
                    <td>{cust.alamat}</td>
                    <td>{cust.phone}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleEdit(cust)}
                      >
                        <i className="bi bi-pencil me-1" /> Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(cust)}
                      >
                        <i className="bi bi-trash me-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {current.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="card-footer d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Showing {(page - 1) * perPage + (current.length ? 1 : 0)} -{" "}
            {(page - 1) * perPage + current.length} of {filtered.length} entries
          </small>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(1)}>
                  «
                </button>
              </li>

              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
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

              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </li>

              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
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
    </div>
  );
}
