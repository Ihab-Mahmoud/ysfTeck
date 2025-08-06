import Wrapper from "../assets/BigSidebar.js";
import React, { useCallback, useEffect, useState } from "react";
import AdminPanel from "./AdminPanel.jsx";

const BigSidebar = ({ toggleSidebar, showSidebar, user, logoutUser }) => {
  return (
    <Wrapper>
      <div
        className={
          showSidebar ? "sidebar-container" : "sidebar-container show-sidebar"
        }
      >
      <AdminPanel/>
      </div>
    </Wrapper>
  );
};

export default BigSidebar;
