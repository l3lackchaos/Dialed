import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Timer, Coffee, Share2 } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBrewLog } from "../lib/queries";
import { formatDate } from "../lib/format";
import { TASTE_AXES } from "../lib/constants";
import { PageLoader, EmptyState } from "../components/ui";
import TasteRadar from "../components/TasteRadar";
import BrewComments from "../components/BrewComments";
import ShareSession from "../components/ShareSession";
import LangToggle from "../components/LangToggle";
import type { BrewLogWithRecipe } from "../lib/types";

export default function Session() {
  const t = useT();
  const { logId } = useParams<{ logId: string }>();
  const { data: log, loading, error } = useQuery(() => fetchBrewLog(logId!));
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col">
      <header className="safe-top sticky top-0 z-sticky border-b border-cream/10 bg-espresso/90 backdrop-blur-md">
        <div className="flex items-center gap-2 px-3 py-3">
          <Link to="/" className="flex h-10 items-center gap-1 rounded-lg pl-1 pr-2 text-cream-dim transition-colors hover:text-cream">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t("session.allBrews")}</span>
          </Link>
          <div className="ml-auto"><LangToggle /></div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-12 pt-5">
        {loading ? (
          <PageLoader label={t("session.opening")} />
        ) : error || !log ? (
          <EmptyState
            icon={<Coffee className="h-7 w-7" />}
            title={t("session.notFoundTitle")}
            description={t("session.notFoundDesc")}
            action={<Link to="/" className="btn-primary px-4">{t("session.goHome")}</Link>}
          />
        ) : (
          <SessionBody log={log} onShare={() => setShareOpen(true)} />
        )}
      </main>

      {log && (
        <ShareSession
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          logId={log.id}
          title={log.recipe?.name ?? t("session.title")}
        />
      )}
    </div>
  );
}

function SessionBody({ log, onShare }: { log: BrewLogWithRecipe; onShare: () => void }) {
  const t = useT();
  const brewerScores: Record<string, number | null> = {};
  for (const axis of TASTE_AXES) brewerScores[axis.key] = log[axis.key] as number | null;
  const hasScores = log.overall != null;

  return (
    <div className="animate-fade-up space-y-5">
      <div className="surface p-5">
        <p className="text-2xs font-semibold uppercase tracking-wide text-gold/80">{t("session.title")}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-cream">{log.recipe?.name ?? "—"}</h1>
        <p className="mt-0.5 text-gold/85">{log.recipe?.bean?.name ?? "—"}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-2xs text-cream-mute">
          <span>{formatDate(log.brew_date)}</span>
          {log.actual_time && <span className="flex items-center gap-1 tnum"><Timer className="h-3.5 w-3.5 text-gold/70" /> {log.actual_time}</span>}
          {log.recipe?.ratio && <span className="tag">{log.recipe.ratio}</span>}
          {log.recipe?.dripper && <span className="tag">{log.recipe.dripper}</span>}
        </div>

        {hasScores && (
          <div className="mt-3 rounded-2xl bg-espresso-700 p-2">
            <p className="px-1 pt-1 text-2xs font-semibold uppercase tracking-wide text-gold/80">{t("session.brewerScore")}</p>
            <TasteRadar height={230} series={[{ name: "", color: "#C8963A", values: brewerScores }]} />
          </div>
        )}

        {log.flavor_notes && (
          <p className="mt-3 text-sm leading-relaxed text-cream-dim">
            <span className="text-cream-mute">{t("logs.flavorLabel")} · </span>{log.flavor_notes}
          </p>
        )}

        <button onClick={onShare} className="btn-ghost mt-4 w-full">
          <Share2 className="h-4 w-4" /> {t("session.shareCta")}
        </button>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-cream">{t("comments.title")}</h2>
        <div className="surface p-4"><BrewComments brewLogId={log.id} /></div>
      </section>
    </div>
  );
}
