import { useState } from "react";
import { CartIcon } from "../Icons";
import "../../styling/Modal.css";

function CartModal() {
  const [cartModal, setCartModal] = useState(false);

  return (
    <div
      className="position-relative"
      onMouseEnter={() => setCartModal(true)}
      onMouseLeave={() => setCartModal(false)}
    >
      <CartIcon />

      {cartModal && (
        <div className="custom-modal shadow">
          <div className="p-3">
            <h5 className="mb-3">Keranjang Belanja</h5>
            <p>Belum ada barang dalam keranjang.</p>
            <button className="btn btn-primary w-100 mt-2">
              Lihat Keranjang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartModal;
