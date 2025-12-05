import { useState } from "react";
import { UserIcon } from "../Icons";
import "../../styling/Modal.css";

function UserModal() {
  const [userModal, setUserModal] = useState(false);

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
            <p>Sign In</p> <br />
            <p>Sign Up</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserModal;
