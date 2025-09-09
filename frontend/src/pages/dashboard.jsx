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
import { useGlobal } from "../utils/global-context.jsx";
import FormComponent from "../components/FormComponent.jsx";






const Dashboard = () => {
  const isLoading = useNavigation.state === "loading";
  const [showSidebar, setShowSidebar] = useState(true);

    const {setUserType, showDirectForm, setShowDirectForm } = useGlobal();
    const [formData, setFormData] = useState({
      fullName: "",
      phoneNumber: "",
      email: "",
      educationStatus: "",
      profession: "",
      nationality: "",
      supportProgram: "",
      dateOfBirth:""
    });
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
   const handleFormSubmitCallback = (success) => {
    if (success) {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Formunuz başarıyla gönderildi! TÜBİTAK tarafından programla ilgili detaylı bilgi içeren bir e-posta tarafınıza gönderilecektir.",
        },
      ]);
    } else {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Form gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.",
        },
      ]);
    }
    setShowDirectForm(false);
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      educationStatus: "",
      profession: "",
      nationality: "",
      supportProgram: "",
      dateOfBirth:""
    });
    setCurrentChatSessionId(uuidv4()); // Yeni bir sohbet oturumu başlat
  };
  const handleBackToChat = () => {
    setShowDirectForm(false);
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      educationStatus: "",
      profession: "",
      nationality: "",
      supportProgram: "",
      dateOfBirth:""
    });
    setChat([]); // Sohbet geçmişini sıfırla
    setCurrentChatSessionId(uuidv4()); // Yeni bir session ID ver
  };

  return (
    <Wrapper>
      <main className="dashboard font-popping">
        <BigSidebar
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <SmallSidebar
          toggleSidebar={toggleSidebar}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}

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

        <FormComponent  
            onFormSubmit={handleFormSubmitCallback}
            onBackToChat={handleBackToChat}
            formData={formData}
            setFormData={setFormData}
            showForm={showDirectForm}
            setShowForm={setShowDirectForm}/> 
      </main>

    </Wrapper>
  );
};

export default Dashboard;
