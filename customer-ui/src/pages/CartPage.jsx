import "../Index.css";
import CardFilter from "../components/CardFilter.jsx";
import Cart from "../components/Cart.jsx";

function CartPage() {
  return (
    <>
      <div className="landing-page-wrapper">
        <div className="cart-full-grid">
          <Cart />
        </div>
        <div>
          <div className="cardfilter-full-grid">
            <CardFilter />
          </div>
        </div>
      </div>
    </>
  );
}

export default CartPage;
