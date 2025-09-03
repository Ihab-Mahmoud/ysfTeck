// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // React Router importları
import FormComponent from "./components/FormComponent";
import AdminPanel from "./components/AdminPanel";
import { v4 as uuidv4 } from "uuid";
import Navbar from "./components/navbar";
import MainChat from "./components/MainChat";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home.jsx"
import Error from "./pages/Error.jsx"
import Dashboard from "./pages/dashboard.jsx";
import ErrorElement from "./components/ErrorElement.jsx";
import "./index.css"
import KVKK from "./pages/KVKK.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
        children: [
          {
            index: true,
            element: <KVKK />,
            errorElement: <ErrorElement />,
          },
          {
            path: "main-chat",
            element:<ProtectedRoute>
            <MainChat />
            </ProtectedRoute>,
            errorElement: <ErrorElement />,
          },
        ],
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;

