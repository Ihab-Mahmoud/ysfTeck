// GlobalContext.js
import React, { createContext, useContext, useState } from "react";

// Create context
const GlobalContext = createContext();

// Create provider component
export const GlobalProvider = ({ children }) => {
  const [userType,setUserType]=useState("")
  const [showDirectForm, setShowDirectForm] = useState(false); 
  const [showSelectPrg,setShowSelectPrg]=useState(false)
  const [chat, setChat] = useState([]);
  const [showNot,setShowNot]=useState(false)
  return (
    <GlobalContext.Provider value={{ userType, setUserType,showDirectForm,setShowDirectForm,showSelectPrg,setShowSelectPrg,setChat,chat,showNot,setShowNot }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook for easier usage
// eslint-disable-next-line react-refresh/only-export-components
export const useGlobal = () => useContext(GlobalContext);
