import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { useState } from "react";

function MainLayout() {
  const [searchTerm, setSearchTerm] = useState(false);
  return (
    <>
      <div className="main-layout">
        <Navbar setSearchTerm={setSearchTerm} />

        <main className="main-content">
          <Outlet context={{ searchTerm }} />
        </main>
        <footer className="main-footer">
          <Footer />
        </footer>
      </div>
    </>
  );
}

export default MainLayout;
