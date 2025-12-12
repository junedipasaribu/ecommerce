import "../styling/Cart.css";
import { useState, useEffect } from "react";
import { cartService } from "../services/cartService.js";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [listCart, setListCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const goToCheckout = () => {
    navigate("/checkout");
  };

  const fetchCart = async () => {
    try {
      const res = await cartService.getAllCart();

      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : res?.data?.items ?? [];

      const cartItems = items.map((item) => ({
        id: item.productId,
        productId: item.productId,
        name: item.name || item.productName,
        price: item.price || 0,
        qty: item.quantity || item.qty || 1,
        image: item.image || item.imageUrl || null,
        description: item.description || "",
        cartItemId: item.id || item.cartItemId,
      }));
      setListCart(cartItems);
      setError(null);
    } catch (error) {
      console.error("Failed to get Cart:", error);
      setError("Gagal memuat produk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleCheckbox = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(listCart.map((item) => item.productId));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSingle = async (productId, itemName = "item") => {
    if (isDeleting) return;

    if (!window.confirm(`Hapus "${itemName}" dari keranjang?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`🗑️ Deleting product with ID: ${productId}`);

      await cartService.removeFromCart(productId);

      await fetchCart();

      setSelectedItems((prev) => prev.filter((id) => id !== productId));

      console.log("✅ Item deleted successfully");
    } catch (err) {
      console.error("Gagal menghapus item:", err);
      console.error("Error response:", err.response?.data);

      const errorMsg =
        err.response?.data?.message || err.message || "Gagal menghapus item";
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearSelected = async () => {
    if (selectedItems.length === 0) return;

    if (
      !window.confirm(
        `Hapus ${selectedItems.length} item terpilih dari keranjang?`
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      console.log("🗑️ Clearing selected items:", selectedItems);

      const deletePromises = selectedItems.map(async (productId) => {
        try {
          console.log(`Deleting productId: ${productId}`);
          await cartService.removeFromCart(productId);
          console.log(`✅ Deleted: ${productId}`);
        } catch (err) {
          console.error(`❌ Failed to delete ${productId}:`, err);
        }
      });

      await Promise.all(deletePromises);

      await fetchCart();

      setSelectedItems([]);

      console.log("✅ All selected items deleted");
    } catch (err) {
      console.error("Gagal menghapus item terpilih:", err);
      alert("Gagal menghapus beberapa item. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllCart = async () => {
    if (listCart.length === 0) return;

    if (
      !window.confirm(`Hapus semua item (${listCart.length}) dari keranjang?`)
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      console.log("🧹 Clearing entire cart");
      await cartService.clearCart();
      await fetchCart();
      setSelectedItems([]);
      console.log("✅ Cart cleared successfully");
    } catch (err) {
      console.error("Gagal menghapus seluruh keranjang:", err);
      alert("Gagal menghapus keranjang. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateQuantity = async (item, newQty) => {
    if (newQty < 1) {
      await handleDeleteSingle(item.productId, item.name);
      return;
    }

    try {
      setListCart((prev) =>
        prev.map((cartItem) =>
          cartItem.productId === item.productId
            ? { ...cartItem, qty: newQty }
            : cartItem
        )
      );

      if (cartService.updateCart) {
        await cartService.updateCart(item.productId, newQty);
      } else {
        console.log("⚠️ updateQuantity service not available");
      }
    } catch (err) {
      console.error("Gagal update quantity:", err);
      alert("Gagal mengupdate jumlah item");
      await fetchCart();
    }
  };

  const handleDecrement = (item) => {
    const newQty = item.qty - 1;
    updateQuantity(item, newQty);
  };

  const handleIncrement = (item) => {
    const newQty = item.qty + 1;
    updateQuantity(item, newQty);
  };

  const grandTotal = listCart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const selectedTotal = listCart
    .filter((item) => selectedItems.includes(item.productId))
    .reduce((total, item) => total + item.price * item.qty, 0);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat keranjang...</p>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger m-3">
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchCart}>
          Coba Lagi
        </button>
      </div>
    );

  return (
    <div className="container-fluid py-3">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-3">Keranjang Belanja</h2>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="badge bg-primary me-2">
                {listCart.length} item
              </span>
              <span className="text-muted">
                {selectedItems.length > 0
                  ? `${selectedItems.length} item terpilih`
                  : "Pilih item untuk checkout"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Kolom kiri: Daftar produk di cart */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAll"
                    checked={
                      selectedItems.length === listCart.length &&
                      listCart.length > 0
                    }
                    onChange={handleSelectAll}
                    disabled={isDeleting}
                  />
                  <label
                    className="form-check-label fw-medium ms-2"
                    htmlFor="selectAll"
                  >
                    Pilih Semua ({listCart.length} item)
                  </label>
                </div>

                {selectedItems.length > 0 && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleClearSelected}
                    disabled={isDeleting}
                  >
                    <i className="bi bi-trash me-1"></i>
                    {isDeleting
                      ? "Menghapus..."
                      : `Hapus Terpilih (${selectedItems.length})`}
                  </button>
                )}
              </div>
            </div>

            <div className="card-body p-0">
              {/* Desktop View - Table */}
              <div className="d-none d-lg-block">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "50px" }}></th>
                        <th className="text-start ps-4">Produk</th>
                        <th className="text-center">Harga</th>
                        <th className="text-center">Qty</th>
                        <th className="text-center">Total</th>
                        <th
                          className="text-center"
                          style={{ width: "80px" }}
                        ></th>
                      </tr>
                    </thead>

                    <tbody>
                      {listCart.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-5 text-center text-muted"
                          >
                            <i className="bi bi-cart-x display-5 d-block mb-3"></i>
                            <p className="mb-0">Keranjang belanja kosong</p>
                          </td>
                        </tr>
                      ) : (
                        listCart.map((item) => (
                          <tr
                            key={item.productId}
                            className={
                              selectedItems.includes(item.productId)
                                ? "table-active"
                                : ""
                            }
                          >
                            <td className="align-middle ps-3">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedItems.includes(item.productId)}
                                onChange={() => handleCheckbox(item.productId)}
                                disabled={isDeleting}
                              />
                            </td>
                            <td className="align-middle">
                              <div className="d-flex align-items-center ps-2">
                                <div className="me-3">
                                  <img
                                    src={item.image || "..."}
                                    alt={item.name}
                                    width="60"
                                    height="60"
                                    className="rounded object-fit-cover"
                                  />
                                </div>
                                <div>
                                  <div className="fw-medium mb-1">
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <small className="text-muted d-block">
                                      {item.description}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="align-middle text-center fw-medium">
                              Rp.{item.price.toLocaleString("id-ID")}
                            </td>
                            <td className="align-middle">
                              <div className="d-flex justify-content-center align-items-center">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  style={{ width: "32px" }}
                                  onClick={() => handleDecrement(item)}
                                  disabled={isDeleting}
                                >
                                  -
                                </button>
                                <span
                                  className="mx-2 fw-medium"
                                  style={{ minWidth: "30px" }}
                                >
                                  {item.qty}
                                </span>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  style={{ width: "32px" }}
                                  onClick={() => handleIncrement(item)}
                                  disabled={isDeleting}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="align-middle text-center fw-bold">
                              Rp.
                              {(item.price * item.qty).toLocaleString("id-ID")}
                            </td>
                            <td className="align-middle text-center">
                              <button
                                className="btn btn-link text-danger p-0"
                                onClick={() =>
                                  handleDeleteSingle(item.productId, item.name)
                                }
                                title="Hapus item"
                                disabled={isDeleting}
                              >
                                <i className="bi bi-trash fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View - Card List */}
              <div className="d-lg-none">
                {listCart.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-cart-x display-5 d-block mb-3"></i>
                    <p className="mb-0">Keranjang belanja kosong</p>
                  </div>
                ) : (
                  <div className="p-3">
                    {listCart.map((item) => (
                      <div
                        key={item.productId}
                        className={`card mb-3 border ${
                          selectedItems.includes(item.productId)
                            ? "border-primary"
                            : ""
                        }`}
                      >
                        <div className="card-body">
                          <div className="d-flex">
                            <div className="me-3">
                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                checked={selectedItems.includes(item.productId)}
                                onChange={() => handleCheckbox(item.productId)}
                                disabled={isDeleting}
                              />
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex">
                                <div className="me-3">
                                  <img
                                    src={item.image || "..."}
                                    alt={item.name}
                                    width="60"
                                    height="60"
                                    className="rounded object-fit-cover"
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="fw-medium mb-1">
                                    {item.name}
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-medium">
                                      Rp.{item.price.toLocaleString("id-ID")}
                                    </span>
                                    <span className="fw-bold text-primary">
                                      Rp.
                                      {(item.price * item.qty).toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        style={{ width: "32px" }}
                                        onClick={() => handleDecrement(item)}
                                        disabled={isDeleting}
                                      >
                                        -
                                      </button>
                                      <span className="mx-2 fw-medium">
                                        {item.qty}
                                      </span>
                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        style={{ width: "32px" }}
                                        onClick={() => handleIncrement(item)}
                                        disabled={isDeleting}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button
                                      className="btn btn-link text-danger p-0"
                                      onClick={() =>
                                        handleDeleteSingle(
                                          item.productId,
                                          item.name
                                        )
                                      }
                                      disabled={isDeleting}
                                    >
                                      <i className="bi bi-trash fs-5"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom kanan: Ringkasan Pembayaran */}
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-0 sticky-lg-top"
            style={{ top: "20px" }}
          >
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-receipt me-2"></i>Ringkasan Pembayaran
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-medium">
                    Rp.{selectedTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Diskon</span>
                  <span className="text-success fw-medium">Rp.0</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">PPN (11%)</span>
                  <span className="fw-medium">
                    Rp.
                    {Math.round(selectedTotal * 0.11).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="border-top pt-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Total Pembayaran</h6>
                  <h4 className="mb-0 text-primary fw-bold">
                    Rp.
                    {(
                      selectedTotal + Math.round(selectedTotal * 0.11)
                    ).toLocaleString("id-ID")}
                  </h4>
                </div>
                {selectedItems.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">Total Terpilih</small>
                    <small className="fw-medium">
                      Rp.{selectedTotal.toLocaleString("id-ID")}
                    </small>
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary w-100 py-3 fw-bold"
                onClick={goToCheckout}
                style={{
                  background: "#f6921e",
                  borderColor: "#f6921e",
                  fontSize: "1.1rem",
                }}
                disabled={selectedItems.length === 0 || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading...
                  </>
                ) : selectedItems.length > 0 ? (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>
                    Checkout ({selectedItems.length} item)
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-check me-2"></i>
                    Pilih Item Terlebih Dahulu
                  </>
                )}
              </button>

              <div className="mt-3 small text-muted">
                <div className="d-flex align-items-center mb-1">
                  <i className="bi bi-shield-check me-2"></i>
                  <span>Transaksi 100% aman dan terjamin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Aksi Mobile */}
      <div className="d-lg-none mt-4">
        <div className="fixed-bottom bg-white border-top p-3 shadow-lg">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-6">
                <div className="small text-muted">Total</div>
                <div className="fw-bold fs-5">
                  Rp.
                  {(
                    grandTotal +
                    Math.round(grandTotal * 0.11) +
                    15000
                  ).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-primary w-100 py-3 fw-bold"
                  style={{ background: "#f6921e", borderColor: "#f6921e" }}
                  disabled={selectedItems.length === 0 || isDeleting}
                >
                  {isDeleting
                    ? "Loading..."
                    : selectedItems.length > 0
                    ? `Checkout (${selectedItems.length})`
                    : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
