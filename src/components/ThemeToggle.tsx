import { useState } from "react";
import { Sun, Moon } from "lucide-react";

/** Toggles the `.dark` class on <html> and remembers the choice. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("dialed.theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={dark}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-cream/15 text-cream-dim transition-colors hover:border-gold/50 hover:text-gold"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
