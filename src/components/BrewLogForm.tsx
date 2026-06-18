import { useState } from "react";
import Modal from "./Modal";
import { Field, TextInput, TextArea, Select } from "./ui";
import ScoreSlider from "./ScoreSlider";
import TasteRadar from "./TasteRadar";
import { TASTE_AXES } from "../lib/constants";
import { createBrewLog, updateBrewLog } from "../lib/queries";
import { todayISO } from "../lib/format";
import { useToast } from "./Toast";
import type { BrewLog, BrewLogInsert, RecipeWithBean } from "../lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  recipes: RecipeWithBean[];
  log?: BrewLog | null;
  defaultRecipeId?: string;
};

type Scores = Record<(typeof TASTE_AXES)[number]["key"], number>;

type FormState = {
  recipe_id: string;
  brew_date: string;
  actual_time: string;
  scores: Scores;
  flavor_notes: string;
  aroma_notes: string;
  next_adjustment: string;
};

const defaultScores: Scores = {
  acidity: 3,
  body: 3,
  sweetness: 3,
  bitterness: 3,
  clarity: 3,
  overall: 3,
};

const emptyForm = (recipeId = ""): FormState => ({
  recipe_id: recipeId,
  brew_date: todayISO(),
  actual_time: "",
  scores: { ...defaultScores },
  flavor_notes: "",
  aroma_notes: "",
  next_adjustment: "",
});

export default function BrewLogForm({
  open,
  onClose,
  onSaved,
  recipes,
  log,
  defaultRecipeId,
}: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const [seededFor, setSeededFor] = useState<string | null>(null);
  const key = log?.id ?? `new-${defaultRecipeId ?? ""}`;
  if (open && seededFor !== key) {
    setForm(
      log
        ? {
            recipe_id: log.recipe_id,
            brew_date: log.brew_date,
            actual_time: log.actual_time ?? "",
            scores: {
              acidity: log.acidity ?? 3,
              body: log.body ?? 3,
              sweetness: log.sweetness ?? 3,
              bitterness: log.bitterness ?? 3,
              clarity: log.clarity ?? 3,
              overall: log.overall ?? 3,
            },
            flavor_notes: log.flavor_notes ?? "",
            aroma_notes: log.aroma_notes ?? "",
            next_adjustment: log.next_adjustment ?? "",
          }
        : emptyForm(defaultRecipeId),
    );
    setSeededFor(key);
  }
  if (!open && seededFor !== null) setSeededFor(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setScore = (k: keyof Scores, v: number) =>
    setForm((f) => ({ ...f, scores: { ...f.scores, [k]: v } }));

  async function handleSave() {
    if (!form.recipe_id) return notify("Pick the recipe you brewed", "error");
    setSaving(true);
    try {
      const payload: BrewLogInsert = {
        recipe_id: form.recipe_id,
        brew_date: form.brew_date || todayISO(),
        actual_time: form.actual_time || null,
        ...form.scores,
        flavor_notes: form.flavor_notes || null,
        aroma_notes: form.aroma_notes || null,
        next_adjustment: form.next_adjustment || null,
      };
      if (log) {
        await updateBrewLog(log.id, payload);
        notify("Brew log updated");
      } else {
        await createBrewLog(payload);
        notify("Brew logged ☕");
      }
      onSaved();
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save log", "error");
    } finally {
      setSaving(false);
    }
  }

  const selectedRecipe = recipes.find((r) => r.id === form.recipe_id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={log ? "Edit brew log" : "Log a brew"}
      subtitle={
        selectedRecipe
          ? `${selectedRecipe.name} · ${selectedRecipe.bean?.name ?? "—"}`
          : "How did it taste?"
      }
      footer={
        <>
          <button className="btn-subtle" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : log ? "Save changes" : "Save brew"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Recipe" className="sm:col-span-1">
            <Select
              value={form.recipe_id}
              onChange={(e) => set("recipe_id", e.target.value)}
              options={recipes.map((r) => ({
                value: r.id,
                label: `${r.name} — ${r.bean?.name ?? "?"}`,
              }))}
              placeholder="Which recipe"
            />
          </Field>
          <Field label="Brew date">
            <TextInput
              type="date"
              value={form.brew_date}
              onChange={(e) => set("brew_date", e.target.value)}
            />
          </Field>
          <Field label="Actual time" hint={selectedRecipe?.target_time ? `Target ${selectedRecipe.target_time}` : undefined}>
            <TextInput
              value={form.actual_time}
              onChange={(e) => set("actual_time", e.target.value)}
              placeholder="2:38"
            />
          </Field>
        </div>

        {/* Tasting sliders + live radar */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            <p className="eyebrow">Tasting score · 1–5</p>
            {TASTE_AXES.map((axis) => (
              <ScoreSlider
                key={axis.key}
                label={axis.label}
                value={form.scores[axis.key]}
                onChange={(v) => setScore(axis.key, v)}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-gold/10 bg-espresso-900/40 p-2">
            <TasteRadar
              height={250}
              series={[{ name: "This brew", color: "#C8963A", values: form.scores }]}
            />
          </div>
        </div>

        <Field label="Flavor notes">
          <TextArea
            value={form.flavor_notes}
            onChange={(e) => set("flavor_notes", e.target.value)}
            placeholder="Stone fruit up front, syrupy mid, lingering florals…"
          />
        </Field>

        <Field label="Aroma notes">
          <TextArea
            value={form.aroma_notes}
            onChange={(e) => set("aroma_notes", e.target.value)}
            placeholder="Jasmine, brown sugar, ripe apricot…"
          />
        </Field>

        <Field label="Next adjustment">
          <TextArea
            value={form.next_adjustment}
            onChange={(e) => set("next_adjustment", e.target.value)}
            placeholder="Grind 1 click finer, drop temp to 90°C, slower bloom pour…"
          />
        </Field>
      </div>
    </Modal>
  );
}
