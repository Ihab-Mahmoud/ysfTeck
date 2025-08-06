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
''
// Sohbet ve Form mantığını içeren yeni bileşen


// Ana App bileşeni, yönlendirmeyi yönetir
// function App() {
//   return (
//     <Router>
//       <Navbar/>
//       <Routes>
//         <Route path="/" element={<MainChat />} />{" "}
//         {/* Ana sohbet ve form sayfası */}
//         <Route
//           path="/admin"
//           element={<AdminPanel onBackToChat={() => window.history.back()} />} // Admin paneli
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



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
            element: <MainChat />,
            // action: addjobSubmit(queryClient),
            errorElement: <ErrorElement />,
          },
          // {
          //   path: "help",
          //   element: <Help />,
          //   // loader: StatsLoader(queryClient),
          //   errorElement: <ErrorElement />,
          // },
        ],
      },
    ],
  },
]);

// const App = () => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <RouterProvider router={router} />
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   );
// };

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;

