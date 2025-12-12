import { SearchIcon, Logo } from "./Icons";
import "../styling/Navbar.css";
import CartModal from "./modals/CartModal.jsx";
import UserModal from "./modals/UserModal.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [query, setQuery] = useState("");

  const goToLand = () => {
    navigate("/");
    setIsCartOpen(false);
    setIsUserOpen(false);
  };

  const handleSearchClick = () => {
    if (!query.trim()) return;
    navigate(`/detailfilter?search=${query}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <header className="navbar">
      <div className="grid-container">
        <div className="col logo">
          <Logo onClick={goToLand} />
        </div>

        <div className="col search-bar">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input"
            />
            <button className="search-button" onClick={handleSearchClick}>
              <SearchIcon />
            </button>
          </div>
        </div>

        <div className="col actions">
          <div
            className="cart-trigger"
            onMouseEnter={() => setIsCartOpen(true)}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <CartModal open={isCartOpen} setOpen={setIsCartOpen} />
          </div>

          <UserModal open={isUserOpen} setOpen={setIsUserOpen} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
