import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Share2, Plus, Trash2, Coffee, ChevronDown } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchSession, fetchTastings, createTasting, deleteTasting } from "../lib/queries";
import { formatDate } from "../lib/format";
import { PageLoader, EmptyState, Field, TextInput, TextArea, Spinner } from "../components/ui";
import StarRating from "../components/StarRating";
import FlavorRadar from "../components/FlavorRadar";
import Modal from "../components/Modal";
import ShareSession from "../components/ShareSession";
import { FLAVOR_AXES } from "../lib/constants";
import LangToggle from "../components/LangToggle";
import { useProfile } from "../components/Profile";
import { useToast } from "../components/Toast";
import type { BrewComment } from "../lib/types";

export default function Session() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const sessionQ = useQuery(() => fetchSession(id!));
  const session = sessionQ.data;

  const [tastings, setTastings] = useState<BrewComment[]>([]);
  const [loadingT, setLoadingT] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (!id) return;
    fetchTastings(id).then(setTastings).catch(() => {}).finally(() => setLoadingT(false));
  }, [id]);

  async function remove(tid: string) {
    try {
      await deleteTasting(tid);
      setTastings((x) => x.filter((c) => c.id !== tid));
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    }
  }

  const scored = tastings.filter((c) => c.overall != null);
  const avg = scored.length ? scored.reduce((a, c) => a + (c.overall ?? 0), 0) / scored.length : null;
  const recipe = session?.recipe;

  // Group-average flavor profile across everyone who rated.
  const flavorAvg: Record<string, number | null> = {};
  let hasFlavor = false;
  for (const axis of FLAVOR_AXES) {
    const vals = tastings.map((c) => c[axis] as number | null).filter((n): n is number => n != null);
    flavorAvg[axis] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    if (vals.length) hasFlavor = true;
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col">
      <header className="safe-top sticky top-0 z-40 border-b border-cream/10 bg-espresso/90 backdrop-blur-md">
        <div className="flex items-center gap-2 px-3 py-3">
          <Link to={recipe ? `/r/${recipe.id}` : "/"} className="flex h-10 items-center gap-1 rounded-lg pl-1 pr-2 text-cream-dim transition-colors hover:text-cream">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{recipe ? t("session.allRecipes") : t("session.goHome")}</span>
          </Link>
          <div className="ml-auto"><LangToggle /></div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-12 pt-5">
        {sessionQ.loading ? (
          <PageLoader label={t("session.opening")} />
        ) : !session ? (
          <EmptyState icon={<Coffee className="h-7 w-7" />} title={t("session.notFoundTitle")} description={t("session.notFoundDesc")} action={<Link to="/" className="btn-primary px-5">{t("session.goHome")}</Link>} />
        ) : (
          <div className="animate-fade-up space-y-5">
            {/* Recipe summary */}
            <div className="surface p-5">
              <p className="text-xs uppercase tracking-wide text-cream-mute">{t("session.title")}</p>
              <h1 className="mt-1 text-2xl font-semibold text-cream">{recipe?.name ?? "—"}</h1>
              {recipe?.bean_label && <p className="mt-0.5 text-gold">{recipe.bean_label}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-cream-dim tnum">
                {recipe?.ratio && <span className="font-semibold text-cream">{recipe.ratio}</span>}
                <span>{recipe?.dose_g ?? "–"} / {recipe?.water_g ?? "–"} g</span>
                <span>· {t("session.on", { date: formatDate(session.brew_date) })}</span>
              </div>
              <button onClick={() => setShareOpen(true)} className="btn-ghost mt-4 w-full"><Share2 className="h-4 w-4" /> {t("session.shareCta")}</button>
            </div>

            {/* Average */}
            {avg != null && (
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-gold/10 py-4">
                <StarRating value={Math.round(avg)} size={24} />
                <span className="text-2xl font-bold text-gold tnum">{avg.toFixed(1)}</span>
                <span className="text-sm text-cream-dim">· {t("session.tasters", { n: scored.length })}</span>
              </div>
            )}

            {/* Group flavor radar */}
            {hasFlavor && (
              <div className="surface p-4">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-cream-dim">{t("session.flavorProfile")}</h2>
                <FlavorRadar values={flavorAvg} size={250} />
              </div>
            )}

            {/* Tastings */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cream">{t("nav.tastings")}</h2>
                <button onClick={() => setFormOpen(true)} className="btn-primary h-10 px-4 text-sm"><Plus className="h-4 w-4" /> {t("session.addMine")}</button>
              </div>

              {loadingT ? (
                <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-gold" /></div>
              ) : tastings.length === 0 ? (
                <p className="surface px-4 py-5 text-sm leading-relaxed text-cream-dim">{t("session.empty")}</p>
              ) : (
                <ul className="space-y-2.5">
                  {tastings.map((c) => (
                    <TastingItem key={c.id} c={c} onDelete={() => remove(c.id)} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>

      {session && (
        <>
          <TastingForm open={formOpen} sessionId={session.id} onClose={() => setFormOpen(false)} onSaved={(c) => setTastings((x) => [...x, c])} />
          <ShareSession open={shareOpen} onClose={() => setShareOpen(false)} logId={session.id} title={recipe?.name ?? t("session.title")} />
        </>
      )}
    </div>
  );
}

function TastingItem({ c, onDelete }: { c: BrewComment; onDelete: () => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const hasFlavor = FLAVOR_AXES.some((a) => c[a] != null);
  const hasDetail = hasFlavor || !!c.comment;

  return (
    <li className="surface overflow-hidden">
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={() => hasDetail && setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={hasDetail ? open : undefined}
        >
          <span className="min-w-0 flex-1 truncate font-semibold text-cream">{c.author}</span>
          {c.overall != null && <StarRating value={c.overall} size={16} />}
          {hasDetail && (
            <ChevronDown className={`h-4 w-4 shrink-0 text-cream-mute transition-transform ${open ? "rotate-180" : ""}`} />
          )}
        </button>
        <button onClick={onDelete} className="shrink-0 text-cream-mute transition-colors hover:text-danger" aria-label={t("common.delete")}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-cream/10 px-4 py-3">
          {hasFlavor && (
            <div className="space-y-2">
              {FLAVOR_AXES.map((axis) => (
                <div key={axis} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-cream-dim">{t(`taste.${axis}` as const)}</span>
                  <StarRating value={(c[axis] as number | null) ?? 0} size={14} />
                </div>
              ))}
            </div>
          )}
          {c.comment && <p className="text-sm leading-relaxed text-cream-dim">{c.comment}</p>}
        </div>
      )}
    </li>
  );
}

function TastingForm({
  open, sessionId, onClose, onSaved,
}: {
  open: boolean;
  sessionId: string;
  onClose: () => void;
  onSaved: (c: BrewComment) => void;
}) {
  const t = useT();
  const { notify } = useToast();
  const { profile } = useProfile();
  const [author, setAuthor] = useState("");
  const [score, setScore] = useState(4);
  const [notes, setNotes] = useState("");
  const [flavor, setFlavor] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const defaultFlavor = () => Object.fromEntries(FLAVOR_AXES.map((a) => [a, 3]));

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setAuthor(profile.name);
    setScore(4);
    setNotes("");
    setFlavor(defaultFlavor());
    setWasOpen(true);
  }
  if (!open && wasOpen) setWasOpen(false);

  async function save() {
    if (!author.trim()) return notify(t("tasting.errName"), "error");
    setSaving(true);
    try {
      const created = await createTasting({
        brew_log_id: sessionId,
        author: author.trim(),
        overall: score,
        comment: notes || null,
        acidity: flavor.acidity,
        body: flavor.body,
        sweetness: flavor.sweetness,
        bitterness: flavor.bitterness,
        clarity: flavor.clarity,
      });
      notify(t("tasting.added"));
      onSaved(created);
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("tasting.formTitle")}
      footer={
        <>
          <button className="btn-quiet flex-1" onClick={onClose} disabled={saving}>{t("common.cancel")}</button>
          <button className="btn-primary flex-[2]" onClick={save} disabled={saving}>{saving ? t("common.saving") : t("common.post")}</button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("tasting.yourName")}>
          <TextInput value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t("tasting.phName")} autoFocus={!profile.name} />
        </Field>
        <div>
          <span className="label">{t("tasting.fieldScore")}</span>
          <div className="flex items-center gap-3">
            <StarRating value={score} onChange={setScore} />
            <span className="text-lg font-bold text-gold tnum">{score}/5</span>
          </div>
        </div>

        {/* Flavor axes — compact star rows that feed the radar */}
        <div>
          <span className="label">{t("tasting.flavor")}</span>
          <div className="space-y-2.5 rounded-2xl bg-espresso-700 p-3">
            {FLAVOR_AXES.map((axis) => (
              <div key={axis} className="flex items-center justify-between gap-3">
                <span className="text-sm text-cream">{t(`taste.${axis}` as const)}</span>
                <StarRating value={flavor[axis] ?? 3} onChange={(v) => setFlavor((f) => ({ ...f, [axis]: v }))} size={20} />
              </div>
            ))}
          </div>
        </div>

        <Field label={t("tasting.fieldNotes")} optionalText={t("common.optional")}>
          <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("tasting.phNotes")} />
        </Field>
      </div>
    </Modal>
  );
}
