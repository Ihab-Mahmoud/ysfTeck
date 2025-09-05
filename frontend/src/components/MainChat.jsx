// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import FormComponent from "./FormComponent";
import { v4 as uuidv4 } from "uuid";
import { FaArrowRight } from "react-icons/fa";
import TypingText from "./TypingText";
import { marked } from "marked";
import { useGlobal } from "../utils/global-context";

const MainChat = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showForm, setShowForm] = useState(false); // Bu state sadece formun gösterilip gizlenmesi için kalacak
  const [suggestedProgram, setSuggestedProgram] = useState(null);
  const [currentChatSessionId, setCurrentChatSessionId] = useState(() =>
    uuidv4()
  );
  const ref = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    educationStatus: "",
    profession: "",
    nationality: "",
    supportProgram: "",
  });
  const [dateOfBirth, setDateOfBirth] = useState("");
  const {userType}= useGlobal()
  console.log(userType)
useEffect(() => {
  if (ref.current) {
    ref.current.scrollTop = ref.current.scrollHeight;
  }
}, [chat]);
  // Uygulama yüklendiğinde veya sohbet oturumu değiştiğinde çalışır
  useEffect(() => {
    // Sohbet geçmişi boşsa (yani yeni bir oturum başlıyorsa)
    // ve geçerli bir oturum ID'si varsa, asistanın ilk mesajını ekle.
    if (chat.length === 0 && currentChatSessionId) {
      setChat([
        {
          role: "assistant",
          text: `Merhaba! 👋 Ben TÜBİ. TÜBİTAK destek programları konusunda sana yardımcı olmak için buradayım. İstersen hayallerini kolaylaştırmak için sana uygun TÜBİTAK programlarını bulabiliriz.
          
Sana hitap edebilmek için ismini öğrenebilir miyim?`,
        },
      ]);
    }
  }, [currentChatSessionId, chat.length]);

const sendMessage = async (opt) => {
    
const message = typeof opt === "string" ? opt : input;
  if (!message) return;

  setChat((prev) => [...prev, { role: "user", text: message }]);
  setInput("");
  setIsTyping(true);
  setSuggestedProgram("");

  try {
    const res = await fetch("http://localhost:5001/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: message,   // ✅ send message, not just input
        chatSessionId: currentChatSessionId,
        userType: userType,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Bilinmeyen hata");
    }

    const data = await res.json();
    const assistantResponse = data.response;

    if (data.programId) {
      setSuggestedProgram(`TÜBİTAK ${data.programId}`);
    } else {
      setSuggestedProgram(null);
    }

    setChat((prev) => [
      ...prev,
      {
        role: "assistant",
        text: assistantResponse,
        hasProgram: data.hasProgram,
        options: data.options || [], // ✅ keep options
      },
    ]);
  } catch (err) {
    setChat((prev) => [
      ...prev,
      { role: "assistant", text: `Bir hata oluştu: ${err.message}` },
    ]);
  } finally {
    setIsTyping(false);
  }
};


  const handleShowForm = () => {
    setFormData((prev) => ({ ...prev, supportProgram: suggestedProgram }));
    setShowForm(true);
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
    setShowForm(false);
    setSuggestedProgram("");
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      educationStatus: "",
      profession: "",
      nationality: "",
      supportProgram: "",
    });
    setDateOfBirth("");
    setCurrentChatSessionId(uuidv4()); // Yeni bir sohbet oturumu başlat
  };

  const handleBackToChat = () => {
    setShowForm(false);
    setSuggestedProgram("");
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      educationStatus: "",
      profession: "",
      nationality: "",
      supportProgram: "",
    });
    setDateOfBirth("");
    setChat([]); // Sohbet geçmişini sıfırla
    setCurrentChatSessionId(uuidv4()); // Yeni bir session ID ver
  };


  return (
    <div className="container">
          <div className="chat-box" ref={ref}>
          {chat?.map((msg, i) => (
  <div
    key={i}
    className={
      msg.role === "user" ? "message-user" : "message-assistant"
    }
  >
    {
      msg.role === "user" ? 
        <>{msg.text}</>
      : 
        <div
          style={{ whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{ __html: marked(msg.text) }} 
        />
    }
      {msg.options && msg.options.length > 0 && (
          <div className="options-list">
            {msg?.options?.map((opt, idx) => (
              <button
                key={idx}
                className="option-btn"
                onClick={() => sendMessage(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
    {msg.role === "assistant" &&
      !showForm &&
      suggestedProgram &&
      i === chat.length - 1 && (
        <button onClick={handleShowForm} className="form-button">
          {suggestedProgram} için Form Doldur
        </button>
      )}
  </div>
))}
            {isTyping && (
              <div className="message-assistant">
                <TypingText/>
              </div>
            )}
          </div>
        
          <div>
            <div className="input-section">
              <input
                className="input-cus "
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Bir şey yaz..."
              />
                <button className="sub-btn2" onClick={sendMessage}>
                <FaArrowRight className="text-black text-lg" />
              </button>
            </div>
          </div>
          <FormComponent  
            onFormSubmit={handleFormSubmitCallback}
            onBackToChat={handleBackToChat}
            formData={formData}
            setFormData={setFormData}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            chatSessionId={currentChatSessionId}
            showForm={showForm}
            setShowForm={setShowForm}/> 
    </div>
  );
};
export default MainChat;
