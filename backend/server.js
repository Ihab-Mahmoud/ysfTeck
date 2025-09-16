  import express from "express";
  import nodemailer from "nodemailer";
  import cors from "cors";
  import bodyParser from "body-parser";
  import * as dotenv from "dotenv";
  dotenv.config();
  import { initializeDatabase, db } from "./database.js"; 
  import OpenAI from "openai";
  import path from "path";
  import fs from "fs";
import { log } from "console";
import { educationPrograms } from "./utils.js";
import sgMail from "@sendgrid/mail";

const app = express();
app.use(express.json());

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
  });
  
  const client = new OpenAI({ 
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
Görevin TÜBİTAK destek programları hakkında **yalnızca verilen resmi veri tabanına dayanarak** bilgi vermek.

KURALLAR:
- Kibar, profesyonel ve kısa cevaplar ver.
- Her mesajda tekrar selamlama yapma.
- Konu dışı sorulara şu şekilde yönlendir: "Ben sadece TÜBİTAK destek programları hakkında bilgi verebilirim."
- Asla demo olduğunu veya yapay zeka olduğunu söyleme.
- Kullanıcı verdiği cevabın/doğrunun doğruluğunu sorarsa, doğruysa onu tereddütsüz şekilde onayla ve emin olmasını sağla.
- **Eğer kullanıcı sorusu hakkında elimde resmi veri yoksa, asla tahmin etme veya uydurma.** 
  Bunun yerine şunu söyle: "Bu konu hakkında net bir bilgiye sahip değilim. İsterseniz tubitak.gov.tr adresinden bilgi alabilirsiniz. Merak ettiğiniz başka bir şey varsa size yardımcı olabilirim."

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

📌 Önemli: 
- Cevaplarını her zaman verilen program verisi (program adı, hedef kitle, kategori, amaç vb.) üzerinden oluştur.
- Elinde olmayan detayları uydurma, sadece veri setinde olanları göster.

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
  const text = ` ${program.targetAudience} ${program.programName} ${program.supportPurpose} `.toLowerCase();
   const targetAudience = (program?.targetAudience || "").toLowerCase();
  const combinedDreams = (
    (profile?.dream_job || "") + " " + (profile?.career_dreams || "")
  ).toLowerCase();

  const jobHas = (t) => combinedDreams.includes(t.toLowerCase());
  const has = (t) => text.includes(t.toLowerCase());
   const audienceHas = (t) => targetAudience.includes(t.toLowerCase());
  let boost = 0;

  // --- Region check ---
  if (profile?.region) {
    const profRegion = profile.region.toLowerCase().trim();
    const progRegion = (program?.region || "").toLowerCase().trim();

    // if profile has region but program doesn’t match, block this program
    if (profRegion && progRegion && profRegion !== progRegion) {
      return Number.NEGATIVE_INFINITY;
    }
  }
  // All possible job keywords you gave
  const jobKeywords = [
    "öğretmen",
    "öğretim eleman",
    "lisans/Lisans üstü mezunu kamu kurumu çalışan",
    "lisans/lisans üstü mezunu özel kuruluş çalışan",
    "büyük ölçekli ve KOBİ",
    "teknoloji geliştirme bölgesi şirket",
    "ar-ge/tasarım merkez",
    "teknoloji transfer ofis",
    "uluslararası ortaklı ar-ge projeleri yürüten Kuruluş",
    "yükseköğretim kurum",
    "uygulama ve araştırma merkez",
    "araştırma enstitü",
    "araştırma altyapı",
    "kamu araştırma merkez",
    "kamu ar-ge birim",
    "kamu kurum ve kuruluş",
    "savunma ve güvenlik alanında görevleri olan kamu kurum",
    "eğitim ve araştırma hastane",
    "bilim merkez",
  ];

  // Check each keyword: must exist in both combinedDreams AND program text

    
  for (const keyword of jobKeywords) {
    if (jobHas(keyword) && audienceHas(keyword)) {
      boost += 0.3; // adjust weight as needed
    }
  }
  
  // Special case: "üniversiteler" → only match in targetAudience
  if (jobHas("üniversiteler") && audienceHas("üniversiteler")) {
    boost += 0.3;
  }
  if (jobHas("DİĞER")&& has("Herkes")) {
    boost += 0.3; // adjust weight as needed
  }

  return boost;
}

// Example with OpenAI embeddings (pseudo-code)
async function getProgramScores(profile, programs) {
  const directEducationLevels = [
  "okul öncesi",
  "i̇lkokul öğrencileri",
  "ortaokul öğrencileri",
  "lise öğrencileri",
  "lise mezunları"
];

let profileText = "";

// Convert profile education level to lowercase for comparison
const eduLevel = (profile.education_level || "").toLowerCase();
console.log(eduLevel);


  // 🔹 Case 1: Direct education levels → return candidates only (no embeddings)
  if (directEducationLevels.includes(eduLevel)) {
    return programs
  }

  profileText = `${(profile.dream_job || "")} ${(profile.career_dreams || "")}`;

const scoredPrograms = [];
for (let program of programs) {
  let score = await computeSemanticScore(profileText, program.embedding);
  scoredPrograms.push({ ...program, score });
}

return scoredPrograms.sort((a, b) => b.score - a.score);
}
async function getProgramScoresForDream(profile, programs) {

let profileText = "";

console.log(programs);


  profileText = `${(profile.career_dreams || "")}`;

const scoredPrograms = [];
for (let program of programs) {
  let score = await computeSemanticScoreDream(profileText, program.supportPurpose);
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
async function computeSemanticScoreDream(profileText, programText) {
  const profileVec = await getEmbedding(profileText);
  const programVec = await getEmbedding(programText);
  return cosineSimilarity(profileVec, programVec); // 0-1
}

/* --------------- Retrieval Helper --------------- */

async function recommendProgramsForProfile(profile, { topK = 3 } = {}) {  
  ensureDataDir();
  if (!fs.existsSync(EMBEDDED_PROGRAMS_PATH_REC)) {
    return { message: "Program verisi bulunamadı.", recommended: [] };
  }

  let  all = JSON.parse(fs.readFileSync(EMBEDDED_PROGRAMS_PATH_REC, "utf-8"));



  // 1) Hard filter by education
  const userEdu = (profile.education_level || "").toLowerCase();
  let candidateNames  = educationPrograms[userEdu] || [];
  
let candidates = all.filter(p =>
  candidateNames.some(c =>
    // match by id if both sides have one
    (c.id && p.programId && p.programId.toLowerCase() === c.id.toLowerCase()) ||
    // otherwise, fallback to programName
    (p.programName && p.programName.toLowerCase().includes(c.name.toLowerCase()))
  )
);

  // fallback if nothing matched
  if (candidates.length === 0 || (profile.dream_job && profile.dream_job !="DİĞER" )) {
    candidates = all;
  }
  let scored=[];
  if (profile.dream_job && profile.dream_job !="DİĞER" ) {
    
    scored = candidates.map(p => {
      const boost = scoreBoostForProfile(p, profile); // your boost function
      return { ...p, score: boost };
    })
    .filter(p => p.score > 0) // keep only boosted ones
    .sort((a, b) => b.score - a.score)



    
    // -------------------------------
    // NO DREAM JOB → Embeddings Path
    // -------------------------------
  } else {
    scored = (await getProgramScores(profile, candidates))
  }

  scored =  (await getProgramScoresForDream(profile,scored)).slice(0,topK)

  // 3) Build pretty response
  const lines = [];
  let eg;
  lines.push("📌 Profilinize göre öne çıkan programlar:");
  if (scored.length === 0) {
    lines.push("- Uygun program bulunamadı. Profili biraz daha detaylandırabilirsiniz.");
  } else {
    for (const p of scored) {
      lines.push(
        `  - ${p.programName}\n` +
        `  • Hedef kitlesi: ${truncate(p.targetAudience, 180)}\n`
      );
    }
    eg = scored[0]?.programName || null;
    if (eg) {
      lines.push(`\n👉 Bir programı seçerseniz destek programı numarasını (örn. **${eg}**) veya adını yazarak detay sorabilirsiniz.`);
    }
  }

  return {
    programId: eg,
    message: lines.join("\n"),
    recommended: scored.map(p => ({
      id: p.programId,
      name: p.programName,
      targetAudience: p.targetAudience
    }))
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
    let allPrograms = JSON.parse(fs.readFileSync(EMBEDDED_PROGRAMS_PATH, "utf-8"));

    const corporateOnlyIds = [
      "1007", "1071", "1501", "1505", "1507", 
      "1509", "1511", "1515", "1602", "1613", 
      "1702", "1707", "1709", "1711", "1719","1004",
    ];
    
    if (profile.user_type === "kurumsal") {
      // Keep only the corporate IDs
      allPrograms = allPrograms.filter(p => corporateOnlyIds.includes(p.programId));
    } else {
      // Exclude corporate IDs
      allPrograms = allPrograms.filter(p => !corporateOnlyIds.includes(p.programId));

    }
  
    

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
        `• *Program ID:* ${p.programId}`,
        `• *Program:* ${p.programName}`,
        `• *Uygunluk(Hedef Kitlesi):* ${p.targetAudience || "-"}`,
        `• *Son Tarih:* ${p.deadline || "-"}`,
        `• *Destek Şartları & Süreç:* ${p.targetConditionsAndProcess || "-"}`,
        `• *Destek Miktarı (Üst Limit):* ${p.supportAmount || "-"}`,
        `• *Bölge:* ${p.region || "-"}`,
        `• *Kategori:* ${p.category || "-"}`,
        `• *Destek Amacı:* ${p.supportPurpose || "-"}`,
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
      console.log("===========================================");
    console.log(userContent);
    console.log("===========================================");
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

    return {ragResult: completion.choices[0]?.message?.content , programId:relevant[0].programName} || "Cevap alınamadı";
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
      let rec=null;
        // 1) Ask name
      if (!profile.name) {
        const maybeName = await detectName(prompt); 
        if (maybeName) {
              if (userType == "bireysel") {
                
                await updateProfile(chatSessionId, {user_type:"bireysel", name: maybeName,stage:0 });
                responseText = `Merhaba ${maybeName}, Tanıştığımıza memnun oldum. Hangi seviyede eğitim aldınız ya da alıyorsunuz?

Aşağıdan size uygun olanı seçebilirsiniz.                
                `;
                
                options = [
                  "İlkokul Öğrencisiyim",
                  "Ortaokul Öğrencisiyim",
                  "Lise Öğrencisiyim",
                  "Lise Mezunuyum",
                  "Önlisans Öğrencisiyim",
                  "Önlisans Mezunuyum",
                  "Lisans Öğrencisiyim",
                  "Lisans Mezunuyum",
                  "Yüksek Lisans Öğrencisiyim",
                  "Yüksek Lisans Mezunuyum",
                  "Doktora Öğrencisiyim",
                  "Doktora Mezunuyum",
                ];

                }else{
                  await updateProfile(chatSessionId, { name: maybeName,stage:2,user_type:"kurumsal" }); 
                  responseText = `Ulusal programlarla mı, yoksa uluslararası programlarla mı ilgileniyorsunuz?`;
              options = [
                            "Ulusal Destek Programları",
                            "Uluslararası Destek Programları",
                          ];
                }
        } else {
          responseText = "Size hitap edebilmek için ismini öğrenebilir miyim?";
          
        }
      }

      // 2) Student/Professional branching 
      else if (profile.stage === 0) {
        
        const maybeeducationLevel = await validateEducationLevel(prompt);
        
          if (maybeeducationLevel) {
                  const lowerLevel = maybeeducationLevel.toLowerCase();
                console.log(lowerLevel);
                
                if (lowerLevel == "okul öncesi" || lowerLevel == "i̇lkokul öğrencileri" || lowerLevel == "ortaokul öğrencileri" || lowerLevel == "lise öğrencileri" || lowerLevel == "lise mezunları" ) {
                  await updateProfile(chatSessionId, { education_level: maybeeducationLevel, stage: 5 });
                  responseText = "Destek alarak hangi planını hayata geçirmek istiyorsunuz? Detaylı şekilde anlatır mısınız?";
                }else{
                  await updateProfile(chatSessionId, { education_level: maybeeducationLevel, stage: 3 });
                   responseText = `Bir işte çalışıyor musunuz?`    
                
            options = [
                  "Evet",
                  "Hayır",
                ];
                }           
              } else {
                responseText = `Tam olarak anlayamadım. Bu listeden senin için uygun olanı bana yazabilir misiniz?`    
                
            options = [
                  "İlkokul Öğrencisiyim",
                  "Ortaokul Öğrencisiyim",
                  "Lise Öğrencisiyim",
                  "Lise Mezunuyum",
                  "Önlisans Öğrencisiyim",
                  "Önlisans Mezunuyum",
                  "Lisans Öğrencisiyim",
                  "Lisans Mezunuyum",
                  "Yüksek Lisans Öğrencisiyim",
                  "Yüksek Lisans Mezunuyum",
                  "Doktora Öğrencisiyim",
                  "Doktora Mezunuyum",
                ];

              }
        }
      else if (profile.stage === 1 && !profile.age) {
   
        // Student path → ask department
          const maybeAge = await validateAge(prompt);
          if (maybeAge) {
            await updateProfile(chatSessionId, { age: maybeAge, stage: 5 });
            responseText = "Destek alarak hangi planını hayata geçirmek istiyorsunuz? Detaylı şekilde anlatır mısınız?";
          } else {
            responseText = "Kaç yaşındasınız?";

          }
      }
      else if (profile.stage === 2) {
            const programType = prompt;

            // Common options list
            const enterpriseOptions =  options = [
                                      "Büyük Ölçekli ve KOBİ",
                                      "Teknoloji Geliştirme Bölgesi Şirketleri",
                                      "Ar-Ge/Tasarım Merkezleri",
                                      "Teknoloji Transfer Ofisleri",
                                      "Uluslararası Ortaklı Ar-Ge Projeleri Yürüten Kuruluşlar",
                                      "Üniversiteler",
                                      "Yükseköğretim Kurumları",
                                      "Uygulama ve Araştırma Merkezleri/Enstitüler",
                                      "Araştırma Enstitüleri",
                                      "Araştırma Altyapıları",
                                      "Kamu Araştırma Merkezleri",
                                      "Kamu Ar-Ge Birimleri",
                                      "Kamu Kurum ve Kuruluşları",
                                      "Savunma ve Güvenlik Alanında Görevleri Olan Kamu Kurumları",
                                      "Eğitim ve Araştırma Hastaneleri",
                                      "Bilim Merkezi",
                                      "DİĞER"
                                    ];

            if (programType === "Ulusal Destek Programları") {
              await updateProfile(chatSessionId, {  stage: 4, region: "Ulusal" });
              responseText = `Kurumsal olarak hangi tür çalışmalarda bulunuyorsunuz?`;
              options = enterpriseOptions;

            } else if (programType === "Uluslararası Destek Programları") {
              await updateProfile(chatSessionId, {  stage: 4, region: "Uluslararası" });
              responseText = `Kurumsal olarak hangi tür çalışmalarda bulunuyorsunuz?`;
              options = enterpriseOptions;

            } else {
              responseText = `Lütfen tekrar seçiniz:`;
              options = [
                "Ulusal Destek Programları",
                "Uluslararası Destek Programları",
              ];
            }
      }
      else if (profile.stage === 3) {

          if (prompt =="Evet") {
 await updateProfile(chatSessionId, { stage: 4 });

              responseText = `Peki hangi mesleğe sahipsiniz? Lütfen aşağıdan size uygun olanı seçin.

`;
                    options = [
                      "Öğretmen",
                      "Öğretim Elemanı",
                      "Lisans/Lisans Üstü Mezunu Kamu Kurumu Calışanı",
                      "Lisans/Lisans Üstü Mezunu Özel Kuruluş Calışanı",
                      "DİĞER"
                    ];
          }else if (prompt =="Hayır"){
 await updateProfile(chatSessionId, { stage: 5 });
                  responseText = "Destek alarak hangi planını hayata geçirmek istiyorsunuz? Detaylı şekilde anlatır mısınız?";
          }else{
            responseText = "Lütfen Tekrar seçiniz"
            options = [
                  "Evet",
                  "Hayır",
                ];
          }

          
      }
      else if (profile.stage === 4 && !profile.dream_job) {
        let maybeJob;  
        if (userType=="bireysel") {
            maybeJob = await validateJob(prompt);
        }else{
            maybeJob = await enterpriseJobVal(prompt);
          }
          if (maybeJob) {
            await updateProfile(chatSessionId, { dream_job: maybeJob, stage: 5 });
            responseText = "Destek alarak hangi planınızı hayata geçirmek istiyorsunuz? Detaylı şekilde anlatır mısınız?";
          } else {

                  if (userType=="bireysel") {
                      responseText = `Tam olarak anlayamadım. Bu listeden senin için uygun olanı bana yazabilir misin?`;
                  options = [
                      "Öğretmen",
                      "Öğretim Elemanı",
                      "Lisans/Lisans Üstü Mezunu Kamu Kurumu Çalışanı",
                      "Lisans/Lisans Üstü Mezunu Özel Kuruluş Çalışanı",
                      "DİĞER"
                    ];
                  } else{
                          responseText = `Tam olarak anlayamadım. Bu listeden senin için uygun olanı bana yazabilir misin?`;
                        options = [
                            "Büyük Ölçekli ve KOBİ",
                            "Teknoloji Geliştirme Bölgesi Şirketleri",
                            "Ar-Ge/Tasarım Merkezleri",
                            "Teknoloji Transfer Ofisleri",
                            "Uluslararası Ortaklı Ar-Ge Projeleri Yürüten Kuruluşlar",
                            "Üniversiteler",
                            "Yükseköğretim Kurumları",
                            "Uygulama ve Araştırma Merkezleri/Enstitüler",
                            "Araştırma Enstitüleri",
                            "Araştırma Altyapıları",
                            "Kamu Araştırma Merkezleri",
                            "Kamu Ar-Ge Birimleri",
                            "Kamu Kurum ve Kuruluşları",
                            "Savunma ve Güvenlik Alanında Görevleri Olan Kamu Kurumları",
                            "Eğitim ve Araştırma Hastaneleri",
                            "Bilim Merkezi",
                            "DİĞER"
                          ];

                    }

          }
      }
      // 4) Career dreams (student path) or worker path
      else if (profile.stage === 5 && !profile.career_dreams) { 
        
        const structuredDreams = prompt;
        if (structuredDreams) {
            await updateProfile(chatSessionId, { career_dreams: JSON.stringify(structuredDreams), stage: 6 });
          profile = await getOrCreateProfile(chatSessionId);
          console.log(profile);
          
          const { message, programId,recommended } = await recommendProgramsForProfile(profile, { topK: 3 });
          rec = recommended
          prog = programId;
          responseText =
            `Teşekkürler ${profile.name}. Profilinizi kaydettim.\n\n` +
            message + `\n\nBelirli bir programı seçip ayrıntı sormak isterseniz program numarası ile yazabilirsiniz.`;
          hasProgram = true;
        } else {
          responseText = "Hayallerini biraz daha net anlatabilir misininz?";
        }
      }
      // 5) Recommendation ready stageq
      else if (profile.stage >= 5) {
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

      res.json({ response: responseText,hasProgram,programId:prog ,options,recommended:rec});
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
  const SYSTEM_PROMPT = `
You are an education level normalizer.

Your task: Given a short Turkish text where a user describes their current or past education 
(e.g. "lisedeyim", "lise bitirdim", "üniversitedeyim"), return the closest matching education level 
from the fixed list below (verbatim, exactly as written):

  • İlkokul Öğrencileri
  • Ortaokul Öğrencileri
  • Lise Öğrencileri
  • Lise Mezunları
  • Önlisans Öğrencileri
  • Önlisans Mezunları
  • Lisans Öğrencileri
  • Lisans Mezunları
  • Yüksek Lisans Öğrencileri
  • Yüksek Lisans Mezunları
  • Doktora Öğrencileri
  • Doktora Mezunları

⚠️ Rules:
- Normalize colloquial expressions (e.g. "lisedeyim" → "Lise Öğrencileri", 
  "lise bitirdim" → "Lise Mezunları"
  ).
- Treat verbs like "okuyorum", "öğrencisiyim", "deyim" as Öğrencileri.
- Treat words like "mezun", "bitirdim", "tamamladım" as Mezunları.
- If the text is vague (e.g. "mezun oldum" without level), return only "INVALID".
- Okul Öncesi is accepted
- Return exactly one option from the list above, nothing else.
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text }
    ]
  });

  const answer = res.choices[0].message.content.trim();
  return answer !== "INVALID" ? answer : null;
}



const allowedJobs = [
  "Öğretmen",
  "Öğretim Elemanı",
  "Lisans/Lisans Üstü Mezunu Kamu Kurumu Çalışanı",
  "Lisans/Lisans Üstü Mezunu Özel Kuruluş Çalışanı",
  "DİĞER"
];

async function validateJob(text) {
  const cleaned = text.trim();

  // Direct match check first
  if (allowedJobs.includes(cleaned)) {
    return cleaned;
  }

  // Otherwise, ask the model
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a strict classifier.

Return EXACTLY one of these options (verbatim):

  • Öğretmen
  • Öğretim Elemanı
  • Lisans/Lisans Üstü Mezunu Kamu Kurumu Çalışanı
  • Lisans/Lisans Üstü Mezunu Özel Kuruluş Çalışanı
  • DİĞER

Rules:
- If the input matches one of the above options (even with different casing or spaces), return that option.
- If the input clearly does not match, return ONLY "INVALID".
- Do not explain, do not add extra text.
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

Your task: Given a short Turkish text where a user describes their institution or enterprise type, return EXACTLY one of the following options (verbatim, exactly as written):

  - Büyük Ölçekli ve KOBİ 
  - Teknoloji Geliştirme Bölgesi Şirketleri 
  - Ar-Ge/Tasarım Merkezleri 
  - Teknoloji Transfer Ofisleri 
  - Uluslararası Ortaklı Ar-Ge Projeleri Yürüten Kuruluşlar 
  - Üniversiteler 
  - Yükseköğretim Kurumları 
  - Uygulama ve Araştırma Merkezleri/Enstitüler
  - Araştırma Enstitüleri 
  - Araştırma Altyapıları 
  - Kamu Araştırma Merkezleri
  - Kamu Ar-Ge Birimleri 
  - Kamu Kurum ve Kuruluşları
  - Savunma ve Güvenlik Alanında Görevleri Olan Kamu Kurumları 
  - Eğitim ve Araştırma Hastaneleri 
  - Bilim Merkezi 
  - DİĞER

⚠️ Rules:
- If the input matches one of the above, return ONLY that option.
- If no match, return ONLY "INVALID".
- If the input "Sermaye Şirketleri", return ONLY "Sermaye Şirketleri".
- If the input "DİĞER", return ONLY "DİĞER".
- Do not normalize, do not infer.
- Return exactly one option from the list above, nothing else.
- The input will be in Turkish.
        `
      },
      { role: "user", content: text }
    ]
  });

  const answer = res.choices[0].message.content.trim();
  return answer === "INVALID" ? null : answer;
}





  /* --------------- /ask Route (integrated flow) --------------- */



// API key ayarı
app.post("/submit-form", async (req, res) => {
  try {
    const { fullName, email, supportProgram } = req.body;
    
    let  all = JSON.parse(fs.readFileSync(EMBEDDED_PROGRAMS_PATH_REC, "utf-8"));
    const suggested = all.filter(p => p.programName === supportProgram);
     
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background:#ffffff; padding:20px; color:#111; text-align:center">
  
  <!-- Logos -->
  <div style="margin-bottom:60px;">
    <img src="https://www.tubitak.online/tubitakxteknofest.png" 
        alt="TÜBİTAK Logo" style="height:80px; margin-right:30px;" />
  </div>

  <!-- Greeting -->
  <p style="font-size:16px; margin:10px 0;">
    Merhaba <b>${fullName}</b>,
  </p>
  <p style="font-size:16px; margin:10px 0;">
    Ben <b>TÜBİ 🚀</b>
  </p>

  <!-- Message -->
  <p style="font-size:16px; margin:15px 0; line-height:1.5;">
    Umarım <b>TEKNOFEST 2025 İstanbul</b>, size bilim ve teknolojiye dair ilham verici deneyimler kazandırmıştır.
  </p>

  <p style="font-size:16px; margin:15px 0; line-height:1.5;">
    İlginizi çeken <b>“${supportProgram}”</b> hakkında detaylı bilgiye 
    <a href="${suggested[0]?.link}" style="color:#0073e6; font-weight:bold; text-decoration:none;">buradan ulaşabilirsiniz</a>.
  </p>

  <!-- Closing -->
  <p style="font-size:16px; margin:15px 0; line-height:1.5;">
    Standımıza uğradığınız için teşekkür ederiz. <br/>
    Bilim ve teknoloji yolculuğunda tekrar görüşmek üzere. 👋
  </p>

</div>
    `;

    const msg = {
      to: email,                                   // formdan gelen alıcı
      from: "hakemehab22@gmail.com",               // ✅ SendGrid’de verified single sender
      subject: "TÜBİTAK Destek Programı Hakkında Detaylı Bilgi",
      text: `Merhaba ${fullName}, ${supportProgram} hakkında bilgi için TÜBİTAK sitesine bakabilirsiniz.`,
      html: htmlTemplate,
    };

    await sgMail.send(msg);

    res.json({ message: "Form başarıyla alındı ve e-posta gönderildi!" });
  } catch (error) {
    console.error("Mail gönderme hatası:", error.response?.body || error);
    res.status(500).json({ error: "Mail gönderilirken hata oluştu." });
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
