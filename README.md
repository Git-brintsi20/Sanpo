# Sanpo 散歩 — Before I Go

> A local-first walking companion for learning Japanese through what you see.

![Sanpo screenshot placeholder](./screenshot.png)

I'm a final-year student in Bhopal, moving to Japan next year. This app turns a walk into Japanese flashcards and a postcard to my future self — all running 100% on my laptop, no internet required after setup.

---

## What it does

1. **Photo → Japanese Cards** — Upload walk photos; a local Gemma vision model picks 3 objects and returns Japanese word cards with hiragana, romaji, an example sentence, and a note on how the thing might feel in Japan. Hit 🔊 to hear the pronunciation.
2. **Postcard to Future Me** — At the end of a walk, write a short letter to yourself in your first week in Japan. Seal it with a date; it shows as an envelope with a countdown until then.
3. **Weather Quest** — Fetches Bhopal's current weather (Open-Meteo, no key) and gives you a walk quest, e.g. "Find 3 green things and name them in Japanese."
4. **Bucket List** — 8 Bhopal places to visit before you leave. Tick them off, add a note and photo.

---

## Setup

### 1. Install Ollama

Download from **https://ollama.com** and install it.

### 2. Pull the models

```bash
ollama pull gemma3:4b        # default — ~15-40s/photo on CPU
ollama pull gemma3:12b       # for comparison — slower, ~8 GB
```

### 3. Clone and run

```bash
git clone https://github.com/Git-brintsi20/sanpo
cd sanpo
cp .env.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**.

> Make sure Ollama is running (`ollama serve`) before you analyze photos.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_MODEL` | `gemma3:4b` | Ollama model to use for analysis |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |

Copy `.env.example` to `.env.local` and edit as needed.

---

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — paper-and-ink palette (cream, vermilion)
- **Ollama** — local LLM server
- **Gemma 3** — vision model (4b default, 12b for comparison)
- **Open-Meteo** — free weather API, no key required
- **Web Speech API** — browser-native Japanese pronunciation
- **localStorage** — all user data stays on device

---

## Honest limitations

- **Speed**: On CPU (no GPU), gemma3:4b takes 15-40 seconds per photo. The 12b model can take 2-5 minutes. This is normal.
- **Japanese accuracy**: Small vision models sometimes mis-identify objects or give slightly off readings. The example sentences are mostly correct but treat them as learning material, not gospel.
- **JSON parsing**: The model occasionally returns malformed JSON. The app retries once and shows a friendly error if it still fails.
- **Speech**: `ja-JP` voice quality depends on your OS. Windows has decent support; macOS is better.
- **No offline AI**: You need Ollama running locally. The weather quest needs internet once on load.

---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*
