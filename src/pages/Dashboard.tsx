import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  ClipboardList,
  Zap,
  Radar as RadarIcon,
  ChevronRight,
  Timer,
} from "lucide-react";
import { useQuery } from "../hooks/useQuery";
import { fetchBeans, fetchBrewLogs, fetchRecipes } from "../lib/queries";
import { TASTE_AXES } from "../lib/constants";
import { average, formatDate } from "../lib/format";
import { LoadingState, EmptyState } from "../components/ui";
import TasteRadar, { type RadarSeries } from "../components/TasteRadar";
import BrewLogForm from "../components/BrewLogForm";
import type { Bean, BrewLogWithRecipe, RecipeWithBean } from "../lib/types";

// Distinct-but-on-theme colors for comparing bean profiles on the radar.
const SERIES_COLORS = ["#C8963A", "#E0B968", "#9C6B2E", "#D98C5F", "#7FA36B"];

export default function Dashboard() {
  const beansQ = useQuery(fetchBeans);
  const logsQ = useQuery(fetchBrewLogs);
  const recipesQ = useQuery(fetchRecipes);

  const beans = beansQ.data ?? [];
  const logs = logsQ.data ?? [];
  const recipes = recipesQ.data ?? [];
  const favorites = recipes.filter((r) => r.is_favorite);

  const [quickLogRecipe, setQuickLogRecipe] = useState<RecipeWithBean | null>(null);
  const [activeBeans, setActiveBeans] = useState<Set<string> | null>(null);

  // Average tasting profile per bean, derived from its brew logs.
  const beanProfiles = useMemo(() => computeBeanProfiles(beans, logs), [beans, logs]);

  // Default the radar to the (up to) three most-logged beans.
  const defaultActive = useMemo(
    () => new Set(beanProfiles.slice(0, 3).map((p) => p.bean.id)),
    [beanProfiles],
  );
  const selected = activeBeans ?? defaultActive;

  const radarSeries: RadarSeries[] = beanProfiles
    .filter((p) => selected.has(p.bean.id))
    .map((p, i) => ({
      name: p.bean.name,
      color: SERIES_COLORS[i % SERIES_COLORS.length],
      values: p.profile,
    }));

  const loading = beansQ.loading || logsQ.loading || recipesQ.loading;

  function refetchAll() {
    logsQ.refetch();
  }

  if (loading) return <LoadingState label="Pulling your notebook…" />;

  const totallyEmpty = beans.length === 0 && recipes.length === 0 && logs.length === 0;
  if (totallyEmpty) {
    return (
      <div className="animate-fade-up space-y-4">
        <Hero beanCount={0} brewCount={0} />
        <EmptyState
          icon={<Coffee className="h-7 w-7" />}
          title="Welcome to Dialed"
          description="Start by adding the beans on your shelf, build a recipe, then log every brew to dial it in."
          action={
            <Link to="/beans" className="btn-gold">
              <Coffee className="h-4 w-4" /> Add your first bean
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-7">
      <Hero beanCount={beans.length} brewCount={logs.length} />

      {/* Quick Log */}
      <section>
        <Heading icon={<Zap className="h-4 w-4" />} title="Quick Log" to="/recipes" />
        {favorites.length === 0 ? (
          <p className="card px-4 py-5 text-sm text-cream-dim">
            Pin a recipe with the ★ on the Recipes page and it'll show here for
            one-tap logging.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {favorites.map((r) => (
              <button
                key={r.id}
                onClick={() => setQuickLogRecipe(r)}
                className="card card-hover flex items-center justify-between gap-3 p-3.5 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-cream">{r.name}</p>
                  <p className="truncate text-xs text-gold/80">
                    {r.bean?.name ?? "—"} · {r.ratio ?? "—"}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-sheen text-espresso-900 shadow-gold">
                  <Zap className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Tasting radar */}
      <section>
        <Heading
          icon={<RadarIcon className="h-4 w-4" />}
          title="Tasting Profiles"
        />
        {beanProfiles.length === 0 ? (
          <p className="card px-4 py-5 text-sm text-cream-dim">
            Log a few brews and the average tasting profile of each bean will be
            plotted here.
          </p>
        ) : (
          <div className="card p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {beanProfiles.map((p, i) => {
                const on = selected.has(p.bean.id);
                const color = SERIES_COLORS[i % SERIES_COLORS.length];
                return (
                  <button
                    key={p.bean.id}
                    onClick={() => {
                      const next = new Set(selected);
                      next.has(p.bean.id)
                        ? next.delete(p.bean.id)
                        : next.add(p.bean.id);
                      setActiveBeans(next);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      on
                        ? "border-transparent text-espresso-900"
                        : "border-gold/20 text-cream-dim hover:text-cream"
                    }`}
                    style={on ? { background: color } : undefined}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: on ? "#140C05" : color }}
                    />
                    {p.bean.name}
                    <span className="opacity-70">({p.count})</span>
                  </button>
                );
              })}
            </div>
            {radarSeries.length > 0 ? (
              <TasteRadar series={radarSeries} height={300} />
            ) : (
              <p className="py-10 text-center text-sm text-cream-mute">
                Select a bean above to plot its profile.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Beans shelf preview */}
      <section>
        <Heading
          icon={<Coffee className="h-4 w-4" />}
          title="On the Shelf"
          to="/beans"
        />
        {beans.length === 0 ? (
          <p className="card px-4 py-5 text-sm text-cream-dim">No beans yet.</p>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {beans.map((b) => (
              <Link
                key={b.id}
                to="/beans"
                className="card card-hover w-44 shrink-0 p-3.5"
              >
                <p className="truncate font-semibold text-cream">{b.name}</p>
                <p className="mt-0.5 truncate text-xs text-cream-dim">
                  {b.origin ?? b.roaster ?? "—"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {b.process && <span className="chip">{b.process}</span>}
                  {b.roast_level && <span className="chip">{b.roast_level}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent brews */}
      <section>
        <Heading
          icon={<ClipboardList className="h-4 w-4" />}
          title="Recent Brews"
          to="/logs"
        />
        {logs.length === 0 ? (
          <p className="card px-4 py-5 text-sm text-cream-dim">
            No brews logged yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {logs.slice(0, 5).map((log) => (
              <Link
                key={log.id}
                to="/logs"
                className="card card-hover flex items-center gap-3 p-3.5"
              >
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-gold/10">
                  <span className="text-base font-bold leading-none text-gold">
                    {log.overall ?? "–"}
                  </span>
                  <span className="text-[0.55rem] text-gold/70">/5</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-cream">
                    {log.recipe?.name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-gold/80">
                    {log.recipe?.bean?.name ?? "—"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-[0.7rem] text-cream-mute">
                    <span>{formatDate(log.brew_date)}</span>
                    {log.actual_time && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" /> {log.actual_time}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-cream-mute" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <BrewLogForm
        open={!!quickLogRecipe}
        onClose={() => setQuickLogRecipe(null)}
        onSaved={refetchAll}
        recipes={recipes}
        defaultRecipeId={quickLogRecipe?.id}
      />
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */

type BeanProfile = {
  bean: Bean;
  count: number;
  profile: Record<string, number | null>;
};

function computeBeanProfiles(
  beans: Bean[],
  logs: BrewLogWithRecipe[],
): BeanProfile[] {
  const byBean = new Map<string, BrewLogWithRecipe[]>();
  for (const log of logs) {
    const beanId = log.recipe?.bean?.id;
    if (!beanId) continue;
    const arr = byBean.get(beanId) ?? [];
    arr.push(log);
    byBean.set(beanId, arr);
  }

  return beans
    .map((bean) => {
      const beanLogs = byBean.get(bean.id) ?? [];
      const profile: Record<string, number | null> = {};
      for (const axis of TASTE_AXES) {
        profile[axis.key] = average(
          beanLogs.map((l) => l[axis.key] as number | null),
        );
      }
      return { bean, count: beanLogs.length, profile };
    })
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);
}

function Hero({ beanCount, brewCount }: { beanCount: number; brewCount: number }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
      <p className="eyebrow">Feature 04 · Dashboard</p>
      <h2 className="mt-1 font-display text-3xl font-semibold text-cream">
        Good brewing.
      </h2>
      <p className="mt-1 text-sm text-cream-dim">
        Your specialty pour-over notebook, dialed in.
      </p>
      <div className="mt-4 flex gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold text-gold">
            {beanCount}
          </span>
          <span className="text-xs text-cream-dim">beans</span>
        </div>
        <span className="text-cream-mute">·</span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold text-gold">
            {brewCount}
          </span>
          <span className="text-xs text-cream-dim">brews logged</span>
        </div>
      </div>
    </div>
  );
}

function Heading({
  icon,
  title,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  to?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-cream">
        <span className="text-gold">{icon}</span>
        {title}
      </h3>
      {to && (
        <Link
          to={to}
          className="flex items-center gap-0.5 text-xs font-medium text-gold/80 transition hover:text-gold"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
