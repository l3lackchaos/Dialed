import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, Zap, ChevronRight, Timer } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBeans, fetchBrewLogs, fetchRecipes, fetchTastingByBean, type TastingRow } from "../lib/queries";
import { TASTE_AXES } from "../lib/constants";
import { average, formatDate } from "../lib/format";
import { PageLoader, EmptyState } from "../components/ui";
import TasteRadar, { type RadarSeries } from "../components/TasteRadar";
import type { Bean } from "../lib/types";

// Distinct, AA-on-white hues for comparing bean profiles.
const SERIES_COLORS = ["#47632F", "#B0492A", "#2F6E86", "#A77B2E", "#7A4A6B"];

export default function Dashboard() {
  const t = useT();
  const navigate = useNavigate();
  const beansQ = useQuery(fetchBeans);
  const logsQ = useQuery(fetchBrewLogs);
  const recipesQ = useQuery(fetchRecipes);
  const tastingQ = useQuery(fetchTastingByBean);

  const beans = beansQ.data ?? [];
  const logs = logsQ.data ?? [];
  const recipes = recipesQ.data ?? [];
  const tasting = tastingQ.data ?? [];
  const favorites = recipes.filter((r) => r.is_favorite);

  const [activeBeans, setActiveBeans] = useState<Set<string> | null>(null);
  const beanProfiles = useMemo(() => computeBeanProfiles(beans, tasting), [beans, tasting]);
  const defaultActive = useMemo(
    () => new Set(beanProfiles.slice(0, 3).map((p) => p.bean.id)),
    [beanProfiles],
  );
  const selected = activeBeans ?? defaultActive;
  const radarSeries: RadarSeries[] = beanProfiles
    .filter((p) => selected.has(p.bean.id))
    .map((p, i) => ({ name: p.bean.name, color: SERIES_COLORS[i % SERIES_COLORS.length], values: p.profile }));

  const loading = beansQ.loading || logsQ.loading || recipesQ.loading || tastingQ.loading;
  if (loading) return <PageLoader label={t("session.opening")} />;

  if (beans.length === 0 && recipes.length === 0 && logs.length === 0) {
    return (
      <div className="animate-fade-up">
        <Hero beanCount={0} brewCount={0} />
        <div className="mt-5">
          <EmptyState
            icon={<Coffee className="h-7 w-7" />}
            title={t("dash.welcomeTitle")}
            description={t("dash.welcomeDesc")}
            action={<Link to="/beans/new" className="btn-primary px-4"><Coffee className="h-4 w-4" /> {t("dash.addFirstBean")}</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-7">
      <Hero beanCount={beans.length} brewCount={logs.length} />

      {/* Quick log */}
      <section>
        <SectionTitle icon={<Zap className="h-4 w-4" />} title={t("dash.quickLog")} to="/recipes" />
        {favorites.length === 0 ? (
          <p className="surface px-4 py-4 text-sm leading-relaxed text-cream-dim">{t("dash.quickLogEmpty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {favorites.map((r) => (
              <button key={r.id} onClick={() => navigate(`/logs/new?recipe=${r.id}`)} className="surface flex items-center justify-between gap-3 p-3.5 text-left transition-colors hover:border-gold/40">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-cream">{r.name}</p>
                  <p className="truncate text-xs text-gold">{r.bean?.name ?? "—"} · {r.ratio ?? "—"}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold text-espresso-900"><Zap className="h-4 w-4" strokeWidth={2.5} /></span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Tasting profiles (from everyone's comments) */}
      {beanProfiles.length > 0 && (
        <section>
          <SectionTitle title={t("dash.profiles")} />
          <div className="surface p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {beanProfiles.map((p, i) => {
                const on = selected.has(p.bean.id);
                const color = SERIES_COLORS[i % SERIES_COLORS.length];
                return (
                  <button
                    key={p.bean.id}
                    onClick={() => {
                      const next = new Set(selected);
                      if (next.has(p.bean.id)) next.delete(p.bean.id); else next.add(p.bean.id);
                      setActiveBeans(next);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${on ? "border-transparent text-espresso-900" : "border-cream/15 text-cream-dim"}`}
                    style={on ? { background: color } : undefined}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: on ? "#FBFBF8" : color }} />
                    {p.bean.name}
                  </button>
                );
              })}
            </div>
            {radarSeries.length > 0 ? (
              <TasteRadar series={radarSeries} height={290} />
            ) : (
              <p className="py-10 text-center text-sm text-cream-mute">{t("dash.selectBean")}</p>
            )}
          </div>
        </section>
      )}

      {/* Shelf */}
      <section>
        <SectionTitle icon={<Coffee className="h-4 w-4" />} title={t("dash.shelf")} to="/beans" />
        {beans.length === 0 ? (
          <p className="surface px-4 py-4 text-sm text-cream-dim">{t("dash.shelfEmpty")}</p>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {beans.map((b) => (
              <Link key={b.id} to="/beans" className="surface w-44 shrink-0 p-3.5 transition-colors hover:border-gold/40">
                <p className="truncate font-semibold text-cream">{b.name}</p>
                <p className="mt-0.5 truncate text-xs text-cream-dim">{b.origin ?? b.roaster ?? "—"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {b.process && <span className="tag">{b.process}</span>}
                  {b.roast_level && <span className="tag">{b.roast_level}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent brews */}
      <section>
        <SectionTitle icon={<Timer className="h-4 w-4" />} title={t("dash.recent")} to="/logs" />
        {logs.length === 0 ? (
          <p className="surface px-4 py-4 text-sm text-cream-dim">{t("dash.recentEmpty")}</p>
        ) : (
          <ul className="space-y-2.5">
            {logs.slice(0, 5).map((log) => (
              <li key={log.id}>
                <Link to="/logs" className="surface flex items-center gap-3 p-3.5 transition-colors hover:border-gold/40">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/12 text-gold">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-cream">{log.recipe?.name ?? "—"}</p>
                    <p className="truncate text-xs text-gold">{log.recipe?.bean?.name ?? "—"}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-2xs text-cream-mute">
                      <span>{formatDate(log.brew_date)}</span>
                      {log.actual_time && <span className="flex items-center gap-1 tnum"><Timer className="h-3 w-3" /> {log.actual_time}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-cream-mute" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type BeanProfile = { bean: Bean; count: number; profile: Record<string, number | null> };

function computeBeanProfiles(beans: Bean[], tasting: TastingRow[]): BeanProfile[] {
  const byBean = new Map<string, TastingRow[]>();
  for (const row of tasting) {
    if (!row.bean_id) continue;
    const arr = byBean.get(row.bean_id) ?? [];
    arr.push(row);
    byBean.set(row.bean_id, arr);
  }
  return beans
    .map((bean) => {
      const rows = byBean.get(bean.id) ?? [];
      const profile: Record<string, number | null> = {};
      for (const axis of TASTE_AXES) profile[axis.key] = average(rows.map((r) => r[axis.key] as number | null));
      return { bean, count: rows.length, profile };
    })
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);
}

function Hero({ beanCount, brewCount }: { beanCount: number; brewCount: number }) {
  const t = useT();
  return (
    <div className="surface relative overflow-hidden p-5">
      <h1 className="font-display text-3xl font-semibold text-cream">{t("dash.greeting")}</h1>
      <p className="mt-1 text-sm text-cream-dim">{t("dash.subtitle")}</p>
      <div className="mt-4 flex items-baseline gap-4">
        <span className="text-cream-dim"><b className="font-display text-2xl font-semibold text-gold tnum">{beanCount}</b> {t("dash.beansCount")}</span>
        <span className="text-cream-mute">·</span>
        <span className="text-cream-dim"><b className="font-display text-2xl font-semibold text-gold tnum">{brewCount}</b> {t("dash.brewsLogged")}</span>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, to }: { icon?: React.ReactNode; title: string; to?: string }) {
  const t = useT();
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-cream">
        {icon && <span className="text-gold">{icon}</span>}
        {title}
      </h2>
      {to && <Link to={to} className="flex items-center gap-0.5 text-xs font-medium text-gold transition-colors hover:text-gold-dark">{t("common.viewAll")} <ChevronRight className="h-3.5 w-3.5" /></Link>}
    </div>
  );
}
