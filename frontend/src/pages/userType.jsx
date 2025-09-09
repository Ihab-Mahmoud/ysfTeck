import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../utils/global-context";

const UserType = () => {
  const navigate = useNavigate();   
  const {setUserType}= useGlobal()

  const handleAccept = (type) => {
    setUserType(type)
    console.log(type);
    
    navigate("/main-chat");
  };


  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "100px auto",
        padding: "40px",
        borderRadius: "12px",
        backgroundColor: "trasnparent",
        textAlign: "center",
      }}
    >
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "70px" }}>
  <h3 style={{ color: "#fff", fontSize: "25px" }}>DESTEK TÜRÜ</h3>
  
  <div className="gap" style={{ display: "flex", justifyContent: "center", gap: "100px" }}>
    <button
      onClick={() => handleAccept("bireysel")}
      style={{
        flex: 1,
        padding: "12px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "#2d2b2b",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <img
        className="image"
        src="/Destek Türü İkonları/Bireysel.png"
        alt="Bireysel"
        style={{ width: "150px", display: "block", margin: "0 auto" }}
      />
    </button>

    <button
      onClick={() => handleAccept("kurumsal")}
      style={{
        flex: 1,
        padding: "12px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "#2d2b2b",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <img
        className="image"
        src="/Destek Türü İkonları/Kurumsal.png"
        alt="Kurumsal"
        style={{ width: "150px", display: "block", margin: "0 auto" }}
      />
    </button>
  </div>
</div>

    </div>
  );
};

export default UserType;
