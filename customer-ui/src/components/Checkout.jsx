import "../styling/Checkout.css";
import { LocationIcon, PayIcon } from "./Icons.jsx";
import { useState, useEffect } from "react";
import { addressService } from "../services/addressService.js";
import { cartService } from "../services/cartService.js";
import { checkoutService } from "../services/checkoutService.js";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const goToPay = () => {
    navigate("/payment");
  };
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [success, setSuccess] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // State untuk transaksi
  const [listCart, setListCart] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("JNE");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  // Courier options dengan tarif
  const courierOptions = [
    { name: "JNE", cost: 15000, estimated: "2-3 hari" },
    { name: "GO KFA", cost: 10000, estimated: "1-2 hari" },
  ];

  // Form state
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

  // Fetch addresses dan cart items on mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchAddresses(), fetchCart()]);
    };

    fetchData();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching addresses...");
      const response = await addressService.getAllAddresses();
      console.log("📦 Address response:", response);

      // Handle different response formats
      let addressData = Array.isArray(response)
        ? response
        : response?.data || [];

      // Filter out empty or invalid addresses
      const validAddresses = addressData.filter(
        (addr) => addr && typeof addr === "object" && addr.fullAddress
      );

      console.log(`✅ Found ${validAddresses.length} valid addresses`);

      setAddresses(validAddresses);

      // Set selected address
      if (validAddresses.length > 0) {
        const primary = validAddresses.find((addr) => addr.isPrimary);
        setSelectedAddress(primary || validAddresses[0]);
      }
    } catch (error) {
      console.error("❌ Error fetching addresses:", error);
      setError(error.message || "Gagal mengambil data alamat");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart items from cartService - menggunakan kode yang Anda berikan
  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await cartService.getAllCart();
      // Cek struktur response
      let cartData;
      if (res?.data) {
        // Jika response memiliki properti data
        cartData = res.data;
      } else {
        // Jika response langsung
        cartData = res;
      }

      console.log("📊 Cart data structure:", cartData);

      // Extract cartId dari response
      const extractedCartId = cartData?.cartId || cartData?.id || null;
      setCartId(extractedCartId);

      // Extract items
      const items = Array.isArray(cartData?.items)
        ? cartData.items
        : Array.isArray(cartData)
        ? cartData
        : [];

      console.log(`📦 Cart ID: ${extractedCartId}, Items: ${items.length}`);

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
      console.log(`🛒 Found ${cartItems.length} cart items`);
    } catch (error) {
      console.error("Failed to get Cart:", error);
      setError("Gagal memuat keranjang belanja. Silakan coba lagi.");
    } finally {
      setCartLoading(false);
    }
  };

  // Calculate total dari cart items
  const calculateCartTotal = () => {
    return listCart.reduce((total, item) => {
      return total + (item.subtotal || item.price * item.qty);
    }, 0);
  };

  // Calculate shipping cost
  const shippingCost =
    courierOptions.find((c) => c.name === selectedCourier)?.cost || 0;

  // Calculate total payment
  const cartTotal = calculateCartTotal();
  const totalPpn = cartTotal * 0.11;
  const totalPayment = cartTotal + shippingCost + totalPpn;

  // Handle proceed to payment/checkout
  const handleProceedToCheckout = async () => {
    // Validasi
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
      alert(
        "Keranjang belanja kosong. Silakan tambahkan produk terlebih dahulu"
      );
      return;
    }

    // Persiapkan data untuk checkout
    const checkoutData = {
      addressId: selectedAddress.id,
      paymentMethod: paymentMethod,
      courier: selectedCourier,
      shippingCost: shippingCost,
    };

    console.log("📤 Data yang akan dikirim ke API:", checkoutData);

    try {
      setProcessing(true);
      setError(null);

      // Kirim request checkout
      const response = await checkoutService.checkoutOrder(checkoutData);

      console.log("✅ Response checkout:", response);

      // Cek jika response adalah object dengan data order
      const orderData = response.data || response;

      if (orderData.orderId || orderData.orderCode) {
        // Tampilkan modal sukses
        setSuccess({
          orderId: orderData.orderId,
          orderCode: orderData.orderCode,
          totalAmount: orderData.totalAmount,
          status: orderData.status,
          paymentMethod: orderData.paymentMethod,
        });

        // Clear cart setelah checkout berhasil
        try {
          await cartService.clearCart();
          setListCart([]);
        } catch (clearError) {
          console.warn("Tidak bisa clear cart:", clearError);
        }

        // Tidak perlu alert lagi, akan ditampilkan di modal
      } else {
        alert("Checkout berhasil tetapi format response tidak sesuai");
      }
    } catch (error) {
      console.error("❌ Error during checkout:", error);

      // Tampilkan error yang lebih spesifik
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Terjadi kesalahan saat proses checkout";

      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle edit button click
  const handleEditAddress = (address = null) => {
    if (address) {
      // Edit existing address
      setIsEditing(true);
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
      // Add new address
      setIsEditing(false);
      setAddressForm({
        label: "Rumah",
        receiver: "",
        phone: "",
        fullAddress: "",
        city: "",
        province: "",
        postalCode: "",
        isPrimary: addresses.length === 0, // Make primary if no addresses
      });
    }
    setShowAddressForm(true);
  };

  // Submit address form (Add or Update)
  const handleSubmitAddress = async () => {
    try {
      // Validation
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

      console.log("📤 Submitting address:", addressForm);

      let response;

      if (isEditing) {
        // Update existing address (if we have address ID)
        // Note: You need to have address ID in your form state
        // response = await addressService.updateAddress(addressForm.id, addressForm);
        console.log("✏️ Update address - Need ID implementation");
        alert("Update feature needs address ID implementation");
        return;
      } else {
        // Create new address
        response = await addressService.createAddress(addressForm);
        console.log("✅ Address created:", response);
      }

      // Close form and refresh addresses
      setShowAddressForm(false);
      await fetchAddresses();

      alert(
        isEditing ? "Alamat berhasil diperbarui" : "Alamat berhasil ditambahkan"
      );
    } catch (error) {
      console.error("❌ Error submitting address:", error);
      alert(
        "Gagal menyimpan alamat: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Hapus alamat ini?")) return;

    try {
      await addressService.deleteAddress(addressId);
      await fetchAddresses();
      alert("Alamat berhasil dihapus");
    } catch (error) {
      console.error("❌ Error deleting address:", error);
      alert("Gagal menghapus alamat");
    }
  };

  // Handle set primary address
  const handleSetPrimary = async (addressId) => {
    try {
      await addressService.setPrimaryAddress(addressId);
      await fetchAddresses();
      alert("Alamat utama berhasil diubah");
    } catch (error) {
      console.error("❌ Error setting primary address:", error);
      alert("Gagal mengubah alamat utama");
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
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
      alert(
        "Keranjang belanja kosong. Silakan tambahkan produk terlebih dahulu"
      );
      return;
    }

    // Format items untuk dikirim ke API
    const formattedItems = listCart.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      subtotal: item.subtotal || item.price * item.qty,
    }));

    const orderData = {
      addressId: selectedAddress.id,
      courierName: selectedCourier,
      paymentMethod: paymentMethod,
      cartId: listCart[0]?.cartItemId || null,
      shippingCost: shippingCost,
      totalAmount: totalPayment,
      items: formattedItems,
    };

    console.log("🚀 Proceeding to payment with data:", orderData);

    try {
      // Kirim data ke API untuk membuat order
      // const response = await checkoutService.createOrder(orderData);
      // alert("Order berhasil dibuat!");
      // Redirect ke halaman pembayaran atau konfirmasi
      // window.location.href = `/payment/${response.data.orderId}`;

      alert(`Order data siap dikirim:\n${JSON.stringify(orderData, null, 2)}`);
    } catch (error) {
      console.error("❌ Error creating order:", error);
      alert("Gagal membuat order: " + error.message);
    }
  };

  useEffect(() => {
    // Jika sukses, scroll ke atas
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
        {/* Left Column: Address and Transaction Details */}
        <div className="col-lg-8">
          {error && (
            <div className="alert alert-danger mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

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
                          <div>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
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

            {/* Selected Address Preview */}
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success Modal after Checkout */}
          {success && (
            <>
              <div className="modal-backdrop fade show"></div>
              <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg">
                    <div
                      className="modal-header border-0"
                      style={{ backgroundColor: "#28a745", color: "white" }}
                    >
                      <div className="d-flex align-items-center w-100">
                        <i
                          className="bi bi-check-circle-fill me-2"
                          style={{ fontSize: "1.5rem" }}
                        ></i>
                        <h5 className="modal-title mb-0">Checkout Berhasil!</h5>
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-auto"
                          onClick={() => {
                            setSuccess(null);
                            // Redirect ke halaman orders atau home
                            window.location.href = "/";
                          }}
                        ></button>
                      </div>
                    </div>

                    <div className="modal-body text-center py-4">
                      <div className="mb-4">
                        <i
                          className="bi bi-check-circle"
                          style={{ fontSize: "4rem", color: "#28a745" }}
                        ></i>
                      </div>

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
                                  : success.paymentMethod === "BANK_TRANSFER"
                                  ? "Bank Transfer"
                                  : success.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted mb-4">
                        Detail order telah dikirim ke email Anda. Silakan
                        selesaikan pembayaran.
                      </p>
                    </div>

                    <div className="modal-footer border-0">
                      <div className="row g-2 w-100">
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            onClick={() => {
                              setSuccess(null);
                              {
                                window.location.href = "/";
                              }
                            }}
                          >
                            Kembali ke Beranda
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn w-100"
                            style={{
                              backgroundColor: "#0B3F7E",
                              borderColor: "#0B3F7E",
                              color: "white",
                            }}
                            onClick={() => {
                              setSuccess(null);
                              window.location.href = `/orders/${
                                success.orderId || success.orderCode
                              }`;
                            }}
                          >
                            <i className="bi bi-receipt me-2"></i>
                            Lihat Detail Order
                          </button>
                        </div>
                      </div>

                      {success.paymentMethod === "KFA_PAY" &&
                        success.status === "PENDING_PAYMENT" && (
                          // Di modal success Checkout.jsx
                          <button
                            type="button"
                            className="btn btn-lg w-100 mt-2"
                            style={{
                              backgroundColor: "#F6921E",
                              borderColor: "#F6921E",
                              color: "white",
                            }}
                            onClick={() => {
                              navigate(
                                `/payment/${
                                  success.orderId || success.orderCode
                                }`,
                                {
                                  state: {
                                    order: {
                                      orderId: success.orderId,
                                      orderCode: success.orderCode,
                                      totalAmount: success.totalAmount,
                                      status: success.status,
                                      paymentMethod: success.paymentMethod,
                                    },
                                  },
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

          {/* Transaction Details Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-cart-check me-2"
                  style={{ color: "#0B3F7E", fontSize: "1.2rem" }}
                ></i>
                <h5 className="mb-0 fw-bold" style={{ color: "#0B3F7E" }}>
                  Detail Transaksi
                </h5>
              </div>
            </div>

            <div className="card-body">
              {cartLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  Memuat detail transaksi...
                </div>
              ) : listCart.length > 0 ? (
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
                            Harga Satuan
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
                                    <i
                                      className="bi bi-capsule text-muted"
                                      style={{ fontSize: "1.5rem" }}
                                    ></i>
                                  </div>
                                )}
                                <div>
                                  <h6
                                    className="mb-0"
                                    style={{ color: "#0B3F7E" }}
                                  >
                                    {item.name}
                                  </h6>
                                  {item.description && (
                                    <small className="text-muted d-block">
                                      {item.description}
                                    </small>
                                  )}
                                  <small className="text-muted">
                                    ID Produk: {item.productId}
                                  </small>
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
                              {(
                                item.subtotal || item.price * item.qty
                              ).toLocaleString("id-ID")}
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
                      Pilih Kurir Pengiriman
                    </h6>
                    <div className="row g-3">
                      {courierOptions.map((courier) => (
                        <div className="col-md-6" key={courier.name}>
                          <div
                            className={`card h-100 cursor-pointer ${
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
                                  style={{ borderColor: "#325A89" }}
                                />
                                <label
                                  className="form-check-label fw-bold"
                                  htmlFor={`courier-${courier.name}`}
                                  style={{ color: "#0B3F7E" }}
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
                            style={{ borderColor: "#325A89" }}
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
                    Tambahkan produk ke keranjang untuk melanjutkan checkout
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
                        {selectedCourier}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#325A89" }}>PPN</span>
                      <span className="fw-medium" style={{ color: "#0B3F7E" }}>
                        Rp {totalPpn.toLocaleString("id-ID")}
                      </span>
                    </div>

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
                    <small className="text-muted d-block mt-1">
                      *Termasuk biaya pengiriman
                    </small>
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
                  borderColor: "#F6921E",
                  color: "white",
                  padding: "12px",
                  fontSize: "1.1rem",
                }}
              >
                {processing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Memproses Checkout...
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

              {/* Info */}
              <div className="alert alert-info mt-3 mb-0" role="alert">
                <div className="d-flex">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>
                    Dengan menekan tombol "Bayar Sekarang", Anda menyetujui{" "}
                    <a href="/terms" style={{ color: "#0B3F7E" }}>
                      Syarat dan Ketentuan
                    </a>{" "}
                    kami.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Box */}
          <div
            className="card border-0 shadow-sm mt-3"
            style={{ backgroundColor: "#F8F9FA" }}
          >
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: "#0B3F7E" }}>
                <i className="bi bi-shield-check me-2"></i>
                Keamanan & Garansi
              </h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  <small>Garansi produk 100% original</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && <div className="modal-backdrop fade show"></div>}

      {showAddressForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div
                className="modal-header"
                style={{ backgroundColor: "#0B3F7E", color: "white" }}
              >
                <h5 className="modal-title">
                  <i className="bi bi-geo-alt me-2"></i>
                  {isEditing ? "Edit Alamat" : "Tambah Alamat Baru"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddressForm(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Label Alamat</label>
                    <select
                      name="label"
                      className="form-select"
                      value={addressForm.label}
                      onChange={handleFormChange}
                      style={{ borderColor: "#325A89" }}
                    >
                      <option value="Rumah">🏠 Rumah</option>
                      <option value="Kantor">🏢 Kantor</option>
                      <option value="Kos">🏘️ Kos</option>
                      <option value="Lainnya">📍 Lainnya</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Nama Penerima *
                    </label>
                    <input
                      type="text"
                      name="receiver"
                      className="form-control"
                      placeholder="Nama lengkap penerima"
                      value={addressForm.receiver}
                      onChange={handleFormChange}
                      style={{ borderColor: "#325A89" }}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="0812-3456-7890"
                      value={addressForm.phone}
                      onChange={handleFormChange}
                      style={{ borderColor: "#325A89" }}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Kota *</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      placeholder="Jakarta"
                      value={addressForm.city}
                      onChange={handleFormChange}
                      style={{ borderColor: "#325A89" }}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      name="fullAddress"
                      className="form-control"
                      rows="3"
                      placeholder="Jl. Contoh No. 123, RT 01/RW 02, Kelurahan, Kecamatan..."
                      value={addressForm.fullAddress}
                      onChange={handleFormChange}
                      style={{ borderColor: "#325A89" }}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Provinsi *</label>
                    <input
                      type="text"
                      name="province"
                      className="form-control"
                      placeholder="DKI Jakarta"
                      value={addressForm.province}
                      onChange={handleFormChange}
                      style={{ borderColor: "#325A89" }}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Kode Pos</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-control"
                      placeholder="12345"
                      value={addressForm.postalCode}
                      onChange={handleFormChange}
                      style={{ borderColor: "#325A89" }}
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
                        style={{ borderColor: "#325A89" }}
                      />
                      <label className="form-check-label fw-medium">
                        Jadikan alamat utama
                      </label>
                      <small className="text-muted d-block">
                        {addresses.length === 0
                          ? "Alamat pertama akan otomatis menjadi alamat utama"
                          : "Centang untuk menjadikan alamat ini sebagai alamat utama pengiriman"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddressForm(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleSubmitAddress}
                  style={{
                    backgroundColor: "#F6921E",
                    borderColor: "#F6921E",
                    color: "white",
                  }}
                >
                  <i className="bi bi-save me-2"></i>
                  {isEditing ? "Update Alamat" : "Simpan Alamat"}
                </button>
              </div>
              <div className="alert alert-info mt-3 mb-0" role="alert">
                <div className="d-flex">
                  <i className="bi bi-info-circle me-2"></i>
                  <div>
                    {listCart.length > 0 && (
                      <div className="mt-1">
                        <small>
                          <i className="bi bi-clock-history me-1"></i>
                          Order akan diproses dalam 1x24 jam setelah pembayaran
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
