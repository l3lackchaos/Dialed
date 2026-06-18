import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./en";
import { th } from "./th";

export type Lang = "th" | "en";
export type TKey = keyof typeof en;
export type Dict = Record<TKey, string>;

const DICTS: Record<Lang, Dict> = { en, th };
const STORAGE_KEY = "dialed.lang";

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function initialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "th" || saved === "en") return saved;
  // Thai-first audience: default to Thai unless the browser clearly prefers English.
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "th";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(
    () => setLangState((l) => (l === "th" ? "en" : "th")),
    [],
  );

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => {
      const raw = DICTS[lang][key] ?? en[key] ?? String(key);
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, k) =>
        k in vars ? String(vars[k]) : `{${k}}`,
      );
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Shorthand: const t = useT(); t("nav.home") */
export function useT() {
  return useI18n().t;
}
