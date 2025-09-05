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
        border: "1px solid #ccc",
        borderRadius: "12px",
        backgroundColor: "#fff",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button
          onClick={()=>handleAccept("bireysel")}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2d2b2b",
            color: "#fff",
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          Bireysel
        </button>   

        <button
          onClick={()=>handleAccept("kurumsal")}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2d2b2b",
            color: "#fff",
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          Kurumsal
        </button>
      </div>
    </div>
  );
};

export default UserType;
