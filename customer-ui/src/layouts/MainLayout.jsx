import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <>
      <div className="main-layout">
        <Navbar />

        <main className="main-content">
          <Outlet />
        </main>
        <footer className="main-footer">
          <Footer />
        </footer>
      </div>
    </>
  );
}

export default MainLayout;
