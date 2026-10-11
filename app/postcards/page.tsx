"use client";
import { useEffect, useState } from "react";
import { Walk, Postcard } from "@/lib/types";
import { getWalks } from "@/lib/storage";

function countdown(openOn: string): string {
  const diff = new Date(openOn).getTime() - Date.now();
  if (diff <= 0) return "Ready to open";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} to go`;
  }
  return `${days} day${days !== 1 ? "s" : ""} to go`;
}

function PostcardCard({ postcard, walkTitle }: { postcard: Postcard; walkTitle: string }) {
  const isSealed = new Date(postcard.openOn) > new Date();
  const [peeked, setPeeked] = useState(false);

  if (isSealed && !peeked) {
    return (
      <div className="envelope rounded-xl p-6 relative">
        <div className="relative z-10 space-y-2">
          <p className="text-xs text-amber-900/70 uppercase tracking-wide font-medium">Sealed</p>
          <p className="font-serif text-amber-900 text-lg">{walkTitle}</p>
          <p className="text-sm text-amber-800/80">Open on: {postcard.openOn}</p>
          <p className="text-vermilion font-medium text-sm">⏳ {countdown(postcard.openOn)}</p>
          <button
            onClick={() => {
              if (confirm("Peek at your future postcard? (you weren't supposed to!)")) setPeeked(true);
            }}
            className="mt-2 text-xs text-amber-900/60 underline"
          >
            peek anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="postcard rounded-xl p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-muted uppercase tracking-wider">To: Future Me</p>
          <p className="text-xs text-muted">{walkTitle}</p>
        </div>
        <p className="text-xs text-muted">{new Date(postcard.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
      </div>
      <div className="border-t border-cream-dark pt-3">
        <p className="font-serif text-ink leading-relaxed text-sm whitespace-pre-line">{postcard.letter}</p>
      </div>
      {isSealed && peeked && (
        <p className="text-xs text-muted italic">You peeked 👀 — seal date: {postcard.openOn}</p>
      )}
    </div>
  );
}

export default function PostcardsPage() {
  const [walks, setWalks] = useState<Walk[]>([]);

  useEffect(() => {
    setWalks(getWalks().filter((w) => w.postcard));
  }, []);

  if (walks.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-5xl">✉️</p>
        <p className="font-serif text-ink text-xl">No postcards yet</p>
        <p className="text-muted text-sm">Go for a walk, analyze some photos, then write your first postcard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-ink">Your Postcards</h1>
      {walks.map((walk) =>
        walk.postcard ? (
          <PostcardCard key={walk.postcard.id} postcard={walk.postcard} walkTitle={walk.title} />
        ) : null
      )}
    </div>
  );
}
