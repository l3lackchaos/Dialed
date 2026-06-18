import { useEffect, useState } from "react";
import { MessageSquarePlus, Trash2, Users } from "lucide-react";
import Modal from "./Modal";
import { Field, TextInput, TextArea, Spinner } from "./ui";
import ScoreSlider from "./ScoreSlider";
import TasteRadar from "./TasteRadar";
import { TASTE_AXES, type TasteAxis } from "../lib/constants";
import { average } from "../lib/format";
import { fetchBrewComments, createBrewComment, deleteBrewComment } from "../lib/queries";
import { useToast } from "./Toast";
import { useAuth } from "./Auth";
import { useT } from "../i18n";
import type { BrewComment } from "../lib/types";

type Scores = Record<TasteAxis, number>;
const defaultScores: Scores = {
  acidity: 3, body: 3, sweetness: 3, bitterness: 3, clarity: 3, overall: 3,
};

/** Multi-taster comment thread for one brew, with a group-average radar. */
export default function BrewComments({ brewLogId }: { brewLogId: string }) {
  const t = useT();
  const { notify } = useToast();
  const [comments, setComments] = useState<BrewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchBrewComments(brewLogId)
      .then((c) => active && setComments(c))
      .catch((err) => active && notify(err instanceof Error ? err.message : "", "error"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brewLogId]);

  async function remove(id: string) {
    try {
      await deleteBrewComment(id);
      setComments((c) => c.filter((x) => x.id !== id));
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    }
  }

  const scored = comments.filter((c) => c.overall != null);
  const groupAvg: Record<string, number | null> = {};
  for (const axis of TASTE_AXES) groupAvg[axis.key] = average(scored.map((c) => c[axis.key] as number | null));

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-cream-mute">
        <Spinner className="h-4 w-4 text-gold" />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {scored.length > 1 && (
        <div className="rounded-xl bg-espresso-700 p-2">
          <p className="mb-1 flex items-center gap-1.5 px-1 text-2xs font-semibold uppercase tracking-wide text-gold/85">
            <Users className="h-3.5 w-3.5" /> {t("comments.groupAvg", { n: scored.length })}
          </p>
          <TasteRadar height={210} series={[{ name: "", color: "#E6C173", values: groupAvg }]} />
        </div>
      )}

      {comments.map((c) => <CommentRow key={c.id} comment={c} onDelete={() => remove(c.id)} />)}

      {comments.length === 0 && <p className="text-xs text-cream-mute">{t("comments.empty")}</p>}

      <button onClick={() => setFormOpen(true)} className="btn-ghost w-full">
        <MessageSquarePlus className="h-4 w-4" /> {t("comments.add")}
      </button>

      <CommentForm
        open={formOpen}
        brewLogId={brewLogId}
        onClose={() => setFormOpen(false)}
        onSaved={(c) => setComments((prev) => [...prev, c])}
      />
    </div>
  );
}

function CommentRow({ comment, onDelete }: { comment: BrewComment; onDelete: () => void }) {
  const t = useT();
  return (
    <div className="rounded-xl bg-espresso-700 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
            {comment.author.slice(0, 1).toUpperCase()}
          </span>
          <span className="font-semibold text-cream">{comment.author}</span>
          {comment.overall != null && <span className="score">★ {comment.overall}/5</span>}
        </div>
        <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center text-cream-mute transition-colors hover:text-danger" aria-label={t("common.delete")}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {comment.comment && <p className="mt-2 text-sm leading-relaxed text-cream-dim">{comment.comment}</p>}
      {comment.overall != null && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-2xs text-cream-mute">
          {TASTE_AXES.map((axis) => (
            <span key={axis.key}>{t(`taste.${axis.key}` as const)} <span className="font-semibold text-gold tnum">{comment[axis.key] as number | null}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  open, brewLogId, onClose, onSaved,
}: {
  open: boolean;
  brewLogId: string;
  onClose: () => void;
  onSaved: (c: BrewComment) => void;
}) {
  const t = useT();
  const { notify } = useToast();
  const { profile } = useAuth();
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [scores, setScores] = useState<Scores>({ ...defaultScores });
  const [saving, setSaving] = useState(false);

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setAuthor(profile?.name ?? "");
    setComment("");
    setScores({ ...defaultScores });
    setWasOpen(true);
  }
  if (!open && wasOpen) setWasOpen(false);

  async function save() {
    if (!author.trim()) return notify(t("comments.errName"), "error");
    setSaving(true);
    try {
      const created = await createBrewComment({
        brew_log_id: brewLogId,
        author: author.trim(),
        comment: comment || null,
        ...scores,
      });
      notify(t("comments.added"));
      onSaved(created);
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : "", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("comments.formTitle")}
      subtitle={t("comments.formSubtitle")}
      footer={
        <>
          <button className="btn-quiet flex-1" onClick={onClose} disabled={saving}>{t("common.cancel")}</button>
          <button className="btn-primary flex-[2]" onClick={save} disabled={saving}>{saving ? t("common.saving") : t("common.post")}</button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("comments.fieldName")}>
          <TextInput value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t("comments.phName")} autoFocus />
        </Field>
        <Field label={t("comments.fieldOpinion")} optionalText={t("common.optional")}>
          <TextArea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("comments.phOpinion")} />
        </Field>

        <div className="rounded-2xl bg-espresso-700 p-2">
          <TasteRadar height={200} series={[{ name: "", color: "#C8963A", values: scores }]} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-cream-dim">{t("comments.scores")}</p>
          {TASTE_AXES.map((axis) => (
            <ScoreSlider key={axis.key} label={t(`taste.${axis.key}` as const)} value={scores[axis.key]} onChange={(v) => setScores((s) => ({ ...s, [axis.key]: v }))} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
