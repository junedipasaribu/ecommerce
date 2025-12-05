import "../styling/DetailFilter.css";
import { useState } from "react";

function DetailFilterPage() {
  // State untuk filter
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState("terbaru");

  // Data sample produk
  const products = [
    {
      id: 1,
      name: "Laptop Gaming Pro",
      brand: "Asus",
      price: 14999000,
      rating: 4.5,
      discount: 15,
      image: "https://via.placeholder.com/300x200",
      category: "elektronik",
      sold: 128,
    },
    {
      id: 2,
      name: "Smartphone Flagship",
      brand: "Samsung",
      price: 8999000,
      rating: 4.8,
      discount: 10,
      image: "https://via.placeholder.com/300x200",
      category: "elektronik",
      sold: 245,
    },
    {
      id: 3,
      name: "Sepatu Running",
      brand: "Nike",
      price: 1299000,
      rating: 4.3,
      discount: 20,
      image: "https://via.placeholder.com/300x200",
      category: "olahraga",
      sold: 89,
    },
    {
      id: 4,
      name: "Kamera Mirrorless",
      brand: "Canon",
      price: 12999000,
      rating: 4.7,
      discount: 12,
      image: "https://via.placeholder.com/300x200",
      category: "elektronik",
      sold: 56,
    },
    {
      id: 5,
      name: "Jaket Hoodie Premium",
      brand: "Uniqlo",
      price: 599000,
      rating: 4.2,
      discount: 25,
      image: "https://via.placeholder.com/300x200",
      category: "fashion",
      sold: 312,
    },
    {
      id: 6,
      name: "Blender Multifungsi",
      brand: "Philips",
      price: 899000,
      rating: 4.4,
      discount: 18,
      image: "https://via.placeholder.com/300x200",
      category: "rumah-tangga",
      sold: 167,
    },
    {
      id: 7,
      name: "Headphone Wireless",
      brand: "Sony",
      price: 2499000,
      rating: 4.6,
      discount: 8,
      image: "https://via.placeholder.com/300x200",
      category: "elektronik",
      sold: 198,
    },
    {
      id: 8,
      name: "Smart Watch",
      brand: "Apple",
      price: 6999000,
      rating: 4.9,
      discount: 5,
      image: "https://via.placeholder.com/300x200",
      category: "elektronik",
      sold: 134,
    },
  ];

  // Data kategori
  const categories = [
    { id: "elektronik", name: "Elektronik", count: 45 },
    { id: "fashion", name: "Fashion", count: 89 },
    { id: "rumah-tangga", name: "Rumah Tangga", count: 67 },
    { id: "olahraga", name: "Olahraga", count: 32 },
    { id: "kesehatan", name: "Kesehatan", count: 23 },
    { id: "otomotif", name: "Otomotif", count: 18 },
  ];

  // Data brand
  const brands = [
    { id: "samsung", name: "Samsung", count: 23 },
    { id: "apple", name: "Apple", count: 18 },
    { id: "sony", name: "Sony", count: 15 },
    { id: "nike", name: "Nike", count: 34 },
    { id: "adidas", name: "Adidas", count: 29 },
    { id: "uniqlo", name: "Uniqlo", count: 27 },
    { id: "philips", name: "Philips", count: 19 },
    { id: "lg", name: "LG", count: 16 },
  ];

  // Fungsi untuk toggle kategori
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Fungsi untuk toggle brand
  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Fungsi untuk reset semua filter
  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000000]);
    setSelectedBrands([]);
    setSelectedRating(0);
  };

  // Filter produk berdasarkan kriteria
  const filteredProducts = products.filter((product) => {
    // Filter kategori
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(product.category)
    ) {
      return false;
    }

    // Filter harga
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    // Filter brand
    if (
      selectedBrands.length > 0 &&
      !selectedBrands.includes(product.brand.toLowerCase())
    ) {
      return false;
    }

    // Filter rating
    if (selectedRating > 0 && product.rating < selectedRating) {
      return false;
    }

    return true;
  });

  // Sort produk
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "harga-terendah":
        return a.price - b.price;
      case "harga-tertinggi":
        return b.price - a.price;
      case "rating-tertinggi":
        return b.rating - a.rating;
      case "terlaris":
        return b.sold - a.sold;
      default: // terbaru
        return b.id - a.id;
    }
  });

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" className="text-decoration-none">
              Home
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Semua Produk
          </li>
        </ol>
      </nav>

      {/* Header Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-2">Semua Produk</h2>
              <p className="text-muted mb-0">
                Menampilkan {sortedProducts.length} dari {products.length}{" "}
                produk
              </p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <label className="me-2 fw-medium">Urutkan:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "180px" }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="harga-terendah">Harga Terendah</option>
                  <option value="harga-tertinggi">Harga Tertinggi</option>
                  <option value="rating-tertinggi">Rating Tertinggi</option>
                  <option value="terlaris">Terlaris</option>
                </select>
              </div>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={resetFilters}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar Filter - Kiri */}
        <div className="col-lg-3 col-xl-2">
          <div
            className="card shadow-sm border-0 sticky-lg-top"
            style={{ top: "20px" }}
          >
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-filter-left me-2"></i>
                  Filter
                </h5>
                {selectedCategories.length > 0 ||
                selectedBrands.length > 0 ||
                priceRange[1] < 5000000 ||
                selectedRating > 0 ? (
                  <button
                    className="btn btn-link text-danger p-0"
                    onClick={resetFilters}
                    title="Reset semua filter"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="card-body">
              {/* Filter Harga */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex justify-content-between">
                  <span>Harga</span>
                  <span className="text-primary fw-normal">
                    Rp {priceRange[0].toLocaleString("id-ID")} - Rp{" "}
                    {priceRange[1].toLocaleString("id-ID")}
                  </span>
                </h6>
                <div className="mb-3">
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                  />
                </div>
                <div className="row">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([
                          parseInt(e.target.value) || 0,
                          priceRange[1],
                        ])
                      }
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange[0],
                          parseInt(e.target.value) || 5000000,
                        ])
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Filter Kategori */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Kategori</h6>
                <div
                  className="filter-scroll"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {categories.map((category) => (
                    <div className="form-check mb-2" key={category.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`cat-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                      />
                      <label
                        className="form-check-label d-flex justify-content-between w-100"
                        htmlFor={`cat-${category.id}`}
                      >
                        <span>{category.name}</span>
                        <span className="text-muted small">
                          ({category.count})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Brand */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Brand</h6>
                <div
                  className="filter-scroll"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {brands.map((brand) => (
                    <div className="form-check mb-2" key={brand.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`brand-${brand.id}`}
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                      />
                      <label
                        className="form-check-label d-flex justify-content-between w-100"
                        htmlFor={`brand-${brand.id}`}
                      >
                        <span>{brand.name}</span>
                        <span className="text-muted small">
                          ({brand.count})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter Rating */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Rating</h6>
                <div className="d-flex flex-column gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      className={`btn btn-sm d-flex justify-content-between align-items-center ${
                        selectedRating === rating
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() =>
                        setSelectedRating(
                          selectedRating === rating ? 0 : rating
                        )
                      }
                      style={{
                        background:
                          selectedRating === rating ? "#f6921e" : "transparent",
                        borderColor:
                          selectedRating === rating ? "#f6921e" : "#dee2e6",
                      }}
                    >
                      <span>
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`bi ${
                              i < rating ? "bi-star-fill" : "bi-star"
                            } ${i < rating ? "text-warning" : "text-muted"}`}
                          ></i>
                        ))}
                        <span className="ms-2">& ke atas</span>
                      </span>
                      <i
                        className={`bi ${
                          selectedRating === rating ? "bi-check-lg" : ""
                        }`}
                      ></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge Filter Aktif */}
              {(selectedCategories.length > 0 ||
                selectedBrands.length > 0 ||
                priceRange[1] < 5000000 ||
                selectedRating > 0) && (
                <div className="mb-3">
                  <div className="d-flex flex-wrap gap-2">
                    {selectedCategories.map((catId) => {
                      const cat = categories.find((c) => c.id === catId);
                      return cat ? (
                        <span
                          key={catId}
                          className="badge bg-primary d-flex align-items-center"
                        >
                          {cat.name}
                          <button
                            className="btn-close btn-close-white btn-close-sm ms-2"
                            onClick={() => toggleCategory(catId)}
                          ></button>
                        </span>
                      ) : null;
                    })}
                    {selectedBrands.map((brandId) => {
                      const brand = brands.find((b) => b.id === brandId);
                      return brand ? (
                        <span
                          key={brandId}
                          className="badge bg-primary d-flex align-items-center"
                        >
                          {brand.name}
                          <button
                            className="btn-close btn-close-white btn-close-sm ms-2"
                            onClick={() => toggleBrand(brandId)}
                          ></button>
                        </span>
                      ) : null;
                    })}
                    {priceRange[1] < 5000000 && (
                      <span className="badge bg-primary d-flex align-items-center">
                        Harga ≤ Rp {priceRange[1].toLocaleString("id-ID")}
                        <button
                          className="btn-close btn-close-white btn-close-sm ms-2"
                          onClick={() => setPriceRange([0, 5000000])}
                        ></button>
                      </span>
                    )}
                    {selectedRating > 0 && (
                      <span className="badge bg-primary d-flex align-items-center">
                        Rating ≥ {selectedRating}
                        <button
                          className="btn-close btn-close-white btn-close-sm ms-2"
                          onClick={() => setSelectedRating(0)}
                        ></button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary w-100 mt-2"
                style={{ background: "#f6921e", borderColor: "#f6921e" }}
                onClick={() =>
                  console.log("Filter diterapkan:", {
                    selectedCategories,
                    priceRange,
                    selectedBrands,
                    selectedRating,
                  })
                }
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Konten Utama - Kanan */}
        <div className="col-lg-9 col-xl-10">
          {/* Produk Terlaris */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-fire text-danger me-2"></i>
                Produk Terlaris
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {products
                  .sort((a, b) => b.sold - a.sold)
                  .slice(0, 4)
                  .map((product) => (
                    <div className="col-md-3 col-sm-6" key={product.id}>
                      <div className="card product-card border-0 h-100">
                        <div className="position-relative">
                          <img
                            src={product.image}
                            className="card-img-top"
                            alt={product.name}
                            style={{ height: "180px", objectFit: "cover" }}
                          />
                          <div className="position-absolute top-0 end-0 p-2">
                            <span className="badge bg-danger">
                              {product.discount}% OFF
                            </span>
                          </div>
                          <div className="position-absolute bottom-0 start-0 p-2">
                            <span className="badge bg-success">
                              <i className="bi bi-cart-check me-1"></i>
                              Terjual {product.sold}
                            </span>
                          </div>
                        </div>
                        <div className="card-body">
                          <small className="text-muted d-block mb-1">
                            {product.brand}
                          </small>
                          <h6
                            className="card-title fw-bold mb-2"
                            style={{ fontSize: "0.95rem" }}
                          >
                            {product.name}
                          </h6>
                          <div className="d-flex align-items-center mb-2">
                            <div className="text-warning small">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`bi ${
                                    i < Math.floor(product.rating)
                                      ? "bi-star-fill"
                                      : i < product.rating
                                      ? "bi-star-half"
                                      : "bi-star"
                                  }`}
                                ></i>
                              ))}
                            </div>
                            <small className="text-muted ms-2">
                              ({product.rating})
                            </small>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div
                                className="fw-bold text-primary"
                                style={{ fontSize: "1.1rem" }}
                              >
                                Rp {product.price.toLocaleString("id-ID")}
                              </div>
                              <del className="text-muted small">
                                Rp{" "}
                                {(
                                  (product.price * 100) /
                                  (100 - product.discount)
                                ).toLocaleString("id-ID")}
                              </del>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Tambah ke keranjang"
                            >
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

          {/* Semua Produk */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Semua Produk</h5>
                <small className="text-muted">
                  {sortedProducts.length} produk ditemukan
                </small>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="card-body text-center py-5">
                <i className="bi bi-search display-4 text-muted mb-3 d-block"></i>
                <h5 className="fw-bold mb-2">Produk tidak ditemukan</h5>
                <p className="text-muted mb-4">
                  Tidak ada produk yang sesuai dengan filter yang Anda pilih.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ background: "#f6921e", borderColor: "#f6921e" }}
                  onClick={resetFilters}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="card-body">
                <div className="row g-3">
                  {sortedProducts.map((product) => (
                    <div
                      className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
                      key={product.id}
                    >
                      <div className="card product-card border-0 h-100">
                        <div className="position-relative">
                          <img
                            src={product.image}
                            className="card-img-top"
                            alt={product.name}
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                          <div className="position-absolute top-0 end-0 p-2">
                            <span className="badge bg-danger">
                              {product.discount}% OFF
                            </span>
                          </div>
                        </div>
                        <div className="card-body">
                          <small className="text-muted d-block mb-1">
                            {product.brand}
                          </small>
                          <h6
                            className="card-title fw-bold mb-2"
                            style={{ fontSize: "0.95rem", minHeight: "2.5rem" }}
                          >
                            {product.name}
                          </h6>
                          <div className="d-flex align-items-center mb-2">
                            <div className="text-warning small">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`bi ${
                                    i < Math.floor(product.rating)
                                      ? "bi-star-fill"
                                      : i < product.rating
                                      ? "bi-star-half"
                                      : "bi-star"
                                  }`}
                                ></i>
                              ))}
                            </div>
                            <small className="text-muted ms-2">
                              ({product.rating})
                            </small>
                          </div>
                          <div className="mb-3">
                            <span className="badge bg-light text-dark border">
                              <i className="bi bi-cart-check me-1"></i>
                              Terjual {product.sold}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div
                                className="fw-bold text-primary"
                                style={{ fontSize: "1.1rem" }}
                              >
                                Rp {product.price.toLocaleString("id-ID")}
                              </div>
                              <del className="text-muted small">
                                Rp{" "}
                                {(
                                  (product.price * 100) /
                                  (100 - product.discount)
                                ).toLocaleString("id-ID")}
                              </del>
                            </div>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Tambah ke keranjang"
                              >
                                <i className="bi bi-cart-plus"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                title="Lihat detail"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center mt-4">
                  <nav aria-label="Page navigation">
                    <ul className="pagination">
                      <li className="page-item disabled">
                        <a className="page-link" href="#" tabIndex="-1">
                          <i className="bi bi-chevron-left"></i>
                        </a>
                      </li>
                      <li className="page-item active">
                        <a className="page-link" href="#">
                          1
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          2
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          3
                        </a>
                      </li>
                      <li className="page-item">
                        <a className="page-link" href="#">
                          <i className="bi bi-chevron-right"></i>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailFilterPage;
