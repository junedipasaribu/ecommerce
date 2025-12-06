import { SearchIcon, Logo } from "./Icons";
import "../styling/Navbar.css";
import CartModal from "./modals/CartModal.jsx";
import UserModal from "./modals/UserModal.jsx";
import { useNavigate } from "react-router-dom";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const goToLand = () => {
    navigate("/");
  };
  const handleSearchClick = () => {
    console.log("Search clicked"); // nanti diganti trigger search
  };

  return (
    <header className="navbar">
      <div className="grid-container">
        <div className="col logo">
          <Logo />
        </div>

        <div className="col search-bar">
          <div className="search-wrapper">
            <button className="search-button" onClick={handleSearchClick}>
              <SearchIcon />
            </button>
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="col actions">
          <CartModal />
          <UserModal />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
