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
    </Wrapper>
  );
};

export default BigSidebar;
