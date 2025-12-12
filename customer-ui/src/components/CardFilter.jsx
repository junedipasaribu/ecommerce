import React, { useState, useEffect, useMemo } from "react";
import { useProducts } from "../hooks/useProducts.js";
import { productService } from "../services/productService.js";
import { useNavigate } from "react-router-dom";
import "../styling/CardFilter.css";

const CardFilter = () => {
  const navigate = useNavigate();
  const { products, loading, error, updateParams, params, fetchProducts } =
    useProducts();
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getUniqueCategories();
        setCategories(res);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (activeCategory === "all") {
      return products;
    }
    const activeCategoryData = categories.find((c) => c.id === activeCategory);
    if (!activeCategoryData) return products;
    const categoryName = activeCategoryData.name.replace("\n", " ");
    return products.filter((product) => product.categoryName === categoryName);
  }, [products, activeCategory, categories]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);

    if (categoryId === "all") {
      updateParams({ category: null, page: 1 });
    } else {
      updateParams({ category: categoryId, page: 1 });
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    fetchProducts();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const CategoryButton = ({ category }) => (
    <button
      className={`category-button ${
        activeCategory === category.id ? "active" : ""
      }`}
      onClick={() => handleCategoryClick(category.id)}
    >
      {category.name.split("\n").map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < category.name.split("\n").length - 1 && <br />}
        </React.Fragment>
      ))}
    </button>
  );

  const ProductCard = ({ product }) => {
    if (!product) return null;

    const formatPrice = (price) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(price || 0);
    };
    const displayPrice = formatPrice(product.price || 0);
    const truncatedPrice =
      displayPrice.length > 12
        ? displayPrice.substring(0, 12) + "..."
        : displayPrice;

    const getValidImageUrl = (imageUrl) => {
      if (!imageUrl || imageUrl.trim() === "") {
        return "https://via.placeholder.com/500x500/f5f5f5/999?text=No+Image";
      }

      if (imageUrl.includes("dummyimage/")) {
        return imageUrl.replace("dummyimage/", "dummyimage.com/");
      }

      return imageUrl;
    };

    return (
      <div className="product-card">
        <div className="product-image-container">
          {product.imageUrl ? (
            <img
              src={getValidImageUrl(product.imageUrl)}
              alt={product.name || "Product"}
              className="product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              <span>No Image</span>
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-name">
            <h4>{product.name || "No Name"}</h4>
          </div>

          <div className="product-details">
            <div className="product-price-stock">
              <p className="product-price" style={{ color: "#ea2315ff" }}>
                {truncatedPrice}
              </p>
              <p className="product-stock">
                <span className={product.stock > 0 ? "in-stock" : "out-stock"}>
                  {product.stock > 0 ? `${product.stock} stok` : "Habis"}
                </span>
              </p>
            </div>
          </div>
        </div>
        <button
          className="detail-item-btn"
          onClick={() => navigate(`/detailitem/${product.id}`)}
        >
          Lihat Detail
        </button>
      </div>
    );
  };

  if (loading && (!products || products.length === 0)) {
    return (
      <>
        <div className="card2-container">
          <div className="categories-section">
            <h3 className="categories-title">Kategori</h3>
            <div className="categories-container">
              {categories.map((category) => (
                <CategoryButton key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>

        <div className="cardfilter-container">
          <div className="products-section">
            <div className="products-header">
              <h3 className="products-title">Produk Obat & Kesehatan</h3>
              <p className="products-subtitle">
                Temukan obat yang Anda butuhkan
              </p>
            </div>

            <div className="products-loading">
              <div className="loading-spinner"></div>
              <p>Memuat produk dari database...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="card2-container">
          <div className="categories-section">
            <h4 className="categories-title">Kategori</h4>
            <div className="categories-container">
              {categories.map((category) => (
                <CategoryButton key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>

        <div className="cardfilter-container">
          <div className="products-section">
            <div className="products-header">
              <h3 className="products-title">Produk Obat & Kesehatan</h3>
            </div>

            <div className="products-error">
              <div className="error-icon">⚠️</div>
              <h4>Gagal memuat produk</h4>
              <p className="error-message">{error}</p>
              <button className="retry-btn" onClick={handleRetry}>
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const activeCategoryName = categories
    .find((c) => c.id === activeCategory)
    ?.name.replace("\n", " ");

  return (
    <>
      <div className="card2-container">
        <div className="categories-section">
          <h4 className="categories-title">Kategori</h4>
          <div className="categories-container">
            {categories.map((category) => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>

      <div className="cardfilter-container">
        <div className="products-section">
          <div className="products-header">
            <h3 className="products-title">Produk Obat & Kesehatan</h3>
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="empty-products">
              <div className="empty-icon">📦</div>
              <h4>Tidak ada produk ditemukan</h4>
              <p className="empty-message">
                {activeCategory !== "all" && activeCategoryName
                  ? `Tidak ada produk dalam kategori "${activeCategoryName}"`
                  : "Belum ada produk yang tersedia"}
              </p>
              <button
                className="reset-btn"
                onClick={() => handleCategoryClick("all")}
              >
                Lihat Semua Produk
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {paginatedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id || `product-${index}`}
                    product={product}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="page-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </button>

                  <div className="page-info">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    className="page-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}

              {currentPage < totalPages && (
                <div className="load-more-section">
                  <button
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span> Memuat...
                      </>
                    ) : (
                      "Tampilkan Lebih Banyak"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CardFilter;
