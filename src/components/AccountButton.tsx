import { useState } from "react";
import { UserPlus } from "lucide-react";
import Modal from "./Modal";
import { Field, TextInput } from "./ui";
import { useProfile, PROFILE_EMOJIS } from "./Profile";
import { useToast } from "./Toast";
import { useT } from "../i18n";

/** Local profile chip: shows your name/icon, opens an editor. No login. */
export default function AccountButton() {
  const t = useT();
  const { profile, hasProfile } = useProfile();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-cream/15 px-2 text-xs font-semibold text-cream transition-colors hover:border-gold/50"
      >
        {hasProfile ? (
          <>
            <span className="text-sm leading-none">{profile.emoji}</span>
            <span className="max-w-[6rem] truncate">{profile.name}</span>
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 text-gold" />
            <span className="hidden sm:inline">{t("profile.button")}</span>
          </>
        )}
      </button>
      <ProfileModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const { notify } = useToast();
  const { profile, hasProfile, save, clear } = useProfile();
  const [name, setName] = useState(profile.name);
  const [emoji, setEmoji] = useState(profile.emoji);

  // Re-seed when reopened.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setName(profile.name);
    setEmoji(profile.emoji);
    setWasOpen(true);
  }
  if (!open && wasOpen) setWasOpen(false);

  function handleSave() {
    if (!name.trim()) return notify(t("profile.errName"), "error");
    save({ name, emoji });
    notify(t("profile.saved"));
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={hasProfile ? t("profile.title") : t("profile.setup")}
      subtitle={t("profile.subtitle")}
      footer={
        <>
          {hasProfile && (
            <button className="btn-quiet" onClick={() => { clear(); onClose(); }}>
              {t("profile.clear")}
            </button>
          )}
          <button className="btn-primary flex-1" onClick={handleSave}>
            {t("common.save")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("tasting.yourName")}>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t("tasting.phName")} autoFocus />
        </Field>
        <div>
          <span className="label">{t("profile.emoji")}</span>
          <div className="flex flex-wrap gap-2">
            {PROFILE_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-colors ${
                  emoji === e ? "border-gold bg-gold/12" : "border-cream/12 bg-espresso-700"
                }`}
                aria-pressed={emoji === e}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
