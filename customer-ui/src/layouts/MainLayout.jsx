import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <div className="main-layout">
        <Navbar />

        <main className="main-content">
          <Outlet />
        </main>
        <footer className="main-footer"></footer>
      </div>
    </>
  );
}

export default MainLayout;
