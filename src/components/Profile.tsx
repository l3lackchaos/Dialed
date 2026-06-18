import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Local, on-device identity — no auth server, no OAuth. Just a name (and an
 * icon) used to sign tasting comments. Stored in localStorage; nothing leaves
 * the device until the person actually posts a comment.
 */
export type Profile = { name: string; emoji: string };

export const PROFILE_EMOJIS = ["☕", "🫘", "🌱", "🔥", "🍒", "🧪", "🐉", "⭐"];
const STORAGE_KEY = "dialed.profile";
const empty: Profile = { name: "", emoji: "☕" };

type ProfileValue = {
  profile: Profile;
  hasProfile: boolean;
  save: (p: Profile) => void;
  clear: () => void;
};

const ProfileContext = createContext<ProfileValue | null>(null);

function load(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const p = JSON.parse(raw) as Partial<Profile>;
    return { name: p.name ?? "", emoji: p.emoji || "☕" };
  } catch {
    return empty;
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(load);

  const save = useCallback((p: Profile) => {
    const next = { name: p.name.trim(), emoji: p.emoji || "☕" };
    setProfile(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const clear = useCallback(() => {
    setProfile(empty);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<ProfileValue>(
    () => ({ profile, hasProfile: profile.name.trim() !== "", save, clear }),
    [profile, save, clear],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
