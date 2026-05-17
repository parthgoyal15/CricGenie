import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "CricGenie — AI Live Cricket",
  description:
    "Real-time AI second-screen experience for live cricket. Powered by Google Gemini.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen">
        <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#09090b]/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="text-lg leading-none">🏏</span>
              <div className="flex items-center gap-0.5">
                <span className="text-lg font-black tracking-tight text-white">
                  Cric
                </span>
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  Genie
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center bg-green-400/8 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-400/20 tracking-widest uppercase">
                AI
              </span>
            </a>

            <nav className="flex items-center gap-1">
              {[
                { href: "/", label: "Live" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/profile", label: "Profile" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="ml-1 pl-3 border-l border-zinc-800">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
