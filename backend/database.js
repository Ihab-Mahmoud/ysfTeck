import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

// __dirname'i ES modülleri için tanımla
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

async function initializeDatabase() {
  // Veritabanı dosyasının yolu (örneğin backend klasöründe data.db)
  const dbPath = path.join(__dirname, "../data.db");

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Tabloları oluştur
  await db.exec(`
        CREATE TABLE IF NOT EXISTS form_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            email TEXT NOT NULL,
            education_status TEXT NOT NULL,
            profession TEXT NOT NULL,
            nationality TEXT NOT NULL,
            support_program TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            date_of_birth TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_record_id INTEGER, -- Foreign Key
            session_id TEXT NOT NULL, -- YENİ: Her sohbet mesajı için benzersiz oturum ID'si
            role TEXT NOT NULL,     -- 'user' or 'assistant'
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (form_record_id) REFERENCES form_records(id)
        );


        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            department TEXT,
            dream_job TEXT,
            stage INTEGER DEFAULT 0 -- 0: ask department, 1: ask dream job, 2: ready
        );

      


    `);

  console.log("Veritabanı bağlandı ve tablolar oluşturuldu/doğrulandı.");
  return db;
}

// Veritabanı bağlantısını ve örnek fonksiyonları dışa aktar
export {
  initializeDatabase,
  db, // db bağlantısını dışa aktarıyoruz
};
