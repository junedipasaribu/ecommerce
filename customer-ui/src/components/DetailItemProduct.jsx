import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styling/DetailItem.css";

function DetailItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  useEffect(() => {
    fetchProductById();
  }, [id]);

  const fetchProductById = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      setProduct(res.data || res);
    } catch (error) {
      setError("Gagal mengambil data produk.");
      console.error("Failed get Product:", error);
    } finally {
      setLoading(false);
    }
  };

  const showAlertMessage = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleQuantityChange = (type) => {
    if (type === "increment" && product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity > product.stock) {
      showAlertMessage(
        `Stok tidak mencukupi. Stok tersedia: ${product.stock}`,
        "warning"
      );
      return;
    }

    try {
      setAddingToCart(true);
      await addOrUpdateCart(product.id, quantity);
      showAlertMessage(
        `${quantity} item "${product.name}" berhasil ditambahkan ke keranjang`
      );
      setQuantity(1);
    } catch (err) {
      console.error("Error details:", err);
      if (err.response?.status === 401) {
        showAlertMessage("Silakan login terlebih dahulu", "warning");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showAlertMessage("Gagal menambahkan item ke keranjang", "danger");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    showAlertMessage("Fitur Buy Now akan langsung ke checkout", "info");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const addOrUpdateCart = async (productId, quantity = 1) => {
    const cart = await cartService.getAllCart();
    const existingItem = cart.find((item) => item.productId === productId);

    if (!existingItem) {
      return cartService.addToCart(productId, quantity);
    }

    return cartService.updateCart(productId, existingItem.quantity + quantity);
  };

  const getValidImageUrl = (imageUrl) => {
    const placeholder =
      "https://via.placeholder.com/500x500/f5f5f5/999?text=No+Image";

    if (!imageUrl || imageUrl.trim() === "") {
      return placeholder;
    }

    if (imageUrl.includes("dummyimage/")) {
      return imageUrl.replace("dummyimage/", "dummyimage.com/");
    }

    return imageUrl;
  };

  const getAlertClass = () => {
    switch (alertType) {
      case "success":
        return "alert-success";
      case "warning":
        return "alert-warning";
      case "danger":
        return "alert-danger";
      case "info":
        return "alert-info";
      default:
        return "alert-success";
    }
  };

  const getAlertIcon = () => {
    switch (alertType) {
      case "success":
        return "bi-check-circle";
      case "warning":
        return "bi-exclamation-triangle";
      case "danger":
        return "bi-x-circle";
      case "info":
        return "bi-info-circle";
      default:
        return "bi-check-circle";
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat produk...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container-fluid py-5">
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          <div>{error}</div>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i> Kembali
        </button>
      </div>
    );
  }

  // Product Not Found
  if (!product) {
    return (
      <div className="container-fluid py-5">
        <div
          className="alert alert-warning d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-search me-2"></i>
          <div>Produk tidak ditemukan</div>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i> Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="detail-item-container">
      {/* Bootstrap Alert */}
      {showAlert && (
        <div className="alert-container">
          <div
            className={`alert ${getAlertClass()} alert-dismissible fade show`}
            role="alert"
          >
            <i className={`bi ${getAlertIcon()} me-2`}></i>
            {alertMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowAlert(false)}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="back-button-container">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i> Kembali
        </button>
      </div>

      <div className="detail-content">
        {/* Left Column: Product Image & Description */}
        <div className="detail-left">
          {/* Product Image */}
          <div className="product-image-main">
            <img src={getValidImageUrl(product.imageUrl)} />
            {product.discount > 0 && (
              <div className="discount-badge-main">-{product.discount}%</div>
            )}
          </div>

          {/* Product Description */}
          <div className="description-section">
            <h3 className="mb-3">Deskripsi Produk</h3>
            <div className="description-content">
              {product.description ? (
                <p className="mb-0">{product.description}</p>
              ) : (
                <p className="text-muted mb-0 fst-italic">
                  Tidak ada deskripsi
                </p>
              )}
            </div>
          </div>

          {/* Product Specifications */}
          {(product.specifications || product.features) && (
            <div className="specifications-section">
              <h3 className="mb-3">Spesifikasi Produk</h3>
              <div className="specifications-grid">
                {product.specifications &&
                  Object.entries(product.specifications).map(
                    ([key, value], index) => (
                      <div className="spec-item" key={index}>
                        <span className="spec-label">{key}:</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    )
                  )}
                {product.features &&
                  product.features.map((feature, index) => (
                    <div className="feature-item" key={index}>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="detail-right">
          <div className="product-details-card">
            {/* Product Name and Category */}
            <h1 className="product-title mb-2">{product.name}</h1>
            <div className="category-badge mb-3">
              {product.categoryName || "Uncategorized"}
            </div>

            {/* Price Section */}
            <div className="price-section-detail mb-3">
              <div className="current-price" style={{ color: "#ee4d2d" }}>
                {formatPrice(product.price)}
              </div>
              {product.originalPrice > product.price && (
                <div className="original-price-section mt-1">
                  <span className="text-muted text-decoration-line-through me-2">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="badge bg-success">
                    {Math.round(
                      (1 - product.price / product.originalPrice) * 100
                    )}
                    % OFF
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-section mb-4">
              <div className="stock-info mb-2">
                <span className="stock-label">Stok Tersedia:</span>
                <span
                  className={`stock-badge badge ${
                    product.stock > 10
                      ? "bg-success"
                      : product.stock > 0
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                >
                  {product.stock} unit
                </span>
              </div>
              {product.stock < 10 && product.stock > 0 && (
                <div className="stock-warning text-warning small">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Stok terbatas!
                </div>
              )}
              {product.stock === 0 && (
                <div className="stock-danger text-danger small">
                  <i className="bi bi-x-circle me-1"></i>
                  Stok habis
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section mb-4">
              <label className="form-label fw-semibold">Jumlah</label>
              <div className="quantity-selector d-flex align-items-center">
                <div className="quantity-controls me-3">
                  <div className="input-group" style={{ width: "140px" }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange("decrement")}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      onChange={handleQuantityInput}
                      min="1"
                      max={product.stock}
                      style={{ height: "38px" }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleQuantityChange("increment")}
                      disabled={quantity >= product.stock}
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>
                <span className="text-muted small">Max: {product.stock}</span>
              </div>
            </div>

            {/* Subtotal */}
            <div className="subtotal-section mb-4 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Subtotal:</span>
                <span className="h5 mb-0 fw-bold text-force">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons mb-4">
              <button
                className="btn btn-primary btn-lg w-100 mb-2 btn-force"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
              >
                {addingToCart ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-plus me-2"></i>
                    Tambah ke Keranjang
                  </>
                )}
              </button>
              {/* <button
                className="btn btn-success btn-lg w-100"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <i className="bi bi-bag-check me-2"></i>
                Beli Sekarang
              </button> */}
            </div>

            {/* Product Metadata */}
            <div className="product-metadata border-top pt-3">
              <h5 className="mb-3">Detail Produk</h5>
              {/* <div className="row small">
                <div className="col-6 text-muted">
                  <div className="mb-2">
                    <i className="bi bi-upc me-1"></i> SKU:
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-box me-1"></i> Berat:
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-rulers me-1"></i> Dimensi:
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-calendar me-1"></i> Ditambahkan:
                  </div>
                </div>
                <div className="col-6 text-end">
                  <div className="mb-2">{product.sku || "-"}</div>
                  <div className="mb-2">
                    {product.weight ? `${product.weight} kg` : "-"}
                  </div>
                  <div className="mb-2">{product.dimensions || "-"}</div>
                  <div className="mb-2">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString("id-ID")
                      : "-"}
                  </div>
                </div>
              </div> */}
            </div>

            {/* Seller Info */}
            {product.sellerName && (
              <div className="seller-section border-top pt-3 mt-3">
                <div className="seller-info d-flex align-items-center">
                  <i className="bi bi-shop fs-4 text-muted me-3"></i>
                  <div>
                    <div className="seller-label text-muted small">
                      Dijual oleh
                    </div>
                    <div className="seller-name fw-bold">
                      {product.sellerName}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailItem;
