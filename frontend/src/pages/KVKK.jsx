import React from 'react'
import { useState, useRef, useEffect } from "react";
import { useNavigate, useNavigation } from 'react-router-dom';

const KVKK = () => {
  const [accepted, setAccepted] = useState(false);
  const [canCheck, setCanCheck] = useState(false);
  const navigate = useNavigate()
  const textRef = useRef();

  // Check if user scrolled to bottom
  // const handleScroll = () => {
  //   const { scrollTop, scrollHeight, clientHeight } = textRef.current;
  //   if (scrollTop + clientHeight >= scrollHeight - 5) {
  //     setCanCheck(true);
  //   }
  // };

  const handleSubmit = async () => {
    if (!accepted) return;
    navigate("/user-type")
  };

 return (
  <div
    style={{
      maxWidth: "720px",
      margin: "40px auto",
      padding: "0",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        color: "#fff",
      border: "1px solid rgba(255,255,255,0.08)",
      backgroundColor:"#2d2b2bd4",
    }}
  >
    {/* Başlık şeridi */}
    <div
      style={{
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#2d2b2bd4",
        backdropFilter: "blur(4px)",
      }}
    >
      <h1
        style={{
          fontSize: "22px",
          margin: 0,
          fontWeight: 600,
          letterSpacing: "0.2px",
        }}
      >
        KVKK Aydınlatma Metni
      </h1>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
        Lütfen metni okuyup onaylayınız.
      </div>
    </div>

    {/* Kaydırılabilir içerik */}
    <div
      ref={textRef}
      // onScroll={handleScroll}
      style={{
        padding: "18px 24px",
        height: "320px",
        overflowY: "auto",
        lineHeight: "1.6",
        color: "#E5E7EB",
      }}
    >
      <p style={{ margin: 0 }}>
        {/* KVKK metniniz buraya */}
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        varius enim in eros elementum tristique. Duis cursus, mi quis viverra
        ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
        Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut
        sem vitae risus tristique posuere.
        <br />
        <br />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        varius enim in eros elementum tristique. Duis cursus, mi quis viverra
        ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
        Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut
        sem vitae risus tristique posuere.
        <br />
        <br />
        {/* ... (devamı) */}
      </p>
    </div>

    {/* Onay kutusu + buton alanı */}
    <div
      style={{
        padding: "18px 24px 24px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <label
        htmlFor="kvkkCheck"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "16px",
          cursor: "pointer",
          userSelect: "none",
          color: "#F9FAFB",
        }}
      >
        <input
          type="checkbox"
          id="kvkkCheck"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          style={{
            maxWidth: "20px",
            height: "20px",
            accentColor: "#3B82F6", // modern tarayıcılarda mavi tik
            cursor: "pointer",
            textAlign:"end"
          }}
        />
        KVKK metnini okudum ve anladım
      </label>

      <button
        onClick={handleSubmit}
        disabled={!accepted}
        style={{
          width: "100%",
          marginTop: "16px",
          padding: "12px 16px",
          fontSize: "16px",
          fontWeight: 700,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: accepted ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.1)",
          background: accepted
            ? "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)"
            : "rgba(255,255,255,0.06)",
          color: accepted ? "#fff" : "rgba(255,255,255,0.6)",
          cursor: accepted ? "pointer" : "not-allowed",
          transition: "transform 120ms ease, box-shadow 120ms ease",
          boxShadow: accepted ? "0 6px 18px rgba(37,99,235,0.35)" : "none",
        }}
        onMouseDown={(e) => {
          if (accepted) e.currentTarget.style.transform = "translateY(1px)";
        }}
        onMouseUp={(e) => {
          if (accepted) e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Devam Et
      </button>
    </div>
  </div>
);

}
export default KVKK