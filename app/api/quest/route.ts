import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";

export async function POST(req: NextRequest) {
  try {
    const { weatherCode, temperature } = await req.json();

    const weatherDesc = temperature
      ? `${temperature}°C, weather code ${weatherCode}`
      : "unknown weather";

    const prompt = `Give ONE short walk quest (max 20 words) for someone in Vizag (Visakhapatnam), India near the sea. Current weather: ${weatherDesc}. The quest should involve finding something in nature and naming it in Japanese. Example: "Find 3 green things and name them in Japanese." Return only the quest text, nothing else.`;

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: false,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const data = await res.json();
    const quest = data.message?.content || data.response || "";

    return NextResponse.json({ quest: quest.trim() });
  } catch {
    // silently fall back
    return NextResponse.json({ quest: "Find something that reminds you of water and name it in Japanese." });
  }
}
