// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import FormComponent from "./FormComponent";
import { v4 as uuidv4 } from "uuid";
import { FaArrowRight } from "react-icons/fa";

const MainChat = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showForm, setShowForm] = useState(false); // Bu state sadece formun gösterilip gizlenmesi için kalacak
  const [suggestedProgram, setSuggestedProgram] = useState("");
  const [currentChatSessionId, setCurrentChatSessionId] = useState(() =>
    uuidv4()
  );

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

  // Uygulama yüklendiğinde veya sohbet oturumu değiştiğinde çalışır
  useEffect(() => {
    // Sohbet geçmişi boşsa (yani yeni bir oturum başlıyorsa)
    // ve geçerli bir oturum ID'si varsa, asistanın ilk mesajını ekle.
    if (chat.length === 0 && currentChatSessionId) {
      setChat([
        {
          role: "assistant",
          text: "Merhaba, ben ysfTech Asistan. Size nasıl yardımcı olabilirim?",
        },
      ]);
    }
  }, [currentChatSessionId, chat.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setChat([...chat, { role: "user", text: input }]);
    setInput("");
    setIsTyping(true);
    setSuggestedProgram("");

    try {
      const res = await fetch("http://localhost:5001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          chatSessionId: currentChatSessionId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Bilinmeyen hata");
      }

      const data = await res.json();
      const assistantResponse = data.response;

      const programMatch = assistantResponse.match(
        /TÜBİTAK\s*(\d{3,4}(?:-\w)?(?:-\w)?)\s*(-|\s|$)/i
      );
      if (programMatch && programMatch[1]) {
        setSuggestedProgram(`TÜBİTAK ${programMatch[1].trim()}`);
      } else {
        setSuggestedProgram("Bir TÜBİTAK Destek Programı");
      }

      setChat((prev) => [
        ...prev,
        { role: "assistant", text: assistantResponse },
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
      {showForm ? (
        <FormComponent
          onFormSubmit={handleFormSubmitCallback}
          onBackToChat={handleBackToChat}
          formData={formData}
          setFormData={setFormData}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          chatSessionId={currentChatSessionId}
        />
      ) : (
        // Sohbet ekranı
        <>
          <div className="chat-box">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "user" ? "message-user" : "message-assistant"
                }
              >
                {msg.text}
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
                <p>...</p>
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
        </>
      )}
    </div>
  );
};
export default MainChat;
