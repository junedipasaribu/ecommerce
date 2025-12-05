import "../styling/Cart.css";
import { Products } from "./test/SampleJual.jsx";
import { useState } from "react";

function Cart() {
  const [listCart, setListCart] = useState(Products);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckbox = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(listCart.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSingle = (id) => {
    setListCart(listCart.filter((item) => item.id !== id));
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  };

  const grandTotal = listCart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const selectedTotal = listCart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.price * item.qty, 0);

  return (
    <div className="container-fluid py-3">
      {/* Judul Halaman */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-3">Keranjang Belanja</h2>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary me-2">
              {listCart.length} item
            </span>
            <span className="text-muted">
              {selectedItems.length > 0
                ? `${selectedItems.length} item terpilih`
                : "Pilih item untuk checkout"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout - Cart dan Ringkasan Pembayaran */}
      <div className="row g-4">
        {/* Kolom kiri: Daftar produk di cart */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAll"
                    checked={
                      selectedItems.length === listCart.length &&
                      listCart.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                  <label
                    className="form-check-label fw-medium ms-2"
                    htmlFor="selectAll"
                  >
                    Pilih Semua ({listCart.length} item)
                  </label>
                </div>

                {selectedItems.length > 0 && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setListCart(
                        listCart.filter(
                          (item) => !selectedItems.includes(item.id)
                        )
                      );
                      setSelectedItems([]);
                    }}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Hapus Terpilih
                  </button>
                )}
              </div>
            </div>

            <div className="card-body p-0">
              {/* Desktop View - Table */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "50px" }}></th>
                        <th className="text-start ps-4">Produk</th>
                        <th className="text-center">Harga</th>
                        <th className="text-center">Qty</th>
                        <th className="text-center">Total</th>
                        <th
                          className="text-center"
                          style={{ width: "80px" }}
                        ></th>
                      </tr>
                    </thead>

                    <tbody>
                      {listCart.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-5 text-center text-muted"
                          >
                            <i className="bi bi-cart-x display-5 d-block mb-3"></i>
                            <p className="mb-0">Keranjang belanja kosong</p>
                          </td>
                        </tr>
                      ) : (
                        listCart.map((item) => (
                          <tr
                            key={item.id}
                            className={
                              selectedItems.includes(item.id)
                                ? "table-active"
                                : ""
                            }
                          >
                            <td className="align-middle ps-3">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleCheckbox(item.id)}
                              />
                            </td>
                            <td className="align-middle">
                              <div className="d-flex align-items-center ps-2">
                                <div className="me-3">
                                  <img
                                    src={
                                      item.image ||
                                      "https://via.placeholder.com/60"
                                    }
                                    alt={item.name}
                                    width="60"
                                    height="60"
                                    className="rounded object-fit-cover"
                                  />
                                </div>
                                <div>
                                  <div className="fw-medium mb-1">
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <small className="text-muted d-block">
                                      {item.description}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="align-middle text-center fw-medium">
                              Rp.{item.price.toLocaleString("id-ID")}
                            </td>
                            <td className="align-middle">
                              <div className="d-flex justify-content-center align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  style={{ width: "32px" }}
                                  onClick={() => {
                                    setListCart(
                                      listCart.map((cartItem) =>
                                        cartItem.id === item.id &&
                                        cartItem.qty > 1
                                          ? {
                                              ...cartItem,
                                              qty: cartItem.qty - 1,
                                            }
                                          : cartItem
                                      )
                                    );
                                  }}
                                >
                                  -
                                </button>
                                <span
                                  className="mx-2 fw-medium"
                                  style={{ minWidth: "30px" }}
                                >
                                  {item.qty}
                                </span>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  style={{ width: "32px" }}
                                  onClick={() => {
                                    setListCart(
                                      listCart.map((cartItem) =>
                                        cartItem.id === item.id
                                          ? {
                                              ...cartItem,
                                              qty: cartItem.qty + 1,
                                            }
                                          : cartItem
                                      )
                                    );
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="align-middle text-center fw-bold">
                              Rp.
                              {(item.price * item.qty).toLocaleString("id-ID")}
                            </td>
                            <td className="align-middle text-center">
                              <button
                                className="btn btn-link text-danger p-0"
                                onClick={() => handleDeleteSingle(item.id)}
                                title="Hapus item"
                              >
                                <i className="bi bi-trash fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View - Card List */}
              <div className="d-lg-none">
                {listCart.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-cart-x display-5 d-block mb-3"></i>
                    <p className="mb-0">Keranjang belanja kosong</p>
                  </div>
                ) : (
                  <div className="p-3">
                    {listCart.map((item) => (
                      <div
                        key={item.id}
                        className={`card mb-3 border ${
                          selectedItems.includes(item.id)
                            ? "border-primary"
                            : ""
                        }`}
                      >
                        <div className="card-body">
                          <div className="d-flex">
                            <div className="me-3">
                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleCheckbox(item.id)}
                              />
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex">
                                <div className="me-3">
                                  <img
                                    src={
                                      item.image ||
                                      "https://via.placeholder.com/60"
                                    }
                                    alt={item.name}
                                    width="60"
                                    height="60"
                                    className="rounded object-fit-cover"
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-medium mb-1">
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <small className="text-muted d-block mb-2">
                                      {item.description}
                                    </small>
                                  )}

                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-medium">
                                      Rp.{item.price.toLocaleString("id-ID")}
                                    </span>
                                    <span className="fw-bold text-primary">
                                      Rp.
                                      {(item.price * item.qty).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        style={{ width: "32px" }}
                                        onClick={() => {
                                          setListCart(
                                            listCart.map((cartItem) =>
                                              cartItem.id === item.id &&
                                              cartItem.qty > 1
                                                ? {
                                                    ...cartItem,
                                                    qty: cartItem.qty - 1,
                                                  }
                                                : cartItem
                                            )
                                          );
                                        }}
                                      >
                                        -
                                      </button>
                                      <span className="mx-2 fw-medium">
                                        {item.qty}
                                      </span>
                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        style={{ width: "32px" }}
                                        onClick={() => {
                                          setListCart(
                                            listCart.map((cartItem) =>
                                              cartItem.id === item.id
                                                ? {
                                                    ...cartItem,
                                                    qty: cartItem.qty + 1,
                                                  }
                                                : cartItem
                                            )
                                          );
                                        }}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button
                                      className="btn btn-link text-danger p-0"
                                      onClick={() =>
                                        handleDeleteSingle(item.id)
                                      }
                                    >
                                      <i className="bi bi-trash fs-5"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom kanan: Ringkasan Pembayaran */}
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-0 sticky-lg-top"
            style={{ top: "20px" }}
          >
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-receipt me-2"></i>
                Ringkasan Pembayaran
              </h5>
            </div>

            <div className="card-body">
              {/* Detail Harga */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-medium">
                    Rp.
                    {listCart
                      .reduce((sum, item) => sum + item.price * item.qty, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Diskon</span>
                  <span className="text-success fw-medium">Rp.0</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Biaya Pengiriman</span>
                  <span className="fw-medium">Rp.15.000</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">PPN (11%)</span>
                  <span className="fw-medium">
                    Rp.
                    {Math.round(
                      listCart.reduce(
                        (sum, item) => sum + item.price * item.qty,
                        0
                      ) * 0.11
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Total Pembayaran */}
              <div className="border-top pt-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Total Pembayaran</h6>
                  <h4 className="mb-0 text-primary fw-bold">
                    Rp.
                    {(
                      grandTotal +
                      Math.round(grandTotal * 0.11) +
                      15000
                    ).toLocaleString("id-ID")}
                  </h4>
                </div>

                {selectedItems.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">Total Terpilih</small>
                    <small className="fw-medium">
                      Rp.{selectedTotal.toLocaleString("id-ID")}
                    </small>
                  </div>
                )}
              </div>

              {/* Tombol Checkout */}
              <button
                className="btn btn-primary w-100 py-3 fw-bold"
                style={{
                  background: "#f6921e",
                  borderColor: "#f6921e",
                  fontSize: "1.1rem",
                }}
                disabled={selectedItems.length === 0}
              >
                {selectedItems.length > 0 ? (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>
                    Checkout ({selectedItems.length} item)
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-check me-2"></i>
                    Pilih Item Terlebih Dahulu
                  </>
                )}
              </button>

              {/* Informasi Tambahan */}
              <div className="mt-3 small text-muted">
                <div className="d-flex align-items-center mb-1">
                  <i className="bi bi-shield-check me-2"></i>
                  <span>Transaksi 100% aman dan terjamin</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  <span>Garansi pengembalian 30 hari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Aksi di Bawah (Mobile Only) */}
      <div className="d-lg-none mt-4">
        <div className="fixed-bottom bg-white border-top p-3 shadow-lg">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-6">
                <div className="small text-muted">Total</div>
                <div className="fw-bold fs-5">
                  Rp.
                  {(
                    grandTotal +
                    Math.round(grandTotal * 0.11) +
                    15000
                  ).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-primary w-100 py-3 fw-bold"
                  style={{
                    background: "#f6921e",
                    borderColor: "#f6921e",
                  }}
                  disabled={selectedItems.length === 0}
                >
                  {selectedItems.length > 0
                    ? `Checkout (${selectedItems.length})`
                    : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
