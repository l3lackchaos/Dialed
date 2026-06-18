import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchRecentSessions } from "../lib/queries";
import { formatDate } from "../lib/format";
import { EmptyState, Skeleton } from "../components/ui";
import StarRating from "../components/StarRating";

export default function Tastings() {
  const t = useT();
  const { data: sessions, loading } = useQuery(fetchRecentSessions);

  return (
    <div className="animate-fade-up">
      <h1 className="mb-5 text-2xl font-semibold text-cream">{t("tastings.title")}</h1>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={<Coffee className="h-7 w-7" />}
          title={t("tastings.title")}
          description={t("tastings.empty")}
          action={<Link to="/" className="btn-primary px-5">{t("nav.recipes")}</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link to={`/s/${s.id}`} className="surface flex items-center gap-3 p-4 transition-colors hover:border-gold/40">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-cream">{s.recipe?.name ?? t("common.none")}</p>
                  {s.recipe?.bean_label && <p className="truncate text-sm text-gold">{s.recipe.bean_label}</p>}
                  <p className="mt-0.5 text-xs text-cream-mute">{formatDate(s.brew_date)} · {t("session.tasters", { n: s.tasting_count })}</p>
                </div>
                {s.avg_overall != null && (
                  <div className="flex items-center gap-1.5">
                    <StarRating value={Math.round(s.avg_overall)} size={16} />
                    <span className="text-sm font-semibold text-gold tnum">{s.avg_overall.toFixed(1)}</span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
