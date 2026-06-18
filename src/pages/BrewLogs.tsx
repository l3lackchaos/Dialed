import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Timer,
  ArrowRight,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import BrewComments from "../components/BrewComments";
import { useQuery } from "../hooks/useQuery";
import { fetchBrewLogs, fetchRecipes, deleteBrewLog } from "../lib/queries";
import { formatDate } from "../lib/format";
import { TASTE_AXES } from "../lib/constants";
import { SectionHeading, LoadingState, EmptyState } from "../components/ui";
import BrewLogForm from "../components/BrewLogForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { BrewLog, BrewLogWithRecipe } from "../lib/types";

export default function BrewLogs() {
  const { notify } = useToast();
  const logsQ = useQuery(fetchBrewLogs);
  const recipesQ = useQuery(fetchRecipes);
  const logs = logsQ.data ?? [];
  const recipes = recipesQ.data ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BrewLog | null>(null);
  const [deleting, setDeleting] = useState<BrewLogWithRecipe | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteBrewLog(deleting.id);
      notify("Brew log deleted");
      setDeleting(null);
      logsQ.refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete", "error");
    } finally {
      setBusy(false);
    }
  }

  const loading = logsQ.loading || recipesQ.loading;

  return (
    <div className="animate-fade-up">
      <SectionHeading
        eyebrow="Feature 03"
        title="Brew Log"
        action={
          <button
            className="btn-gold"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            disabled={recipes.length === 0}
            title={recipes.length === 0 ? "Create a recipe first" : undefined}
          >
            <Plus className="h-4 w-4" /> Log
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading brews…" />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="No recipes to log against"
          description="Create a recipe first, then log how each brew turned out and what to change next time."
        />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="No brews logged"
          description="Log your next cup — score the taste, jot the flavor and aroma, and note the next adjustment."
          action={
            <button
              className="btn-gold"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Log a brew
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <LogCard
              key={log.id}
              log={log}
              onEdit={() => {
                setEditing(log);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(log)}
            />
          ))}
        </div>
      )}

      <BrewLogForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={logsQ.refetch}
        recipes={recipes}
        log={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete brew log?"
        message="This brew log will be permanently deleted."
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
      <span className="w-16 shrink-0 text-[0.7rem] text-cream-mute">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-espresso-600">
        <div
          className="h-full rounded-full bg-gold-sheen"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-4 shrink-0 text-right text-[0.7rem] font-semibold text-gold">
        {value ?? "—"}
      </span>
    </div>
  );
}

function LogCard({
  log,
  onEdit,
  onDelete,
}: {
  log: BrewLogWithRecipe;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  return (
    <article className="card card-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-cream">
            {log.recipe?.name ?? "Unknown recipe"}
          </h3>
          <p className="mt-0.5 text-sm text-gold/80">
            {log.recipe?.bean?.name ?? "—"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {log.overall != null && (
            <span className="mr-1 flex items-center gap-1 rounded-lg bg-gold/15 px-2 py-1 text-sm font-bold text-gold">
              {log.overall}
              <span className="text-[0.65rem] font-normal text-gold/70">/5</span>
            </span>
          )}
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-cream-mute transition hover:bg-gold/10 hover:text-gold"
            aria-label="Edit log"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-cream-mute transition hover:bg-red-500/15 hover:text-red-400"
            aria-label="Delete log"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-cream-dim">
        <span>{formatDate(log.brew_date)}</span>
        {log.actual_time && (
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5 text-gold/70" /> {log.actual_time}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
        {TASTE_AXES.map((axis) => (
          <ScoreBar
            key={axis.key}
            label={axis.label}
            value={log[axis.key] as number | null}
          />
        ))}
      </div>

      {(log.flavor_notes || log.aroma_notes) && (
        <div className="mt-3 space-y-1.5 text-sm">
          {log.flavor_notes && (
            <p className="text-cream-dim">
              <span className="text-cream-mute">Flavor · </span>
              {log.flavor_notes}
            </p>
          )}
          {log.aroma_notes && (
            <p className="text-cream-dim">
              <span className="text-cream-mute">Aroma · </span>
              {log.aroma_notes}
            </p>
          )}
        </div>
      )}

      {log.next_adjustment && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-gold/15 bg-gold/5 px-3 py-2">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p className="text-sm text-cream">
            <span className="font-medium text-gold/90">Next: </span>
            {log.next_adjustment}
          </p>
        </div>
      )}

      {/* Multi-taster comments — lazy-mounted on first open */}
      <div className="mt-3 border-t border-gold/10 pt-3">
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex w-full items-center justify-between text-sm font-medium text-gold/80 transition hover:text-gold"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Tasting comments
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showComments ? "rotate-180" : ""}`}
          />
        </button>
        {showComments && <BrewComments brewLogId={log.id} />}
      </div>
    </article>
  );
}
