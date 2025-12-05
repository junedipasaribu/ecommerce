import "../styling/DetailItem.css";

function DetailItemPage() {
  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      <div className="row g-4">
        {/* Sidebar Filter - Kiri */}
        <div className="col-lg-3 col-xl-2 d-none d-lg-block">
          <div
            className="card shadow-sm border-0 sticky-top"
            style={{ top: "20px" }}
          >
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-filter-left me-2"></i>
                Filter Produk
              </h5>
            </div>
            <div className="card-body">
              {/* Filter by Category */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Kategori</h6>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="category1"
                  />
                  <label className="form-check-label" htmlFor="category1">
                    Elektronik
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="category2"
                  />
                  <label className="form-check-label" htmlFor="category2">
                    Fashion
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="category3"
                  />
                  <label className="form-check-label" htmlFor="category3">
                    Rumah Tangga
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="category4"
                  />
                  <label className="form-check-label" htmlFor="category4">
                    Olahraga
                  </label>
                </div>
              </div>

              {/* Filter by Price */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Harga</h6>
                <div className="mb-3">
                  <label htmlFor="priceRange" className="form-label">
                    Maks: Rp 5.000.000
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    id="priceRange"
                    min="0"
                    max="5000000"
                    step="100000"
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Rp 0</span>
                  <span className="text-muted">Rp 5.000.000</span>
                </div>
              </div>

              {/* Filter by Rating */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Rating</h6>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rating5"
                  />
                  <label
                    className="form-check-label d-flex align-items-center"
                    htmlFor="rating5"
                  >
                    <span className="text-warning me-2">★★★★★</span>
                    <span>4.5 ke atas</span>
                  </label>
                </div>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rating4"
                  />
                  <label
                    className="form-check-label d-flex align-items-center"
                    htmlFor="rating4"
                  >
                    <span className="text-warning me-2">★★★★☆</span>
                    <span>4.0 ke atas</span>
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rating3"
                  />
                  <label
                    className="form-check-label d-flex align-items-center"
                    htmlFor="rating3"
                  >
                    <span className="text-warning me-2">★★★☆☆</span>
                    <span>3.0 ke atas</span>
                  </label>
                </div>
              </div>

              <button
                className="btn btn-primary w-100 mt-3"
                style={{ background: "#f6921e", borderColor: "#f6921e" }}
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Konten Utama - Kanan */}
        <div className="col-lg-9 col-xl-10">
          {/* Header Produk */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="row">
                {/* Gallery Produk */}
                <div className="col-md-6">
                  <div className="product-gallery mb-4">
                    <div className="main-image mb-3">
                      <img
                        src="https://via.placeholder.com/500x500"
                        alt="Product Main"
                        className="img-fluid rounded"
                        style={{
                          maxHeight: "400px",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                    </div>
                    <div className="thumbnail-images d-flex gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <div
                          key={num}
                          className="thumbnail border rounded p-1"
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={`https://via.placeholder.com/100x100`}
                            alt={`Thumbnail ${num}`}
                            className="img-fluid rounded"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detail Produk */}
                <div className="col-md-6">
                  <div className="product-details">
                    <h1 className="fw-bold mb-3">Nama Produk Premium</h1>

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className="text-warning me-2">★★★★★</div>
                        <span className="text-muted">(4.8 • 128 reviews)</span>
                      </div>
                      <span className="badge bg-success me-2">Terlaris</span>
                      <span className="badge bg-primary">Stok Tersedia</span>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-primary fw-bold mb-2">
                        Rp 1.299.000
                      </h3>
                      <del className="text-muted me-2">Rp 1.599.000</del>
                      <span className="badge bg-danger">18% OFF</span>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Deskripsi</h6>
                      <p className="text-muted">
                        Produk berkualitas tinggi dengan material terbaik.
                        Dilengkapi dengan fitur-fitur canggih yang membuat
                        pengalaman penggunaan menjadi lebih menyenangkan dan
                        efisien.
                      </p>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Spesifikasi</h6>
                      <ul className="list-unstyled">
                        <li className="mb-1">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          <span className="text-muted">Material:</span> Premium
                          Quality
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          <span className="text-muted">Garansi:</span> 1 Tahun
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          <span className="text-muted">Warna Tersedia:</span> 5
                          Variasi
                        </li>
                        <li>
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          <span className="text-muted">Pengiriman:</span> 1-2
                          Hari
                        </li>
                      </ul>
                    </div>

                    {/* Quantity & Action Buttons */}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <label className="me-3 fw-medium">Qty:</label>
                          <div
                            className="input-group"
                            style={{ width: "140px" }}
                          >
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              className="form-control text-center"
                              value="1"
                              readOnly
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary flex-grow-1">
                            <i className="bi bi-cart-plus me-2"></i>
                            Add to Cart
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{
                              background: "#f6921e",
                              borderColor: "#f6921e",
                            }}
                          >
                            <i className="bi bi-lightning me-2"></i>
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation untuk Detail Lainnya */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom">
              <ul
                className="nav nav-tabs card-header-tabs"
                id="productTab"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="description-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#description"
                    type="button"
                    role="tab"
                  >
                    Deskripsi Lengkap
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="specification-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#specification"
                    type="button"
                    role="tab"
                  >
                    Spesifikasi
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="reviews-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#reviews"
                    type="button"
                    role="tab"
                  >
                    Ulasan (128)
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tab-content" id="productTabContent">
                <div
                  className="tab-pane fade show active"
                  id="description"
                  role="tabpanel"
                >
                  <h5 className="fw-bold mb-3">Deskripsi Produk Lengkap</h5>
                  <p>
                    Produk ini merupakan inovasi terbaru dengan teknologi
                    terkini. Dibuat dengan material berkualitas tinggi yang
                    tahan lama dan ramah lingkungan. Setiap detail dirancang
                    dengan presisi untuk memberikan pengalaman penggunaan
                    terbaik.
                  </p>
                  <ul>
                    <li>Material premium yang awet dan tahan lama</li>
                    <li>Desain ergonomis untuk kenyamanan maksimal</li>
                    <li>Fitur keamanan lengkap</li>
                    <li>Garansi resmi 1 tahun</li>
                    <li>Support customer service 24/7</li>
                  </ul>
                </div>

                <div
                  className="tab-pane fade"
                  id="specification"
                  role="tabpanel"
                >
                  <h5 className="fw-bold mb-3">Spesifikasi Teknis</h5>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th style={{ width: "30%" }}>Brand</th>
                        <td>Premium Brand</td>
                      </tr>
                      <tr>
                        <th>Model</th>
                        <td>2024 Edition</td>
                      </tr>
                      <tr>
                        <th>Dimensi</th>
                        <td>30 x 20 x 15 cm</td>
                      </tr>
                      <tr>
                        <th>Berat</th>
                        <td>1.5 kg</td>
                      </tr>
                      <tr>
                        <th>Warna</th>
                        <td>Hitam, Putih, Silver, Gold, Navy Blue</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="tab-pane fade" id="reviews" role="tabpanel">
                  <h5 className="fw-bold mb-3">Ulasan Pelanggan</h5>
                  <div className="row">
                    <div className="col-md-4 mb-4">
                      <div className="card border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="text-warning">★★★★★</div>
                            <small className="text-muted">2 hari lalu</small>
                          </div>
                          <h6 className="fw-bold">Budi Santoso</h6>
                          <p className="small mb-0">
                            Produk berkualitas, sesuai deskripsi. Pengiriman
                            cepat!
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-4">
                      <div className="card border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="text-warning">★★★★☆</div>
                            <small className="text-muted">1 minggu lalu</small>
                          </div>
                          <h6 className="fw-bold">Sari Dewi</h6>
                          <p className="small mb-0">
                            Sangat puas dengan produknya. Packing rapi dan aman.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-4">
                      <div className="card border">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="text-warning">★★★★★</div>
                            <small className="text-muted">2 minggu lalu</small>
                          </div>
                          <h6 className="fw-bold">Ahmad Rizki</h6>
                          <p className="small mb-0">
                            Worth the price! Fungsi semua bekerja dengan baik.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Produk Terkait */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">Produk Terkait</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {[1, 2, 3, 4].map((item) => (
                  <div className="col-md-3 col-sm-6 mb-4" key={item}>
                    <div className="card product-card border-0 h-100">
                      <div className="position-relative">
                        <img
                          src={`https://via.placeholder.com/300x200`}
                          className="card-img-top"
                          alt={`Produk ${item}`}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                        <span className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 m-2 small">
                          -20%
                        </span>
                      </div>
                      <div className="card-body">
                        <h6 className="card-title fw-bold mb-2">
                          Produk Terkait {item}
                        </h6>
                        <div className="text-warning small mb-2">★★★★☆</div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold text-primary">
                              Rp 899.000
                            </div>
                            <del className="text-muted small">Rp 1.099.000</del>
                          </div>
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-cart-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailItemPage;
