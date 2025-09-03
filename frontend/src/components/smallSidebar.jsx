import Wrapper from "../assets/SmallSidebar.js";
import { FaTimes } from "react-icons/fa";
import Logo from "./Logo.jsx"
import React, { useCallback, useEffect, useState } from "react";
import AdminPanel from "./AdminPanel.jsx";

// eslint-disable-next-line react/prop-types
const SmallSidebar = ({ showSidebar, toggleSidebar, user, logoutUser }) => {
  return (
    <Wrapper>
      <div
        className={
          showSidebar ? "sidebar-container " : "sidebar-container show-sidebar"
        }
      >
        <div className="content">
          <div className=" header-holder">
            <button className="close-btn" onClick={toggleSidebar}>
              <FaTimes />
            </button>
            <Logo />
          </div>
          <AdminPanel />
        </div>
      </div>
    </Wrapper>
  );
};

export default SmallSidebar;
