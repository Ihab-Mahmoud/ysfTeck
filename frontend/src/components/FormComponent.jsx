// frontend/src/FormComponent.jsx
import React, { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useGlobal } from "../utils/global-context";
import { useNavigate } from "react-router-dom";



let programs=
[
  "1001 - Bilimsel ve Teknolojik Araştırma Projelerini Destekleme Programı",
  "1002 - A - Hızlı Destek Modülü",
  "1002 - B - Acil Destek Modülü",
  "1003 - Öncelikli Alanlar Ar-Ge Projeleri Destekleme Programı",
  "1004 - Mükemmeliyet Merkezi Destek Programı",
  "1005 - Ulusal Yeni Fikirler ve Ürünler Araştırma Destek Programı",
  "1007 - Kamu Kurumları Araştırma ve Geliştirme Projelerini Destekleme Programı",
  "1071 - Uluslararası Araştırma Fonlarından Yararlanma Kapasitesinin ve Uluslararası Ar-Ge İşbirliklerine Katılımın Arttırılmasına Yönelik Destek Programı",
  "3005 - Sosyal ve Beşeri Bilimlerde Yenilikçi Çözümler Araştırma Projeleri Destek Programı",
  "3501 - Kariyer Geliştirme Programı",
  "2202-Bilim Olimpiyatları Programı",
  "2204-B-Ortaokul Öğrencileri Araştırma Projeleri Yarışmaları",
  "2204-A-Lise Öğrencileri Araştırma Projeleri Yarışmaları",
  "2204-C-Lise Öğrencileri Kutup Araştırma Projeleri Yarışmaları",
  "2204-D-Lise Öğrencileri İklim Değişikliği Araştırma Projeleri Yarışmaları",
  "2205-Lisans Burs Programı:",
  "2209-A-Üniversite Öğrencileri Araştırma Projeleri Destekleme Programı",
  "2209-B-Üniversite Öğrencileri Sanayiye Yönelik Araştırma Projeleri Destekleme Programı",
  "2210-A Genel Yurt İçi Yüksek Lisans Burs Programı",
  "2210-C-Yurt İçi Öncelikli Alanlar Yüksek Lisans Burs Programı",
  "2210-D-Yurt İçi Sanayiye Yönelik Yüksek Lisans Burs Programı",
  "2210-E Doğrudan Yurt İçi Yüksek Lisans Burs Programı",
  "2211-A Genel Yurt İçi Doktora Burs Programı",
  "2211-C-Yurt İçi Öncelikli Alanlar Doktora Burs Programı",
  "2211-E Doğrudan Yurt İçi Doktora Burs Programı",
  "2213-A Yurt Dışı Doktora Burs Programı",
  "2214-A-Yurt Dışı Doktora Sırası Araştırma Burs Programı",
  "2216-B-TÜBİTAK-TWAS Doktora Sırası ve Doktora Sonrası Araştırma Burs Programları",
  "2218-Yurt İçi Doktora Sonrası Araştırma Burs Programı",
  "2219-Yurt Dışı Doktora Sonrası Araştırma Burs Programı",
  "2221-Konuk veya Akademik İzinli (Sabbatical) Bilim İnsanı Destekleme Programı",
  "2223-B-Yurt İçi Bilimsel Etkinlik Düzenleme Desteği",
  "2223-C-Çok Katılımlı Uluslararası Etkinlik Düzenleme Desteği",
  "2223-D-İkili İş Birliği Anlaşmaları Çerçevesinde Etkinlik Düzenleme Desteği",
  "2224-A-Yurt Dışı Bilimsel Etkinliklere Katılımı Destekleme Programı",
  "2224-B-Yurt İçi Bilimsel Etkinliklere Katılımı Destekleme Programı",
  "2224-C-Uluslararası Anlaşmalar Çerçevesinde Yurt Dışındaki Bilimsel Etkinliklere Katılımı Destekleme Programı",
  "2224-D-Yurt Dışındaki Bilimsel Eğitim Etkinliklerine Katılımı Destekleme Programı",
  "2232-A-Uluslararası Lider Araştırmacılar Programı",
  "2232-B-Uluslararası Genç Araştırmacılar Programı",
  "2236-Uluslararası Deneyimli Araştırmacı Dolaşımı Destek Programı",
  "2236-B-MSCA-COFUND Burs Programlarına Katkı Fonu Programı",
  "2237-A-Bilimsel Eğitim Etkinlikleri Desteği",
  "2237-B-Proje Eğitimi Etkinliklerini Destekleme Programı",
  "2242-Üniversite Öğrencileri Araştırma Proje Yarışmaları",
  "2244-Sanayi Doktora Programı",
  "2247-A-Ulusal Lider Araştırmacılar Programı",
  "2247-B-Avrupa Araştırma Konseyi (ERC) Projeleri Güçlendirme Desteği Programı",
  "2247-C Stajyer Araştırmacı Burs Programı",
  "2247-D-Ulusal Genç Liderler Programı",
  "2248-Mentorluk Desteği Programı",
  "2249-Bilim ve Teknoloji Okulları Programı",
  "2250-Lisansüstü Bursları Performans Programı",
  "4001-Ulusal ve Uluslararası Yarışma/Etkinli4003-Tk Katılım Desteği",
  "4004 Doğa Eğitimi ve Bilim Okulları Destekleme Programı",
  "4005 Yenilikçi Eğitim Uygulamaları Destekleme Programı",
  "4006-TÜBİTAK Bilim Fuarları Destekleme Programı",
  "4006-C Bilim Fuarları Festivali Desteği",
  "4007 Bilim Şenlikleri Destekleme Programı",
  "4008-Özel Gereksinimli Bireylere Yönelik Kapsayıcı Toplum Uygulamaları Destek Programı",
  "4003-T Milli Teknoloji Atölyeleri Destek Programı",
  "Milli Teknoloji Kulüpler Birliği Desteği",
  "TÜBİTAK Bilim Kampları",
  "DENEYAP TEKNOLOJİ ATÖLYELERİ",
  "4003-A Büyük Ölçekli Bilim Merkezi Kurulum Desteği",
  "4003-A Büyük Ölçekli Bilim Merkezi Sürdürülebilirlik ve Kapasite Artırımı Desteği",
  "4003-B Küçük Ölçekli Bilim Merkezi Kurulum Desteği",
  "4003-B Küçük Ölçekli Bilim Merkezi Sürdürülebilirlik ve Kapasite Artırımı Desteği",
  "1812 - Yatırım Tabanlı Girişimcilik Destek Programı (BiGG Yatırım)",
  "1711 - Yapay Zeka Ekosistem Çağrısı",
  "1501 - Sanayi Ar-Ge Projeleri Destekleme Programı",
  "1832 - Sanayide Yeşil Dönüşüm",
  "1507 - TÜBİTAK KOBİ Ar-Ge Başlangıç Destek Programı",
  "1719 - Eureka Network Tematik Çağrıları",
  "1709 - Eureka Eurostars Çağrıları",
  "1505 Üniversite-Sanayi İşbirliği Destek Programı",
  "1702 - Patent Tabanlı Teknoloji Transferi Destekleme Çağrısı",
  "1613-Teknoloji Transfer Profesyoneli İstihdamı Desteği Çağrısı",
  "1831 - Yeşil İnovasyon Teknoloji Mentörlük Çağrısı",
  "1602 Patent Destek Programı",
  "1833- SAYEM YEŞİL DÖNÜŞÜM ÇAĞRISI",
  "1707 - Siparişe Dayalı Ar-Ge Projeleri için KOBİ Destekleme Çağrısı",
  "1515 - Öncül Ar-Ge Laboratuvarları Destekleme Programı",
  "1511 - TÜBİTAK Öncelikli Alanlar Araştırma Teknoloji Geliştirme ve Yenilik P. D. P.(Teknoloji Odaklı Sanayi Hamlesi Programı)",
  "1509 - TÜBİTAK Uluslararası Sanayi Ar-Ge Projeleri Destekleme Programı"
]

function FormComponent({
  onFormSubmit,
  formData,
  setFormData,
  showForm,
  setShowForm
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
      navigate("/")
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
            !formData.supportProgram && 
            <div className="select-wrapper">
            <select
                name="educationStatus"
                value={formData.supportProgram}
                onChange={handleChange}
                required
                disabled={formData.supportProgram}
              >
                {programs.map((value, idx) => (
                  <option key={idx} value={value}>
                    {value}
                  </option>
                ))}
            </select>

            </div>
            }
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
            <div className="flex justify-center">
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
