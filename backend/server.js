import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import {initializeDatabase, db} from './database.js'; // BURAYI EKLEYİN! initializeDatabase ve db import edildi

dotenv.config({path: '.env'});

const app = express();
const port = 5001;

let database;
// initializeDatabase fonksiyonunu çağırıp veritabanı bağlantısını başlat
initializeDatabase().then(instance => {
    database = instance;
}).catch(err => {
    console.error('Veritabanı başlatılırken hata oluştu:', err);
    process.exit(1);
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // İzin verilen HTTP metotları
    allowedHeaders: ['Content-Type', 'Authorization'] // İzin verilen başlıklar
}));

app.use(bodyParser.json());

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});


app.post('/ask', async (req, res) => {
    try {
        const {prompt, chatSessionId} = req.body;

        // Kullanıcı mesajını sohbet geçmişine session_id ile kaydet
        await database.run(
            'INSERT INTO chat_history (role, content, session_id) VALUES (?, ?, ?)',
            ['user', prompt, chatSessionId]
        );
        // Prompta dil yönergesi ekliyoruz
        const turkishPrompt = prompt + ' Lütfen bu soruyu Türkçe olarak yanıtla.';

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                //  Modelden Türkçe yanıt vermesini istiyoruz
                {
                    role: 'system',
                    content: `Sen TÜBİ adında bir sanal asistansın. Yalnızca TÜBİTAK destek programları hakkında bilgi verirsin. Sohbete kendini tanıtarak başla. Kullanıcı seni selamlar veya “Nasılsın?” gibi sorular sorarsa, kibarca cevap ver ve ardından “İstersen sana uygun programları bulmam için birkaç soru sorabilirim” diyerek konuya dön. 
                            Kullanıcı kendisi hakkında bilgi vermemişse şu soruları sırayla sor:
                            1.⁠ ⁠Mesleğiniz nedir?
                            2.⁠ ⁠Hangi bölümde okudunuz veya mezun oldunuz?
                            3.⁠ ⁠Hayalinizdeki meslek nedir?

                            Bu bilgileri aldıktan sonra 1501, 1503, 1505 kodlu TÜBİTAK desteklerinden 2-3 uygun olanı seç, kısa açıklamalarla öner. 

                            Konu dışı sorulara “Ben sadece TÜBİTAK destek programları hakkında bilgi verebilirim” diyerek yönlendir. Demo olduğunu belirtme, samimi ve profesyonel ol.`
                },
                {role: 'user', content: turkishPrompt}
            ],
            model: 'llama3-70b-8192', // Kullandığınız Groq modeli
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "Cevap alınamadı";
        // Asistan mesajını sohbet geçmişine session_id ile kaydet
        await database.run(
            'INSERT INTO chat_history (role, content, session_id) VALUES (?, ?, ?)',
            ['assistant', responseText, chatSessionId]
        );

        res.json({response: responseText});
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).json({error: 'Sunucu hatası'});
    }
});

// Yeni form gönderme endpoint'i 
app.post('/submit-form', async (req, res) => {
    try {
        const formData = req.body;
        const {chatSessionId, ...formFields} = formData;

        const result = await database.run(
            `INSERT INTO form_records (full_name, phone_number, email, education_status, profession, nationality,
                                       support_program, date_of_birth)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [formFields.fullName, formFields.phoneNumber, formFields.email, formFields.educationStatus,
                formFields.profession, formFields.nationality, formFields.supportProgram, formFields.dateOfBirth]
        );

        const newFormRecordId = result.lastID;

        // Form_record_id'yi, ilgili session_id'ye sahip TÜM chat_history kayıtlarına ata
        if (chatSessionId) {
            await database.run(
                'UPDATE chat_history SET form_record_id = ? WHERE session_id = ?',
                [newFormRecordId, chatSessionId]
            );
        }

        console.log('Alınan form verileri:', formFields);

        res.json({message: 'Formunuz başarıyla alındı!', formRecordId: newFormRecordId});
    } catch (error) {
        console.error('Form gönderme hatası:', error);
        res.status(500).json({error: 'Form gönderilirken bir hata oluştu.'});
    }
});


app.get('/admin/chat-history', async (req, res) => {
    try {
        const history = await database.all(`
            SELECT ch.id         AS chat_id,
                   ch.role,
                   ch.content,
                   ch.timestamp,
                   ch.session_id, -- session_id'yi de çekiyoruz
                   fr.id         AS form_id,
                   fr.full_name,
                   fr.phone_number,
                   fr.email,
                   fr.education_status,
                   fr.profession,
                   fr.nationality,
                   fr.support_program,
                   fr.created_at AS form_created_at
            FROM chat_history ch
                     LEFT JOIN
                 form_records fr ON ch.form_record_id = fr.id
            ORDER BY ch.timestamp DESC;
        `);
        res.json(history);
    } catch (error) {
        console.error('Sohbet geçmişi çekilirken hata:', error); // Hata detayını terminalde göster
        res.status(500).json({error: 'Sohbet geçmişi alınamadı.'});
    }
});

// Seçilen sohbet geçmişi kayıtlarını silme endpoint'i
app.delete('/admin/chat-sessions', async (req, res) => { // Endpoint adını değiştirdik
    try {
        const {sessionIds} = req.body; // Frontend'den gelen sessionIds'ı doğru şekilde alıyoruz

        if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
            return res.status(400).json({error: 'Silinecek oturum ID\'leri sağlanmadı veya formatı hatalı.'});
        }

        // SQL sorgusunda session_id'ye göre silme yapıyoruz
        const placeholders = sessionIds.map(() => '?').join(',');
        const sql = `DELETE
                     FROM chat_history
                     WHERE session_id IN (${placeholders})`;

        const result = await database.run(sql, sessionIds); // SQL'e sessionIds'ı iletiyoruz

        if (result.changes === 0) {
            return res.status(404).json({message: 'Belirtilen ID\'lere sahip hiçbir sohbet oturumu bulunamadı veya zaten silinmiş.'});
        }

        res.json({message: `${result.changes} adet sohbet mesajı başarıyla silindi (${sessionIds.length} oturumdan).`});
    } catch (error) {
        console.error('Sohbet oturumu silinirken hata:', error); // Detaylı hata logu
        res.status(500).json({error: 'Sohbet oturumu silinirken sunucu hatası oluştu.'});
    }
});

app.listen(port, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});