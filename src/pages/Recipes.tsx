import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Plus, Pencil, Trash2, Star, PlayCircle } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchRecipes, fetchBeans, deleteRecipe, toggleRecipeFavorite } from "../lib/queries";
import { parsePourSchedule } from "../lib/format";
import { TabHeader, EmptyState, Skeleton } from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { RecipeWithBean } from "../lib/types";

export default function Recipes() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const recipesQ = useQuery(fetchRecipes);
  const beansQ = useQuery(fetchBeans);
  const recipes = recipesQ.data ?? [];
  const beans = beansQ.data ?? [];

  const [deleting, setDeleting] = useState<RecipeWithBean | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggleFav(r: RecipeWithBean) {
    try {
      await toggleRecipeFavorite(r.id, !r.is_favorite);
      recipesQ.refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    }
  }
  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteRecipe(deleting.id);
      notify(t("recipes.deleted"));
      setDeleting(null);
      recipesQ.refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    } finally {
      setBusy(false);
    }
  }

  const loading = recipesQ.loading || beansQ.loading;

  return (
    <div className="animate-fade-up">
      <TabHeader
        title={t("recipes.title")}
        action={
          beans.length > 0 ? (
            <Link to="/recipes/new" className="btn-primary h-10 px-3.5">
              <Plus className="h-4 w-4" /> {t("recipes.new")}
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : beans.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title={t("recipes.needBeanTitle")}
          description={t("recipes.needBeanDesc")}
          action={<Link to="/beans/new" className="btn-primary px-4"><Plus className="h-4 w-4" /> {t("beans.new")}</Link>}
        />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title={t("recipes.emptyTitle")}
          description={t("recipes.emptyDesc")}
          action={<Link to="/recipes/new" className="btn-primary px-4"><Plus className="h-4 w-4" /> {t("recipes.emptyCta")}</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {recipes.map((r) => (
            <li key={r.id}>
              <RecipeRow
                recipe={r}
                onEdit={() => navigate(`/recipes/${r.id}/edit`)}
                onDelete={() => setDeleting(r)}
                onToggleFav={() => toggleFav(r)}
                onLog={() => navigate(`/logs/new?recipe=${r.id}`)}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        title={t("recipes.deleteTitle")}
        message={t("recipes.deleteMsg", { name: deleting?.name ?? "" })}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-espresso-700 px-2.5 py-1.5">
      <p className="text-2xs text-cream-mute">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-cream tnum">{value}</p>
    </div>
  );
}

function RecipeRow({
  recipe,
  onEdit,
  onDelete,
  onToggleFav,
  onLog,
}: {
  recipe: RecipeWithBean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFav: () => void;
  onLog: () => void;
}) {
  const t = useT();
  const steps = parsePourSchedule(recipe.pour_schedule);

  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[1.05rem] font-semibold text-cream">{recipe.name}</h3>
          <p className="mt-0.5 text-sm text-gold/85">{recipe.bean?.name ?? t("common.none")}</p>
        </div>
        <div className="flex shrink-0 items-center">
          <button onClick={onToggleFav} className="flex h-9 w-9 items-center justify-center text-cream-mute transition-colors hover:text-gold" aria-label={t("recipes.favorite")}>
            <Star className={`h-5 w-5 ${recipe.is_favorite ? "fill-gold text-gold" : ""}`} />
          </button>
          <button onClick={onEdit} className="flex h-9 w-9 items-center justify-center text-cream-mute transition-colors hover:text-gold" aria-label={t("common.edit")}>
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="flex h-9 w-9 items-center justify-center text-cream-mute transition-colors hover:text-danger" aria-label={t("common.delete")}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {(recipe.dripper || recipe.grinder || recipe.click_setting) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {recipe.dripper && <span className="tag">{recipe.dripper}</span>}
          {recipe.grinder && <span className="tag">{recipe.grinder}</span>}
          {recipe.click_setting && <span className="tag">{recipe.click_setting}</span>}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t("recipes.statDoseWater")} value={`${recipe.dose_g ?? "–"}/${recipe.water_g ?? "–"}g`} />
        <Stat label={t("recipes.statRatio")} value={recipe.ratio ?? "—"} />
        <Stat label={t("recipes.statTemp")} value={recipe.water_temp ? `${recipe.water_temp}°C` : "—"} />
        <Stat label={t("recipes.statTarget")} value={recipe.target_time ?? "—"} />
      </div>

      {steps.length > 0 && (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-sm font-medium text-gold/85 transition-colors hover:text-gold">
            {t("recipes.scheduleN", { n: steps.length })}
          </summary>
          <div className="mt-2 overflow-hidden rounded-lg border border-cream/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-espresso-700 text-2xs uppercase tracking-wide text-cream-dim">
                <tr>
                  <th className="px-2.5 py-1.5 font-semibold">{t("pour.pour")}</th>
                  <th className="px-2.5 py-1.5 font-semibold">{t("pour.cumulative")}</th>
                  <th className="px-2.5 py-1.5 font-semibold">{t("pour.time")}</th>
                  <th className="px-2.5 py-1.5 font-semibold">{t("pour.note")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/8">
                {steps.map((s, i) => (
                  <tr key={i} className="text-cream-dim">
                    <td className="px-2.5 py-1.5 text-cream">{s.pour || "—"}</td>
                    <td className="px-2.5 py-1.5 tnum">{s.cumulative_g || "—"}</td>
                    <td className="px-2.5 py-1.5 tnum">{s.time || "—"}</td>
                    <td className="px-2.5 py-1.5">{s.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {recipe.notes && <p className="mt-3 text-sm italic leading-relaxed text-cream-dim">{recipe.notes}</p>}

      <button onClick={onLog} className="btn-ghost mt-3 w-full">
        <PlayCircle className="h-4 w-4" /> {t("recipes.logThis")}
      </button>
    </div>
  );
}
