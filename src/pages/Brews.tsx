import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList, Plus, Pencil, Trash2, Timer, ArrowRight, MessageSquare, ChevronDown, Share2,
} from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBrewLogs, fetchRecipes, deleteBrewLog } from "../lib/queries";
import { formatDate } from "../lib/format";
import { TASTE_AXES } from "../lib/constants";
import { TabHeader, EmptyState, Skeleton } from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import BrewComments from "../components/BrewComments";
import ShareSession from "../components/ShareSession";
import { useToast } from "../components/Toast";
import type { BrewLogWithRecipe } from "../lib/types";

export default function Brews() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const logsQ = useQuery(fetchBrewLogs);
  const recipesQ = useQuery(fetchRecipes);
  const logs = logsQ.data ?? [];
  const recipes = recipesQ.data ?? [];

  const [deleting, setDeleting] = useState<BrewLogWithRecipe | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteBrewLog(deleting.id);
      notify(t("logs.deleted"));
      setDeleting(null);
      logsQ.refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    } finally {
      setBusy(false);
    }
  }

  const loading = logsQ.loading || recipesQ.loading;

  return (
    <div className="animate-fade-up">
      <TabHeader
        title={t("logs.title")}
        action={
          recipes.length > 0 ? (
            <Link to="/logs/new" className="btn-primary h-10 px-3.5">
              <Plus className="h-4 w-4" /> {t("logs.new")}
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title={t("logs.needRecipeTitle")}
          description={t("logs.needRecipeDesc")}
        />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title={t("logs.emptyTitle")}
          description={t("logs.emptyDesc")}
          action={<Link to="/logs/new" className="btn-primary px-4"><Plus className="h-4 w-4" /> {t("logs.emptyCta")}</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id}>
              <LogCard log={log} onEdit={() => navigate(`/logs/${log.id}/edit`)} onDelete={() => setDeleting(log)} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        title={t("logs.deleteTitle")}
        message={t("logs.deleteMsg")}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-2xs text-cream-dim">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-espresso-600">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-4 shrink-0 text-right text-2xs font-semibold text-gold tnum">{value ?? "–"}</span>
    </div>
  );
}

function LogCard({
  log, onEdit, onDelete,
}: {
  log: BrewLogWithRecipe;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const [showComments, setShowComments] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-cream">{log.recipe?.name ?? t("common.none")}</h3>
          <p className="mt-0.5 text-sm text-gold/85">{log.recipe?.bean?.name ?? t("common.none")}</p>
          <div className="mt-1 flex items-center gap-3 text-2xs text-cream-mute">
            <span>{formatDate(log.brew_date)}</span>
            {log.actual_time && (
              <span className="flex items-center gap-1 tnum"><Timer className="h-3 w-3" /> {log.actual_time}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          {log.overall != null && (
            <span className="score mr-1">{log.overall}<span className="text-2xs font-normal text-gold/70">/5</span></span>
          )}
          <button onClick={() => setShareOpen(true)} className="flex h-9 w-9 items-center justify-center text-cream-mute transition-colors hover:text-gold" aria-label={t("common.share")}>
            <Share2 className="h-4 w-4" />
          </button>
          <button onClick={onEdit} className="flex h-9 w-9 items-center justify-center text-cream-mute transition-colors hover:text-gold" aria-label={t("common.edit")}>
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="flex h-9 w-9 items-center justify-center text-cream-mute transition-colors hover:text-danger" aria-label={t("common.delete")}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
        {TASTE_AXES.map((axis) => (
          <ScoreBar key={axis.key} label={t(`taste.${axis.key}` as const)} value={log[axis.key] as number | null} />
        ))}
      </div>

      {(log.flavor_notes || log.aroma_notes) && (
        <div className="mt-3 space-y-1 text-sm">
          {log.flavor_notes && <p className="text-cream-dim"><span className="text-cream-mute">{t("logs.flavorLabel")} · </span>{log.flavor_notes}</p>}
          {log.aroma_notes && <p className="text-cream-dim"><span className="text-cream-mute">{t("logs.aromaLabel")} · </span>{log.aroma_notes}</p>}
        </div>
      )}

      {log.next_adjustment && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-gold/20 bg-gold/8 px-3 py-2">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p className="text-sm text-cream"><span className="font-medium text-gold/90">{t("logs.nextLabel")}: </span>{log.next_adjustment}</p>
        </div>
      )}

      <div className="mt-3 border-t border-cream/10 pt-3">
        <button onClick={() => setShowComments((s) => !s)} className="flex w-full items-center justify-between text-sm font-medium text-gold/85 transition-colors hover:text-gold">
          <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> {t("comments.title")}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showComments ? "rotate-180" : ""}`} />
        </button>
        {showComments && <BrewComments brewLogId={log.id} />}
      </div>

      <ShareSession
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        logId={log.id}
        title={`${log.recipe?.name ?? ""} · ${log.recipe?.bean?.name ?? ""}`}
      />
    </div>
  );
}
