import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "../utils/global-context";

const UserType = () => {
  const navigate = useNavigate();   

  const handleAccept = (type) => {
    setUserType(type)
    console.log(type);
    setChat([])
    navigate("/main-chat");
  };
      const {setUserType, showDirectForm, setShowDirectForm,showSelectPrg,setShowSelectPrg,setChat,chat  } = useGlobal();


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
  <h3 style={{ color: "#fff", fontSize: "30px",fontWeight: "bolder"}}>DESTEK TÜRÜNÜ SEÇİN</h3>
  
  <div className="gap" style={{ display: "flex", justifyContent: "center", gap: "70px" }}>
    <button
      onClick={() => handleAccept("bireysel")}
      style={{
        flex: 1,
        padding: "12px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <img
        className="image"
        src="/Destek Türü İkonları/Bireysel-Aktif.png"
        alt="Bireysel"
        style={{ width: "120px", display: "block", margin: "0 auto" }}
      />
    </button>

    <button
      onClick={() => handleAccept("kurumsal")}
      style={{
        flex: 1,
        padding: "12px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <img
        className="image"
        src="/Destek Türü İkonları/Kurumsal-Aktif.png"
        alt="Kurumsal"
        style={{ width: "120px", display: "block", margin: "0 auto" }}
      />
    </button>
  </div>
</div>

    </div>
  );
};

export default UserType;
