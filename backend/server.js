  import express from "express";
  import cors from "cors";
  import bodyParser from "body-parser";
  import * as dotenv from "dotenv";
  dotenv.config();
  import { initializeDatabase, db } from "./database.js"; 
  import OpenAI from "openai";
  import path from "path";
  import fs from "fs";
import { log } from "console";
  dotenv.config({ path: ".env" });

  const app = express();
  const port = 5001;

  let database;
  // initializeDatabase fonksiyonunu çağırıp veritabanı bağlantısını başlat
  initializeDatabase()
    .then((instance) => {
      database = instance;
    })
    .catch((err) => {
      console.error("Veritabanı başlatılırken hata oluştu:", err);
      process.exit(1);
    });

  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"], // İzin verilen HTTP metotları
      allowedHeaders: ["Content-Type", "Authorization"], // İzin verilen başlıklar
    })
  );

  app.use(bodyParser.json());

  const openai = new OpenAI({
    apiKey:"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" ,
  });

  const client = new OpenAI({ 

      apiKey: "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",

    });

  const DATA_DIR = path.join(process.cwd(), "data");
  const RAW_PROGRAMS_PATH = path.join(DATA_DIR, "tubitak_programs.json");
  const EMBEDDED_PROGRAMS_PATH = path.join(
    DATA_DIR,
    "tubitak_programs_with_embeddings.json"
  );
  const EMBEDDED_PROGRAMS_PATH_REC = path.join(
    DATA_DIR,
    "tubitak_programs_with_embeddings_rec.json"
  );

  /* ----------------------- Utilities ----------------------- */
  function clean(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function truncate(s, n = 200) { s = clean(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  function cosineSimilarity(vecA, vecB) {
    let dot = 0,
      a = 0,
      b = 0;
    for (let i = 0; i < vecA.length; i++) {
      const x = vecA[i],
        y = vecB[i];
      dot += x * y;
      a += x * x;
      b += y * y;
    }
    return dot / (Math.sqrt(a) * Math.sqrt(b));
  }

  async function getConversationHistory(sessionId) {
    const rows = await database.all(
      "SELECT role, content FROM chat_history WHERE session_id = ? ORDER BY id ASC",
      [sessionId]
    );
    return rows.map((r) => ({ role: r.role, content: r.content }));
  }

  async function getOrCreateProfile(sessionId) {
    let profile = await database.get(
      "SELECT * FROM user_profile WHERE session_id = ?",
      [sessionId]
    );
    if (!profile) {
      await database.run(
        "INSERT INTO user_profile (session_id, stage) VALUES (?, 0)",
        [sessionId]
      );
      profile = await database.get(
        "SELECT * FROM user_profile WHERE session_id = ?",
        [sessionId]
      );
    }
    return profile;
  }

  async function updateProfile(sessionId, fields) {
    const sets = [];
    const values = [];
    for (const [k, v] of Object.entries(fields)) {
      sets.push(`${k} = ?`);
      values.push(v);
    }
    values.push(sessionId);
    const sql = `UPDATE user_profile SET ${sets.join(", ")} WHERE session_id = ?`;
    await database.run(sql, values);
  }

  /* ----------------- System Prompt (rules) ----------------- */
  const systemPrompt = `
  Sen TÜBİ adında bir sanal asistansın.
  Görevin TÜBİTAK destek programları hakkında bilgi vermek.

  KURALLAR:
  - Kibar, profesyonel ve kısa cevaplar ver.
  - Her mesajda tekrar selamlama yapma.
  - Konu dışı sorulara şu şekilde yönlendir: "Ben sadece TÜBİTAK destek programları hakkında bilgi verebilirim."
  - Asla demo olduğunu veya yapay zeka olduğunu söyleme.

  SORU AKIŞI:
  1. Eğer kullanıcı kendini tanıtmadıysa sırayla sor:
    - "📘 Hangi bölümde okudunuz veya mezun oldunuz?"
    - "💡 Hayalinizdeki meslek nedir?"
  2. Kullanıcı cevap verdikçe bir sonraki soruya geç.
  3. İki soru tamamlandığında kullanıcı profiline göre uygun **TÜBİTAK destek programlarını öner**.

  ÖNERİLER:
  - Başlıkları **kalın** yaz.
  - Programları numara veya madde işaretleri ile listele, her programın başında bir emoji olmalı.
  - Mesaj sonunda kısa bir yönlendirme ekle (ör: "👉 Detay görmek için destek programı numarasını yazabilirsiniz.").

  Örnek program önerisi formatı:
  **Sana uygun olabilecek TÜBİTAK programları:**
  1. 🚀 **2209-A Üniversite Öğrencileri Araştırma Projeleri Desteği**  
    Lisans öğrencileri için araştırma desteği
  2. 🧪 **2247-A Ulusal Lider Araştırmacılar Programı**  
    Akademik kariyer planlayanlar için  
  👉 Detay görmek için destek programı numarasını yazabilirsiniz.

  `;

  /* --------------- Indexing Route (run occasionally) --------------- */
  /**
   * POST /admin/index-programs
   * Reads data/tubitak_programs.json, embeds each record, and writes data/tubitak_programs_with_embeddings.json
   */
  app.post("/admin/index-programs", async (req, res) => {
    
    try {
      ensureDataDir();
      if (!fs.existsSync(RAW_PROGRAMS_PATH)) {
        return res
          .status(400)
          .json({ error: "Missing data/tubitak_programs.json" });
      }

      const raw = JSON.parse(fs.readFileSync(RAW_PROGRAMS_PATH, "utf-8"));
      console.log(raw);

      // Create embeddings
      const withEmbeddings = [];
      for (const p of raw) {
        const text = [
          p.programName,
          p.description,
          `Uygunluk: ${p.eligibility || ""}`,
          `Son Tarih: ${p.deadline || ""}`,
        ].join(" | ");

        const emb = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
        });

        withEmbeddings.push({
          ...p,
          embedding: emb.data[0].embedding,
        });
      }

      fs.writeFileSync(
        EMBEDDED_PROGRAMS_PATH,
        JSON.stringify(withEmbeddings, null, 2)
      );
      res.json({ ok: true, count: withEmbeddings.length });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Indexing failed" });
    }
  });
  app.post("/admin/index-programs-rec", async (req, res) => {
  try {
    ensureDataDir();

    if (!fs.existsSync(RAW_PROGRAMS_PATH)) {
      return res.status(400).json({ error: "Missing data/tubitak_programs.json" });
    }

    const raw = JSON.parse(fs.readFileSync(RAW_PROGRAMS_PATH, "utf-8"));
    const withEmbeddings = [];


    for (const p of raw) {
      // Only use core fields for embedding
      const text = `${p.programName} ${p.supportPurpose} ${p.targetAudience}`;

      const emb = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      withEmbeddings.push({
        ...p,
        embedding: emb.data[0].embedding,
      });
    }

    fs.writeFileSync(EMBEDDED_PROGRAMS_PATH_REC, JSON.stringify(withEmbeddings, null, 2));
    res.json({ ok: true, count: withEmbeddings.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Indexing failed" });
  }
});


function scoreBoostForProfile(program, profile) {
  const text = `${program.programName} ${program.supportPurpose} ${program.targetAudience}`.toLowerCase();
  const edu = (profile?.education_level || "").toLowerCase();

  const lowerEducationPrograms = ["okul öncesi", "ilkokul", "ortaokul", "lise"];
  const higherEducationLevels = ["önlisans", "lisans", "yüksek lisans", "doktora", "tıpta uzmanlık", "sanatta yeterlilik"];

  // Exclude lower-edu programs for higher-edu users
  if (higherEducationLevels.some(h => edu.includes(h)) && lowerEducationPrograms.some(l => text.includes(l))) {
    return -1;
  }

  // Exclude higher-edu programs for lower-edu users
  if (lowerEducationPrograms.some(l => edu.includes(l)) && higherEducationLevels.some(h => text.includes(h))) {
    return -1;
  }

  // Department
  const dept = (profile?.department || "").toLowerCase();

  // Career dream + dream job combined
const combinedDreams = (
  (profile?.dream_job || "") + " " + (profile?.career_dreams || "")
).toLowerCase();

console.log(combinedDreams);

  const jobHas = (t) => combinedDreams.includes(t);
  const has = (t) => text.includes(t);
  const depHas = (t) => dept.includes(t);

  let boost = 0;

// Akademisyen veya Araştırmacı
if ((jobHas("araştırmacı", "araştırma projesi") && (has("araştırma"))) ||
    (jobHas("akademisyen", "yayın") && (has("akademi") || has("akademik"))) ||
    (jobHas("doktora", "bilimsel çalışma") && (has("üniversite") || has("laboratuvar") || has("bilim"))))
{
    boost += 0.25;
}

// Sanayici
if ((jobHas("sanayici") && jobHas("ar-ge projesi") && (has("ar-ge") || has("teknoloji"))) ||
    (jobHas("sanayici") && jobHas("yeni ürün geliştirme") && (has("üretim") || has("kobi") || has("sanayi"))) ||
    (jobHas("imalat", "kobi geliştirme") && (has("üretim") || has("kobi"))))
{
    boost += 0.25;
}

// Çevre Mühendisi veya İklim Aktivisti
if ((jobHas("çevre mühendisi", "çevre projesi") && (has("sürdürülebilir") || has("yeşil"))) ||
    (jobHas("iklim aktivisti", "sürdürülebilirlik çalışması") && (has("iklim") || has("sürdürülebilir"))))
{
    boost += 0.25;
}
if (profile.programId==1711) {
  console.log(text);
  console.log(combinedDreams);
  
}
// Yazılımcı / Teknoloji Uzmanı
if ((jobHas("yazılımcı") && jobHas("yazılım projesi") && (has("yazılım"))) ||
    (jobHas("yazılımcı") && jobHas( "robotik proje") && (has("robotik"))) ||
    ( jobHas("yazılımcı") && jobHas("ai uygulaması") && (has("yapay") || has("zeka"))) ||
    ( jobHas("yazılımcı") && jobHas("ai hayali") && (has("büyük") || has("veri") || has("nesnelerin"))))
{
    boost += 0.25;
}

// Sağlık Alanı (Doktor, Hekim)
if ((jobHas("doktor") && jobHas("klinik araştırma") && (has("tıpta") || has("uzmanlık"))) ||
    (jobHas("doktor") &&  jobHas("tedavi projesi") && (has("tıpta") || has("uzmanlık"))) ||
    (jobHas("hekim", "sağlık kampanyası") && (has("tıpta") || has("uzmanlık"))))
{
    boost += 0.25;
}

// Eğitim / Sosyal Bilimler
if ((jobHas("öğretmen", "eğitim projesi") && (has("eğitim") || has("öğretim"))) ||
    (jobHas("pedagog", "öğrenci çalışması") && (has("okul") || has("eğitim"))) ||
    (jobHas("eğitimci", "eğitim projesi") && (has("eğitim") || has("öğretim"))))
{
    boost += 0.20;
}

// Doğa Bilimleri (Biyolog, Fizikçi, Kimyager, Matematikçi)
if ((jobHas("biyolog", "bilimsel proje") && (has("biyoloji") || has("analiz"))) ||
    (jobHas("fizikçi", "araştırma çalışması") && (has("fizik") || has("analiz"))) ||
    (jobHas("kimyager", "bilimsel proje") && (has("kimya") || has("analiz"))) ||
    (jobHas("matematikçi", "araştırma çalışması") && (has("matematik") || has("analiz"))))
{
    boost += 0.25;
}


  // Education level boost
  const programEducationLevels = text.match(/(doktora mezunları|lise mezunları|yüksek lisans mezunları|lisans mezunları|tıpta uzmanlık derecesine sahip kişiler|tıpta uzmanlık öğrencileri|sanatta yeterliliğe sahip kişiler|okul öncesi|ilkokul öğrencileri|ilkokul mezunları|ortaokul öğrencileri|ortaokul mezunları|lise öğrencileri|yüksek lisans öğrencileri|önlisans öğrencileri|önlisans mezunları|lisans öğrencileri|doktora öğrencileri|doktora yapmış araştırmacılar)/gi);

  if (programEducationLevels?.some(level => edu.includes(level.toLowerCase()))) {
    if (lowerEducationPrograms.some(l => edu.includes(l)) || ["okul öncesi,lise,ilk okul,orta okul,uzmanlık öğrencisi", "uzmanlık derecesine", "sanatta yeterliliğe"].some(s => edu.includes(s))) {
      boost += 0.20;
    } else {
      boost += 0.10;
    }
  }

  return boost;
}
// Example with OpenAI embeddings (pseudo-code)
async function getProgramScores(profile, programs) {
  const lowerEducationLevels = [
  "okul öncesi",
  "ilkokul öğrencileri",
  "ortaokul öğrencileri",
  "lise öğrencileri",
  "lise mezunları"
];

let profileText = "";

// Convert profile education level to lowercase for comparison
const eduLevel = (profile.education_level || "").toLowerCase();
const careerDreams = (profile.career_dreams || "").toLowerCase();

if (lowerEducationLevels.includes(eduLevel)) {
  // Only include education level
  profileText = profile.education_level;
} else {
  // Include everything
  profileText = `${profile.education_level || ""} ${(profile.dream_job || "")} ${(profile.career_dreams || "")}`;
}

const scoredPrograms = [];
for (let program of programs) {
  let score = await computeSemanticScore(profileText, program.embedding);
  if (eduLevel=="okul öncesi" && program.programId=="4004" ) {
    score = 1
  }
  if (careerDreams.includes("bilim merkezi çalışanları") && program.programId=="4004" ) {
    score = 1
  }
  if (eduLevel=="lise mezunları" && program.programId=="4001" ) {
    score = 1
  }
  if (eduLevel=="lise mezunları" && program.programId=="4003-T" ) {
    score = 1
  }
  scoredPrograms.push({ ...program, score });
}

return scoredPrograms.sort((a, b) => b.score - a.score);
}

// Function to get embedding
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Cosine similarity

// Compute semantic score
async function computeSemanticScore(profileText, programText) {
  const profileVec = await getEmbedding(profileText);
  // const programVec = await getEmbedding(programText);
  return cosineSimilarity(profileVec, programText); // 0-1
}

/* --------------- Retrieval Helper --------------- */
  async function recommendProgramsForProfile(profile, { topK = 3 } = {}) {  
    ensureDataDir();
    if (!fs.existsSync(EMBEDDED_PROGRAMS_PATH_REC)) {
      return { message: "Program verisi bulunamadı.", recommended: [] };
    }

    const all = JSON.parse(fs.readFileSync(EMBEDDED_PROGRAMS_PATH_REC, "utf-8"));

    const scored = (await getProgramScores(profile,all)).slice(0,topK)
    // Pretty, compact Markdown list
    const lines = [];
    let eg;
    lines.push("Profilinize göre öne çıkan programlar:");
    if (scored.length === 0) {
      lines.push("- Uygun program bulunamadı. Profili biraz daha detaylandırabilirsiniz.");
    } else {
      for (const p of scored) {
        lines.push(
          `  - ${p.programName}\n` +
          `  • hedef kitlesi: ${truncate(p.targetAudience, 180)}\n` 
        
        );
      }
      eg = scored[0]?.programId ? scored[0].programId : scored[1].programId;
      lines.push(`\nBir programı seçerseniz destek programı numarasını (örn. **${eg}**) veya adını yazarak detay sorabilirsiniz.`);
    }
    
    return {
      programId:eg,
      message: lines.join("\n"),
      recommended: scored.map(p => ({ id: p.programId, name: p.programName }))
    };
  }

  function shouldRecommendNow(text) {
    const t = (text || "").toLowerCase();
    return /hangi program|hangi destek|bana uygun|öner(ir)? misin|ne önerirsin|uygun program/i.test(t);
  }

  /* --------------- Answer Builder (RAG) --------------- */

  async function answerWithRAG({ userQuestion, conversationHistory, profile }) {
    // Load all programs
    ensureDataDir();
    if (!fs.existsSync(EMBEDDED_PROGRAMS_PATH)) return "Program verisi bulunamadı.";
    const allPrograms = JSON.parse(fs.readFileSync(EMBEDDED_PROGRAMS_PATH, "utf-8"));

    // 1️ Try to find direct match from user message
    let directMatch = null;
    const idMatch = userQuestion.match(/\b(\d{4}(?:-[A-Z]+)?)\b/i);
    if (idMatch) {
      directMatch = allPrograms.find(p => p.programId.toUpperCase() === idMatch[1].toUpperCase());
    }
    if (!directMatch) {
      const nameMatch = allPrograms.find(p =>
        userQuestion.toLowerCase().includes(p.programName.toLowerCase())
      );
      if (nameMatch) directMatch = nameMatch;
    }

    // 2️ If no direct match, try to find program from chat history (latest first)
    if (!directMatch) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const msg = conversationHistory[i].content;
        const matchById = msg.match(/\b(\d{4}(?:-[A-Z]+)?)\b/i);
        if (matchById) {
            directMatch = allPrograms.find(p => p.programId.toUpperCase() === matchById[1].toUpperCase());
            if (directMatch) break;
          }
        const matchByName = allPrograms.find(p =>
          msg.toLowerCase().includes(p.programName.toLowerCase())
        );
        if (matchByName) {
          directMatch = matchByName;
          break;
        }
      }
    }

    // 3️ If still no match, fallback to embeddings search
    let relevant = [];
    if (directMatch) {
      relevant = [directMatch];
    } else {
      const q = [
        userQuestion,
        profile?.department ? `Kullanıcı bölümü: ${profile.department}` : "",
        profile?.dream_job ? `Hedef meslek: ${profile.dream_job}` : "",
      ].join(" | ");

      const qEmbRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: q,
      });
      const qEmb = qEmbRes.data[0].embedding;

      relevant = allPrograms
        .map(p => ({ ...p, score: cosineSimilarity(qEmb, p.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    }

    // 4️ If multiple candidates are too close, ask for clarification
    if (!directMatch && relevant.length > 1 && relevant[0].score - relevant[1].score < 0.05) {
      return {
        type: "clarify",
        message: "Birden fazla program uygun görünüyor. Hangisini kastettiniz?",
        options: relevant.map(r => ({ id: r.programId, name: r.programName })),
      };
    }

    // 5️ Build readable context with bullets and links
    const contextText = relevant
      .map(p => [
        `• **Program ID:** ${p.programId}`,
        `• **Program:** ${p.programName}`,
        `• **Uygunluk(Hedef Kitlesi):** ${p.targetAudience || "-"}`,
        `• **Son Tarih:** ${p.deadline || "-"}`,
        `• **Destek Şartları & Süreç:** ${p.targetConditionsAndProcess || "-"}`,
        `• **Destek Miktarı (Üst Limit):** ${p.SupportAmount || "-"}`,
        `• **Bölge:** ${p.region || "-"}`,
        `• **Kategori:** ${p.category || "-"}`,
        `• **Destek Amacı:** ${p.supportPurpose || "-"}`,
      ].join("\n"))
      .join("\n\n");

    // 6️ Add personalization
    const personalization = [
      profile?.department ? `• Kullanıcı bölümü: ${profile.department}` : null,
      profile?.dream_job ? `• Hedef meslek: ${profile.dream_job}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const userContent = [
      userQuestion,
      personalization ? `\nBağlamsal bilgiler:\n${personalization}` : "",
      contextText ? `\nİlgili program:\n${contextText}` : "",
    ].join("\n");

    // 7️ Generate answer using LLM
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt},
        ...conversationHistory,
        {
          role: "user",
          content:
            userContent ,
        },
      ],
    });

    return {ragResult: completion.choices[0]?.message?.content , programId:relevant[0].programId} || "Cevap alınamadı";
  }


  app.post("/ask", async (req, res) => {
    try {
      const { prompt, chatSessionId,userType } = req.body;

      // Save user message
      await database.run(
        "INSERT INTO chat_history (role, content, session_id) VALUES (?, ?, ?)",
        ["user", prompt, chatSessionId]
      );

      const conversationHistory = await getConversationHistory(chatSessionId);
      let profile = await getOrCreateProfile(chatSessionId);

      let responseText="";
      let hasProgram=false;
      let prog=null;
      let options = []
        // 1) Ask name
      if (!profile.name) {
        const maybeName = await detectName(prompt); 
        if (maybeName) {
              if (userType == "bireysel") {
                
                await updateProfile(chatSessionId, { name: maybeName,stage:0 });
                responseText = `Merhaba ${maybeName}, Tanıştığımıza memnun oldum. Hangi seviyede eğitim aldın ya da alıyorsun?
                `;
                
                options = [
                  "Okul Öncesi",
                  "İlkokul Öğrencileri",
                  "Ortaokul Öğrencileri",
                  "Lise Öğrencileri",
                  "Lise Mezunları",
                  "Önlisans Öğrencileri",
                  "Önlisans Mezunları",
                  "Lisans Öğrencileri",
                  "Lisans Mezunları",
                  "Yüksek Lisans Öğrencileri",
                  "Yüksek Lisans Mezunları",
                  "Doktora Öğrencileri",
                  "Doktora Mezunları",
                  "Doktora Yapmış Araştırmacılar",
                  "Tıpta Uzmanlık Öğrencileri",
                  "Tıpta Uzmanlık Derecesine Sahip Kişiler",
                  "Sanatta Yeterliliğe Sahip Kişiler"];
                }else{
                  await updateProfile(chatSessionId, { name: maybeName,stage:2 }); 
                  responseText = `Kurumsal olarak hangi tür çalışmalarda bulunuyorsunuz?`;
                  options = [
                            "Araştırma Üniversiteleri Bünyesindeki Araştırma Altyapıları",
                            "Uygulama ve Araştırma Merkezleri",
                            "Ar-Ge/Tasarım Merkezleri",
                            "Kamu Ar-Ge Birimleri",
                            "Savunma ve Güvenlik Alanında Görevleri Olan Kamu Kurumları",
                            "Yükseköğretim Kurumları",
                            "Eğitim ve Araştırma Hastaneleri",
                            "Kamu Kurum ve Kuruluşları",
                            "Sermaye Şirketleri",
                            "Büyük Ölçekli Sermaye Şirketleri",
                            "KOBİ",
                            "Üniversiteler",
                            "Kamu Araştırma Merkezleri",
                            "Kamu Araştırma Merkez ve Enstitüleri",
                            "Araştırma Enstitüleri",
                            "Araştırma Altyapıları",
                            "Teknoloji Geliştirme Bölgesi Şirketleri",
                            "Teknoloji Transfer Ofisleri",
                            "Teknoloji Geliştirme Bölgeleri Yönetici Şirketleri",
                            "Uluslararası ortaklı Ar-Ge projeleri yürüten kuruluşlar",
                            "Bilim Merkezi Kurumları",
                            "Başka"
                          ];

                }
        } else {
          responseText = "Sana hitap edebilmek için ismini öğrenebilir miyim?";
        }
      }

      // 2) Student/Professional branching 
      else if (profile.stage === 0) {
        
        const maybeeducationLevel = await validateEducationLevel(prompt);
        
          if (maybeeducationLevel) {
                  const lowerLevel = maybeeducationLevel.toLowerCase();
                console.log(lowerLevel);
                
                if (lowerLevel == "okul öncesi" || lowerLevel == "ilkokul Öğrencileri" || lowerLevel == "ortaokul öğrencileri" || lowerLevel == "lise öğrencileri" || lowerLevel == "lise mezunları" ) {
                  await updateProfile(chatSessionId, { education_level: maybeeducationLevel, stage: 1 });
                  responseText = "Kaç yaşındasınız?";
                }else{
                  await updateProfile(chatSessionId, { education_level: maybeeducationLevel, stage: 2 });
                  responseText = "Peki bir işte çalışıyorsan ne iş yaptığını söyler misin?";
                      options = [
                      "Öğretmenler",
                      "Araştırma Görevlisi",
                      "Öğretim Görevlisi",
                      "Öğretim Elemanları",
                      "Doktor Öğretim Üyesi",
                      "Doçent",
                      "Uzman",
                      "Lisans Mezunu Enstitüsü Çalışanları",
                      "Lisans Mezunu Üniversite Çalışanı",
                      "Lisans Mezunu Kamu Kurumu Çalışanı",
                      "Lisans Mezunu Özel Kuruluş Çalışanları",
                      "Bilim Merkezi Çalışanları",
                      "Başka"

                    ];
                }           
              } else {
                responseText = `Tam olarak anlayamadım. Bu listeden senin için uygun olanı bana yazabilir misin?`    
                
                options = [
                  "Okul Öncesi",
                  "İlkokul Öğrencisi",
                  "Ortaokul Öğrencisi",
                  "Lise Öğrencisi",
                  "Lise Mezunu",
                  "Ön Lisans Öğrencisi",
                  "Ön Lisans Mezunu",
                  "Lisans Öğrencisi",
                  "Lisans Mezunu",
                  "Yüksek Lisans Öğrencisi",
                  "Yüksek Lisans Mezunu",
                  "Doktora Öğrencisi",
                  "Doktora Mezunu",
                  "Doktora Yapmış Araştırmacılar",
                  "Tıpta Uzmanlık Öğrencisi",
                  "Tıpta Uzmanlık Derecesine Sahip Kişiler",
                  "Sanatta Yeterliliğe Sahip Kişiler"];

              }
        }
    
      else if (profile.stage === 1 && !profile.age) {
   
        // Student path → ask department
          const maybeAge = await validateAge(prompt);
          if (maybeAge) {
            await updateProfile(chatSessionId, { age: maybeAge, stage: 3 });
            responseText = "Destek alarak hangi planını hayata geçirmek istiyorsun? Detaylı şekilde anlatır mısın?";
          } else {
            responseText = "Kaç yaşındasınız?";

          }
      }
      else if (profile.stage === 2 && !profile.dream_job) {
        let maybeJob;  
        if (userType=="bireysel") {
            maybeJob = await validateJob(prompt);
        }else{
            maybeJob = await enterpriseJobVal(prompt);
          }
          if (maybeJob) {
            await updateProfile(chatSessionId, { dream_job: maybeJob, stage: 3 });
            responseText = "Destek alarak hangi planını hayata geçirmek istiyorsun? Detaylı şekilde anlatır mısın?";
          } else {

                  if (userType=="bireysel") {
                      responseText = `Tam olarak anlayamadım. Bu listeden senin için uygun olanı bana yazabilir misin?`;
                    options = [
                      "Öğretmenler",
                      "Araştırma Görevlisi",
                      "Öğretim Görevlisi",
                      "Öğretim Elemanları",
                      "Doktor Öğretim Üyesi",
                      "Doçent",
                      "Uzman",
                      "Lisans Mezunu Enstitüsü Çalışanları",
                      "Lisans Mezunu Üniversite Çalışanı",
                      "Lisans Mezunu Kamu Kurumu Çalışanı",
                      "Lisans Mezunu Özel Kuruluş Çalışanları",
                      "Bilim Merkezi Çalışanları",
                      "Başka"

                    ];

                  } else{
                          responseText = `Tam olarak anlayamadım. Bu listeden senin için uygun olanı bana yazabilir misin?`;
                        options = [
                            "Araştırma Üniversiteleri Bünyesindeki Araştırma Altyapıları",
                            "Uygulama ve Araştırma Merkezleri",
                            "Ar-Ge/Tasarım Merkezleri",
                            "Kamu Ar-Ge Birimleri",
                            "Savunma ve Güvenlik Alanında Görevleri Olan Kamu Kurumları",
                            "Yükseköğretim Kurumları",
                            "Eğitim ve Araştırma Hastaneleri",
                            "Kamu Kurum ve Kuruluşları",
                            "Sermaye Şirketleri",
                            "Büyük Ölçekli Sermaye Şirketleri",
                            "KOBİ",
                            "Üniversiteler",
                            "Kamu Araştırma Merkezleri",
                            "Kamu Araştırma Merkez ve Enstitüleri",
                            "Araştırma Enstitüleri",
                            "Araştırma Altyapıları",
                            "Teknoloji Geliştirme Bölgesi Şirketleri",
                            "Teknoloji Transfer Ofisleri",
                            "Teknoloji Geliştirme Bölgeleri Yönetici Şirketleri",
                            "Uluslararası ortaklı Ar-Ge projeleri yürüten kuruluşlar",
                            "Bilim Merkezi Kurumları",
                            "Başka"
                          ];

                    }

          }
      }

      // 4) Career dreams (student path) or worker path
      else if (profile.stage === 3 && !profile.career_dreams) {
        
        const structuredDreams = prompt;
        if (structuredDreams) {
            await updateProfile(chatSessionId, { career_dreams: JSON.stringify(structuredDreams), stage: 4 });
          profile = await getOrCreateProfile(chatSessionId);
          console.log(profile);
          
          const { message, programId } = await recommendProgramsForProfile(profile, { topK: 3 });
          prog = programId;
          responseText =
            `Teşekkürler ${profile.name}. Profilinizi kaydettim.\n\n` +
            message + `\n\nBelirli bir programı seçip ayrıntı sormak isterseniz program numarası ile yazabilirsiniz.`;
          hasProgram = true;
        } else {
          responseText = "Hayallerini biraz daha net anlatabilir misin?";
        }
      }

      // 5) Recommendation ready stageq
      else if (profile.stage >= 3) {
        if (shouldRecommendNow(prompt)) {
          const { message, programId } = await recommendProgramsForProfile(profile, { topK: 3 });
          prog = programId;
          responseText = message;
        } else {
          const { ragResult, programId } = await answerWithRAG({ userQuestion: prompt, conversationHistory, profile });
          prog = programId;
          responseText = ragResult?.type === "clarify" ? ragResult.message : ragResult;
        }
      }

      
      // Save assistant response
      await database.run(
        "INSERT INTO chat_history (role, content, session_id) VALUES (?, ?, ?)",
        ["assistant", responseText, chatSessionId]
      );

      res.json({ response: responseText,hasProgram,programId:prog ,options});
    } catch (err) {
      console.error("Hata:", err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });


  /* --------------- Answer Builder (RAG) --------------- */
  async function detectName(text) {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract the person's first name if it's given. If no name is provided, return only 'NONE' the input is turkish so do not consider ben as a name it`s i in turkish." },
        { role: "user", content: text }
      ]
    });
    const answer = res.choices[0].message.content.trim();
    return answer !== "NONE" ? answer : null;
  }



  async function validateAge(text) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
          Extract the **age** from the input text (in Turkish).  

          ✅ Rules:
          - Return ONLY a number (e.g., "23").
          - Accept common Turkish formats:
            - "23 yaşındayım" → "23"
            - "yaşım 18" → "18"
            - "ben 30 oldum" → "30"
            - "14 yaş" → "14"
            - also accept numbers 
          - If multiple ages are mentioned, choose the most likely one referring to the user's current age.
          - If no valid age is found, return ONLY "INVALID".
        `
      },
      { role: "user", content: text }
    ]
  });

  const answer = res.choices[0].message.content.trim();
  return answer !== "INVALID" ? parseInt(answer, 10) : null;
}

async function validateEducationLevel(text) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a strict classifier.  
Identify the **specific education level** mentioned in the text.  
It must match EXACTLY ONE of these options (verbatim):

  • Okul Öncesi
	•	İlkokul Öğrencileri
	•	Ortaokul Öğrencileri
	•	10-17 Yaşlarındaki Ortaokul Öğrencileri
	•	Lise Öğrencileri
	•	15-17 Yaşındaki Lise Öğrencileri
	•	Lise Mezunları
	•	Önlisans Öğrencileri
	•	Önlisans Mezunları
	•	Lisans Öğrencileri
	•	Lisans Mezunları
	•	Yüksek Lisans Öğrencileri
	•	Yüksek Lisans Mezunları
	•	Doktora Öğrencileri
	•	Doktora Mezunları
	•	Doktora Yapmış Araştırmacılar
	•	Tıpta Uzmanlık Öğrencileri
	•	Tıpta Uzmanlık Derecesine Sahip Kişiler
	•	Sanatta Yeterliliğe Sahip Kişiler


⚠️ Rules:
- If the input **clearly matches** one of the above, return ONLY that option.  
- If the input is vague, incomplete, or doesn’t exactly map (e.g. "mezun", "lisans", "üniversite"), return ONLY "INVALID".  
- Do not guess or make assumptions.  
- The input will be in Turkish.

✅ Examples:
- "mezunum" → "INVALID"  
- "lisans" → "INVALID"  
- "üniversite" → "INVALID"
`
      },
      { role: "user", content: text }
    ]
  });

  const answer = res.choices[0].message.content.trim();
  return answer !== "INVALID" ? answer : null;
}


