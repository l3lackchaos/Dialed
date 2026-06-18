import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, Plus, Trash2 } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBeans, deleteBean } from "../lib/queries";
import { daysSince, formatDate } from "../lib/format";
import { ROAST_TINT } from "../lib/constants";
import { TabHeader, EmptyState, Skeleton } from "../components/ui";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import type { Bean } from "../lib/types";

export default function Beans() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { data: beans, loading, refetch } = useQuery(fetchBeans);

  const [deleting, setDeleting] = useState<Bean | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteBean(deleting.id);
      notify(t("beans.removed"));
      setDeleting(null);
      refetch();
    } catch (err) {
      notify(err instanceof Error ? err.message : t("beans.removed"), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <TabHeader
        title={t("beans.title")}
        action={
          <Link to="/beans/new" className="btn-primary h-10 px-3.5">
            <Plus className="h-4 w-4" /> {t("beans.new")}
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : !beans || beans.length === 0 ? (
        <EmptyState
          icon={<Coffee className="h-7 w-7" />}
          title={t("beans.emptyTitle")}
          description={t("beans.emptyDesc")}
          action={
            <Link to="/beans/new" className="btn-primary px-4">
              <Plus className="h-4 w-4" /> {t("beans.emptyCta")}
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {beans.map((bean, i) => (
            <li key={bean.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <BeanRow
                bean={bean}
                index={i}
                onOpen={() => navigate(`/beans/${bean.id}/edit`)}
                onDelete={() => setDeleting(bean)}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        title={t("beans.deleteTitle")}
        message={t("beans.deleteMsg", { name: deleting?.name ?? "" })}
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function freshness(t: ReturnType<typeof useT>, roastDate: string | null): string | null {
  const d = daysSince(roastDate);
  if (d === null) return null;
  if (d < 0) return t("beans.restSoon");
  if (d === 0) return t("beans.restToday");
  if (d === 1) return t("beans.restDay");
  return t("beans.restDays", { n: d });
}

function BeanRow({
  bean,
  index,
  onOpen,
  onDelete,
}: {
  bean: Bean;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const tint = bean.roast_level ? ROAST_TINT[bean.roast_level] : "#47632F";
  const rest = freshness(t, bean.roast_date);

  return (
    <article className="surface relative p-5 transition-colors hover:border-gold/40">
      <button onClick={onDelete} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center text-cream-mute transition-colors hover:text-danger" aria-label={t("common.delete")}>
        <Trash2 className="h-4 w-4" />
      </button>

      <button onClick={onOpen} className="block w-full text-left">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-xs text-cream-mute tnum">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-2.5 w-2.5 shrink-0 translate-y-[-1px] rounded-full" style={{ background: tint }} aria-hidden />
          <h3 className="mast min-w-0 flex-1 truncate pr-8 text-xl">{bean.name}</h3>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-8 text-sm text-cream-dim">
          {bean.origin && <span>{bean.origin}</span>}
          {bean.origin && bean.roaster && <span className="text-cream-mute">·</span>}
          {bean.roaster && <span>{bean.roaster}</span>}
        </div>

        {(bean.process || bean.roast_level) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8">
            {bean.process && <span className="tag">{bean.process}</span>}
            {bean.roast_level && (
              <span className="tag" style={{ color: tint, borderColor: `${tint}66` }}>{bean.roast_level}</span>
            )}
          </div>
        )}

        {bean.tasting_notes && (
          <p className="mt-3 border-t border-cream/15 pt-3 font-display text-[0.95rem] italic leading-relaxed text-cream-dim">
            “{bean.tasting_notes}”
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-2xs uppercase tracking-wide text-cream-mute">
          <span>{t("beans.roasted", { date: formatDate(bean.roast_date) })}</span>
          {rest && <span className="text-gold">· {rest}</span>}
        </div>
      </button>
    </article>
  );
}
