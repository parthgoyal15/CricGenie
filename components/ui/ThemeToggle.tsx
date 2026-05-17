"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cricgenie-theme");
    if (stored === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggle = () => {
    const goLight = isDark;
    setIsDark(!goLight);
    if (goLight) {
      document.documentElement.classList.add("light");
      localStorage.setItem("cricgenie-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("cricgenie-theme", "dark");
    }
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-8 h-8 rounded-lg border border-zinc-700 hover:border-zinc-500 flex items-center justify-center text-sm transition-all hover:bg-zinc-800"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
