import { useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "./Auth";
import { useT } from "../i18n";

/** Google sign-in, or the signed-in avatar with a sign-out menu. */
export default function AccountButton() {
  const t = useT();
  const { profile, loading, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return <div className="h-9 w-9 animate-pulse rounded-full bg-espresso-700" />;

  if (!profile) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-cream/15 px-2.5 text-xs font-semibold text-cream transition-colors hover:border-gold/50"
        aria-label={t("auth.signInGoogle")}
      >
        <GoogleGlyph />
        <span className="hidden sm:inline">{t("account.signIn")}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-cream/15 transition-colors hover:border-gold/50"
        aria-label={profile.name}
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gold/15 text-gold">
            <UserIcon className="h-4 w-4" />
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-backdrop" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-sheet mt-2 w-48 animate-fade-in rounded-xl border border-cream/12 bg-espresso-800 p-1.5 shadow-pop">
            <div className="px-2.5 py-1.5">
              <p className="truncate text-sm font-medium text-cream">{profile.name}</p>
              {profile.email && (
                <p className="truncate text-2xs text-cream-mute">{profile.email}</p>
              )}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-cream transition-colors hover:bg-gold/10"
            >
              <LogOut className="h-4 w-4" /> {t("account.signOut")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" transform="scale(.5)" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" transform="scale(.5)" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" transform="scale(.5)" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.6 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" transform="scale(.5)" />
    </svg>
  );
}
