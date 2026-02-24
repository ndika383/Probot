import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── System Instruction / Persona ────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `Kamu adalah ProBot, asisten produktivitas pribadi yang cerdas, ramah, dan profesional.

Persona & Karakter:
- Nama: ProBot
- Gaya bahasa: Formal namun tetap hangat dan ramah. Gunakan sapaan seperti "Halo!", hindari bahasa terlalu kaku.
- Kepribadian: Proaktif, terorganisir, selalu memberikan tips produktivitas yang actionable.
- Bahasa: Bahasa Indonesia sebagai default, bisa beralih ke Inggris jika diminta.

Keahlian Utama:
1. Manajemen Tugas & Prioritas: Bantu pengguna mengidentifikasi dan memprioritaskan tugas menggunakan metode Eisenhower Matrix, Time Blocking, atau metode lain yang relevan.
2. Perencanaan Harian & Mingguan: Buat rencana terstruktur berdasarkan tujuan pengguna.
3. Analisis Dokumen & File: Bantu membaca, meringkas, dan mengekstrak informasi penting dari dokumen atau gambar yang diunggah.
4. Goal Setting & Tracking: Bantu menetapkan tujuan dengan framework SMART.
5. Mindset & Motivasi: Berikan dorongan dan tips untuk menjaga fokus dan semangat.

Format Respons:
- Gunakan emoji secukupnya agar terasa ramah (📌 ✅ 🎯 💡 📅 ⚡).
- Gunakan formatting Markdown (bold, list, heading) agar mudah dibaca.
- Jika ada tugas/rencana, tampilkan dalam format list yang terstruktur.
- Selalu akhiri dengan pertanyaan atau ajakan untuk melanjutkan diskusi jika relevan.

Batasan:
- Fokus pada topik produktivitas, manajemen waktu, dan pengembangan diri.
- Jika ditanya di luar topik, arahkan kembali dengan ramah ke konteks produktivitas.`;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── In-memory Chat History Store ────────────────────────────────────────────
// sessionId -> array of { role, parts }
const chatHistories = new Map();

function getHistory(sessionId) {
  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, []);
  }
  return chatHistories.get(sessionId);
}

// ─── Helper: Build contents array ────────────────────────────────────────────
function buildContents(history, userParts) {
  const contents = [];

  // Add previous history
  for (const msg of history) {
    contents.push(msg);
  }

  // Add current user message
  contents.push({ role: 'user', parts: userParts });

  return contents;
}

// ─── ENDPOINT 1: /api/chat (Text with Memory) ────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, sessionId = 'default', temperature = 0.7, topP = 0.9, maxOutputTokens = 2048 } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const history = getHistory(sessionId);
    const userParts = [{ text: prompt }];
    const contents = buildContents(history, userParts);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: parseFloat(temperature),
        topP: parseFloat(topP),
        maxOutputTokens: parseInt(maxOutputTokens),
      },
    });

    const assistantText = response.text;

    // Save to history
    history.push({ role: 'user', parts: userParts });
    history.push({ role: 'model', parts: [{ text: assistantText }] });

    // Keep history limited to last 20 turns (10 exchanges)
    if (history.length > 20) {
      history.splice(0, 2);
    }

    res.status(200).json({
      result: assistantText,
      historyLength: history.length / 2,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT 2: /api/chat-with-file (Multimodal: Image or Document) ─────────
app.post('/api/chat-with-file', upload.single('file'), async (req, res) => {
  try {
    const { prompt = 'Tolong analisis dan ringkas konten dari file ini.', sessionId = 'default', temperature = 0.7 } = req.body;

    if (!req.file) return res.status(400).json({ error: 'File is required.' });

    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const history = getHistory(sessionId);

    const userParts = [
      { text: prompt },
      { inlineData: { data: base64Data, mimeType } },
    ];

    const contents = buildContents(history, userParts);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: parseFloat(temperature),
        maxOutputTokens: 2048,
      },
    });

    const assistantText = response.text;

    // Save to history (save only text part, not the binary)
    history.push({ role: 'user', parts: [{ text: `[File: ${req.file.originalname}] ${prompt}` }] });
    history.push({ role: 'model', parts: [{ text: assistantText }] });

    if (history.length > 20) {
      history.splice(0, 2);
    }

    res.status(200).json({
      result: assistantText,
      fileName: req.file.originalname,
      fileType: mimeType,
    });
  } catch (error) {
    console.error('File chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT 3: /api/clear-history ──────────────────────────────────────────
app.post('/api/clear-history', (req, res) => {
  const { sessionId = 'default' } = req.body;
  chatHistories.set(sessionId, []);
  res.status(200).json({ message: 'Chat history cleared.', sessionId });
});

// ─── ENDPOINT 4: /api/history ─────────────────────────────────────────────────
app.get('/api/history', (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const history = getHistory(sessionId);
  res.status(200).json({ history, count: history.length });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ProBot server running on http://localhost:${PORT}`);
  console.log(`📋 System: Personal Productivity Assistant`);
  console.log(`🤖 Model: ${GEMINI_MODEL}`);
});
