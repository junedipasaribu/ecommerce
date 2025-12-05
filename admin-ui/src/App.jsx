import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import EditUserRoles from "./pages/EditUserRoles";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN PAGE */}
        <Route path="/login" element={<Login />} />

        {/* MAIN APP LAYOUT */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="users" element={<Users />} />
          <Route path="/users/roles" element={<EditUserRoles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
