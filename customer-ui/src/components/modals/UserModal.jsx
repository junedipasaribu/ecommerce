import { useState } from "react";
import { UserIcon } from "../Icons";
import "../../styling/Modal.css";
import { useNavigate } from "react-router-dom";

function UserModal() {
  const [userModal, setUserModal] = useState(false);
  const navigate = useNavigate();
  const goTologin = () => {
    navigate("login");
  };
  const goToReg = () => {
    navigate("/register");
  };

  return (
    <div
      className="position-relative"
      onMouseEnter={() => setUserModal(true)}
      onMouseLeave={() => setUserModal(false)}
    >
      <UserIcon />

      {userModal && (
        <div className="custom-modal shadow">
          <div className="p-3">
            <button
              className="btn btn-link text-decoration-none"
              onClick={goTologin}
              style={{ color: "#325A89" }}
            >
              Sign In
            </button>{" "}
            <br />
            <button
              className="btn btn-link text-decoration-none"
              onClick={goToReg}
              style={{ color: "#325A89" }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserModal;
