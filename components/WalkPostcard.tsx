"use client";
import { useState } from "react";
import { PhotoResult, Postcard } from "@/lib/types";
import { getWalks, saveWalk } from "@/lib/storage";

interface Props {
  walkTitle: string;
  words: string[];
  results: PhotoResult[];
}

function oneYearFromNow(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export default function WalkPostcard({ walkTitle, words, results }: Props) {
  const [feeling, setFeeling] = useState("");
  const [openOn, setOpenOn] = useState(oneYearFromNow());
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/postcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: words.slice(0, 8),
          walkTitle,
          feeling,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to write postcard");
      } else {
        setLetter(data.letter);
      }
    } catch {
      setError("Could not reach Ollama. Try: ollama serve");
    } finally {
      setLoading(false);
    }
  }

  function savePostcard() {
    if (!letter) return;
    const postcard: Postcard = {
      id: "pc_" + Date.now(),
      walkId: "walk_" + Date.now(),
      letter,
      createdAt: new Date().toISOString(),
      openOn,
      sealed: true,
    };
    // attach to latest walk or create new
    const walks = getWalks();
    if (walks.length > 0) {
      walks[0].postcard = postcard;
      saveWalk(walks[0]);
    } else {
      saveWalk({
        id: postcard.walkId,
        title: walkTitle,
        date: new Date().toISOString(),
        photos: results,
        postcard,
      });
    }
    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl text-ink">✉️ Postcard to Future You</h2>

      {!letter && (
        <div className="card p-4 space-y-3">
          <label className="block">
            <span className="text-sm text-ink-light">How did the walk feel? (optional)</span>
            <textarea
              className="mt-1 w-full bg-cream/50 border border-cream-dark rounded-lg p-2 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-vermilion/30"
              rows={2}
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="Quiet, a little wistful. The lake reflected the trees…"
            />
          </label>
          <label className="block">
            <span className="text-sm text-ink-light">Open this postcard on</span>
            <input
              type="date"
              className="mt-1 block bg-cream/50 border border-cream-dark rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-vermilion/30"
              value={openOn}
              onChange={(e) => setOpenOn(e.target.value)}
            />
          </label>
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Writing… (~30s)" : "Write my postcard"}
          </button>
          {loading && (
            <p className="text-xs text-muted text-center">
              Gemma is writing your letter on CPU — takes ~30s…
            </p>
          )}
          {error && <p className="text-sm text-red-600">⚠️ {error}</p>}
        </div>
      )}

      {letter && (
        <div className="postcard rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">To: Future Me</p>
              <p className="text-xs text-muted">Open on: {openOn}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="text-xs text-vermilion font-medium">{walkTitle}</p>
            </div>
          </div>
          <div className="border-t border-cream-dark pt-4">
            <p className="font-serif text-ink leading-relaxed text-sm whitespace-pre-line">{letter}</p>
          </div>
          <div className="border-t border-cream-dark pt-3 flex gap-2">
            {!saved ? (
              <>
                <button onClick={savePostcard} className="btn-primary text-sm">
                  💾 Save postcard
                </button>
                <button onClick={() => setLetter("")} className="btn-secondary text-sm">
                  Rewrite
                </button>
              </>
            ) : (
              <p className="text-sm text-vermilion font-medium">✓ Saved to Postcards</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
