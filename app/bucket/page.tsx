"use client";
import { useEffect, useRef, useState } from "react";
import { BucketItem } from "@/lib/types";
import { getBucketList, saveBucketList } from "@/lib/storage";

export default function BucketPage() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setItems(getBucketList());
  }, []);

  function toggle(id: string) {
    const updated = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setItems(updated);
    saveBucketList(updated);
  }

  function setNote(id: string, note: string) {
    const updated = items.map((item) =>
      item.id === id ? { ...item, note } : item
    );
    setItems(updated);
    saveBucketList(updated);
  }

  function setPhoto(id: string, photoUrl: string) {
    const updated = items.map((item) =>
      item.id === id ? { ...item, photoUrl } : item
    );
    setItems(updated);
    saveBucketList(updated);
  }

  async function handlePhotoFile(id: string, file: File) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(id, canvas.toDataURL("image/jpeg", 0.7));
        resolve();
      };
      img.src = url;
    });
  }

  const done = items.filter((i) => i.done).length;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-2xl text-ink">Before I Fly</h1>
        <p className="text-vermilion font-medium text-sm">
          {done} of {items.length} done
        </p>
      </div>

      <div className="w-full bg-cream-dark rounded-full h-2">
        <div
          className="bg-vermilion h-2 rounded-full transition-all duration-500"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`card p-4 transition-all ${item.done ? "opacity-70" : ""}`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggle(item.id)}
                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center text-sm ${
                  item.done
                    ? "bg-vermilion border-vermilion text-white"
                    : "border-muted hover:border-vermilion"
                }`}
              >
                {item.done ? "✓" : ""}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-ink ${item.done ? "line-through text-muted" : ""}`}
                >
                  {item.name}
                </p>
                <input
                  type="text"
                  placeholder="Add a note…"
                  value={item.note || ""}
                  onChange={(e) => setNote(item.id, e.target.value)}
                  className="mt-1 w-full text-sm text-ink-light bg-transparent border-b border-cream-dark focus:outline-none focus:border-vermilion/50 pb-0.5"
                />
                {item.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="mt-2 w-24 h-16 object-cover rounded-md"
                  />
                )}
              </div>
              <div>
                <input
                  ref={(el) => { fileRefs.current[item.id] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) await handlePhotoFile(item.id, e.target.files[0]);
                  }}
                />
                <button
                  onClick={() => fileRefs.current[item.id]?.click()}
                  className="text-muted hover:text-vermilion text-lg transition-colors"
                  title="Add photo"
                >
                  📷
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
