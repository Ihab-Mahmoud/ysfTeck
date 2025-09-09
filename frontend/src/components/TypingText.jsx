import React, { useState, useEffect } from "react";

const TypingText = ({suggestedProgram}) => {
   const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, []);


  return (
    <p
        style={{
    width: "calc(fit-content)",
    height: "calc(fit-content)",
  }}
    >
      Sizin için en uygun sonuçları arıyorum. Lütfen bekleyiniz{" "}{dots}
    </p>
  );

  
};

export default TypingText;
