import React from 'react'
import { useNavigate } from 'react-router-dom';

const Notification = ({showNot,setShowNot}) => 
    {
        const navigate=useNavigate()

        if (!showNot) {
            return null
        }
   return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          background: "#1f1f1f",
          color: "#e5e7eb",
          maxWidth: "500px",
          width: "90%",
          borderRadius: "14px",
          padding: "32px",
          position: "relative",
          textAlign: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={()=>{
            setShowNot(false );
            navigate("/");
        }}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            border: "none",
            background: "transparent",
            fontSize: "28px",
            cursor: "pointer",
            color: "#9ca3af",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
        >
          ✕
        </button>

        {/* Image */}
        <img
          src="/onay.png" // change to your own image path
          alt="Notification"
          style={{ width: "100px", margin: "0 auto 20px", display: "block" }}
        />

        {/* Text */}
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#f3f4f6",
            marginBottom: "12px",
          }}
        >
          Başarılı 🎉
        </h3>
        <p style={{ fontSize: "16px", color: "#d1d5db" }}>
          Detaylı bilgiler e-posta adresinize yönlendirilmiştir.
        </p>
      </div>
    </div>
  );
}

export default Notification