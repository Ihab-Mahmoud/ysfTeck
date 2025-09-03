import { Navigate } from "react-router-dom";
import React from "react";
const  ProtectedRoute = ({ children })=> {
  const kvkkAccepted = localStorage.getItem("kvkkAccepted") === "true"; 
  console.log(kvkkAccepted);
  
  if (!kvkkAccepted) {
    return <Navigate to="/" replace />;
  }
  return children;
}



export default ProtectedRoute