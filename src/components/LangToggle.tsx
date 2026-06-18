import { useI18n } from "../i18n";

/** Compact TH / EN segmented switch. */
export default function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div
      className="flex items-center rounded-lg border border-cream/12 bg-espresso-700 p-0.5 text-2xs font-semibold"
      role="group"
      aria-label="Language"
    >
      {(["th", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`h-7 w-9 rounded-md uppercase transition-colors ${
            lang === l ? "bg-gold text-espresso-900" : "text-cream-mute hover:text-cream"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
