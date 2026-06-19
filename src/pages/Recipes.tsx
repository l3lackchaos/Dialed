import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Plus, ChevronRight, CheckCircle2, Circle, Trash2, X } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchRecipes, deleteRecipes } from "../lib/queries";
import { EmptyState, Skeleton } from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

export default function Recipes() {
  const t = useT();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: recipes, loading, refetch } = useQuery(fetchRecipes);

  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  function exitSelect() {
    setSelecting(false);
    setPicked(new Set());
  }
  function toggle(id: string) {
    setPicked((p) => {
      const next = new Set(p);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    const all = recipes ?? [];
    setPicked((p) => (p.size === all.length ? new Set() : new Set(all.map((r) => r.id))));
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await deleteRecipes([...picked]);
      notify(t("recipes.bulkDeleted", { n: picked.size }));
      setConfirm(false);
      exitSelect();
      refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    } finally {
      setBusy(false);
    }
  }

  const hasRecipes = recipes && recipes.length > 0;
  // Active coffees first, finished ones sink to the bottom.
  const sorted = recipes ? [...recipes].sort((a, b) => Number(a.finished) - Number(b.finished)) : [];

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-cream">{t("recipes.title")}</h1>
        {selecting ? (
          <button onClick={exitSelect} className="btn-quiet h-11 px-4">
            <X className="h-4 w-4" /> {t("common.cancel")}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {hasRecipes && (
              <button onClick={() => setSelecting(true)} className="btn-ghost h-11 px-3.5">
                {t("common.select")}
              </button>
            )}
            <Link to="/r/new" className="btn-primary h-11 px-4">
              <Plus className="h-4 w-4" /> {t("recipes.add")}
            </Link>
          </div>
        )}
      </div>

      {selecting && (
        <button onClick={toggleAll} className="mb-3 text-sm font-medium text-gold">
          {picked.size === (recipes?.length ?? 0) ? t("common.cancel") : t("common.selectAll")}
          {" · "}
          {t("common.selectedN", { n: picked.size })}
        </button>
      )}

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : !hasRecipes ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title={t("recipes.emptyTitle")}
          description={t("recipes.emptyDesc")}
          action={<Link to="/r/new" className="btn-primary px-5"><Plus className="h-4 w-4" /> {t("recipes.add")}</Link>}
        />
      ) : (
        <ul className={`space-y-3 ${selecting && picked.size > 0 ? "pb-20" : ""}`}>
          {sorted.map((r) => {
            const checked = picked.has(r.id);
            return (
              <li key={r.id}>
                <button
                  onClick={() => (selecting ? toggle(r.id) : navigate(`/r/${r.id}`))}
                  className={`surface flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-gold/40 ${
                    selecting && checked ? "border-gold ring-1 ring-gold/40" : ""
                  }`}
                >
                  {selecting && (
                    checked
                      ? <CheckCircle2 className="h-6 w-6 shrink-0 text-gold" />
                      : <Circle className="h-6 w-6 shrink-0 text-cream-mute" />
                  )}
                  <div className={`min-w-0 flex-1 ${r.finished ? "opacity-55" : ""}`}>
                    <div className="flex items-center gap-2">
                      <h2 className={`truncate text-lg font-semibold text-cream ${r.finished ? "line-through" : ""}`}>{r.name}</h2>
                      {r.finished && (
                        <span className="shrink-0 rounded-full bg-espresso-700 px-2 py-0.5 text-xs font-medium text-cream-dim">{t("recipes.finished")}</span>
                      )}
                    </div>
                    {r.bean_label && <p className="mt-0.5 truncate text-sm text-gold">{r.bean_label}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-cream-dim tnum">
                      {r.ratio && <span className="font-semibold text-cream">{r.ratio}</span>}
                      <span>{r.dose_g ?? "–"} / {r.water_g ?? "–"} g</span>
                      {r.water_temp && <span>· {r.water_temp}°C</span>}
                    </div>
                  </div>
                  {!selecting && <ChevronRight className="h-5 w-5 shrink-0 text-cream-mute" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Sticky bulk action bar */}
      {selecting && picked.size > 0 && (
        <div className="safe-bottom fixed inset-x-0 bottom-[4.5rem] z-40 px-4">
          <div className="mx-auto max-w-lg">
            <button onClick={() => setConfirm(true)} className="btn-danger w-full shadow-pop">
              <Trash2 className="h-4 w-4" /> {t("common.deleteN", { n: picked.size })}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        title={t("recipes.bulkDeleteTitle", { n: picked.size })}
        message={t("recipes.bulkDeleteMsg")}
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
