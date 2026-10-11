"use client";
import { JapaneseCard } from "@/lib/types";

interface Props {
  card: JapaneseCard;
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function FlashCard({ card }: Props) {
  return (
    <div className="flashcard">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span className="japanese-text">{card.japanese}</span>
            <span className="text-sm text-muted">{card.reading_hiragana}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-vermilion text-sm font-medium">{card.romaji}</span>
            <span className="text-muted text-xs">·</span>
            <span className="text-ink-light text-sm">{card.english}</span>
          </div>
        </div>
        <button
          onClick={() => speak(card.japanese)}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-cream-dark hover:bg-vermilion/10 border border-cream-dark hover:border-vermilion/30 transition-colors flex items-center justify-center text-lg"
          title="Pronounce"
        >
          🔊
        </button>
      </div>

      {/* Example sentences */}
      <div className="mt-3 pt-3 border-t border-cream-dark space-y-1">
        <p className="text-sm text-ink leading-relaxed">{card.example_sentence_ja}</p>
        <p className="text-xs text-muted italic">{card.example_sentence_en}</p>
      </div>

      {/* Japan note */}
      {card.japan_note && (
        <div className="mt-2 pt-2 border-t border-cream-dark/50">
          <p className="text-xs text-vermilion">
            🗾 {card.japan_note}
          </p>
        </div>
      )}
    </div>
  );
}
