import { useState, useEffect, useRef } from "react";
import { CartIcon } from "../Icons";
import "../../styling/CartModal.css";
import { useNavigate } from "react-router-dom";
import { cartService } from "../../services/cartService";

function CartModal({ open, setOpen, closeOtherModals }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const modalRef = useRef(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getAllCart();

      const safeCart = Array.isArray(res)
        ? {
            items: res,
            total: res.reduce((s, i) => s + (i.subtotal || 0), 0),
          }
        : {
            items: res?.items || [],
            total: res?.total || 0,
          };

      setCart(safeCart);
      setError(null);
    } catch (error) {
      console.error("Failed to load Cart: ", error);
      setError("Gagal memuat keranjang.");
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCart();
      if (closeOtherModals) closeOtherModals();
    }
  }, [open]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (modalRef.current && !modalRef.current.matches(":hover")) {
        setOpen(false);
      }
    }, 300);
  };

  const handleModalMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleModalMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);

  const displayItems = cart.items.slice(0, 5);
  const hasMoreItems = cart.items.length > 5;

  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.querySelector(".cart-modal-container");
      const cartIcon = document.querySelector(".cart-icon-container");

      if (
        modal &&
        !modal.contains(event.target) &&
        cartIcon &&
        !cartIcon.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [open, setOpen]);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div
      className="cart-modal-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="cart-icon-container"
        onClick={() => {
          setOpen(!open);
          if (closeOtherModals) closeOtherModals();
        }}
      >
        <CartIcon />
        {cart.items.length > 0 && (
          <span className="cart-badge">
            {cart.items.length > 99 ? "99+" : cart.items.length}
          </span>
        )}
      </div>

      {open && (
        <div
          className="cart-modal-content"
          ref={modalRef}
          onMouseEnter={handleModalMouseEnter}
          onMouseLeave={handleModalMouseLeave}
        >
          {/* Header */}
          <div className="cart-modal-header">
            <div className="cart-title">
              <i className="bi bi-cart3 me-2"></i>
              <h3>Keranjang Belanja</h3>
            </div>
            <div className="cart-header-meta">
              {cart.items.length > 0 && (
                <span className="cart-item-count">
                  {cart.items.length} item
                </span>
              )}
              <button
                className="cart-close-btn"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="cart-modal-body">
            {loading ? (
              <div className="cart-loading">
                <div className="spinner"></div>
                <p>Memuat keranjang...</p>
              </div>
            ) : error ? (
              <div className="cart-error">
                <i className="bi bi-exclamation-triangle"></i>
                <p>{error}</p>
                <button className="btn-retry" onClick={fetchCart}>
                  Coba Lagi
                </button>
              </div>
            ) : cart.items.length === 0 ? (
              <div className="cart-empty">
                <i className="bi bi-cart-x"></i>
                <h4>Keranjang Belanja Kosong</h4>
                <p className="cart-empty-message">
                  Tambahkan produk untuk memulai belanja
                </p>
                <button
                  className="btn-start-shopping"
                  onClick={() => handleNavigate("/")}
                >
                  <i className="bi bi-shop me-2"></i>
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="cart-items-list">
                  {displayItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-image">
                        <img
                          src={
                            item.image_url ||
                            item.imageUrl ||
                            item.image ||
                            "..."
                          }
                          alt={item.name}
                          loading="lazy"
                        />
                      </div>

                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-details">
                          <span className="cart-item-quantity">
                            {item.quantity} ×{" "}
                            {formatPrice(
                              item.price || item.subtotal / item.quantity || 0
                            )}
                          </span>
                          <span className="cart-item-subtotal">
                            {formatPrice(item.subtotal || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* More Items Indicator */}
                  {hasMoreItems && (
                    <div className="more-items-indicator">
                      <i className="bi bi-three-dots"></i>
                      <span>+{cart.items.length - 5} produk lainnya</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="cart-actions">
                  <button
                    className="btn-view-cart"
                    onClick={() => handleNavigate("/cart")}
                  >
                    <i className="bi bi-eye me-2"></i>
                    Lihat Keranjang Lengkap
                  </button>

                  <button
                    className="btn-checkout"
                    onClick={() => handleNavigate("/checkout")}
                    disabled={cart.items.length === 0}
                  >
                    <i className="bi bi-bag-check me-2"></i>
                    Lanjut ke Checkout
                    {cart.items.length > 0 && (
                      <span className="checkout-total">
                        {formatPrice(cart.total)}
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CartModal;
