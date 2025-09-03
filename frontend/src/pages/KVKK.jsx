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
    localStorage.setItem("kvkkAccepted","true")
    navigate("/main-chat")
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "40px auto",
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#fff"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>KVKK Aydınlatma Metni</h1>

      <div
        ref={textRef}
        // onScroll={handleScroll}
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
          marginBottom: "20px"
        }}
      >
        <p style={{
          lineHeight: "20px",
          
        }}>
          {/* Paste your KVKK text here */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
          <br/><br/>
          {/* Repeat text to make it scrollable */}
        </p>
      </div>

      <div style={{ marginBottom: "20px" , fontSize:"23px" }}>
        <input
          type="checkbox"
          id="kvkkCheck"
          checked={accepted}
          // disabled={!canCheck}
          onChange={(e) => setAccepted(e.target.checked)
            
          }
          style={{width:"20px"}}
        />
        <label htmlFor="kvkkCheck" style={{ marginLeft: "8px" }}>
          KVKK metnini okudum ve anladım
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!accepted}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "5px",
          border: "none",
          backgroundColor: accepted ? "#007BFF" : "#ccc",
          color: accepted ? "#fff" : "#666",
          cursor: accepted ? "pointer" : "not-allowed"
        }}
      >
        Devam Et
      </button>
    </div>
  );
}
export default KVKK