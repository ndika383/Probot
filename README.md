# ⚡ ProBot — Personal Productivity Assistant

Chatbot berbasis AI yang dirancang untuk menjadi asisten produktivitas pribadi yang cerdas, ramah, dan profesional. Dibangun menggunakan **Google Gemini 2.5 Flash** dan **Node.js + Express**.

---

## 🚀 Fitur Utama

| Fitur | Keterangan |
|---|---|
| 💬 **Chat dengan Memory** | Percakapan berkesinambungan dengan riwayat hingga 10 pertukaran terakhir |
| 🤖 **System Persona** | ProBot memiliki kepribadian dan gaya bahasa formal-ramah yang konsisten |
| 📎 **Upload File** | Analisis gambar, PDF, dan dokumen teks |
| ⚙️ **Parameter AI** | Konfigurasi `temperature`, `top-P`, dan `max tokens` langsung dari UI |
| 🎯 **Use Case Fokus** | Manajemen tugas, perencanaan harian, goal setting, dan mindset produktivitas |

---

## 🧠 Use Case

- 📅 **Rencana Harian** — Buat jadwal terstruktur berdasarkan prioritas
- 🎯 **Prioritas Tugas** — Bantu menentukan tugas paling penting dengan Eisenhower Matrix
- ✅ **Goal Setting SMART** — Tetapkan tujuan yang Specific, Measurable, Achievable, Relevant, Time-bound
- 🧠 **Tips Fokus & Produktivitas** — Teknik Pomodoro, deep work, time blocking, dll.
- 📎 **Analisis Dokumen** — Upload laporan, catatan, atau gambar untuk dianalisis

---

## 🛠 Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
- **File Upload**: Multer (in-memory)
- **Frontend**: HTML, CSS, Vanilla JS (Single File)

---

## 📁 Struktur Proyek

```
probot/
├── public/
│   └── index.html       # Frontend chatbot UI
├── .env                 # API key (tidak di-commit)
├── .env.example         # Template env
├── .gitignore
├── index.js             # Backend Express + Gemini API
├── package.json
└── README.md
```

---

## ⚙️ Cara Menjalankan

### 1. Clone repositori

```bash
git clone https://github.com/username/probot-productivity-assistant.git
cd probot-productivity-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment

```bash
cp .env.example .env
```

Edit file `.env` dan isi API key kamu:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

> Dapatkan API key di: https://aistudio.google.com/u/0/api-keys

### 4. Jalankan server

```bash
npm start
```

Buka browser: **http://localhost:3000**

---

## 🔌 API Endpoints

### `POST /api/chat`
Chat teks biasa dengan memory (riwayat percakapan).

**Request Body:**
```json
{
  "prompt": "Buatkan rencana harian saya",
  "sessionId": "user_123",
  "temperature": 0.7,
  "topP": 0.9,
  "maxOutputTokens": 2048
}
```

---

### `POST /api/chat-with-file`
Chat multimodal (teks + file gambar/dokumen).

**Form Data:**
- `file` — File gambar (PNG/JPG), PDF, atau TXT
- `prompt` — Pertanyaan terkait file
- `sessionId` — ID sesi
- `temperature` — Parameter AI

---

### `POST /api/clear-history`
Hapus riwayat percakapan untuk sesi tertentu.

---

### `GET /api/history?sessionId=xxx`
Lihat riwayat percakapan sesi tertentu.

---

## 🎨 Parameter AI

| Parameter | Rentang | Default | Fungsi |
|---|---|---|---|
| **Temperature** | 0.0 – 1.0 | 0.7 | Kreativitas respons. Rendah = lebih tepat, Tinggi = lebih kreatif |
| **Top-P** | 0.0 – 1.0 | 0.9 | Sampling respons. Rendah = lebih fokus |
| **Max Tokens** | 256 – 8192 | 2048 | Panjang maksimum respons |

---

## 📸 Screenshots

_(Tambahkan screenshot UI di sini setelah menjalankan aplikasi)_

---

## 📄 Lisensi

MIT License

---

> Dibuat sebagai Final Project untuk program **AI Productivity and AI API Integration for Developers** — Hacktiv8 × Google.org
