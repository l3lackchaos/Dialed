import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2, Plus, ChevronRight, Coffee, PackageX, RotateCcw } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import {
  fetchRecipe, fetchSessionsForRecipe, createSession, deleteRecipe, setRecipeFinished,
} from "../lib/queries";
import { parsePourSchedule, formatDate } from "../lib/format";
import { PageLoader, EmptyState } from "../components/ui";
import StarRating from "../components/StarRating";
import ConfirmDialog from "../components/ConfirmDialog";
import LangToggle from "../components/LangToggle";
import ThemeToggle from "../components/ThemeToggle";
import { useToast } from "../components/Toast";

export default function RecipeDetail() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const recipeQ = useQuery(() => fetchRecipe(id!));
  const sessionsQ = useQuery(() => fetchSessionsForRecipe(id!));
  const recipe = recipeQ.data;

  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);

  async function startRound() {
    if (!id) return;
    setStarting(true);
    try {
      const s = await createSession(id);
      notify(t("session.created"));
      navigate(`/s/${s.id}`);
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
      setStarting(false);
    }
  }

  async function toggleFinished() {
    if (!recipe) return;
    try {
      await setRecipeFinished(recipe.id, !recipe.finished);
      notify(t(recipe.finished ? "recipes.availableToast" : "recipes.finishedToast"));
      recipeQ.refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    }
  }

  async function confirmDelete() {
    if (!id) return;
    setBusy(true);
    try {
      await deleteRecipe(id);
      notify(t("recipes.deleted"));
      navigate("/");
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
      setBusy(false);
    }
  }

  const steps = recipe ? parsePourSchedule(recipe.pour_schedule) : [];
  const sessions = sessionsQ.data ?? [];

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col">
      <header className="safe-top sticky top-0 z-40 border-b border-cream/10 bg-espresso/90 backdrop-blur-md">
        <div className="flex items-center gap-2 px-3 py-3">
          <Link to="/" className="flex h-10 items-center gap-1 rounded-lg pl-1 pr-2 text-cream-dim transition-colors hover:text-cream">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t("session.allRecipes")}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2"><ThemeToggle /><LangToggle /></div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-12 pt-5">
        {recipeQ.loading ? (
          <PageLoader label={t("session.opening")} />
        ) : !recipe ? (
          <EmptyState icon={<Coffee className="h-7 w-7" />} title={t("session.notFoundTitle")} description={t("session.notFoundDesc")} action={<Link to="/" className="btn-primary px-5">{t("session.goHome")}</Link>} />
        ) : (
          <div className="animate-fade-up space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className={`text-2xl font-semibold text-cream ${recipe.finished ? "line-through opacity-60" : ""}`}>{recipe.name}</h1>
                    {recipe.finished && (
                      <span className="shrink-0 rounded-full bg-espresso-700 px-2.5 py-0.5 text-xs font-medium text-cream-dim">{t("recipes.finished")}</span>
                    )}
                  </div>
                  {recipe.bean_label && <p className="mt-0.5 text-gold">{recipe.bean_label}</p>}
                </div>
                <div className="flex shrink-0">
                  <Link to={`/r/${recipe.id}/edit`} className="flex h-10 w-10 items-center justify-center text-cream-mute hover:text-gold" aria-label={t("common.edit")}><Pencil className="h-4 w-4" /></Link>
                  <button onClick={() => setDeleting(true)} className="flex h-10 w-10 items-center justify-center text-cream-mute hover:text-danger" aria-label={t("common.delete")}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <button
                onClick={toggleFinished}
                className={`mt-3 w-full ${recipe.finished ? "btn-primary" : "btn-ghost"}`}
              >
                {recipe.finished
                  ? <><RotateCcw className="h-4 w-4" /> {t("recipes.markAvailable")}</>
                  : <><PackageX className="h-4 w-4" /> {t("recipes.markFinished")}</>}
              </button>
            </div>

            {/* How to brew */}
            <section className="surface p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream-dim">{t("recipes.howTo")}</h2>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-cream-mute">{t("recipes.fieldRatio")}</p>
                  <p className="text-4xl font-bold text-gold tnum">{recipe.ratio ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cream-mute">{recipe.dose_g ?? "–"} g / {recipe.water_g ?? "–"} g</p>
                  {recipe.water_temp && <p className="text-lg font-semibold text-cream tnum">{recipe.water_temp}°C</p>}
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-cream/10 pt-4 text-sm">
                <Row label={t("recipes.fieldDripper")} value={recipe.dripper} />
                <Row label={t("recipes.fieldGrinder")} value={recipe.grinder} />
                <Row label={t("recipes.fieldClick")} value={recipe.click_setting} />
                <Row label={t("recipes.fieldTarget")} value={recipe.target_time} />
              </dl>

              {steps.length > 0 && (
                <ol className="mt-4 space-y-2 border-t border-cream/10 pt-4">
                  {steps.map((s, i) => (
                    <li key={i} className="flex items-baseline gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/12 text-xs font-bold text-gold tnum">{i + 1}</span>
                      <span className="flex-1 text-cream">{s.pour || t("pour.pour")}{s.note ? ` · ${s.note}` : ""}</span>
                      <span className="text-sm text-cream-dim tnum">{s.cumulative_g ? `${s.cumulative_g}g` : ""} {s.time}</span>
                    </li>
                  ))}
                </ol>
              )}

              {recipe.notes && <p className="mt-4 border-t border-cream/10 pt-4 text-sm leading-relaxed text-cream-dim">{recipe.notes}</p>}
            </section>

            {/* Tasting rounds */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cream">{t("recipes.rounds")}</h2>
                <button onClick={startRound} disabled={starting} className="btn-primary h-10 px-4 text-sm">
                  <Plus className="h-4 w-4" /> {t("recipes.brewIt")}
                </button>
              </div>

              {sessions.length === 0 ? (
                <p className="surface px-4 py-5 text-sm leading-relaxed text-cream-dim">{t("recipes.noRounds")}</p>
              ) : (
                <ul className="space-y-2.5">
                  {sessions.map((s) => (
                    <li key={s.id}>
                      <Link to={`/s/${s.id}`} className="surface flex items-center gap-3 p-4 transition-colors hover:border-gold/40">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-cream">{formatDate(s.brew_date)}</p>
                          <p className="mt-0.5 text-sm text-cream-dim">{t("session.tasters", { n: s.tasting_count })}</p>
                        </div>
                        {s.avg_overall != null && (
                          <div className="flex items-center gap-1.5">
                            <StarRating value={Math.round(s.avg_overall)} size={16} />
                            <span className="text-sm font-semibold text-gold tnum">{s.avg_overall.toFixed(1)}</span>
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 shrink-0 text-cream-mute" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>

      <ConfirmDialog
        open={deleting}
        title={t("recipes.deleteTitle")}
        message={t("recipes.deleteMsg", { name: recipe?.name ?? "" })}
        busy={busy}
        onCancel={() => setDeleting(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  const t = useT();
  return (
    <div>
      <dt className="text-xs text-cream-mute">{label}</dt>
      <dd className="mt-0.5 font-medium text-cream">{value || t("common.none")}</dd>
    </div>
  );
}
