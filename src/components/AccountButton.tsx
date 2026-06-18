import { useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "./Auth";

/** Google sign-in button, or the signed-in avatar with a sign-out menu. */
export default function AccountButton() {
  const { profile, loading, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return <div className="h-9 w-9 animate-pulse rounded-full bg-espresso-700" />;

  if (!profile) {
    return (
      <button
        onClick={signInWithGoogle}
        className="btn-ghost px-3 py-2 text-xs"
        aria-label="Sign in with Google"
      >
        <GoogleGlyph /> Sign in
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-gold/25 bg-espresso-800/60 py-1 pl-1 pr-3 transition hover:border-gold/50"
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold">
            <UserIcon className="h-4 w-4" />
          </span>
        )}
        <span className="max-w-[7rem] truncate text-xs font-medium text-cream">
          {profile.name}
        </span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-44 animate-scale-in rounded-xl border border-gold/20 bg-espresso-800 p-1.5 shadow-card">
            <p className="truncate px-2.5 py-1.5 text-[0.7rem] text-cream-mute">
              {profile.email}
            </p>
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-cream transition hover:bg-gold/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
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
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.6 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
