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
          {recipes.map((r, i) => (
            <li key={r.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
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

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="kicker">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-cream tnum">{value}</dd>
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
    <article className="surface p-5">
      {/* Masthead */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kicker">{recipe.bean?.name ?? t("common.none")}</p>
          <h3 className="mast mt-1 text-xl">{recipe.name}</h3>
        </div>
        <div className="-mr-1.5 -mt-1 flex shrink-0 items-center">
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

      {/* Ratio hero band */}
      <div className="mt-4 flex items-end justify-between border-t border-cream/15 pt-3">
        <div>
          <p className="kicker">{t("recipes.statRatio")}</p>
          <p className="font-mono text-[2.4rem] font-medium leading-none text-rust tnum">{recipe.ratio ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="kicker">{t("recipes.statDoseWater")}</p>
          <p className="mt-1 text-lg text-cream tnum">{recipe.dose_g ?? "–"} · {recipe.water_g ?? "–"} g</p>
        </div>
      </div>

      {/* Spec sheet */}
      <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 border-t border-cream/15 pt-3">
        <Spec label={t("recipes.fieldDripper")} value={recipe.dripper ?? "—"} />
        <Spec label={t("recipes.fieldGrinder")} value={recipe.grinder ?? "—"} />
        <Spec label={t("recipes.fieldClick")} value={recipe.click_setting ?? "—"} />
        <Spec label={t("recipes.statTemp")} value={recipe.water_temp ? `${recipe.water_temp}°C` : "—"} />
        <Spec label={t("recipes.statTarget")} value={recipe.target_time ?? "—"} />
      </dl>

      {steps.length > 0 && (
        <details className="group mt-4 border-t border-cream/15 pt-3">
          <summary className="kicker cursor-pointer list-none text-cream-dim transition-colors hover:text-gold">
            {t("recipes.scheduleN", { n: steps.length })} ▸
          </summary>
          <table className="mt-2 w-full text-left text-sm">
            <thead className="kicker text-cream-mute">
              <tr className="border-b border-cream/15">
                <th className="py-1.5 pr-2 font-semibold">{t("pour.pour")}</th>
                <th className="py-1.5 pr-2 font-semibold">{t("pour.cumulative")}</th>
                <th className="py-1.5 pr-2 font-semibold">{t("pour.time")}</th>
                <th className="py-1.5 font-semibold">{t("pour.note")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/10">
              {steps.map((s, i) => (
                <tr key={i} className="text-cream-dim">
                  <td className="py-1.5 pr-2 text-cream">{s.pour || "—"}</td>
                  <td className="py-1.5 pr-2 tnum">{s.cumulative_g || "—"}</td>
                  <td className="py-1.5 pr-2 tnum">{s.time || "—"}</td>
                  <td className="py-1.5">{s.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      {recipe.notes && (
        <p className="mt-4 border-t border-cream/15 pt-3 font-display text-[0.95rem] italic leading-relaxed text-cream-dim">
          {recipe.notes}
        </p>
      )}

      <button onClick={onLog} className="btn-ghost mt-4 w-full">
        <PlayCircle className="h-4 w-4" /> {t("recipes.logThis")}
      </button>
    </article>
  );
}
