import "./App.css";
import MainLayout from "./layouts/MainLayout";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPageUser";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./components/Checkout";

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
