// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import FormComponent from "./FormComponent";
import { v4 as uuidv4 } from "uuid";
import { FaArrowRight } from "react-icons/fa";
import TypingText from "./TypingText";
import { marked } from "marked";
import { useGlobal } from "../utils/global-context";
import { useOutletContext } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

const MainChat = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showForm, setShowForm] = useState(false); // Bu state sadece formun gösterilip gizlenmesi için kalacak
  const [suggestedProgram, setSuggestedProgram] = useState(null);
      const {setUserType, showDirectForm, setShowDirectForm,showSelectPrg,setShowSelectPrg,setChat,chat,setShowNot  } = useGlobal();
  
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
          text: `Merhaba! 👋 Ben TÜBİ. TÜBİTAK destek programları konusunda size yardımcı olmak için buradayım. İsterseniz hayallerinizi kolaylaştırmak için size uygun TÜBİTAK programlarını bulabilirim.

          
Size hitap edebilmek için isminizi öğrenebilir miyim?`,
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
        prompt: message,   //  send message, not just input
        chatSessionId: currentChatSessionId,
        userType: userType,
      }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Bilinmeyen hata");
    }

    const data = await res.json();
    console.log(data);
    const assistantResponse = data.response;

    if (data.programId) {
      setSuggestedProgram(`${data.programId}`);
    } else {
      setSuggestedProgram(null);
    }

    setChat((prev) => [
      ...prev,
      {
        role: "assistant",
        text: assistantResponse,
        hasProgram: data.hasProgram,
        options: data.options || [],
        recommended:data.recommended
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
  function clean(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

  function truncate(s, n = 200) { s = clean(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

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
  msg.role === "user" ? (
    <>{msg.text}</>
  ) : (
    // Assistant messages
    msg?.recommended && Array.isArray(msg.recommended) ? (
      <div className="assistant-block">
        <p>Profilinize göre öne çıkan programlar:</p>

        {msg.recommended.length === 0 ? (
          <p>- Uygun program bulunamadı. Profili biraz daha detaylandırabilirsiniz.</p>
        ) : (
          <div className="program-list">
            {msg.recommended.map((p) => (
              <div className="program-item" key={p.name}>
                <div className="program-text">
                  <div className="program-name"><strong>{p.name}</strong></div>
                  {p.targetAudience && (
                    <div className="program-audience">
                      • Hedef Kitlesi: {truncate(p.targetAudience, 180)}
                    </div>
                  )}
                  <button

                  className="program-id-btn"
                  title={p.targetAudience || ""}
                  onClick={() => sendMessage(p.name + " nedir ?")}
                >
                  {"Detayli bilgi"}
                </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {msg.recommended[0]?.id && (
          <p style={{ marginTop: 16 }}>
            Bir programı seçerseniz destek programı numarasını (örn.{" "}
            <strong>{msg.recommended[0].id}</strong>) veya adını yazarak detay
            sorabilirsiniz.
          </p>
        )}
      </div>
    ) : (
      // Fallback: no structured recommended data → render the raw markdown/text
      <div
        style={{ whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: marked(msg.text || "") }}
      />
    )
  )
}

      {msg.options && msg.options.length > 0&& i === chat?.length - 1 &&   (
  <div className="options-list">
    {msg.options.map((opt, idx) =>
        <button
        style={{backgroundColor:"#2a1a47",color:"#ffffffbd"}}
                key={idx}
                className="option-btn pointer"
                onClick={() => sendMessage(opt)}
                disabled={isTyping}
              >
                {opt}
              </button>
    )}
  </div>
)}

    {msg.role === "assistant" &&
      !showForm &&
      suggestedProgram &&
      i === chat.length - 1 && (
        <button onClick={handleShowForm} className="form-button">
          {suggestedProgram} desteği için bana detaylı bilgi gönder
        </button>
      )}
  </div>
))}
            {isTyping && (
              <div className="message-assistant">
                <TypingText suggestedProgram={suggestedProgram}/>
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
                <IoIosArrowForward className="text-black text-lg" />
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
            setShowForm={setShowForm}
            setShowNot={setShowNot}
            /> 
    </div>
  );
};
export default MainChat;
