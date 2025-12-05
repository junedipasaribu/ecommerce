import "../styling/Checkout.css";
import { LocationIcon, PayIcon } from "../components/Icons.jsx";
import { useState } from "react";
import { OrderDetail } from "../components/test/SampleCust.jsx";
import { Pengirim } from "../components/test/SamplePengirim.jsx";
import { Products } from "../components/test/SampleJual.jsx";
import { Bayar } from "../components/test/SampleBayar.jsx";

function CheckoutPage() {
  /* State Pengiriman */
  const [selectedPengirim, setSelectedPengirim] = useState(
    Pengirim.length > 0 ? Pengirim[0] : null
  );
  const [selectedItems, setSelectedItems] = useState([]);
  const [isOpenPengirim, setIsOpenPengirim] = useState(false);
  const [listCart, setListCart] = useState(Products);

  const subTotal = listCart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const handleCheckbox = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(listCart.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  /* State Pembayaran */
  const [selectedBayar, setSelectedBayar] = useState(
    Bayar.length > 0 ? Bayar[0] : null
  );
  const [isOpenBayar, setIsOpenBayar] = useState(false);

  /* Perhitungan Total */
  const totalPPN = subTotal * 0.11;
  const totalOngkir = selectedPengirim ? selectedPengirim.price : 0;
  const grandTotal = subTotal + totalPPN + totalOngkir;

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      {/* Judul Halaman */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-3">Checkout</h2>
          <div className="text-muted">
            Selesaikan pembayaran untuk menyelesaikan pesanan Anda
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Kolom Kiri: Detail Pesanan */}
        <div className="col-lg-8">
          {/* Card Alamat Pengiriman */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex align-items-center">
                <LocationIcon className="text-primary me-2" />
                <h5 className="mb-0 fw-bold">Alamat Pengiriman</h5>
              </div>
            </div>

            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-3 mb-3 mb-md-0">
                  <div className="d-flex flex-column">
                    <h6 className="fw-bold mb-1">{OrderDetail.name}</h6>
                    <small className="text-muted">{OrderDetail.phone}</small>
                  </div>
                </div>

                <div className="col-md-6 mb-3 mb-md-0">
                  <div className="border-start ps-3">
                    <p className="mb-1">{OrderDetail.address}</p>
                    <small className="text-muted">
                      {OrderDetail.city}, {OrderDetail.province}{" "}
                      {OrderDetail.postalCode}
                    </small>
                  </div>
                </div>

                <div className="col-md-3 text-md-end">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    style={{ color: "#F6921E", borderColor: "#F6921E" }}
                  >
                    Ubah Alamat
                  </button>
                </div>
              </div>
            </div>

            {/* Metode Pengiriman */}
            <div className="card-footer bg-white border-top">
              <div className="row align-items-center">
                <div className="col-md-3 mb-3 mb-md-0">
                  <h6 className="mb-0 fw-medium">Metode Pengiriman</h6>
                </div>

                <div className="col-md-6">
                  <div className="dropdown position-relative">
                    <button
                      className="btn btn-outline-secondary dropdown-toggle w-100 d-flex justify-content-between align-items-center py-2"
                      type="button"
                      onClick={() => setIsOpenPengirim(!isOpenPengirim)}
                    >
                      {selectedPengirim ? (
                        <div className="d-flex justify-content-between w-100 align-items-center">
                          <span>{selectedPengirim.nama}</span>
                          <span className="badge bg-primary">
                            Rp {selectedPengirim.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ) : (
                        "Pilih Pengiriman"
                      )}
                    </button>

                    {isOpenPengirim && (
                      <div
                        className="dropdown-menu show w-100 mt-1"
                        style={{ position: "absolute", zIndex: 1050 }}
                      >
                        <div className="dropdown-header small fw-bold">
                          Pilih Kurir
                        </div>
                        {Pengirim.map((pengirim) => (
                          <button
                            key={pengirim.id}
                            className="dropdown-item d-flex justify-content-between align-items-center py-2"
                            onClick={() => {
                              setSelectedPengirim(pengirim);
                              setIsOpenPengirim(false);
                            }}
                          >
                            <span>{pengirim.nama}</span>
                            <span className="text-primary">
                              Rp {pengirim.price.toLocaleString("id-ID")}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Daftar Produk */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Detail Pesanan</h5>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllCheckout"
                    checked={
                      selectedItems.length === listCart.length &&
                      listCart.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                  <label
                    className="form-check-label small ms-2"
                    htmlFor="selectAllCheckout"
                  >
                    Pilih Semua ({listCart.length})
                  </label>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th
                        className="text-center"
                        style={{ width: "50px" }}
                      ></th>
                      <th className="text-start">Produk</th>
                      <th className="text-center">Harga</th>
                      <th className="text-center">Qty</th>
                      <th className="text-center">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {listCart.map((item) => (
                      <tr key={item.id}>
                        <td className="align-middle text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleCheckbox(item.id)}
                          />
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <img
                                src={
                                  item.image || "https://via.placeholder.com/60"
                                }
                                alt={item.name}
                                width="60"
                                height="60"
                                className="rounded object-fit-cover"
                              />
                            </div>
                            <div>
                              <div className="fw-medium">{item.name}</div>
                              {item.description && (
                                <small className="text-muted d-block">
                                  {item.description}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="align-middle text-center">
                          Rp.{item.price.toLocaleString("id-ID")}
                        </td>
                        <td className="align-middle text-center fw-medium">
                          {item.qty}
                        </td>
                        <td className="align-middle text-center fw-bold">
                          Rp.{(item.price * item.qty).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Pesanan */}
            <div className="card-footer bg-white border-top">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 fw-bold">Total Pesanan</h6>
                  <small className="text-muted">
                    {selectedItems.length} item terpilih
                  </small>
                </div>
                <div className="text-end">
                  <div className="fw-bold fs-4 text-primary">
                    Rp.{subTotal.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Pembayaran */}
        <div className="col-lg-4">
          {/* Card Metode Pembayaran */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex align-items-center">
                <PayIcon className="text-primary me-2" />
                <h5 className="mb-0 fw-bold">Metode Pembayaran</h5>
              </div>
            </div>

            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-medium mb-2">
                  Pilih Metode Bayar
                </label>
                <div className="dropdown position-relative">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle w-100 d-flex justify-content-between align-items-center py-2"
                    type="button"
                    onClick={() => setIsOpenBayar(!isOpenBayar)}
                  >
                    {selectedBayar ? (
                      <div className="d-flex align-items-center w-100">
                        <div className="flex-grow-1 text-start">
                          {selectedBayar.nama}
                        </div>
                        {selectedBayar.icon && (
                          <span className="ms-2">{selectedBayar.icon}</span>
                        )}
                      </div>
                    ) : (
                      "Pilih Metode Pembayaran"
                    )}
                  </button>

                  {isOpenBayar && (
                    <div
                      className="dropdown-menu show w-100 mt-1"
                      style={{ position: "absolute", zIndex: 1050 }}
                    >
                      <div className="dropdown-header small fw-bold">
                        Pilih Metode
                      </div>
                      {Bayar.map((bayar) => (
                        <button
                          key={bayar.id}
                          className="dropdown-item d-flex justify-content-between align-items-center py-2"
                          onClick={() => {
                            setSelectedBayar(bayar);
                            setIsOpenBayar(false);
                          }}
                        >
                          <div className="d-flex align-items-center">
                            {bayar.icon && (
                              <span className="me-2">{bayar.icon}</span>
                            )}
                            <span>{bayar.nama}</span>
                          </div>
                          {bayar.fee > 0 && (
                            <small className="text-muted">
                              +Rp {bayar.fee.toLocaleString("id-ID")}
                            </small>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Informasi Pembayaran */}
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Sub Total</span>
                  <span className="fw-medium">
                    Rp.{subTotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">PPN (11%)</span>
                  <span className="fw-medium">
                    Rp.{totalPPN.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Ongkos Kirim</span>
                  <span className="fw-medium">
                    Rp.{totalOngkir.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 fw-bold">Total Pembayaran</h6>
                    <h4 className="mb-0 text-primary fw-bold">
                      Rp.{grandTotal.toLocaleString("id-ID")}
                    </h4>
                  </div>

                  <button
                    className="btn btn-primary w-100 py-3 fw-bold"
                    style={{
                      background: "#f6921e",
                      borderColor: "#f6921e",
                      fontSize: "1.1rem",
                    }}
                  >
                    <i className="bi bi-lock-fill me-2"></i>
                    Bayar Sekarang
                  </button>

                  <div className="mt-3 small text-muted text-center">
                    Dengan menekan tombol ini, Anda menyetujui{" "}
                    <a href="#terms" className="text-decoration-none">
                      Syarat & Ketentuan
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Penting */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Informasi Penting</h6>
              <ul className="list-unstyled small mb-0">
                <li className="mb-2 d-flex">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  <span>Transaksi 100% aman dan terjamin</span>
                </li>
                <li className="mb-2 d-flex">
                  <i className="bi bi-clock-history text-warning me-2"></i>
                  <span>Pesanan diproses dalam 1-2 jam kerja</span>
                </li>
                <li className="mb-2 d-flex">
                  <i className="bi bi-truck text-primary me-2"></i>
                  <span>Pengiriman estimasi 2-5 hari kerja</span>
                </li>
                <li className="d-flex">
                  <i className="bi bi-arrow-counterclockwise text-info me-2"></i>
                  <span>Garansi pengembalian 30 hari</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-top">
        <p className="footer-text text-center text-muted small">
          © Tim 5 Cacing Capston Project 2025. Hak Cipta Dilindungi
        </p>
      </div>
    </div>
  );
}

export default CheckoutPage;
