import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList, Plus, Pencil, Trash2, Timer, MessageSquare, ChevronDown, Share2,
} from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBrewLogs, fetchRecipes, deleteBrewLog } from "../lib/queries";
import { formatDate } from "../lib/format";
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
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-32" />)}</div>
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
          {logs.map((log, i) => (
            <li key={log.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
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

  const grinder = log.grinder ?? log.recipe?.grinder;
  const click = log.click_setting ?? log.recipe?.click_setting;

  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kicker">{log.recipe?.bean?.name ?? t("common.none")}</p>
          <h3 className="mast mt-1 truncate text-lg">{log.recipe?.name ?? t("common.none")}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs uppercase tracking-wide text-cream-mute">
            <span>{formatDate(log.brew_date)}</span>
            {log.actual_time && <span className="flex items-center gap-1 tnum"><Timer className="h-3 w-3" /> {log.actual_time}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center">
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

      {(log.recipe?.dripper || grinder || click) && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-cream/15 pt-3">
          {log.recipe?.dripper && <span className="tag">{log.recipe.dripper}</span>}
          {grinder && <span className="tag">{grinder}</span>}
          {click && <span className="tag">{click}</span>}
          {log.recipe?.ratio && <span className="tag">{log.recipe.ratio}</span>}
        </div>
      )}

      <div className="mt-3 border-t border-cream/15 pt-3">
        <button onClick={() => setShowComments((s) => !s)} className="flex w-full items-center justify-between text-sm font-medium text-gold transition-colors hover:text-gold-dark">
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
