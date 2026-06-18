import { useEffect, useState } from "react";
import { MessageSquarePlus, Trash2, Users } from "lucide-react";
import Modal from "./Modal";
import { Field, TextInput, TextArea, Spinner } from "./ui";
import ScoreSlider from "./ScoreSlider";
import TasteRadar from "./TasteRadar";
import { TASTE_AXES } from "../lib/constants";
import { average } from "../lib/format";
import {
  fetchBrewComments,
  createBrewComment,
  deleteBrewComment,
} from "../lib/queries";
import { useToast } from "./Toast";
import type { BrewComment } from "../lib/types";

type Scores = Record<(typeof TASTE_AXES)[number]["key"], number>;
const defaultScores: Scores = {
  acidity: 3,
  body: 3,
  sweetness: 3,
  bitterness: 3,
  clarity: 3,
  overall: 3,
};

/**
 * Multi-taster comment thread for one brew. Each person leaves a name, an
 * opinion, and their own 1-5 scores; the group's average is plotted on a radar.
 * Mounted lazily (inside an expanded section) so it only queries when opened.
 */
export default function BrewComments({ brewLogId }: { brewLogId: string }) {
  const { notify } = useToast();
  const [comments, setComments] = useState<BrewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    try {
      setComments(await fetchBrewComments(brewLogId));
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not load comments", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brewLogId]);

  async function remove(id: string) {
    try {
      await deleteBrewComment(id);
      setComments((c) => c.filter((x) => x.id !== id));
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete", "error");
    }
  }

  // Group average across everyone who scored.
  const scored = comments.filter((c) => c.overall != null);
  const groupAvg: Record<string, number | null> = {};
  for (const axis of TASTE_AXES) {
    groupAvg[axis.key] = average(scored.map((c) => c[axis.key] as number | null));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-cream-mute">
        <Spinner className="h-4 w-4 text-gold" /> Loading comments…
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      {scored.length > 1 && (
        <div className="rounded-xl border border-gold/10 bg-espresso-900/40 p-2">
          <p className="mb-1 flex items-center gap-1.5 px-1 text-[0.7rem] font-semibold uppercase tracking-wider text-gold/80">
            <Users className="h-3.5 w-3.5" /> Group average · {scored.length} tasters
          </p>
          <TasteRadar
            height={220}
            series={[{ name: "Group", color: "#E0B968", values: groupAvg }]}
          />
        </div>
      )}

      {comments.map((c) => (
        <CommentRow key={c.id} comment={c} onDelete={() => remove(c.id)} />
      ))}

      {comments.length === 0 && (
        <p className="text-xs text-cream-mute">
          No opinions yet — be the first to weigh in.
        </p>
      )}

      <button onClick={() => setFormOpen(true)} className="btn-ghost w-full py-2 text-sm">
        <MessageSquarePlus className="h-4 w-4" /> Add opinion
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

function CommentRow({
  comment,
  onDelete,
}: {
  comment: BrewComment;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-gold/10 bg-espresso-900/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
            {comment.author.slice(0, 1).toUpperCase()}
          </span>
          <span className="font-semibold text-cream">{comment.author}</span>
          {comment.overall != null && (
            <span className="chip">★ {comment.overall}/5</span>
          )}
        </div>
        <button
          onClick={onDelete}
          className="rounded-lg p-1 text-cream-mute transition hover:bg-red-500/15 hover:text-red-400"
          aria-label="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {comment.comment && (
        <p className="mt-2 text-sm text-cream-dim">{comment.comment}</p>
      )}

      {comment.overall != null && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] text-cream-mute">
          {TASTE_AXES.map((axis) => (
            <span key={axis.key}>
              {axis.label}{" "}
              <span className="font-semibold text-gold">
                {comment[axis.key] as number | null}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  open,
  brewLogId,
  onClose,
  onSaved,
}: {
  open: boolean;
  brewLogId: string;
  onClose: () => void;
  onSaved: (c: BrewComment) => void;
}) {
  const { notify } = useToast();
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [scores, setScores] = useState<Scores>({ ...defaultScores });
  const [saving, setSaving] = useState(false);

  // Reset each time it opens.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setAuthor("");
    setComment("");
    setScores({ ...defaultScores });
    setWasOpen(true);
  }
  if (!open && wasOpen) setWasOpen(false);

  async function save() {
    if (!author.trim()) return notify("Add your name first", "error");
    setSaving(true);
    try {
      const created = await createBrewComment({
        brew_log_id: brewLogId,
        author: author.trim(),
        comment: comment || null,
        ...scores,
      });
      notify("Opinion added");
      onSaved(created);
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add your opinion"
      subtitle="Score it your way"
      footer={
        <>
          <button className="btn-subtle" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-gold" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Post"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Your name">
          <TextInput
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Pae"
            autoFocus
          />
        </Field>
        <Field label="Your opinion">
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Too bright for me, but lovely florals…"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="eyebrow">Your scores · 1–5</p>
            {TASTE_AXES.map((axis) => (
              <ScoreSlider
                key={axis.key}
                label={axis.label}
                value={scores[axis.key]}
                onChange={(v) => setScores((s) => ({ ...s, [axis.key]: v }))}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-gold/10 bg-espresso-900/40 p-2">
            <TasteRadar
              height={230}
              series={[{ name: "You", color: "#C8963A", values: scores }]}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
