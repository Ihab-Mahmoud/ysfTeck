// frontend/src/FormComponent.jsx
import React, { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

function FormComponent({
  onFormSubmit,
  formData,
  setFormData,
  dateOfBirth,
  setDateOfBirth,
  chatSessionId,
  showForm,
  setShowForm
}) {
  // Prop'ları aldık

  const [showNationalityDetail, setShowNationalityDetail] = useState(false);
  const [nationalityDetail, setNationalityDetail] = useState("");

  // Prop olarak gelen handleChange fonksiyonunu kullanacağız
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Eğer isim 'dateOfBirth' ise özel olarak işliyoruz
    if (name === "dateOfBirth") {
      const cleanedValue = value.replace(/[^0-9.]/g, ""); // Sadece sayı ve nokta kabul et
      if (cleanedValue.match(/^\d{0,2}(\.\d{0,2}(\.\d{0,4})?)?$/)) {
        // GG.AA.YYYY formatı için basit regex
        setDateOfBirth(cleanedValue);
      }
    } else if (name === "phoneNumber") {
      // Telefon numarası için sadece sayı kabul et
      const cleanedValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else if (name === "phoneNumber") {
      const cleanedValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else if (name === "nationality") {
      // YENİ: Uyruk seçimi değiştiğinde
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value === "yabanci") {
        setShowNationalityDetail(true);
      } else {
        setShowNationalityDetail(false);
        setNationalityDetail(""); // Seçim değişince detayı sıfırla
      }
    } else if (name === "nationalityDetail") {
      // YENİ: Uyruk detay alanı
      setNationalityDetail(value);
    } else {
      // Diğer form alanları için genel güncelleme
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
          <h2>Destek Programı Ön Kayıt Formu</h2>
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
                type="tel" // Telefon klavyesi için
                name="phoneNumber"
                placeholder="Telefon Numarası (Sadece Rakam)"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                pattern="[0-9]{10,}" // Sadece rakam ve minimum 10 karakter
                title="Lütfen sadece rakam kullanarak telefon numaranızı girin (örneğin: 5XXXXXXXXX)."
              />
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {/* YENİ: Doğum Tarihi Alanı */}
            <input
              type="text" // Metin olarak alıp formatı kontrol edeceğiz
              name="dateOfBirth"
              placeholder="Doğum Tarihi (GG.AA.YYYY)"
              value={dateOfBirth} // Ayrı state'ten geliyor
              onChange={handleChange}
              required
              pattern="\d{2}\.\d{2}\.\d{4}" // GG.AA.YYYY formatını zorlar
              title="Lütfen doğum tarihinizi GG.AA.YYYY formatında girin (örneğin: 01.01.2000)."
            />
            <div className="select-wrapper">
              <select
                name="educationStatus"
                value={formData.educationStatus}
                onChange={handleChange}
                required
              >
                <option value="">Eğitim Durumu Seçin</option>
                <option value="lise">Lise</option>
                <option value="onlisans">Ön Lisans</option>
                <option value="lisans">Lisans</option>
                <option value="yuksek_lisans">Yüksek Lisans</option>
                <option value="doktora">Doktora</option>
              </select>
            </div>
            <input
              type="text"
              name="profession"
              placeholder="Meslek"
              value={formData.profession}
              onChange={handleChange}
              required
            />
            {/* Uyruk seçimi */}
            <div className="select-wrapper">
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
              >
                <option value="">Uyruk Seçin</option>
                <option value="tc">Türkiye (T.C.)</option>
                <option value="yabanci">Yabancı Uyruk</option>{" "}
                {/* value 'yabanci' olarak kullanıldı */}
              </select>
            </div>

            {/* Yabancı Uyruk seçildiğinde gösterilecek ek input alanı */}
            {showNationalityDetail && (
              <input
                type="text"
                name="nationalityDetail"
                placeholder="Uyruğunuzu Belirtin (Örn: Suriye, Almanya)"
                value={nationalityDetail}
                onChange={handleChange}
                required // Bu alan da zorunlu
              />
            )}
            <input
              type="text"
              name="supportProgram"
              placeholder="İlgilenilen Destek Programı"
              value={formData.supportProgram}
              onChange={handleChange}
              readOnly // Bu alanı sadece önerilen programı göstermek için kullanıyoruz
              required
            />
            <div className="flex justify-around">
              <div className="input-section2">
                <button className="sub-btn" type="submit" onClick={()=>setShowForm(false)}>
                  <FaArrowLeft className="arr-spec text-black text-lg" />
                  Geri don
                </button>
              </div>
              <div className="input-section2">
                <button className="sub-btn" type="submit">
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
