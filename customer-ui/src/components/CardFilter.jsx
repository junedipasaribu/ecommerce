import React from "react";
import "../styling/CardFilter.css";
import ImgSpl from "./test/Sample.jsx";
import { Categories, Products } from "./test/SampleItem.jsx";

const CardFilter = () => {
  const CategoryButton = ({ category }) => (
    <button
      key={category.id}
      className="category-button"
      onClick={() => console.log(`Category clicked: ${category.name}`)}
    >
      {category.name.split("\n").map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < category.name.split("\n").length - 1 && <br />}
        </React.Fragment>
      ))}
    </button>
  );

  const ProductCard = ({ product }) => (
    <div key={product.id} className="product-card">
      <div className="product-image-container">
        <ImgSpl />
      </div>
      <div className="product-info">
        <div className="product-name">
          {product.name}
          <p className="product-price">{product.price}</p>
        </div>
      </div>
      <button className="checkout-item-btn">Check Item</button>
    </div>
  );

  return (
    <>
      <div className="card2-container">
        <div className="categories-section">
          <div className="categories-container">
            {Categories.map((category) => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>

      <div className="cardfilter-container">
        <div className="products-section">
          <div className="products-header">
            <h3 className="products-title">Produk Terpopuler</h3>
            <div className="sort-options">
              <select className="sort-select">
                <option value="popular">Terpopuler</option>
                <option value="newest">Terbaru</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          <div className="products-grid">
            {Products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="load-more-section">
            <button className="load-more-btn">Tampilkan Lebih Banyak</button>
          </div>
        </div>

        <div className="filter-footer">
          <p className="footer-text">
            © Tim 5 Cacing Capston Project 2025. Hak Cipta Dilindungi
          </p>
        </div>
      </div>
    </>
  );
};

export default CardFilter;
