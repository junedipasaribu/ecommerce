import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import EditUserRoles from "./pages/EditUserRoles";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import Shipping from "./pages/Shipping";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* LOGIN / REGISTER PAGES */}
          <Route path="/login" element={<Login />} />

          {/* MAIN APP LAYOUT - protected */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            {/* <Route path="categories" element={<Categories />} /> */}
            <Route path="orders" element={<Orders />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="users" element={<Users />} />
            <Route path="/users/roles" element={<EditUserRoles />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
