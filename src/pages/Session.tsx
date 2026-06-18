import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Timer, Coffee, Share2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "../hooks/useQuery";
import { fetchBrewLog } from "../lib/queries";
import { formatDate } from "../lib/format";
import { TASTE_AXES } from "../lib/constants";
import { LoadingState, EmptyState } from "../components/ui";
import TasteRadar from "../components/TasteRadar";
import BrewComments from "../components/BrewComments";
import ShareSession from "../components/ShareSession";

export default function Session() {
  const { logId } = useParams<{ logId: string }>();
  const { data: log, loading, error } = useQuery(() => fetchBrewLog(logId!));
  const [shareOpen, setShareOpen] = useState(false);

  if (loading) return <LoadingState label="Opening session…" />;

  if (error || !log) {
    return (
      <div className="animate-fade-up">
        <EmptyState
          icon={<Coffee className="h-7 w-7" />}
          title="Session not found"
          description="This brew session may have been deleted, or the link is incorrect."
          action={
            <Link to="/" className="btn-gold">
              Go home
            </Link>
          }
        />
      </div>
    );
  }

  const brewerScores: Record<string, number | null> = {};
  for (const axis of TASTE_AXES) brewerScores[axis.key] = log[axis.key] as number | null;
  const hasScores = log.overall != null;

  return (
    <div className="animate-fade-up space-y-5">
      <Link
        to="/logs"
        className="inline-flex items-center gap-1 text-sm text-cream-dim transition hover:text-cream"
      >
        <ArrowLeft className="h-4 w-4" /> All brews
      </Link>

      <div className="card p-5">
        <p className="eyebrow">Brew session</p>
        <h2 className="mt-1 text-2xl font-semibold text-cream">
          {log.recipe?.name ?? "Brew"}
        </h2>
        <p className="mt-0.5 text-gold/80">{log.recipe?.bean?.name ?? "—"}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-cream-dim">
          <span>{formatDate(log.brew_date)}</span>
          {log.actual_time && (
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5 text-gold/70" /> {log.actual_time}
            </span>
          )}
          {log.recipe?.ratio && <span className="chip">{log.recipe.ratio}</span>}
          {log.recipe?.dripper && <span className="chip">{log.recipe.dripper}</span>}
        </div>

        {hasScores && (
          <div className="mt-3 rounded-2xl border border-gold/10 bg-espresso-900/40 p-2">
            <p className="px-1 pt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-gold/80">
              Brewer's score
            </p>
            <TasteRadar
              height={240}
              series={[{ name: "Brewer", color: "#C8963A", values: brewerScores }]}
            />
          </div>
        )}

        {log.flavor_notes && (
          <p className="mt-3 text-sm text-cream-dim">
            <span className="text-cream-mute">Flavor · </span>
            {log.flavor_notes}
          </p>
        )}

        <button onClick={() => setShareOpen(true)} className="btn-ghost mt-4 w-full">
          <Share2 className="h-4 w-4" /> Share this session
        </button>
      </div>

      <section>
        <h3 className="mb-2 text-lg font-semibold text-cream">Tasting comments</h3>
        <div className="card p-4">
          <BrewComments brewLogId={log.id} />
        </div>
      </section>

      <ShareSession
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        logId={log.id}
        title={log.recipe?.name ?? "Brew session"}
      />
    </div>
  );
}
