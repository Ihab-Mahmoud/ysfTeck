import React from 'react'
import { useState, useRef, useEffect } from "react";
import { useNavigate, useNavigation } from 'react-router-dom';

const KVKK = () => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate()
  const textRef = useRef();

  // Check if user scrolled to bottom
  // const handleScroll = () => {
  //   const { scrollTop, scrollHeight, clientHeight } = textRef.current;
  //   if (scrollTop + clientHeight >= scrollHeight - 5) {
  //     setCanCheck(true);
  //   }
  // };

  const handleSubmit = async () => {
    if (!accepted) return;
    navigate("/user-type")
  };

 return (

  <div style={{  display:"flex",
      flexDirection:"column",
      gap:"25px",
      marginBottom:"70px"}}>
 
  <div
    style={{
      maxWidth: "720px",
      margin: "40px auto",
      padding: "0",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        color: "#fff",
      border: "1px solid rgba(255,255,255,0.08)",
      backgroundColor:"#2d2b2bd4",
    
    }}
  >
    {/* Başlık şeridi */}
    <div
      style={{
        padding: "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "#2d2b2bd4",
        backdropFilter: "blur(4px)",
      }}
    >
      <h1
        style={{
          fontSize: "22px",
          margin: 0,
          fontWeight: 600,
          letterSpacing: "0.2px",
          cursor:"pointer"
        }}
      >
        KVKK Aydınlatma Metni
      </h1>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
        Lütfen metni okuyup onaylayınız.
      </div>
    </div>

    {/* Kaydırılabilir içerik */}
    <div
    className='KVKK'
      ref={textRef}
      // onScroll={handleScroll}
      style={{
        padding: "18px 24px",
        height: "320px",
        overflowY: "auto",
        lineHeight: "1.6",
        color: "#E5E7EB",
      }}
    >
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

    {/* Onay kutusu + buton alanı */}
    <div
      style={{
        padding: "18px 24px 24px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <label
        htmlFor="kvkkCheck"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "16px",
          cursor: "pointer",
          userSelect: "none",
          color: "#F9FAFB",
        }}
      >
        <input
          type="checkbox"
          id="kvkkCheck"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          style={{
            maxWidth: "20px",
            height: "20px",
            accentColor: "#3B82F6", // modern tarayıcılarda mavi tik
            cursor: "pointer",
            textAlign:"end"
          }}
        />
        KVKK aydınlatma metnini okudum, kabul ediyorum.
      </label>

      <button
        onClick={handleSubmit}
        disabled={!accepted}
        style={{
          width: "100%",
          marginTop: "16px",
          padding: "12px 16px",
          fontSize: "16px",
          fontWeight: 700,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: accepted ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.1)",
          background: accepted
            ? "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)"
            : "rgba(255,255,255,0.06)",
          color: accepted ? "#fff" : "rgba(255,255,255,0.6)",
          cursor: accepted ? "pointer" : "not-allowed",
          transition: "transform 120ms ease, box-shadow 120ms ease",
          boxShadow: accepted ? "0 6px 18px rgba(37,99,235,0.35)" : "none",
        }}
        onMouseDown={(e) => {
          if (accepted) e.currentTarget.style.transform = "translateY(1px)";
        }}
        onMouseUp={(e) => {
          if (accepted) e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Devam Et
      </button>
    </div>

     

  </div>

      <div style={{textAlign:"center"}}>
      <img style={{

        width:"400px",
      }} src='/stb-logo.png'></img>
      </div>  
  </div>
);

}
export default KVKK