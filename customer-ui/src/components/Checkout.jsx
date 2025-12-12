import "../styling/Checkout.css";
import { useState, useEffect } from "react";
import { addressService } from "../services/addressService";
import { cartService } from "../services/cartService";
import { checkoutService } from "../services/checkoutService";
import { useNavigate } from "react-router-dom";
import { courierOptions } from "./test/SampleCourir";

function Checkout() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [success, setSuccess] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const [listCart, setListCart] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("JNE");
  const [paymentMethod, setPaymentMethod] = useState("KFA_PAY");

  const [addressForm, setAddressForm] = useState({
    label: "Rumah",
    receiver: "",
    phone: "",
    fullAddress: "",
    city: "",
    province: "",
    postalCode: "",
    isPrimary: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setCartLoading(true);
      await Promise.all([fetchAddresses(), fetchCart()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data checkout");
    } finally {
      setLoading(false);
      setCartLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await addressService.getAllAddresses();
      const addressData = Array.isArray(response) ? response : [];

      const validAddresses = addressData.filter(
        (addr) => addr && addr.fullAddress
      );

      setAddresses(validAddresses);

      if (validAddresses.length > 0) {
        const primaryAddress = validAddresses.find(
          (addr) => addr.isPrimary === true
        );
        const defaultAddress = primaryAddress || validAddresses[0];
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError("Gagal mengambil data alamat");
    }
  };

  const fetchCart = async () => {
    try {
      const res = await cartService.getAllCart();
      const cartData = res?.data || res || [];

      const items = Array.isArray(cartData?.items)
        ? cartData.items
        : Array.isArray(cartData)
        ? cartData
        : [];

      const cartItems = items.map((item) => ({
        id: item.productId,
        productId: item.productId,
        name: item.name || item.productName || "Produk",
        price: item.price || 0,
        qty: item.quantity || item.qty || 1,
        image: item.image || item.imageUrl || null,
        cartItemId: item.id || item.cartItemId,
      }));

      setListCart(cartItems);
    } catch (error) {
      console.error("Failed to get cart:", error);
      setError("Gagal memuat keranjang belanja");
    }
  };

  const calculateCartTotal = () => {
    return listCart.reduce((total, item) => {
      return total + item.price * item.qty;
    }, 0);
  };

  const shippingCost =
    courierOptions.find((c) => c.name === selectedCourier)?.cost || 0;
  const cartTotal = calculateCartTotal();
  const totalPpn = cartTotal * 0;
  const totalPayment = cartTotal + shippingCost + totalPpn;

  const handleProceedToCheckout = async () => {
    if (!selectedAddress) {
      alert("Silakan pilih alamat pengiriman terlebih dahulu");
      return;
    }

    if (!selectedCourier) {
      alert("Silakan pilih kurir pengiriman");
      return;
    }

    if (!paymentMethod) {
      alert("Silakan pilih metode pembayaran");
      return;
    }

    if (listCart.length === 0) {
      alert("Keranjang belanja kosong");
      return;
    }

    const addressToSend =
      addresses.find((addr) => addr.isPrimary) || selectedAddress;

    const checkoutData = {
      addressId: addressToSend.id,
      paymentMethod: paymentMethod,
      courierName: selectedCourier,
    };

    try {
      setProcessing(true);
      setError(null);

      const response = await checkoutService.checkoutOrder(checkoutData);
      const orderData = response.data || response;

      if (orderData.orderId || orderData.orderCode) {
        setSuccess({
          orderId: orderData.orderId,
          orderCode: orderData.orderCode,
          totalAmount: orderData.totalAmount,
          status: orderData.status,
          paymentMethod: orderData.paymentMethod,
          addressData: {
            receiver: addressToSend.receiver,
            phone: addressToSend.phone,
            fullAddress: addressToSend.fullAddress,
            city: addressToSend.city,
            province: addressToSend.province,
            postalCode: addressToSend.postalCode,
            label: addressToSend.label,
          },
          courier: selectedCourier,
          shippingCost: shippingCost,
        });

        try {
          await cartService.clearCart();
          setListCart([]);
        } catch (clearError) {
          console.warn("Tidak bisa clear cart:", clearError);
        }
      } else {
        alert("Checkout berhasil tetapi format response tidak sesuai");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      setError(
        error.response?.data?.message ||
          "Terjadi kesalahan saat proses checkout"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditAddress = (address = null) => {
    if (address) {
      setIsEditing(true);
      setEditingAddressId(address.id);
      setAddressForm({
        label: address.label || "Rumah",
        receiver: address.receiver || "",
        phone: address.phone || "",
        fullAddress: address.fullAddress || "",
        city: address.city || "",
        province: address.province || "",
        postalCode: address.postalCode || "",
        isPrimary: address.isPrimary || false,
      });
    } else {
      setIsEditing(false);
      setEditingAddressId(null);
      setAddressForm({
        label: "Rumah",
        receiver: "",
        phone: "",
        fullAddress: "",
        city: "",
        province: "",
        postalCode: "",
        isPrimary: addresses.length === 0,
      });
    }
    setShowAddressForm(true);
  };

  const handleSubmitAddress = async () => {
    if (!addressForm.receiver.trim()) {
      alert("Nama penerima harus diisi");
      return;
    }

    if (!addressForm.fullAddress.trim()) {
      alert("Alamat lengkap harus diisi");
      return;
    }

    if (!addressForm.phone.trim()) {
      alert("Nomor telepon harus diisi");
      return;
    }

    try {
      if (isEditing && editingAddressId) {
        await addressService.updateAddress(editingAddressId, addressForm);
      } else {
        await addressService.createAddress(addressForm);
      }

      setShowAddressForm(false);
      setIsEditing(false);
      setEditingAddressId(null);
      await fetchAddresses();

      alert(
        isEditing ? "Alamat berhasil diperbarui" : "Alamat berhasil ditambahkan"
      );
    } catch (error) {
      console.error("Error submitting address:", error);
      alert("Gagal menyimpan alamat");
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      await addressService.setPrimaryAddress(addressId);
      await fetchAddresses();

      const updatedAddresses = await addressService.getAllAddresses();
      const primaryAddress = Array.isArray(updatedAddresses)
        ? updatedAddresses.find((addr) => addr.isPrimary)
        : null;

      if (primaryAddress) {
        setSelectedAddress(primaryAddress);
      }

      alert("Alamat utama berhasil diubah");
    } catch (error) {
      console.error("Error setting primary address:", error);
      alert("Gagal mengubah alamat utama");
    }
  };

  const handleDeleteAddress = async (addressId, e) => {
    e.stopPropagation();

    if (!window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      return;
    }

    try {
      await addressService.deleteAddress(addressId);
      await fetchAddresses();

      if (selectedAddress?.id === addressId) {
        const primary = addresses.find(
          (addr) => addr.id !== addressId && addr.isPrimary
        );
        if (primary) {
          setSelectedAddress(primary);
        } else if (addresses.length > 1) {
          setSelectedAddress(addresses.find((addr) => addr.id !== addressId));
        } else {
          setSelectedAddress(null);
        }
      }

      alert("Alamat berhasil dihapus");
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Gagal menghapus alamat");
    }
  };

  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [success]);

  if (loading || cartLoading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat data checkout...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      <div className="row">
        {/* Left Column */}
        <div className="col-lg-8">
          {error && (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Address Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-1" style={{ color: "#0B3F7E" }}>
                  <i className="bi bi-geo-alt me-2"></i>
                  Alamat Pengiriman
                </h6>
                {selectedAddress && (
                  <div className="d-flex align-items-center">
                    <span className="me-2">{selectedAddress.receiver}</span>
                    {selectedAddress.isPrimary && (
                      <span className="badge bg-success me-2">Utama</span>
                    )}
                    <span className="badge bg-light text-dark">
                      {selectedAddress.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-primary dropdown-toggle"
                  type="button"
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Ubah
                </button>

                {showAddressDropdown && (
                  <div
                    className="dropdown-menu show p-3"
                    style={{
                      minWidth: "400px",
                      right: 0,
                      left: "auto",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <div className="mb-2">
                      <small className="text-muted">Pilih alamat:</small>
                    </div>

                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`dropdown-item p-2 mb-1 rounded ${
                          selectedAddress?.id === address.id ? "bg-light" : ""
                        }`}
                        onClick={() => {
                          setSelectedAddress(address);
                          setShowAddressDropdown(false);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="d-flex align-items-center">
                              <strong className="me-2">
                                {address.receiver}
                              </strong>
                              {address.isPrimary && (
                                <span className="badge bg-success">Utama</span>
                              )}
                            </div>
                            <small className="text-muted d-block">
                              {address.phone}
                            </small>
                            <small className="d-block">
                              {address.fullAddress}
                            </small>
                          </div>
                          <div className="d-flex flex-column align-items-end">
                            <div className="mb-1">
                              {!address.isPrimary && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPrimary(address.id);
                                  }}
                                >
                                  <i className="bi bi-star"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-outline-primary mx-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(address);
                                  setShowAddressDropdown(false);
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <hr className="my-2" />

                    <button
                      className="btn btn-outline-success w-100"
                      onClick={() => {
                        handleEditAddress();
                        setShowAddressDropdown(false);
                      }}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Tambah Alamat Baru
                    </button>
                  </div>
                )}
              </div>
            </div>

            {selectedAddress && (
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row">
                    <div className="col-10">
                      <p className="mb-1">
                        <strong>Penerima:</strong> {selectedAddress.receiver}
                      </p>
                      <p className="mb-1">
                        <strong>Telepon:</strong> {selectedAddress.phone}
                      </p>
                      <p className="mb-1">
                        <strong>Alamat:</strong> {selectedAddress.fullAddress}
                      </p>
                      <p className="mb-0">
                        <strong>Kota:</strong> {selectedAddress.city},{" "}
                        {selectedAddress.province}
                      </p>
                    </div>
                    <div className="col-2 text-end">
                      <div className="d-flex flex-column gap-1">
                        {!selectedAddress.isPrimary && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleSetPrimary(selectedAddress.id)}
                            title="Jadikan alamat utama"
                          >
                            <i className="bi bi-star"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditAddress(selectedAddress)}
                          title="Edit alamat"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success Modal */}
          {success && (
            <>
              {/* Backdrop dengan opacity penuh */}
              <div
                className="modal-backdrop fade show"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1040,
                  opacity: 1,
                }}
              ></div>

              {/* Modal content */}
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1050,
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div
                    className="modal-content border-0 shadow-lg"
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      margin: "1rem",
                    }}
                  >
                    <div
                      className="modal-header border-0"
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                      }}
                    >
                      <div className="d-flex align-items-center w-100">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <h5 className="modal-title mb-0">Checkout Berhasil!</h5>
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-auto"
                          onClick={() => {
                            setSuccess(null);
                            navigate("/");
                          }}
                        ></button>
                      </div>
                    </div>

                    <div className="modal-body text-center py-4">
                      <i
                        className="bi bi-check-circle text-success"
                        style={{ fontSize: "4rem" }}
                      ></i>
                      <h4 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
                        Order #{success.orderCode}
                      </h4>

                      <div className="card border mb-3">
                        <div className="card-body">
                          <div className="row text-start">
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Total Pembayaran
                              </small>
                              <h5
                                className="fw-bold mt-1"
                                style={{ color: "#F6921E" }}
                              >
                                Rp{" "}
                                {success.totalAmount?.toLocaleString("id-ID") ||
                                  "0"}
                              </h5>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">
                                Status
                              </small>
                              <span
                                className={`badge ${
                                  success.status === "PENDING_PAYMENT"
                                    ? "bg-warning"
                                    : "bg-success"
                                } mt-1`}
                              >
                                {success.status === "PENDING_PAYMENT"
                                  ? "Menunggu Pembayaran"
                                  : success.status}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-top">
                            {/* ALAMAT PENERIMA DETAIL - DIPERBAIKI */}
                            <div className="mb-3">
                              <small className="text-muted d-block mb-2">
                                Alamat Pengiriman
                              </small>
                              <div className="bg-light p-3 rounded">
                                <div className="d-flex align-items-start mb-2">
                                  <i
                                    className="bi bi-person me-2 mt-1"
                                    style={{ color: "#0B3F7E" }}
                                  ></i>
                                  <div>
                                    <strong style={{ color: "#0B3F7E" }}>
                                      {success.addressData?.receiver ||
                                        "Nama Penerima"}
                                    </strong>
                                    <div className="text-muted small">
                                      {success.addressData?.phone ||
                                        "No. Telepon"}
                                    </div>
                                  </div>
                                </div>

                                <div className="d-flex align-items-start mb-2">
                                  <i
                                    className="bi bi-geo-alt me-2 mt-1"
                                    style={{ color: "#0B3F7E" }}
                                  ></i>
                                  <div className="text-muted small">
                                    {success.addressData?.fullAddress ||
                                      "Alamat lengkap"}
                                  </div>
                                </div>

                                <div className="d-flex align-items-start">
                                  <i
                                    className="bi bi-building me-2 mt-1"
                                    style={{ color: "#0B3F7E" }}
                                  ></i>
                                  <div className="text-muted small">
                                    {success.addressData?.city || "Kota"},{" "}
                                    {success.addressData?.province ||
                                      "Provinsi"}
                                    {success.addressData?.postalCode && (
                                      <span className="ms-2">
                                        • {success.addressData.postalCode}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block mb-1">
                                Metode Pembayaran
                              </small>
                              <div className="d-flex align-items-center">
                                <i
                                  className="bi bi-wallet2 me-2"
                                  style={{ color: "#0B3F7E" }}
                                ></i>
                                <span
                                  className="fw-medium"
                                  style={{ color: "#0B3F7E" }}
                                >
                                  {success.paymentMethod === "KFA_PAY"
                                    ? "KFA Pay"
                                    : success.paymentMethod}
                                </span>
                              </div>
                            </div>

                            {/* INFO KURIR */}
                            <div className="mb-2">
                              <small className="text-muted d-block mb-1">
                                Kurir Pengiriman
                              </small>
                              <div className="d-flex align-items-center">
                                <i
                                  className="bi bi-truck me-2"
                                  style={{ color: "#0B3F7E" }}
                                ></i>
                                <span
                                  className="fw-medium"
                                  style={{ color: "#0B3F7E" }}
                                >
                                  {selectedCourier}
                                </span>
                                {shippingCost > 0 && (
                                  <span className="ms-2 text-muted small">
                                    • Rp {shippingCost.toLocaleString("id-ID")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted mb-4">
                        Detail order telah dikirim ke email Anda. Silakan
                        selesaikan pembayaran.
                      </p>
                    </div>

                    <div
                      className="modal-footer border-0"
                      style={{
                        borderBottomLeftRadius: "8px",
                        borderBottomRightRadius: "8px",
                      }}
                    >
                      <div className="row g-2 w-100">
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            onClick={() => {
                              setSuccess(null);
                              navigate("/");
                            }}
                          >
                            Kembali ke Beranda
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn-force-blue w-100"
                            onClick={() => {
                              setSuccess(null);
                              navigate(
                                `/orders/${
                                  success.orderId || success.orderCode
                                }`
                              );
                            }}
                          >
                            <i className="bi bi-receipt me-2"></i>
                            Lihat Detail Order
                          </button>
                        </div>
                      </div>

                      {success.paymentMethod === "KFA_PAY" &&
                        success.status === "PENDING_PAYMENT" && (
                          <button
                            type="button"
                            className="btn-force-warning w-100 mt-2"
                            onClick={() => {
                              navigate(
                                `/payment/${
                                  success.orderId || success.orderCode
                                }`,
                                {
                                  state: { order: success },
                                }
                              );
                            }}
                          >
                            <i className="bi bi-credit-card me-2"></i>
                            Bayar Sekarang dengan KFA Pay
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Transaction Details */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-cart-check me-2"
                  style={{ color: "#0B3F7E" }}
                ></i>
                <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                  Detail Transaksi
                </h5>
              </div>
            </div>

            <div className="card-body">
              {listCart.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-borderless">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            style={{ color: "#325A89", width: "50%" }}
                          >
                            Produk
                          </th>
                          <th
                            scope="col"
                            style={{ color: "#325A89", textAlign: "center" }}
                          >
                            Harga
                          </th>
                          <th
                            scope="col"
                            style={{ color: "#325A89", textAlign: "center" }}
                          >
                            Jumlah
                          </th>
                          <th
                            scope="col"
                            style={{ color: "#325A89", textAlign: "right" }}
                          >
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {listCart.map((item, index) => (
                          <tr key={item.productId || index}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="rounded me-3"
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="rounded bg-light d-flex align-items-center justify-content-center me-3"
                                    style={{ width: "60px", height: "60px" }}
                                  >
                                    <i className="bi bi-capsule text-muted"></i>
                                  </div>
                                )}
                                <div>
                                  <h6
                                    className="mb-0"
                                    style={{ color: "#0B3F7E" }}
                                  >
                                    {item.name}
                                  </h6>
                                </div>
                              </div>
                            </td>
                            <td
                              className="text-center"
                              style={{ color: "#0B3F7E" }}
                            >
                              Rp {item.price.toLocaleString("id-ID")}
                            </td>
                            <td
                              className="text-center"
                              style={{ color: "#0B3F7E" }}
                            >
                              {item.qty}
                            </td>
                            <td
                              className="text-end fw-bold"
                              style={{ color: "#0B3F7E" }}
                            >
                              Rp{" "}
                              {(item.price * item.qty).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Courier Selection */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
                      <i className="bi bi-truck me-2"></i>
                      Pilih Kurir
                    </h6>
                    <div className="row g-3">
                      {courierOptions.map((courier) => (
                        <div className="col-md-6" key={courier.name}>
                          <div
                            className={`card h-100 ${
                              selectedCourier === courier.name
                                ? "border-primary border-2"
                                : "border"
                            }`}
                            onClick={() => setSelectedCourier(courier.name)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="card-body">
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="courier"
                                  id={`courier-${courier.name}`}
                                  checked={selectedCourier === courier.name}
                                  onChange={() =>
                                    setSelectedCourier(courier.name)
                                  }
                                />
                                <label
                                  className="form-check-label fw-bold"
                                  htmlFor={`courier-${courier.name}`}
                                >
                                  {courier.name}
                                </label>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h5
                                    className="mb-1"
                                    style={{ color: "#F6921E" }}
                                  >
                                    Rp {courier.cost.toLocaleString("id-ID")}
                                  </h5>
                                  <small className="text-muted">
                                    Estimasi: {courier.estimated}
                                  </small>
                                </div>
                                <div
                                  className={`badge ${
                                    selectedCourier === courier.name
                                      ? "bg-primary"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {selectedCourier === courier.name
                                    ? "Dipilih"
                                    : "Pilih"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
                      <i className="bi bi-credit-card me-2"></i>
                      Metode Pembayaran
                    </h6>
                    <div className="card border">
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="payment-kfa"
                            checked={paymentMethod === "KFA_PAY"}
                            onChange={() => setPaymentMethod("KFA_PAY")}
                          />
                          <label
                            className="form-check-label d-flex align-items-center"
                            htmlFor="payment-kfa"
                          >
                            <div
                              className="rounded bg-primary d-flex align-items-center justify-content-center me-3"
                              style={{ width: "40px", height: "40px" }}
                            >
                              <i className="bi bi-wallet2 text-white"></i>
                            </div>
                            <div>
                              <h6 className="mb-0" style={{ color: "#0B3F7E" }}>
                                KFA Pay
                              </h6>
                              <small className="text-muted">
                                Saldo KFA Pay Anda
                              </small>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i
                    className="bi bi-cart-x"
                    style={{ fontSize: "3rem", color: "#325A89" }}
                  ></i>
                  <h5 className="mt-3" style={{ color: "#0B3F7E" }}>
                    Keranjang kosong
                  </h5>
                  <p className="text-muted">
                    Tambahkan produk ke keranjang untuk melanjutkan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-0 sticky-top"
            style={{ top: "20px" }}
          >
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                Ringkasan Pesanan
              </h5>
            </div>

            <div className="card-body">
              {listCart.length > 0 && (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#325A89" }}>Subtotal Produk</span>
                      <span className="fw-medium" style={{ color: "#0B3F7E" }}>
                        Rp {cartTotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#325A89" }}>Biaya Pengiriman</span>
                      <span className="fw-medium" style={{ color: "#0B3F7E" }}>
                        Rp {shippingCost.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#325A89" }}>Kurir</span>
                      <span className="fw-medium" style={{ color: "#0B3F7E" }}>
                        {selectedCourier || "-"}
                      </span>
                    </div>

                    {/* <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#325A89" }}>PPN</span>
                      <span className="fw-medium" style={{ color: "#0B3F7E" }}>
                        Rp {totalPpn.toLocaleString("id-ID")}
                      </span>
                    </div> */}

                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#325A89" }}>
                        Metode Pembayaran
                      </span>
                      <span className="fw-medium" style={{ color: "#0B3F7E" }}>
                        KFA Pay
                      </span>
                    </div>
                  </div>

                  <div className="border-top pt-3 mt-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0" style={{ color: "#0B3F7E" }}>
                        Total Pembayaran
                      </h5>
                      <h3 className="mb-0" style={{ color: "#F6921E" }}>
                        Rp {totalPayment.toLocaleString("id-ID")}
                      </h3>
                    </div>
                  </div>
                </>
              )}

              <button
                className="btn btn-lg w-100 mt-4"
                onClick={handleProceedToCheckout}
                disabled={
                  !selectedAddress || listCart.length === 0 || processing
                }
                style={{
                  backgroundColor:
                    !selectedAddress || listCart.length === 0
                      ? "#cccccc"
                      : "#F6921E",
                  color: "white",
                  padding: "12px",
                }}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>
                    {listCart.length > 0
                      ? `Bayar Rp ${totalPayment.toLocaleString("id-ID")}`
                      : "Bayar Sekarang"}
                  </>
                )}
              </button>

              <div className="alert alert-info mt-3 mb-0" role="alert">
                <small>
                  Dengan menekan tombol "Bayar Sekarang", Anda menyetujui syarat
                  dan ketentuan.
                </small>
                <span> Harga sudah termasuk PPN 11%.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Address Form Modal */}
      {showAddressForm && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{
              zIndex: 1050,
              backgroundColor: "rgba(0,0,0,0.5)",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          ></div>

          <div
            className="modal fade show"
            style={{
              display: "block",
              zIndex: 1060,
              backgroundColor: "transparent",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflowX: "hidden",
              overflowY: "auto",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddressForm(false);
                setIsEditing(false);
                setEditingAddressId(null);
              }
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-geo-alt me-2"></i>
                    {isEditing ? "Edit Alamat" : "Tambah Alamat Baru"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowAddressForm(false);
                      setIsEditing(false);
                      setEditingAddressId(null);
                    }}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Label Alamat</label>
                      <select
                        name="label"
                        className="form-select"
                        value={addressForm.label}
                        onChange={handleFormChange}
                      >
                        <option value="Rumah">🏠 Rumah</option>
                        <option value="Kantor">🏢 Kantor</option>
                        <option value="Kos">🏘️ Kos</option>
                        <option value="Lainnya">📍 Lainnya</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Nama Penerima *</label>
                      <input
                        type="text"
                        name="receiver"
                        className="form-control"
                        placeholder="Nama lengkap penerima"
                        value={addressForm.receiver}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Nomor Telepon *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="0812-3456-7890"
                        value={addressForm.phone}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Kota *</label>
                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        placeholder="Jakarta"
                        value={addressForm.city}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Alamat Lengkap *</label>
                      <textarea
                        name="fullAddress"
                        className="form-control"
                        rows="3"
                        placeholder="Jl. Contoh No. 123, RT 01/RW 02..."
                        value={addressForm.fullAddress}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Provinsi *</label>
                      <input
                        type="text"
                        name="province"
                        className="form-control"
                        placeholder="DKI Jakarta"
                        value={addressForm.province}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Kode Pos</label>
                      <input
                        type="text"
                        name="postalCode"
                        className="form-control"
                        placeholder="12345"
                        value={addressForm.postalCode}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="isPrimary"
                          checked={addressForm.isPrimary}
                          onChange={handleFormChange}
                        />
                        <label className="form-check-label">
                          Jadikan alamat utama
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddressForm(false);
                      setIsEditing(false);
                      setEditingAddressId(null);
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmitAddress}
                  >
                    <i className="bi bi-save me-2"></i>
                    {isEditing ? "Update Alamat" : "Simpan Alamat"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Checkout;
