import "../Index.css";
import Checkout from "../components/Checkout.jsx";

function CheckoutPage() {
  return (
    <>
      <div className="landing-page-wrapper">
        <div className="cart-full-grid">
          <Checkout />
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;
