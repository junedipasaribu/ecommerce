import "../styling/Checkout.css";
import { LocationIcon } from "./Icons.jsx";
import { useState } from "react";
import { OrderDetail } from "../components/test/SampleCust.jsx";
import { Pengirim } from "../components/test/SamplePengirim.jsx";

function CheckoutPage() {
  const [selectedPengirim, setSelectedPengirim] = useState(
    Pengirim.length > 0 ? Pengirim[0] : null
  );
  const [isOpen, setIsOpen] = useState(false);

  console.log("Pengirim data type:", typeof Pengirim);
  console.log("Is array?", Array.isArray(Pengirim));
  console.log("Pengirim keys:", Object.keys(Pengirim));
  console.log("Pengirim values:", Object.values(Pengirim));

  return (
    <div
      className="container-fluid"
      style={{ position: "relative", minHeight: "100vh" }}
    >
      <div className="card mt-3 shadow-sm">
        <div className="card-header bg-light">
          <div className="d-flex align-items-center">
            <LocationIcon className="text-primary me-2" />
            <h5 className="mb-0 fw-bold">Alamat Pengiriman</h5>
          </div>
        </div>

        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3">
              <div className="d-flex flex-column">
                <h6 className="fw-bold mb-1">{OrderDetail.name}</h6>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border-start border-end px-3">
                <p className="mb-0 text-start">{OrderDetail.address}</p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-sm btn-outline-primary">Ubah</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer bg-white">
          <div className="row align-items-center">
            <div className="col-md-3">
              <h6 className="mb-0 fw-medium">Metode Pengiriman</h6>
            </div>

            <div className="col-md-6">
              <div className="dropdown position-relative">
                <button
                  className="btn btn-outline-secondary dropdown-toggle w-100 d-flex justify-content-between align-items-center"
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {selectedPengirim ? (
                    <div className="d-flex justify-content-between w-100">
                      <span>{selectedPengirim.nama}</span>
                      <span className="badge bg-primary">
                        Rp {selectedPengirim.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ) : (
                    "Pilih Pengiriman"
                  )}
                </button>

                {isOpen && (
                  <div
                    className="dropdown-menu show w-100 mt-1"
                    style={{ position: "absolute", zIndex: 9999 }}
                  >
                    <div className="dropdown-header small">Pilih Kurir</div>
                    {Pengirim.map((pengirim) => (
                      <button
                        key={pengirim.id}
                        className="dropdown-item d-flex justify-content-between"
                        onClick={() => {
                          setSelectedPengirim(pengirim);
                          setIsOpen(false);
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

            <div className="col-md-3">
              {selectedPengirim && (
                <div className="text-end">
                  <small className="text-muted">Estimasi:</small>
                  <div className="fw-bold">2-3 hari kerja</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="filter-footer mt-4">
        <p className="footer-text text-center text-muted">
          © Tim 5 Cacing Capston Project 2025. Hak Cipta Dilindungi
        </p>
      </div>
    </div>
  );
}

export default CheckoutPage;