async function validateJob(text) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a strict classifier.  
Your task is to extract a profession from user text, but it MUST be one of the following exactly (no variations, no synonyms):

- Öğretmenler
- Araştırma Görevlisi
- Öğretim Görevlisi
- Öğretim Elemanları
- Doktor Öğretim Üyesi
- Doçent
- Uzman
- Lisans Mezunu Enstitüsü Çalışanları
- Lisans Mezunu Üniversite Çalışanı
- Lisans Mezunu Kamu Kurumu Çalışanı
- Lisans Mezunu Özel Kuruluş Çalışanları
- Bilim Merkezi Çalışanları
- Başka 

Rules:
- If the input clearly matches one of these, return ONLY that exact phrase.  
- If no clear match, return ONLY "INVALID".  
- Do not return explanations, multiple options, or anything else.  
- The input will be in Turkish.
`
      },
      { role: "user", content: text }
    ]
  });

  const answer = res.choices[0].message.content.trim();
  return answer === "INVALID" ? null : answer;
}
async function enterpriseJobVal(text) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a strict classifier.  
Your task is to extract an enterprise type from user text, but it MUST be one of the following exactly (no variations, no synonyms):

- Araştırma Üniversiteleri Bünyesindeki Araştırma Altyapıları
- Uygulama ve Araştırma Merkezleri
- Ar-Ge/Tasarım Merkezleri
- Kamu Ar-Ge Birimleri
- Savunma ve Güvenlik Alanında Görevleri Olan Kamu Kurumları
- Yükseköğretim Kurumları
- Eğitim ve Araştırma Hastaneleri
- Kamu Kurum ve Kuruluşları
- Sermaye Şirketleri
- Büyük Ölçekli Sermaye Şirketleri
- KOBİ
- Üniversiteler
- Kamu Araştırma Merkezleri
- Kamu Araştırma Merkez ve Enstitüleri
- Araştırma Enstitüleri
- Araştırma Altyapıları
- Teknoloji Geliştirme Bölgesi Şirketleri
- Teknoloji Transfer Ofisleri
- Teknoloji Geliştirme Bölgeleri Yönetici Şirketleri
- Uluslararası ortaklı Ar-Ge projeleri yürüten kuruluşlar
- Bilim Merkezi Kurumları
- Başka 

Rules:
- If the input clearly matches one of these, return ONLY that exact phrase.  
- If no clear match, return ONLY "INVALID".  
- Do not return explanations, multiple options, or anything else.  
- The input will be in Turkish.
        `
      },
      { role: "user", content: text }
    ]
  });

  const answer = res.choices[0].message.content.trim();
  return answer === "INVALID" ? null : answer;
}

  async function detectCareerDreams(text) {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
          You will be given a user response in Turkish about their professional dreams or career goals.
          Your task is to extract a structured representation of their career dreams.

          Rules:
          - The input is in Turkish.
          - Extract the main job or profession the user wants to pursue as "mainJob".
          - Extract any specific focus areas, specialties, or fields related to that job as "focusAreas" (if mentioned).
          - If multiple dreams or professions are mentioned, include them all in "mainJob" as a list.
          - Respond ONLY in valid JSON like this:

          {
            "mainJob": ["Job1", "Job2"],
            "focusAreas": ["Focus1", "Focus2"]
          }

          Do NOT add explanations or extra text.
          `
        },
        { role: "user", content: text }
      ]
    });

    let raw = res.choices[0].message?.content?.trim();
    let structuredDreams;

    try {
      structuredDreams = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse career dreams JSON:", raw);
      structuredDreams = { mainJob: [], focusAreas: [] };
    }

    return structuredDreams;
  }
async function generateCareerRecommendation(profile) {
  const text = profile?.career_dreams || "";


  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an assistant that summarizes a user's career dream and then makes a recommendation.
        Rules:
        - If the input is vague, meaningless, or not a valid career dream, ONLY return "INVALID".
        - Otherwise: 
          1. Write 1–2 sentences describing the dream positively in Turkish. 
          2. Then add one sentence that starts with "Buna dayanarak..." and give a clear, encouraging recommendation.`
      },
      {
        role: "user",
        content: `Kariyer hayali: ${text}`
      }
    ]
  });
    const answer = res.choices[0].message.content.trim();
    return answer !== "INVALID" ? answer : null;
}



  /* --------------- /ask Route (integrated flow) --------------- */

  app.post("/submit-form", async (req, res) => {
    try {
      const formData = req.body;
      const { chatSessionId, ...formFields } = formData;

      const result = await database.run(
        `INSERT INTO form_records (full_name, phone_number, email, education_status, profession, nationality,
                                        support_program, date_of_birth)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          formFields.fullName,
          formFields.phoneNumber,
          formFields.email,
          formFields.educationStatus,
          formFields.profession,
          formFields.nationality,
          formFields.supportProgram,
          formFields.dateOfBirth,
        ]
      );

      const newFormRecordId = result.lastID;

      // Form_record_id'yi, ilgili session_id'ye sahip TÜM chat_history kayıtlarına ata
      if (chatSessionId) {
        await database.run(
          "UPDATE chat_history SET form_record_id = ? WHERE session_id = ?",
          [newFormRecordId, chatSessionId]
        );
      }

      console.log("Alınan form verileri:", formFields);

      res.json({
        message: "Formunuz başarıyla alındı!",
        formRecordId: newFormRecordId,
      });
    } catch (error) {
      console.error("Form gönderme hatası:", error);
      res.status(500).json({ error: "Form gönderilirken bir hata oluştu." });
    }
  });

  app.get("/admin/chat-history", async (req, res) => {
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
          console.log("");
          
      res.json(history);
    } catch (error) {
      console.error("Sohbet geçmişi çekilirken hata:", error); // Hata detayını terminalde göster
      res.status(500).json({ error: "Sohbet geçmişi alınamadı." });
    }
  });

  // Seçilen sohbet geçmişi kayıtlarını silme endpoint'i
  app.delete("/admin/chat-sessions", async (req, res) => {
    // Endpoint adını değiştirdik
    try {
      const { sessionIds } = req.body; // Frontend'den gelen sessionIds'ı doğru şekilde alıyoruz

      if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
        return res.status(400).json({
          error: "Silinecek oturum ID'leri sağlanmadı veya formatı hatalı.",
        });
      }

      // SQL sorgusunda session_id'ye göre silme yapıyoruz
      const placeholders = sessionIds.map(() => "?").join(",");
      const sql = `DELETE
                      FROM chat_history
                      WHERE session_id IN (${placeholders})`;

      const result = await database.run(sql, sessionIds); // SQL'e sessionIds'ı iletiyoruz

      if (result.changes === 0) {
        return res.status(404).json({
          message:
            "Belirtilen ID'lere sahip hiçbir sohbet oturumu bulunamadı veya zaten silinmiş.",
        });
      }

      res.json({
        message: `${result.changes} adet sohbet mesajı başarıyla silindi (${sessionIds.length} oturumdan).`,
      });
    } catch (error) {
      console.error("Sohbet oturumu silinirken hata:", error); // Detaylı hata logu
      res
        .status(500)
        .json({ error: "Sohbet oturumu silinirken sunucu hatası oluştu." });
    }
  });

  app.listen(port, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${port}`);
  });
