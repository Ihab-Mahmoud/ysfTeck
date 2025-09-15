import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import programs from "../utils/programs.json"; // <- JSON import


const SelectPrg = ({ setFormData, showSelectPrg, setShowSelectPrg ,setShowForm}) => {
  const [selectedProgram, setSelectedProgram] = useState("");

  const handleChange = (e) => {
     const program = programs.find((p) => p.programName === e.target.value);
    setSelectedProgram(program);
    setFormData((prev) => ({ ...prev, supportProgram: program?.programName || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProgram) return;
    // Submit logic (parent handles it)
    setShowSelectPrg(false);
  };

  if (!showSelectPrg) return null;

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
          maxWidth: "700px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: "14px",
          padding: "32px",
          position: "relative",
          boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowSelectPrg(false)}
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

        {/* Title */}
        <h2
          style={{
            marginTop: 0,
            marginBottom: "24px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#f3f4f6",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "12px",
          }}
        >
          Hızlı Erişim
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Select Dropdown */}
          <select
            name="supportProgram"
            onChange={handleChange}
            value={selectedProgram.programName     }
            required
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "#2b2b2b",
              color: "#fff",
            }}
          >
            <option value="">- Program Seçin -</option>
            {programs.map((opt, idx) => (
              <option key={idx} value={opt.programName}>
                {opt.programName}
              </option>
            ))}
          </select>

      {/* Program Bilgileri */}
          <textarea
            readOnly
            value={
              selectedProgram
                ? `Amaç: ${selectedProgram.supportPurpose}\n\nDestek Miktarı: ${selectedProgram.supportAmount}`
                : "Lütfen bilgi almak istediğiniz programı seçin"
            }
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "#2b2b2b",
              color: "#fff",
              minHeight: "120px",
              fontSize:"15px",
            }}
          />

          {/* Action Buttons */}
         
              <div className="flex justify-center">
                        <div className="input-section2">
                          <button onClick={()=>{setShowSelectPrg(false);setShowForm(true)}}
                            disabled={!selectedProgram} className="sub-btn" type="submit">
                            E-posts ile gönder
                            <FaArrowRight className="arr-spec text-black text-lg" />
                          </button>
                        </div>
                      </div>
        </form>
      </div>
    </div>
  );
};

export default SelectPrg;