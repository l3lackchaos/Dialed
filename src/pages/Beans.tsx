import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, Plus, Trash2, ChevronRight } from "lucide-react";
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
          {beans.map((bean) => (
            <li key={bean.id}>
              <BeanRow
                bean={bean}
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
  onOpen,
  onDelete,
}: {
  bean: Bean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const tint = bean.roast_level ? ROAST_TINT[bean.roast_level] : "#C8963A";
  const rest = freshness(t, bean.roast_date);

  return (
    <div className="surface group flex items-stretch overflow-hidden transition-colors hover:border-gold/30">
      <button onClick={onOpen} className="flex-1 px-4 py-3.5 text-left">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: tint }} aria-hidden />
          <h3 className="truncate font-semibold text-cream">{bean.name}</h3>
        </div>
        {bean.roaster && <p className="mt-0.5 pl-5 text-sm text-cream-dim">{bean.roaster}</p>}

        {(bean.process || bean.roast_level) && (
          <div className="mt-2 flex flex-wrap gap-1.5 pl-5">
            {bean.process && <span className="tag">{bean.process}</span>}
            {bean.roast_level && (
              <span className="tag" style={{ color: tint, borderColor: `${tint}55` }}>
                {bean.roast_level}
              </span>
            )}
          </div>
        )}

        {bean.tasting_notes && (
          <p className="mt-2 pl-5 text-sm italic leading-relaxed text-cream-dim">
            {bean.tasting_notes}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2 pl-5 text-2xs text-cream-mute">
          <span>{t("beans.roasted", { date: formatDate(bean.roast_date) })}</span>
          {rest && <span className="text-gold/80">· {rest}</span>}
        </div>
      </button>

      <div className="flex flex-col items-center justify-between border-l border-cream/8 py-2">
        <button
          onClick={onDelete}
          className="flex h-9 w-11 items-center justify-center text-cream-mute transition-colors hover:text-danger"
          aria-label={t("common.delete")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={onOpen}
          className="flex h-9 w-11 items-center justify-center text-cream-mute transition-colors hover:text-gold"
          aria-label={t("common.edit")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
