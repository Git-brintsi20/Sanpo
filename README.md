# 散歩 Sanpo — Before I Go

> A local-first walking companion. Walk anywhere, photograph what you see, learn it in Japanese, write a postcard to your future self.

**Demo:** [▶ Watch on YouTube](https://youtu.be/NAZwhDZAzXQ)  
**Live post:** [DEV.to — Hacktoberfest Week 1 submission](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)

---

![Sanpo app screenshot](./screenshot.png)

## What it does

| Feature | Description |
|---|---|
| 📸 **Photo → Japanese Cards** | Upload walk photos. A local Gemma 3 vision model picks 3 objects and returns word cards: Japanese, hiragana, romaji, example sentence, Japan note |
| 🔊 **Pronunciation** | Hit the speaker button on any card to hear it in Japanese via Web Speech API (`ja-JP`) |
| ✉️ **Postcard to Future Me** | At the end of a walk, Gemma writes a short letter from you to yourself — sealed until a date you choose |
| 🎯 **Weather Quest** | Fetches local weather (Open-Meteo, no key) and gives you a walk quest suited to the day |
| 📋 **Bucket List** | Personal places to visit before leaving India — tick them off with photos and notes |

Everything runs **100% on your device**. No cloud. No API keys. No accounts. No data leaves your laptop.

---

## Setup

### 1. Install Ollama

Download from **https://ollama.com/download** → run the installer. Ollama will start automatically in your system tray.

### 2. Pull the model

```bash
ollama pull gemma3:4b
```

> ~3.3 GB download. Takes 5-10 min depending on your internet.  
> Want to compare models? `ollama pull gemma3:12b` (~8 GB) — needs free disk space.

### 3. Clone and run

```bash
git clone https://github.com/Git-brintsi20/Sanpo
cd Sanpo
cp .env.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**

> Make sure Ollama is running before you upload photos (`ollama serve` if it isn't in your tray).

---

## Environment variables

Copy `.env.example` to `.env.local`:

```env
OLLAMA_MODEL=gemma3:4b
OLLAMA_URL=http://localhost:11434
```

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_MODEL` | `gemma3:4b` | Ollama model for vision analysis and postcard writing |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |

---

## Tech stack

- **[Next.js 14](https://nextjs.org)** — App Router, TypeScript, API routes
- **[Tailwind CSS](https://tailwindcss.com)** — paper-and-ink palette (cream `#F5F0E8`, vermilion `#C0392B`)
- **[Ollama](https://ollama.com)** — local LLM server
- **[Gemma 3](https://ai.google.dev/gemma)** — vision model (4B, multimodal)
- **[Open-Meteo](https://open-meteo.com)** — free weather API, no key required
- **Web Speech API** — browser-native `ja-JP` pronunciation
- **localStorage** — all user data stays on device, persisted between sessions

---

## Real-world performance (CPU, no GPU, 32 GB RAM)

Tested on gemma3:4b with a mix of personal photos:

| Photo type | Time |
|---|---|
| Boots (simple, bright) | 10.4s |
| Anime art (medium detail) | 11.3s |
| Food plate (idli-dosa thali) | 13.7s |
| Rainy windshield | 34.7s |
| Yellow rose (macro) | 52.4s |
| Room with string lights (complex) | 65.3s |

**Client-side resize to 768px** (canvas, JPEG 0.8) before sending is the biggest speed win. Without it, times were 2-3× longer on the first batch.

---

## Honest limitations

- **Speed**: 10–218s per photo on CPU. The first request after startup is slowest (model warmup). Subsequent requests are faster.
- **Japanese accuracy**: The model occasionally mis-identifies objects or confuses similar words. In testing: `あられ` (arare, *hailstones*) was returned for a rainy windshield — but arare means hailstones, not raindrops (雨粒 *amatsubu*). And `ヒマワリ` (*himawari*, sunflower) was returned for a yellow food plate labelled "Marigold." Keep a dictionary handy.
- **JSON reliability**: The model sometimes returns malformed JSON. The app retries once automatically. If both attempts fail, a friendly error is shown.
- **Speech on Windows**: `ja-JP` voice requires the Japanese language pack. Go to **Settings → Time & Language → Speech → Add voices** and install Japanese if the 🔊 button is silent.
- **12B model**: Needs ~8 GB free disk space. For everyday objects, 4B is sufficient.
- **No offline AI**: Ollama must be running locally. The weather quest needs internet on first load.

---

## Project structure

```
app/
  page.tsx              ← Walk page (photo upload, flashcards, postcard)
  postcards/page.tsx    ← Saved postcards with countdown / peek-anyway
  bucket/page.tsx       ← Bucket list of places to visit
  api/
    analyze/route.ts    ← POST: Ollama vision → Japanese cards
    postcard/route.ts   ← POST: Ollama → personal letter
    quest/route.ts      ← POST: weather → walk quest
components/
  FlashCard.tsx         ← Word card with speech synthesis
  WalkPostcard.tsx      ← Postcard writer and renderer
  QuestBanner.tsx       ← Daily quest from weather
  Navbar.tsx / Footer.tsx
lib/
  types.ts              ← Shared TypeScript interfaces
  storage.ts            ← localStorage helpers
```

---

## Hacktoberfest

*Submitted for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

Prize track: **Best Use of Gemma**

---

## License

MIT — see [LICENSE](./LICENSE)
