import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sanpo 散歩 — Before I Go",
  description: "A local-first walking companion. Walk in Bhopal, learn Japanese, write a postcard to your future self in Japan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
