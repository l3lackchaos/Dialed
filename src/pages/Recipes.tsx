import { useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Star,
  Thermometer,
  Scale,
  Timer,
  PlayCircle,
} from "lucide-react";
import { useQuery } from "../hooks/useQuery";
import {
  fetchRecipes,
  fetchBeans,
  deleteRecipe,
  toggleRecipeFavorite,
} from "../lib/queries";
import { parsePourSchedule } from "../lib/format";
import { SectionHeading, LoadingState, EmptyState, StatPill } from "../components/ui";
import RecipeForm from "../components/RecipeForm";
import BrewLogForm from "../components/BrewLogForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { Recipe, RecipeWithBean } from "../lib/types";

export default function Recipes() {
  const { notify } = useToast();
  const recipesQ = useQuery(fetchRecipes);
  const beansQ = useQuery(fetchBeans);
  const recipes = recipesQ.data ?? [];
  const beans = beansQ.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState<RecipeWithBean | null>(null);
  const [busy, setBusy] = useState(false);

  const [logFor, setLogFor] = useState<RecipeWithBean | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  async function toggleFav(recipe: RecipeWithBean) {
    try {
      await toggleRecipeFavorite(recipe.id, !recipe.is_favorite);
      recipesQ.refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not update", "error");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteRecipe(deleting.id);
      notify("Recipe deleted");
      setDeleting(null);
      recipesQ.refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete", "error");
    } finally {
      setBusy(false);
    }
  }

  const loading = recipesQ.loading || beansQ.loading;

  return (
    <div className="animate-fade-up">
      <SectionHeading
        eyebrow="Feature 02"
        title="Recipes"
        action={
          <button
            className="btn-gold"
            onClick={openNew}
            disabled={beans.length === 0}
            title={beans.length === 0 ? "Add a bean first" : undefined}
          >
            <Plus className="h-4 w-4" /> Recipe
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading recipes…" />
      ) : beans.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="Add a bean first"
          description="Recipes link to a bean. Head to The Shelf and add what you're brewing, then come back to build a recipe."
        />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title="No recipes yet"
          description="Build your first pour-over recipe — dripper, grind, ratio and a full pour schedule."
          action={
            <button className="btn-gold" onClick={openNew}>
              <Plus className="h-4 w-4" /> New recipe
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => {
                setEditing(recipe);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(recipe)}
              onToggleFav={() => toggleFav(recipe)}
              onLog={() => setLogFor(recipe)}
            />
          ))}
        </div>
      )}

      <RecipeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={recipesQ.refetch}
        beans={beans}
        recipe={editing}
      />

      <BrewLogForm
        open={!!logFor}
        onClose={() => setLogFor(null)}
        onSaved={() => {}}
        recipes={recipes}
        defaultRecipeId={logFor?.id}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete recipe?"
        message={`"${deleting?.name}" and its brew logs will be permanently deleted.`}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function RecipeCard({
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
  const steps = parsePourSchedule(recipe.pour_schedule);

  return (
    <article className="card card-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-cream">{recipe.name}</h3>
            {recipe.is_favorite && (
              <Star className="h-4 w-4 shrink-0 fill-gold text-gold" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-gold/80">{recipe.bean?.name ?? "—"}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onToggleFav}
            className={`rounded-lg p-1.5 transition hover:bg-gold/10 ${
              recipe.is_favorite ? "text-gold" : "text-cream-mute hover:text-gold"
            }`}
            aria-label="Toggle favorite"
          >
            <Star className={`h-4 w-4 ${recipe.is_favorite ? "fill-gold" : ""}`} />
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-cream-mute transition hover:bg-gold/10 hover:text-gold"
            aria-label="Edit recipe"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-cream-mute transition hover:bg-red-500/15 hover:text-red-400"
            aria-label="Delete recipe"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {recipe.dripper && <span className="chip">{recipe.dripper}</span>}
        {recipe.grinder && <span className="chip">{recipe.grinder}</span>}
        {recipe.click_setting && <span className="chip">{recipe.click_setting}</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill
          label="Dose / Water"
          value={
            <span className="flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-gold/70" />
              {recipe.dose_g ?? "—"} / {recipe.water_g ?? "—"}g
            </span>
          }
        />
        <StatPill label="Ratio" value={recipe.ratio ?? "—"} />
        <StatPill
          label="Temp"
          value={
            <span className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-gold/70" />
              {recipe.water_temp ? `${recipe.water_temp}°C` : "—"}
            </span>
          }
        />
        <StatPill
          label="Target"
          value={
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5 text-gold/70" />
              {recipe.target_time ?? "—"}
            </span>
          }
        />
      </div>

      {steps.length > 0 && (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-xs font-medium text-gold/80 transition hover:text-gold">
            <span className="group-open:hidden">▸ Pour schedule ({steps.length})</span>
            <span className="hidden group-open:inline">▾ Pour schedule</span>
          </summary>
          <div className="mt-2 overflow-hidden rounded-lg border border-gold/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-espresso-900/60 text-[0.65rem] uppercase tracking-wider text-gold/70">
                <tr>
                  <th className="px-2.5 py-1.5 font-semibold">Pour</th>
                  <th className="px-2.5 py-1.5 font-semibold">Cum. g</th>
                  <th className="px-2.5 py-1.5 font-semibold">Time</th>
                  <th className="px-2.5 py-1.5 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {steps.map((s, i) => (
                  <tr key={i} className="text-cream-dim">
                    <td className="px-2.5 py-1.5 text-cream">{s.pour || "—"}</td>
                    <td className="px-2.5 py-1.5">{s.cumulative_g || "—"}</td>
                    <td className="px-2.5 py-1.5">{s.time || "—"}</td>
                    <td className="px-2.5 py-1.5">{s.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {recipe.notes && (
        <p className="mt-3 text-sm italic text-cream-dim">{recipe.notes}</p>
      )}

      <button onClick={onLog} className="btn-ghost mt-3 w-full">
        <PlayCircle className="h-4 w-4" /> Log this brew
      </button>
    </article>
  );
}
