// frontend/src/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react'; // useCallback'i import ediyoruz

function AdminPanel() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState(new Set()); // Seçili ID'leri tutmak için Set kullanıyoruz

  // Sohbet geçmişini çeken fonksiyonu dışarıda tanımlayalım veya useCallback ile saralım
  const fetchChatHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("api/admin/chat-history"); // Backend endpoint
      if (!res.ok) {
        throw new Error(`Veriler çekilemedi. Durum kodu: ${res.status}`);
      }
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Sohbet geçmişi çekilirken hata:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Bağımlılığı yok, sadece bir kez oluşur

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]); // fetchChatHistory'yi bağımlılık olarak ekliyoruz (useCallback kullandığımız için güvenli)


  // Checkbox değişimini yöneten fonksiyon (oturum ID'si alacak)
  const handleCheckboxChange = (sessionId) => {
    setSelectedSessionIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(sessionId)) {
        newSelected.delete(sessionId);
      } else {
        newSelected.add(sessionId);
      }
      return newSelected;
    });
  };

  // Seçilen kayıtları silen fonksiyon
  const handleDeleteSelected = async () => {

    // ---- DEBUGGING LOGLARI BAŞLANGICI ----
    console.log("handleDeleteSelected fonksiyonu çağrıldı.");
    console.log("selectedSessionIds boyutu:", selectedSessionIds.size);
    // ---- DEBUGGING LOGLARI SONU ----

    if (selectedSessionIds.size === 0) {
      alert('Lütfen silmek istediğiniz sohbet oturumlarını seçin.');
      console.log("Hiç oturum seçilmedi, işlem iptal edildi."); // Debug log
      return;
    }

    // --- YENİ LOG BURAYA! ---
    console.log("Window.confirm çağrılacak..."); // Bu logu görüyor musunuz?
    const confirmation = window.confirm(`${selectedSessionIds.size} adet sohbet oturumunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`);
    console.log("Window.confirm sonucu:", confirmation); // Bu logu görüyor musunuz?

    if (!confirmation) { // confirm'den gelen sonucu kullanıyoruz
      console.log("Kullanıcı silme işlemini iptal etti (confirm penceresi kapandı).");
      return;
    }

    setLoading(true); // Silme işlemi sırasında yükleniyor durumuna geç
    setError(null);

    try {

      // ---- DEBUGGING LOGLARI BAŞLANGICI ----
      console.log("Fetch isteği başlatılıyor...");
      console.log("Gönderilecek session ID'ler:", Array.from(selectedSessionIds));
      // ---- DEBUGGING LOGLARI SONU ----

      const response = await fetch(
        'api/admin/chat-sessions',
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionIds: Array.from(selectedSessionIds) }), // Set'i diziye çeviriyoruz
        }
      );

      // ---- DEBUGGING LOGLARI BAŞLANGICI ----
      console.log("Fetch isteği tamamlandı. Yanıt durumu:", response.status);
      // ---- DEBUGGING LOGLARI SONU ----

      // Backend'den gelen yanıtı doğru şekilde işliyoruz
      const responseData = await response.json(); // JSON verisini doğrudan al

      // ---- DEBUGGING LOGLARI BAŞLANGICI ----
      console.log("Yanıt verisi:", responseData);
      // ---- DEBUGGING LOGLARI SONU ----

      if (!response.ok) {
        // Hata durumunda, backend'in döndürdüğü hata mesajını kullan
        throw new Error(responseData.error || 'Silme işlemi başarısız oldu.');
      }

      alert(responseData.message || 'Seçilen oturumlar başarıyla silindi.'); // Backend'den gelen mesajı göster

      setSelectedSessionIds(new Set()); // Seçimi sıfırla
      fetchChatHistory(); // Güncel listeyi yeniden çek
    } catch (err) {
      console.error("Silme hatası:", err); // Konsola hata detayını yazdır
      setError(err.message); // Kullanıcıya gösterilecek hatayı ayarla
      alert(`Silme işlemi sırasında hata oluştu: ${err.message}`);
    } finally {
      setLoading(false); // Silme işlemi bitince yükleniyor durumunu kapat
    }
  };

  if (loading) {
    return <div className="admin-container"><p>Veriler yükleniyor...</p></div>;
  }

  if (error) {
    return <div className="admin-container"><p className="error-message">Hata: {error}</p></div>;
  }

  // Gruplama mantığı: Sohbet geçmişini session_id'ye göre gruplayalım
  const groupedSessions = records.reduce((acc, record) => {
    const sessionId = record.session_id; // Her sohbet mesajının session_id'si var

    if (!acc[sessionId]) {
      acc[sessionId] = {
        sessionId: sessionId, // Oturum ID'sini gruba ekliyoruz
        formInfo: null, // Form bilgisi varsa buraya eklenecek
        chatMessages: []
      };
    }

    // Eğer bu record bir forma bağlıysa ve henüz formInfo eklenmemişse ekle
    if (record.form_id && !acc[sessionId].formInfo) {
      acc[sessionId].formInfo = {
        id: record.form_id,
        full_name: record.full_name,
        phone_number: record.phone_number,
        email: record.email,
        education_status: record.education_status,
        profession: record.profession,
        nationality: record.nationality,
        support_program: record.support_program,
        created_at: record.form_created_at
      };
    }

    acc[sessionId].chatMessages.push({
      id: record.chat_id,
      role: record.role,
      content: record.content,
      timestamp: record.timestamp
    });
    return acc;
  }, {});

  return (
    <div className="admin-container"> 
      <h2>Admin Paneli - Sohbet ve Form Kayıtları</h2>
      {/* Seçilenleri Sil butonu */}
      <button
        onClick={handleDeleteSelected}
        disabled={selectedSessionIds.size === 0 || loading}
        className="delete-selected-button"
        // Stil düzenlemesi
        style={{
          margin: '10px 0',
          padding: '10px 20px',
          backgroundColor: '#dc3545', // Kırmızı tonu
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      >
        Seçilen Oturumları Sil ({selectedSessionIds.size})
      </button>

      {Object.keys(groupedSessions).length === 0 ? (
        <p className='text-white'>Henüz hiç kayıt yok.</p>
      ) : (
        <div className="records-list">
          {Object.keys(groupedSessions).map((sessionId) => {
            const sessionGroup = groupedSessions[sessionId];
            return (
              <div key={sessionId} className="record-group">
                <h3>
                  <input
                    type="checkbox"
                    checked={selectedSessionIds.has(sessionId)}
                    onChange={() => handleCheckboxChange(sessionId)}
                    style={{ marginRight: '10px' }}
                  />
                  Oturum ID: {sessionId.substring(0, 8)}...
                  {sessionGroup.formInfo ? ` - Form Kayıtlı: ${sessionGroup.formInfo.full_name}` : ' - Formsuz Sohbet'}
                </h3>
                {sessionGroup.formInfo && (
                  <div className="form-info">
                    <h4>Form Bilgileri:</h4>
                    <p><strong>Ad Soyad:</strong> {sessionGroup.formInfo.full_name}</p>
                    <p><strong>E-posta:</strong> {sessionGroup.formInfo.email}</p>
                    <p><strong>Telefon:</strong> {sessionGroup.formInfo.phone_number}</p>
                    <p><strong>Eğitim:</strong> {sessionGroup.formInfo.education_status}</p>
                    <p><strong>Meslek:</strong> {sessionGroup.formInfo.profession}</p>
                    <p><strong>Uyruk:</strong> {sessionGroup.formInfo.nationality}</p>
                    <p><strong>Program:</strong> {sessionGroup.formInfo.support_program}</p>
                    <p><strong>Form Tarihi:</strong> {new Date(sessionGroup.formInfo.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                )}
                <h4>Sohbet Geçmişi:</h4>
                <div className="chat-messages">
                  {sessionGroup.chatMessages.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).map((msg) => (
                    <div key={msg.id} className={`chat-entry ${msg.role}`}>
                      <strong>{msg.role === 'user' ? 'Kullanıcı' : 'Asistan'}:</strong> {msg.content}
                      <span className="timestamp">{new Date(msg.timestamp).toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;