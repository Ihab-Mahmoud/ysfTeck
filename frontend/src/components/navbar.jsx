import React from "react"
import { FaAlignLeft } from "react-icons/fa";
// import { FaUserCircle, FaCaretDown } from "react-icons/fa";
import { FaRegQuestionCircle } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import Wrapper from "../assets/Navbar.js";
import Logo from "../components/Logo.jsx";
const Navbar = ({ toggleSidebar }) => {
  return (
    <Wrapper>
      <div className="nav-center">
        <button className="toggle-btn" type="button" onClick={toggleSidebar}>
          <FaAlignLeft />
        </button>
        <div>
          <NavLink to="/">
            <Logo className="logo" />
          </NavLink>
        </div>
        <div className="btn-container">
          <FaRegQuestionCircle />
        </div>
      </div>
    </Wrapper>
  );
};

export default Navbar;
