// frontend/src/FormComponent.jsx
import React, { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";



let programs=[
  "1001", "1002-A", "1002-B", "1003", "1004", "1005", "1007", "1071", "3005", "3501", 
  "2202", "2204-B", "2204-A", "2204-C", "2204-D", "2205", "2209-A", "2209-B", "2210-A", 
  "2210-C", "2210-D", "2210-E", "2211-A", "2211-C", "2211-E", "2213-A", "2214-A", 
  "2216-B", "2218", "2219", "2221", "2223-B", "2223-C", "2223-D", "2224-A", "2224-B", 
  "2224-C", "2224-D", "2232-A", "2232-B", "2236", "2236-B", "2237-A", "2237-B", "2242", 
  "2244", "2247-A", "2247-D", "2247-B", "2247-C", "2248", "2249", "2250", "4001", 
  "4004", "4005", "4006", "4006-C", "4007", "4008", "4003-T", "4003-A", "4003-B", 
  "1812", "1711", "1501", "1832", "1507", "1719", "1709", "1505", "1702", "1613", 
  "1831", "1602", "1833", "1707", "1515", "1511", "1509"
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
      !formData.phoneNumber ||
      !formData.email ||
      !formData.educationStatus ||
      !formData.profession ||
      !formData.nationality ||
      !formData.supportProgram ||
      !dateOfBirth
    ) {
      // dateOfBirth'i de kontrol et
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    // Telefon numarası sadece sayı içermeli (Regex)
    if (!/^[0-9]+$/.test(formData.phoneNumber)) {
      alert("Telefon numarası sadece rakam içermelidir.");
      return;
    }

    // Doğum tarihi formatı kontrolü (GG.AA.YYYY) ve geçerlilik kontrolü
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateOfBirth)) {
      alert(
        "Doğum tarihi GG.AA.YYYY formatında olmalıdır (örneğin: 01.01.2000)."
      );
      return;
    }
    const [day, month, year] = dateOfBirth.split(".").map(Number);
    const dateObj = new Date(year, month - 1, day); // Ay 0-indekslidir
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      alert("Lütfen geçerli bir doğum tarihi girin.");
      return;
    }

    // Gelecek bir tarih olup olmadığını kontrol et
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Sadece tarih karşılaştırması için saatleri sıfırla
    if (dateObj > today) {
      alert("Doğum tarihi bugünden ileri bir tarih olamaz.");
      return;
    }

    // ----------- DOĞRULAMA BİTTİ -----------

    try {
      // YENİ: Eğer yabancı uyruk seçildiyse, nationalityDetail'ı nationality olarak gönder
      const finalNationality =
        formData.nationality === "yabanci"
          ? nationalityDetail
          : formData.nationality;

      const res = await fetch("http://localhost:5001/submit-form", {
        // Backend'deki yeni endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, dateOfBirth, chatSessionId }), // chatSessionId'yi de gönder
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Form gönderilirken bilinmeyen bir hata oluştu."
        );
      }

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
      <div className="modal-backdrop">
      
    <div className="modal-content">
      <div  style={{ backgroundColor:"transparent", color:"red" , fontSize:"30px" , fontWeight:"bolder" , textAlign:"end"}}>
    <svg onClick={()=>setShowForm(false)} style={{cursor:"pointer" ,width:"40px", height:"40px", padding:"10px"}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-label="Close">
  <path d="M18 6L6 18M6 6l12 12"/>
    </svg>

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
            <div className="rap-dev">
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="select-wrapper">
            <select
                name="educationStatus"
                value={formData.educationStatus}
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
            <input
              type="text"
              name="supportProgram"
              placeholder="İlgilenilen Destek Programı"
              value={formData.supportProgram ? formData.supportProgram :formData.educationStatus}
              onChange={handleChange}
              readOnly // Bu alanı sadece önerilen programı göstermek için kullanıyoruz
            />
              <div style={{ margin: "15px 0" }}>
                <label style={{ fontSize: "20px",display:"flex",alignItems:"center",gap:"10px",cursor:"pointer" }}>
                  <input
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
                        textAlign:"end"
                      }}
                  />
                  Verdiğim bilgilerin doğruluğunu onaylıyorum.
                </label>
            </div>
            <div className="flex justify-around">
              <div className="input-section2">
                <button className="sub-btn" type="submit" onClick={()=>setShowForm(false)}>
                  <FaArrowLeft className="arr-spec text-black text-lg" />
                  Geri don
                </button>
              </div>
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
    </div>
  );
}

export default FormComponent;
