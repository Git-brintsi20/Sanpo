import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";

export async function POST(req: NextRequest) {
  try {
    const { words, walkTitle, weather, feeling } = await req.json();

    const wordList = (words as string[]).slice(0, 6).join(", ");
    const prompt = `Write a short, warm, honest letter (90-130 words) from a final-year student from Vizag (Visakhapatnam), India to herself in her first week working in Japan. She learned these Japanese words on a walk today: ${wordList}. Walk: "${walkTitle}". Weather: ${weather || "warm coastal day"}. How she felt: "${feeling || "curious and a little wistful"}". Naturally reference 2-3 of the Japanese words. No clichés, no exaggeration. Write in first person, present tense. Sign off as "— You, today". Return only the letter text, no JSON.`;

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: false,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const data = await res.json();
    const letter = data.message?.content || data.response || "";

    return NextResponse.json({ letter });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
      return NextResponse.json({ error: "Start Ollama first: run `ollama serve`" }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
