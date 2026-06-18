import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Plus, ChevronRight } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchRecipes } from "../lib/queries";
import { EmptyState, Skeleton } from "../components/ui";

export default function Recipes() {
  const t = useT();
  const navigate = useNavigate();
  const { data: recipes, loading } = useQuery(fetchRecipes);

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-cream">{t("recipes.title")}</h1>
        <Link to="/r/new" className="btn-primary h-11 px-4">
          <Plus className="h-4 w-4" /> {t("recipes.add")}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : !recipes || recipes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-7 w-7" />}
          title={t("recipes.emptyTitle")}
          description={t("recipes.emptyDesc")}
          action={<Link to="/r/new" className="btn-primary px-5"><Plus className="h-4 w-4" /> {t("recipes.add")}</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {recipes.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => navigate(`/r/${r.id}`)}
                className="surface flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-gold/40"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-cream">{r.name}</h2>
                  {r.bean_label && <p className="mt-0.5 truncate text-sm text-gold">{r.bean_label}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-cream-dim tnum">
                    {r.ratio && <span className="font-semibold text-cream">{r.ratio}</span>}
                    <span>{r.dose_g ?? "–"} / {r.water_g ?? "–"} g</span>
                    {r.water_temp && <span>· {r.water_temp}°C</span>}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-cream-mute" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
