import { useEffect, useState } from "react";
import { productService } from "../services/productService";
import { useNavigate } from "react-router-dom";
import "../styling/DetailFilter.css";

export default function DetailFilter({ searchTerm }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Search term dari navbar:", searchTerm);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await productService.getAll();
        const data = res?.data || res || [];

        const filtered = searchTerm
          ? data.filter((p) =>
              p.name?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : data;

        console.log("Filtered products:", filtered);
        setProducts(filtered);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleViewDetail = (productId) => {
    navigate(`/detailitem/${productId}`);
  };

  const handleAddToCart = (product) => {
    console.log("Added to cart:", product);
    alert(`Added ${product.name} to cart!`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat produk...</p>
      </div>
    );
  }

  return (
    <div className="detail-filter-container">
      <div className="search-header">
        <h2>
          {searchTerm ? `Hasil pencarian "${searchTerm}"` : "Semua Produk"}
        </h2>
        <p className="product-count">
          Ditemukan {products.length}{" "}
          {products.length === 1 ? "produk" : "produk"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-results">
          <i className="bi bi-search"></i>
          <h3>Tidak ada produk ditemukan</h3>
          <p>Coba kata kunci lain atau lihat kategori produk</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              {/* Product Image */}
              <div className="product-image-container">
                <img
                  src={
                    product.imageUrl ||
                    "https://via.placeholder.com/150x150/f5f5f5/999?text=No+Image"
                  }
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150x150/f5f5f5/999?text=No+Image";
                  }}
                />
                {product.discount && product.discount > 0 && (
                  <div className="discount-badge">-{product.discount}%</div>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <span className="low-stock-badge">Stok Terbatas</span>
                )}
                {product.stock === 0 && (
                  <span className="out-of-stock-badge">Habis</span>
                )}
              </div>

              {/* Product Info */}
              <div className="product-info">
                <h3 className="product-name">{product.name || "No Name"}</h3>

                {/* Rating (Optional) */}
                {product.rating !== undefined && (
                  <div className="product-rating">
                    <div className="rating-stars">
                      {"★".repeat(Math.floor(product.rating))}
                      {"☆".repeat(5 - Math.floor(product.rating))}
                    </div>
                    {product.reviewCount && (
                      <span className="rating-count">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )}

                <div className="price-section">
                  <span className="product-price" style={{ color: "#ee4d2d" }}>
                    {formatPrice(product.price || 0)}
                  </span>
                  <span
                    className={`product-stock ${
                      product.stock > 0 ? "in-stock" : "out-stock"
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} stok` : "Habis"}
                  </span>
                </div>

                {/* Sold Count (Optional) */}
                {product.soldCount && product.soldCount > 0 && (
                  <div className="sold-count">Terjual: {product.soldCount}</div>
                )}

                <div className="product-actions">
                  <button
                    className="btn-detail"
                    onClick={() => handleViewDetail(product.id)}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
