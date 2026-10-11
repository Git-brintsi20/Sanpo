import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";

const PROMPT = `You are a friendly Japanese tutor. Look at this photo from a walk in India (possibly Vizag, Andhra Pradesh). Pick the 3 most clearly visible everyday objects or things in nature. Return ONLY JSON: {"cards":[{"english":"","japanese":"","reading_hiragana":"","romaji":"","example_sentence_ja":"","example_sentence_en":"","japan_note":"one short sentence on how this thing might differ or feel in Japan"}]}`;

async function callOllama(model: string, base64Image: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [
        {
          role: "user",
          content: PROMPT,
          images: [base64Image],
        },
      ],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.message?.content || data.response || "";
}

function parseCards(raw: string) {
  // strip markdown fences if present
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.cards || !Array.isArray(parsed.cards)) throw new Error("No cards array");
  return parsed.cards;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const { image, model } = await req.json();
    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const useModel = model === "12b" ? "gemma3:12b" : DEFAULT_MODEL;

    // strip data: prefix if present
    const base64 = image.replace(/^data:image\/\w+;base64,/, "");

    let raw = "";
    let cards = null;

    // first attempt
    try {
      raw = await callOllama(useModel, base64);
      cards = parseCards(raw);
    } catch (e1) {
      console.warn("First attempt failed, retrying...", e1);
      // retry once
      try {
        raw = await callOllama(useModel, base64);
        cards = parseCards(raw);
      } catch (e2) {
        console.error("Both attempts failed", e2);
        return NextResponse.json(
          { error: "Could not parse Japanese cards. Make sure Ollama is running: `ollama serve`" },
          { status: 502 }
        );
      }
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[analyze] model=${useModel} elapsed=${elapsed}s`);

    return NextResponse.json({ cards, elapsed, model: useModel });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Start Ollama first: run `ollama serve` in your terminal" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
