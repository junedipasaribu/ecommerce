import "./App.css";
import MainLayout from "./layouts/MainLayout";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPageUser";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import DetailItemPage from "./pages/DetailItemPage";
import DetailFilterPage from "./pages/DetailFilterPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/detailitem" element={<DetailItemPage />} />
            <Route path="/detailfilter" element={<DetailFilterPage />} />
            <Route path="/history" element={<OrderHistoryPage />} />
          </Route>

          <Route path="login" element={<LoginPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
