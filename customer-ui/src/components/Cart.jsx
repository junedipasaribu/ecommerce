import "../styling/Cart.css";
import { Products } from "./test/SampleJual.jsx";
import { useState } from "react";

function Cart() {
  const [listCart, setListCart] = useState(Products);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckbox = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(listCart.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSingle = (id) => {
    setListCart(listCart.filter((item) => item.id !== id));
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
  };

  const grandTotal = listCart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  return (
    <div className="container-fluid">
      <table className="table">
        <thead className="thead">
          <tr>
            <th className="text-center">
              <input
                type="checkbox"
                checked={
                  selectedItems.length === listCart.length &&
                  listCart.length > 0
                }
                onChange={handleSelectAll}
              />
            </th>
            <th className="text-center">Produk</th>
            <th className="text-center">Harga Satuan</th>
            <th className="text-center">Kuantitas</th>
            <th className="text-center">Total Harga</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>

        <tbody className="text-center">
          {listCart.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleCheckbox(item.id)}
                />
              </td>
              <td>{item.name}</td>
              <td>Rp.{item.price.toLocaleString()}</td>
              <td>{item.qty}</td>
              <td>Rp.{(item.price * item.qty).toLocaleString("id-ID")}</td>
              <td>
                <button
                  className="btn btn-text"
                  onClick={() => handleDeleteSingle(item.id)}
                  style={{ color: "#F6921E" }}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="4" className="text-end fw-bold">
              GRAND TOTAL
            </td>
            <td className="fw-bold">Rp.{grandTotal.toLocaleString("id-ID")}</td>
            <td>
              <button
                className="btn btn-light"
                style={{ background: "#f6921e", color: "white" }}
              >
                Checkout
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Cart;
