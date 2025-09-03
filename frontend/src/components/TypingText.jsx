import React, { useState, useEffect } from "react";

const TypingText = () => {
   const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <p style={{ 
      width: "50px" ,
      height:"20px"
    }}>{dots}</p>;
};

export default TypingText;
