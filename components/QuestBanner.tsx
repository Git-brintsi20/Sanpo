"use client";
import { useEffect, useState } from "react";

const DEFAULT_QUEST = "Find something that only grows near the sea — name it in Japanese.";

export default function QuestBanner() {
  const [quest, setQuest] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // fetch weather from Open-Meteo (no key needed)
        const weatherRes = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=17.6868&longitude=83.2185&current=temperature_2m,weathercode&timezone=Asia/Kolkata"
        );
        const wData = await weatherRes.json();
        const temp = wData.current?.temperature_2m ?? null;
        const code = wData.current?.weathercode ?? null;

        const res = await fetch("/api/quest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weatherCode: code, temperature: temp }),
        });
        const data = await res.json();
        if (!cancelled) setQuest(data.quest || DEFAULT_QUEST);
      } catch {
        if (!cancelled) setQuest(DEFAULT_QUEST);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!loaded) return null;

  return (
    <div className="bg-vermilion/8 border border-vermilion/20 rounded-xl px-4 py-3 flex gap-3 items-start">
      <span className="text-xl flex-shrink-0">🎯</span>
      <div>
        <p className="text-xs font-medium text-vermilion uppercase tracking-wide mb-0.5">Today&apos;s Quest</p>
        <p className="text-sm text-ink leading-relaxed">{quest}</p>
      </div>
    </div>
  );
}
