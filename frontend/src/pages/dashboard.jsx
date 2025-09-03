import React,{ useCallback, useEffect, useState } from "react";
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import Wrapper from "../assets/Dashboard.js";

import  BigSidebar  from "../components/bigSidebar.jsx"
import SmallSidebar from "../components/smallSidebar.jsx";
import Loading from "../components/Lodaing.jsx";
import Navbar from "../components/navbar.jsx";






const Dashboard = () => {
  const isLoading = useNavigation.state === "loading";
  const [showSidebar, setShowSidebar] = useState(true);

  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };


  return (
    <Wrapper>
      <main className="dashboard font-popping">
        <BigSidebar
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
        />
        <SmallSidebar
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
        />
        <div>
          <div className="z-50 top-0 sticky">
            <Navbar
              toggleSidebar={toggleSidebar}
            />
          </div>
          <div className="dashboard-page font-popping flex items-center justify-center  ">
            {isLoading ? <Loading /> : <Outlet  />}
          </div>
        </div>
      </main>
    </Wrapper>
  );
};

export default Dashboard;
