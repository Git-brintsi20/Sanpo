"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Walk 歩く" },
  { href: "/postcards", label: "Postcards" },
  { href: "/bucket", label: "Bucket List" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="border-b border-cream-dark bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-vermilion text-xl">散</span>
          <span className="font-serif text-lg text-ink font-semibold">Sanpo</span>
        </Link>
        <nav className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === l.href
                  ? "bg-vermilion text-white"
                  : "text-ink-light hover:text-ink hover:bg-cream-dark"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
