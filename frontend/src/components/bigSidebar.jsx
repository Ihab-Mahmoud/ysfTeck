import Wrapper from "../assets/BigSidebar.js";
import React, { useCallback, useContext, useEffect, useState } from "react";
import AdminPanel from "./AdminPanel.jsx";
import { NavLink, useOutletContext } from "react-router-dom";
import { useGlobal } from "../utils/global-context.jsx";
const BigSidebar = ({ toggleSidebar, showSidebar, user, logoutUser,setShowSidebar }) => {
      const { userType, setUserType, showDirectForm, setShowDirectForm } = useGlobal();

    

  return (
    <Wrapper>
      <div
        className={
          showSidebar ? "sidebar-container" : "sidebar-container show-sidebar"
        }
      >
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
    onClick={() => setShowDirectForm(true)}
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
    </Wrapper>
  );
};

export default BigSidebar;
