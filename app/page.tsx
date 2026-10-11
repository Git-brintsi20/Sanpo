"use client";
import { useState, useRef, useCallback } from "react";
import { JapaneseCard, PhotoResult } from "@/lib/types";
import FlashCard from "@/components/FlashCard";
import WalkPostcard from "@/components/WalkPostcard";
import QuestBanner from "@/components/QuestBanner";
import { saveWalk } from "@/lib/storage";

function resizeImage(file: File, maxPx = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, maxPx / Math.max(w, h));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function HomePage() {
  const [model, setModel] = useState<"4b" | "12b">("4b");
  const [walkTitle, setWalkTitle] = useState("Morning walk");
  const [results, setResults] = useState<PhotoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError("");
      setLoading(true);
      const newResults: PhotoResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingMsg(
          `Analyzing photo ${i + 1} of ${files.length} — this may take ~30s on CPU…`
        );
        try {
          const base64 = await resizeImage(file);
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, model }),
          });
          const data = await res.json();
          if (!res.ok || data.error) {
            setError(data.error || "Analysis failed");
            break;
          }
          newResults.push({
            id: crypto.randomUUID(),
            photoUrl: base64,
            cards: data.cards as JapaneseCard[],
            elapsed: data.elapsed,
            model: data.model,
          });
        } catch {
          setError("Network error — is Ollama running? Try: ollama serve");
          break;
        }
      }

      setResults((prev) => [...prev, ...newResults]);
      setLoading(false);
      setLoadingMsg("");

      // auto-save walk
      if (newResults.length > 0) {
        const walkId = "walk_" + Date.now();
        saveWalk({
          id: walkId,
          title: walkTitle,
          date: new Date().toISOString(),
          photos: [...results, ...newResults],
        });
      }
    },
    [model, walkTitle, results]
  );

  const allWords = results.flatMap((r) =>
    r.cards.map((c) => c.japanese + " (" + c.romaji + ")")
  );

  return (
    <div className="space-y-6">
      {/* Quest banner */}
      <QuestBanner />

      {/* Walk title + settings */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={walkTitle}
          onChange={(e) => setWalkTitle(e.target.value)}
          className="flex-1 bg-white/60 border border-cream-dark rounded-lg px-3 py-2 text-ink font-serif text-lg focus:outline-none focus:ring-2 focus:ring-vermilion/40"
          placeholder="Name this walk…"
        />
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="p-2 rounded-lg border border-cream-dark bg-white/60 hover:bg-cream-dark transition-colors text-muted"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="card p-4 space-y-2">
          <p className="text-sm font-medium text-ink-light">Model</p>
          <div className="flex gap-2">
            {(["4b", "12b"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`px-4 py-1.5 rounded-md text-sm border transition-colors ${
                  model === m
                    ? "bg-vermilion text-white border-vermilion"
                    : "border-cream-dark text-ink-light hover:border-vermilion/50"
                }`}
              >
                gemma3:{m}
                {m === "12b" && (
                  <span className="ml-1 text-xs opacity-70">(slow)</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            4b ≈ 15-40s/photo on CPU · 12b is for comparison only
          </p>
        </div>
      )}

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-cream-dark rounded-xl p-8 text-center cursor-pointer hover:border-vermilion/50 transition-colors bg-white/40"
        onClick={() => fileRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="text-4xl mb-2">📸</div>
        <p className="font-serif text-ink text-lg">Drop photos or tap to upload</p>
        <p className="text-sm text-muted mt-1">
          Each photo → 3 Japanese words. Resized to 768px in browser.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-vermilion border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-sm text-ink-light">{loadingMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {results.map((result) => (
        <div key={result.id} className="space-y-3">
          {/* Photo thumbnail */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.photoUrl}
            alt="Walk photo"
            className="w-full max-h-64 object-cover rounded-xl shadow-md"
          />
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>⏱ {result.elapsed}s</span>
            <span>·</span>
            <span>{result.model}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {result.cards.map((card, i) => (
              <FlashCard key={i} card={card} />
            ))}
          </div>
        </div>
      ))}

      {/* End walk button */}
      {results.length > 0 && !showPostcard && (
        <button
          onClick={() => setShowPostcard(true)}
          className="w-full btn-primary py-3 text-base font-serif"
        >
          ✉️ End walk &amp; write postcard
        </button>
      )}

      {showPostcard && (
        <WalkPostcard
          walkTitle={walkTitle}
          words={allWords}
          results={results}
        />
      )}
    </div>
  );
}
