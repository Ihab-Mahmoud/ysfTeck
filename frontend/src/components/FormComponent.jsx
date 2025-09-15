// frontend/src/FormComponent.jsx
import React, { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useGlobal } from "../utils/global-context";
import { useNavigate } from "react-router-dom";
import programs from "../utils/programs.json"; // <- JSON import




function FormComponent({
  onFormSubmit,
  formData,
  setFormData,
  showForm,
  setShowForm,
  setShowNot,
  setShowSelectPrg
}) {
  // Prop'ları aldık

  const [showNationalityDetail, setShowNationalityDetail] = useState(false);
  const [nationalityDetail, setNationalityDetail] = useState("");
  const [formAccepted, setFormAccepted] = useState(false);
  const [popup, setPopup] = useState(false);
  const {setChat} = useGlobal();
  const navigate=useNavigate()
  // Prop olarak gelen handleChange fonksiyonunu kullanacağız
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Eğer isim 'dateOfBirth' ise özel olarak işliyoruz
      setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ----------- EK DOĞRULAMA KONTROLLERİ -----------
    // Tüm alanların dolu olup olmadığını kontrol et
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.supportProgram  
    ) {
      // dateOfBirth'i de kontrol et
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    // ----------- DOĞRULAMA BİTTİ -----------

    try {
      // YENİ: Eğer yabancı uyruk seçildiyse, nationalityDetail'ı nationality olarak gönder
      const res = await fetch("http://localhost:5001/submit-form", {
        // Backend'deki yeni endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }), // chatSessionId'yi de gönder
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Form gönderilirken bilinmeyen bir hata oluştu."
        );
      }
      setChat([])
      setShowForm(false)
      setShowNot(true)
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
      onFormSubmit(true); // Başarılı gönderildi

    } catch (error) {
      console.error("Form gönderme hatası:", error);
      onFormSubmit(false); // Hata oluştu
    }
  };
  if (!showForm) {
    return
  }
  return (
      <div  style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(6px)",
      }}>
      
    <div style={{
          background: "#1f1f1f",
          color: "#e5e7eb",
          maxWidth: "700px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          borderRadius: "14px",
          padding: "32px",
          position: "relative",
          boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
      <div  style={{ backgroundColor:"transparent", color:"red" , fontSize:"30px" , fontWeight:"bolder" , textAlign:"end"}}>
     {/* Close Button */}
        <button
          onClick={() => setShowForm(false)}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            border: "none",
            background: "transparent",
            fontSize: "28px",
            cursor: "pointer",
            color: "#9ca3af",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
        >
          ✕
        </button>

      </div>
        <div className="form-container">
          <h2>Destek Programı Bilgi Talep Formu</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Ad Soyad"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={handleChange}
                required
              />
            {
            formData.supportProgram && 
            <input
              type="text"
              name="supportProgram"
              placeholder="İlgilenilen Destek Programı"
              value={formData.supportProgram ? formData.supportProgram :""}
              onChange={handleChange}
              readOnly // Bu alanı sadece önerilen programı göstermek için kullanıyoruz
            />
            }
          
              <div style={{ margin: "15px 0",display:"flex" ,gap:"25px" }}>
                  <input
                  className="inputRes"
                    type="checkbox"
                    name="confirm"
                    required
                    checked={formAccepted}
                    onChange={(e) => setFormAccepted(e.target.checked)}
                    style={{
                        maxWidth: "20px",
                        height: "20px",
                        accentColor: "#3B82F6", // modern tarayıcılarda mavi tik
                        cursor: "pointer",
                        textAlign:"end",
                      }}
                  />
              <label onClick={()=>setPopup(true)}  className="labelRes" style={{ fontSize: "20px",display:"flex",alignItems:"center",gap:"10px",cursor:"pointer",textDecoration:"underline",fontWeight:"bold" }}>
                  KVKK aydınlatma metnini okudum, kabul ediyorum.
                </label>
            </div>
            <div style={{justifyContent:"space-around"}} className="flex justify-center gap-6">

                {setShowSelectPrg &&    
              <div className="input-section2">
               <button onClick={()=>{
                    
                    setShowSelectPrg(true)
                    setShowForm(false)
                }} disabled={!formAccepted} className="sub-btn" type="submit">
                  <FaArrowLeft className="arr-spec text-black text-lg" />
                  Geri dön
                </button>
              </div>
                }
             
              <div className="input-section2">
                <button disabled={!formAccepted} className="sub-btn" type="submit">
                  Gonder
                  <FaArrowRight className="arr-spec text-black text-lg" />
                </button>
              </div>
            </div>
          </form>
        </div>
    </div>
    {popup && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(6px)",
    }}
  >
    <div
    className='KVKK'
      style={{
        background: "#1f1f1f",
        color: "#e5e7eb",
        maxWidth: "850px",
        width: "90%",
        maxHeight: "85vh",
        overflowY: "auto",
        borderRadius: "14px",
        padding: "32px",
        position: "relative",
        boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
        border: "1px solid rgba(255,255,255,0.1)",
        lineHeight: "1.7",
        whiteSpace: "pre-line", // ✅ preserves your line breaks
      }}
    >
     
           {/* Close Button */}
        <button
          onClick={() => setPopup(false)}
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            border: "none",
            background: "transparent",
            fontSize: "28px",
            cursor: "pointer",
            color: "#9ca3af",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
        >
          ✕
        </button>
      <h2
        style={{
          marginTop: 0,
          marginBottom: "24px",
          fontSize: "24px",
          fontWeight: 700,
          color: "#f3f4f6",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "12px",
        }}
      >
        KVKK Aydınlatma Metni
      </h2>

      {/* ✅ Full Text Exactly As You Provided */}
      <div style={{ color: "#d1d5db", fontSize: "15px", lineHeight: "1.7" }}>
  <section style={{ marginBottom: "24px" }}>
    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#60a5fa",marginBottom:"15px" }}>
      Veri Sorumlusunun Kimliği
    </h3>
    <p>
      Bu aydınlatma metni, Veri Sorumlusu sıfatıyla Türkiye Bilimsel ve
      Teknolojik Araştırma Kurumu (TÜBİTAK) tarafından 6698 sayılı Kişisel
      Verilerin Korunması Kanununun (“Kanun”) 10. maddesi ile Aydınlatma
      Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında
      Tebliğ uyarınca tubitak.online platformunda işlenen kişisel verilere
      ilişkin aydınlatma yapılması amacıyla hazırlanmıştır.
    </p>
  </section>

  <section style={{ marginBottom: "24px" }}>
    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#60a5fa",marginBottom:"15px" }}>
      İşlenen Kişisel Veriler
    </h3>
    <p>tubitak.online uygulaması üzerinden aşağıdaki kişisel veriler işlenmektedir:</p>
    <ul style={{ marginTop: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <li>Ad, Soyad</li>
      <li>Eğitim Bilgileri (mezuniyet, öğrenim durumu, alan/bölüm)</li>
      <li>Meslek / Görev Bilgisi</li>
      <li>E-posta Adresi</li>
      <li>Kullanıcı tarafından sohbet sırasında paylaşılan diğer bilgiler</li>
    </ul>
  </section>

  <section style={{ marginBottom: "24px" }}>
    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#60a5fa",marginBottom:"15px" }}>
      Kişisel Verilerin İşlenme Amaçları
    </h3>
    <p>tubitak.online üzerinde işlenen kişisel veriler;</p>
    <ul style={{ marginTop: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <li>TÜBİTAK destek programları hakkında bilgilendirme yapılması,</li>
      <li>Kullanıcıya uygun olabilecek destek programlarının ön değerlendirmesinin sağlanması,</li>
      <li>Başvuru ve yönlendirme süreçlerinde kullanıcıyla iletişimin kurulması,</li>
      <li>Platformun işletilmesi, geliştirilmesi ve güvenliğinin sağlanması,</li>
      <li>Hukuki yükümlülüklerin yerine getirilmesi,</li>
      <li>Yetkili kurum/kuruluşlara yapılması gereken bildirimlerin gerçekleştirilmesi</li>
    </ul>
  </section>

  <section style={{ marginBottom: "24px" }}>
    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#60a5fa",marginBottom:"15px" }}>
      Kişisel Verilerin Toplanma Yöntemi
    </h3>
    <p>
      Kişisel verileriniz, tubitak.online uygulaması üzerinden elektronik
      ortamda ve kullanıcı beyanına dayalı olarak otomatik yollarla
      toplanmaktadır.
    </p>
  </section>

  <section style={{ marginBottom: "24px" }}>
    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#60a5fa",marginBottom:"15px" }}>
      Kişisel Verilerin Toplanmasının Hukuki Sebebi
    </h3>
    <p>
      TÜBİTAK, Kanun’un 5. ve 6. maddelerinde yer alan aşağıdaki hukuki
      sebepler doğrultusunda kişisel verileri işlemektedir:
    </p>
    <ul style={{ marginTop: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması kaydıyla, hizmetin sağlanması için gerekli olması,</li>
      <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması,</li>
      <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlemenin zorunlu olması,</li>
      <li>Açık rızanızın bulunduğu haller.</li>
    </ul>
  </section>

  <section style={{ marginBottom: "24px" }}>
    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#60a5fa",marginBottom:"15px" }}>
      Kişisel Verilerin Aktarıldığı Gerçek ve Tüzel Kişiler ve Aktarım Amaçları
    </h3>
    <p>Toplanan kişisel veriler;</p>
    <ul style={{ marginTop: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <li>Yalnızca TÜBİTAK’ın görev ve sorumluluklarını yerine getirmesi amacıyla,</li>
      <li>Yetkili kamu kurum/kuruluşları ile paylaşılabilir.</li>
    </ul>
    <p>
      Yurt dışına aktarım söz konusu olduğunda, Kanun’un 9. maddesinde tanımlanan şartlar aranır ve gerekli güvenlik tedbirleri alınır.
    </p>
  </section>

  <section style={{ marginBottom: "24px" }}>
    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#60a5fa",marginBottom:"15px" }}>
      İlgili Kişinin Hakları
    </h3>
    <p>Kanun’un 11. maddesi gereğince kişisel verilerinizin;</p>
    <ol style={{ marginTop: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
      <li>İşlenip işlenmediğini öğrenme,</li>
      <li>İşlenmişse bilgi talep etme,</li>
      <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
      <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
      <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
      <li>Kanun’un 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme,</li>
      <li>Bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
      <li>Münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
      <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
    </ol>
  </section>

  <section style={{ marginTop: "32px" }}>
    <p style={{ fontSize: "14px", color: "#9ca3af" }}>
      Bu kapsamdaki taleplerinizi, kimliğinizi tespit edici belgeleri ekleyerek{" "}
      <strong>TÜBİTAK Tunus Caddesi No:80 06100 Kavaklıdere / Ankara</strong>{" "}
      adresine bizzat iletebilir veya{" "}
      <strong>tubitak.baskanlik@tubitak.hs03.kep.tr</strong> adresine güvenli
      elektronik imzalı olarak gönderebilirsiniz.
    </p>
  </section>
</div>

    </div>
  </div>
)}

    </div>
  );
}

export default FormComponent;
