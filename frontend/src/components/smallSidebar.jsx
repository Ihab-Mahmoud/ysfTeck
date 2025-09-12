import Wrapper from "../assets/SmallSidebar.js";
import { FaTimes } from "react-icons/fa";
import Logo from "./Logo.jsx"
import React, { useCallback, useEffect, useState } from "react";
import AdminPanel from "./AdminPanel.jsx";
import { useGlobal } from "../utils/global-context.jsx";
import { NavLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const SmallSidebar = ({ showSidebar, toggleSidebar, user, logoutUser,setShowSidebar }) => {
        const { userType, setUserType, showDirectForm, setShowDirectForm } = useGlobal();
  
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
            <div className="admin-container">
      <NavLink
      onClick={()=>{setShowSidebar(true)}}
        to="/"
        style={{
          padding: "10px 16px",
          marginRight: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          backgroundColor: "rgb(45 43 43)",
          color: "#fff",
          cursor: "pointer",
          textDecoration:"none",
          textAlign:"center",
          width:"80%",
          fontFamily:"sans-serif"
        }}
      >
        Başa Dön

      </NavLink>

      <NavLink
      onClick={()=>{setShowDirectForm(true)
      }}
        style={{
          padding: "10px 16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          backgroundColor: "rgb(45 43 43)",
          color: "#fff",
          cursor: "pointer",
          textDecoration:"none",
          textAlign:"center",
          width:"80%",
          fontFamily:"sans-serif"
        }}
      >
        Destek Bilgi Talep Formu
      </NavLink>
        </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default SmallSidebar;
