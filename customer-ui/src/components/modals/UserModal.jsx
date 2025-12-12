import { useState, useEffect, useRef } from "react";
import { UserIcon } from "../Icons";
import "../../styling/UserModal.css";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function UserModal({ open, setOpen, closeOtherModals }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const modalRef = useRef(null);
  const isLoggedIn = authService.isAuthenticated();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!open) return;

      try {
        setLoading(true);
        if (isLoggedIn) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [open, isLoggedIn]);

  useEffect(() => {
    if (open && closeOtherModals) {
      closeOtherModals();
    }
  }, [open, closeOtherModals]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.querySelector(".user-modal-container");
      const userIcon = document.querySelector(".user-icon-container");

      if (
        modal &&
        !modal.contains(event.target) &&
        userIcon &&
        !userIcon.contains(event.target)
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

  const handleNavigate = (path, options = {}) => {
    setOpen(false);
    navigate(path, options);
  };

  const handleLogin = () => handleNavigate("/login");
  const handleRegister = () => handleNavigate("/register");
  const handleOrders = () => handleNavigate("/orders");
  const handleProfile = () => handleNavigate("/profile");
  const handleAddresses = () => handleNavigate("/addresses");
  const handleWishlist = () => handleNavigate("/wishlist");
  const handleHelp = () => handleNavigate("/help");

  const handleLogout = () => {
    if (window.confirm("Yakin ingin logout?")) {
      authService.logout();
      setOpen(false);
      navigate("/", { replace: true });
    }
  };

  const getUserName = () => {
    if (!user) return "Guest";
    return user.name || user.email?.split("@")[0] || "User";
  };

  const getUserEmail = () => {
    if (!user) return null;
    return user.email || null;
  };

  return (
    <div
      className="user-modal-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="user-icon-container"
        onClick={() => {
          setOpen(!open);
          if (closeOtherModals) closeOtherModals();
        }}
      >
        <UserIcon />
        {isLoggedIn && <div className="user-status-indicator online"></div>}
      </div>

      {open && (
        <div
          className="user-modal-content"
          ref={modalRef}
          onMouseEnter={handleModalMouseEnter}
          onMouseLeave={handleModalMouseLeave}
        >
          {/* Header */}
          <div className="user-modal-header">
            <div className="user-title">
              <i className="bi bi-person-circle me-2"></i>
              <h3>Akun Saya</h3>
            </div>
            <button
              className="user-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body */}
          <div className="user-modal-body">
            {loading ? (
              <div className="user-loading">
                <div className="spinner"></div>
                <p>Memuat data pengguna...</p>
              </div>
            ) : error ? (
              <div className="user-error">
                <i className="bi bi-exclamation-triangle"></i>
                <p>{error}</p>
                <button
                  className="btn-retry"
                  onClick={() => window.location.reload()}
                >
                  Coba Lagi
                </button>
              </div>
            ) : !isLoggedIn ? (
              <div className="user-not-logged">
                <i className="bi bi-person-x"></i>
                <h4>Anda belum login</h4>
                <p className="user-not-logged-message">
                  Silakan login untuk mengakses fitur
                </p>

                <div className="user-auth-actions">
                  <button className="btn-login" onClick={handleLogin}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </button>

                  <button className="btn-register" onClick={handleRegister}>
                    <i className="bi bi-person-plus me-2"></i>
                    Daftar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* User Profile Section */}
                <div className="user-profile-section">
                  <div className="user-avatar">
                    <div className="avatar-placeholder">
                      {getUserName().charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="user-info">
                    <h4 className="user-name">{getUserName()}</h4>
                    {getUserEmail() && (
                      <p className="user-email">{getUserEmail()}</p>
                    )}
                    <span className="user-status">Online</span>
                  </div>
                </div>

                {/* User Menu */}
                <div className="user-menu">
                  <div className="menu-section">
                    <h5 className="menu-title">Akun Saya</h5>
                    <ul className="menu-list">
                      <li>
                        <button className="menu-item" onClick={handleProfile}>
                          <i className="bi bi-person me-2"></i>
                          <span>Profil Saya</span>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>

                      <li>
                        <button className="menu-item" onClick={handleOrders}>
                          <i className="bi bi-bag me-2"></i>
                          <span>Pesanan Saya</span>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="user-logout-section">
                  <button className="btn-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left me-2"></i>
                    Keluar
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

export default UserModal;
