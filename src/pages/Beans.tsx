import { useState } from "react";
import { Coffee, Plus, Pencil, Trash2, MapPin, Factory } from "lucide-react";
import { useQuery } from "../hooks/useQuery";
import { fetchBeans, deleteBean } from "../lib/queries";
import { restLabel, formatDate } from "../lib/format";
import { ROAST_TINT } from "../lib/constants";
import { SectionHeading, LoadingState, EmptyState } from "../components/ui";
import BeanForm from "../components/BeanForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { Bean } from "../lib/types";

export default function Beans() {
  const { notify } = useToast();
  const { data: beans, loading, refetch } = useQuery(fetchBeans);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Bean | null>(null);
  const [deleting, setDeleting] = useState<Bean | null>(null);
  const [busy, setBusy] = useState(false);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(bean: Bean) {
    setEditing(bean);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteBean(deleting.id);
      notify("Bean removed");
      setDeleting(null);
      refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <SectionHeading
        eyebrow="Feature 01"
        title="The Shelf"
        action={
          <button className="btn-gold" onClick={openNew}>
            <Plus className="h-4 w-4" /> Bean
          </button>
        }
      />

      {loading ? (
        <LoadingState label="Loading your beans…" />
      ) : !beans || beans.length === 0 ? (
        <EmptyState
          icon={<Coffee className="h-7 w-7" />}
          title="No beans yet"
          description="Add the bags you're brewing — origin, process, roast level and the notes on the label."
          action={
            <button className="btn-gold" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add your first bean
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {beans.map((bean) => (
            <BeanCard
              key={bean.id}
              bean={bean}
              onEdit={() => openEdit(bean)}
              onDelete={() => setDeleting(bean)}
            />
          ))}
        </div>
      )}

      <BeanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
        bean={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Remove bean?"
        message={`"${deleting?.name}" and all of its recipes and brew logs will be permanently deleted.`}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function BeanCard({
  bean,
  onEdit,
  onDelete,
}: {
  bean: Bean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tint = bean.roast_level ? ROAST_TINT[bean.roast_level] : "#C8963A";
  const rest = restLabel(bean.roast_date);

  return (
    <article className="card card-hover relative overflow-hidden p-4">
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: tint }}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3 pl-1.5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-cream">{bean.name}</h3>
          {bean.roaster && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-cream-dim">
              <Factory className="h-3 w-3" /> {bean.roaster}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-cream-mute transition hover:bg-gold/10 hover:text-gold"
            aria-label="Edit bean"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-cream-mute transition hover:bg-red-500/15 hover:text-red-400"
            aria-label="Delete bean"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 pl-1.5">
        {bean.process && <span className="chip">{bean.process}</span>}
        {bean.roast_level && (
          <span className="chip" style={{ borderColor: `${tint}66`, color: tint }}>
            {bean.roast_level}
          </span>
        )}
      </div>

      {bean.origin && (
        <p className="mt-3 flex items-center gap-1.5 pl-1.5 text-sm text-cream-dim">
          <MapPin className="h-3.5 w-3.5 text-gold/70" /> {bean.origin}
        </p>
      )}

      {bean.tasting_notes && (
        <p className="mt-2 pl-1.5 text-sm italic text-cream-dim">
          “{bean.tasting_notes}”
        </p>
      )}

      <div className="mt-3 flex items-center justify-between pl-1.5 text-xs text-cream-mute">
        <span>Roasted {formatDate(bean.roast_date)}</span>
        {rest && <span className="text-gold/70">{rest}</span>}
      </div>
    </article>
  );
}
