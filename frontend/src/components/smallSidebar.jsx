import Wrapper from "../assets/SmallSidebar.js";
import { FaTimes } from "react-icons/fa";
import Logo from "./Logo.jsx"
import React, { useCallback, useEffect, useState } from "react";
import AdminPanel from "./AdminPanel.jsx";
import { useGlobal } from "../utils/global-context.jsx";
import { NavLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const SmallSidebar = ({ showSidebar, toggleSidebar, user, logoutUser,setShowSidebar,setShowSelectPrg }) => {
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
    <div className="admin-container" 
     style={{
       display: "flex",
       flexDirection: "column",
       alignItems: "left",
       gap: "14px",
       padding: "60px",
       backgroundColor: "#1c1c1c",
       height: "100vh",
       color: "#fff",
       fontFamily: "sans-serif",

     }}
>
  {/* Yeniden Başla */}
  <NavLink
    onClick={() => setShowSidebar(true)}
    to="/"
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      textDecoration: "none",
      color: "#fff",
      fontSize: "18px",
      gap: "10px"
    }}
  >
    <img style={{ width: "20px" }} src="/yeniden başla.png"/>
    Yeniden Başla
  </NavLink>

  <hr style={{ width: "100%", border: "1px solid #444" }} />

  {/* Hızlı Erişim */}
  <NavLink
    onClick={() => setShowSelectPrg(true)}
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      textDecoration: "none",
      color: "#fff",
      fontSize: "18px",
      gap: "10px"
    }}
  >
    <img style={{ width: "20px" }} src="/hızlı erişim.png"/>
    Hızlı Erişim
  </NavLink>
</div>
        </div>
      </div>
    </Wrapper>
  );
};

export default SmallSidebar;
