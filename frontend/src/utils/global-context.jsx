// GlobalContext.js
import React, { createContext, useContext, useState } from "react";

// Create context
const GlobalContext = createContext();

// Create provider component
export const GlobalProvider = ({ children }) => {
  const [userType,setUserType]=useState("")

  return (
    <GlobalContext.Provider value={{ userType, setUserType }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook for easier usage
// eslint-disable-next-line react-refresh/only-export-components
export const useGlobal = () => useContext(GlobalContext);
