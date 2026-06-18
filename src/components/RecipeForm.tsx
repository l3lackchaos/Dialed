import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import Modal from "./Modal";
import { Field, TextInput, TextArea, Select } from "./ui";
import { DRIPPERS, GRINDERS } from "../lib/constants";
import { createRecipe, updateRecipe } from "../lib/queries";
import { computeRatio, parsePourSchedule } from "../lib/format";
import { useToast } from "./Toast";
import type { Bean, PourStep, Recipe, RecipeInsert } from "../lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  beans: Bean[];
  recipe?: Recipe | null;
  defaultBeanId?: string;
};

type FormState = {
  bean_id: string;
  name: string;
  dripper: string;
  grinder: string;
  click_setting: string;
  water_temp: string;
  dose_g: string;
  water_g: string;
  target_time: string;
  notes: string;
  is_favorite: boolean;
  pour_schedule: PourStep[];
};

const blankStep: PourStep = { pour: "", cumulative_g: "", time: "", note: "" };

const emptyForm = (beanId = ""): FormState => ({
  bean_id: beanId,
  name: "",
  dripper: "",
  grinder: "",
  click_setting: "",
  water_temp: "",
  dose_g: "",
  water_g: "",
  target_time: "",
  notes: "",
  is_favorite: false,
  pour_schedule: [{ pour: "Bloom", cumulative_g: "", time: "0:00", note: "" }],
});

export default function RecipeForm({
  open,
  onClose,
  onSaved,
  beans,
  recipe,
  defaultBeanId,
}: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const [seededFor, setSeededFor] = useState<string | null>(null);
  const key = recipe?.id ?? `new-${defaultBeanId ?? ""}`;
  if (open && seededFor !== key) {
    setForm(
      recipe
        ? {
            bean_id: recipe.bean_id,
            name: recipe.name,
            dripper: recipe.dripper ?? "",
            grinder: recipe.grinder ?? "",
            click_setting: recipe.click_setting ?? "",
            water_temp: recipe.water_temp?.toString() ?? "",
            dose_g: recipe.dose_g?.toString() ?? "",
            water_g: recipe.water_g?.toString() ?? "",
            target_time: recipe.target_time ?? "",
            notes: recipe.notes ?? "",
            is_favorite: recipe.is_favorite,
            pour_schedule: parsePourSchedule(recipe.pour_schedule),
          }
        : emptyForm(defaultBeanId),
    );
    setSeededFor(key);
  }
  if (!open && seededFor !== null) setSeededFor(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const ratio = computeRatio(Number(form.dose_g), Number(form.water_g));

  function updateStep(i: number, patch: Partial<PourStep>) {
    setForm((f) => ({
      ...f,
      pour_schedule: f.pour_schedule.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s,
      ),
    }));
  }
  function addStep() {
    setForm((f) => ({ ...f, pour_schedule: [...f.pour_schedule, { ...blankStep }] }));
  }
  function removeStep(i: number) {
    setForm((f) => ({
      ...f,
      pour_schedule: f.pour_schedule.filter((_, idx) => idx !== i),
    }));
  }

  async function handleSave() {
    if (!form.bean_id) return notify("Pick a bean for this recipe", "error");
    if (!form.name.trim()) return notify("Recipe name is required", "error");

    setSaving(true);
    try {
      const cleanSteps = form.pour_schedule.filter(
        (s) => s.pour || s.cumulative_g || s.time || s.note,
      );
      const payload: RecipeInsert = {
        bean_id: form.bean_id,
        name: form.name.trim(),
        dripper: form.dripper || null,
        grinder: form.grinder || null,
        click_setting: form.click_setting || null,
        water_temp: form.water_temp ? Number(form.water_temp) : null,
        dose_g: form.dose_g ? Number(form.dose_g) : null,
        water_g: form.water_g ? Number(form.water_g) : null,
        ratio,
        target_time: form.target_time || null,
        notes: form.notes || null,
        is_favorite: form.is_favorite,
        pour_schedule: cleanSteps,
      };
      if (recipe) {
        await updateRecipe(recipe.id, payload);
        notify("Recipe updated");
      } else {
        await createRecipe(payload);
        notify("Recipe saved");
      }
      onSaved();
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save recipe", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={recipe ? "Edit recipe" : "New recipe"}
      subtitle="Dial in the brew"
      footer={
        <>
          <button className="btn-subtle" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : recipe ? "Save changes" : "Save recipe"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Bean">
            <Select
              value={form.bean_id}
              onChange={(e) => set("bean_id", e.target.value)}
              options={beans.map((b) => ({ value: b.id, label: b.name }))}
              placeholder="Link a bean"
            />
          </Field>
          <Field label="Recipe name">
            <TextInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Tetsu 4:6 — bright"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Dripper">
            <Select
              value={form.dripper}
              onChange={(e) => set("dripper", e.target.value)}
              options={DRIPPERS}
              placeholder="Select dripper"
            />
          </Field>
          <Field label="Grinder">
            <Select
              value={form.grinder}
              onChange={(e) => set("grinder", e.target.value)}
              options={GRINDERS}
              placeholder="Select grinder"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Click / grind setting">
            <TextInput
              value={form.click_setting}
              onChange={(e) => set("click_setting", e.target.value)}
              placeholder="e.g. 2.5 clicks"
            />
          </Field>
          <Field label="Water temp (°C)">
            <TextInput
              type="number"
              inputMode="decimal"
              value={form.water_temp}
              onChange={(e) => set("water_temp", e.target.value)}
              placeholder="92"
            />
          </Field>
        </div>

        {/* Dose / water / ratio block */}
        <div className="rounded-2xl border border-gold/10 bg-espresso-900/40 p-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Dose (g)">
              <TextInput
                type="number"
                inputMode="decimal"
                value={form.dose_g}
                onChange={(e) => set("dose_g", e.target.value)}
                placeholder="15"
              />
            </Field>
            <Field label="Water (g)">
              <TextInput
                type="number"
                inputMode="decimal"
                value={form.water_g}
                onChange={(e) => set("water_g", e.target.value)}
                placeholder="250"
              />
            </Field>
            <div>
              <span className="field-label">Ratio</span>
              <div className="flex h-[46px] items-center justify-center rounded-xl border border-gold/20 bg-gold/5 text-lg font-semibold text-gold">
                {ratio ?? "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Pour schedule table */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="field-label mb-0">Pour schedule</span>
            <button
              type="button"
              onClick={addStep}
              className="btn-ghost px-2.5 py-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Pour
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gold/10">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1.4fr_auto] gap-px bg-gold/10 text-[0.65rem] font-semibold uppercase tracking-wider text-gold/80">
              <div className="bg-espresso-900/60 px-2 py-1.5">Pour</div>
              <div className="bg-espresso-900/60 px-2 py-1.5">Cum. g</div>
              <div className="bg-espresso-900/60 px-2 py-1.5">Time</div>
              <div className="bg-espresso-900/60 px-2 py-1.5">Note</div>
              <div className="bg-espresso-900/60 px-2 py-1.5" />
            </div>

            {form.pour_schedule.map((step, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.4fr_1fr_1fr_1.4fr_auto] gap-px bg-gold/5"
              >
                <input
                  className="input-sm rounded-none border-0 bg-espresso-900/40"
                  value={step.pour}
                  onChange={(e) => updateStep(i, { pour: e.target.value })}
                  placeholder={i === 0 ? "Bloom" : `Pour ${i + 1}`}
                />
                <input
                  className="input-sm rounded-none border-0 bg-espresso-900/40"
                  value={step.cumulative_g}
                  onChange={(e) => updateStep(i, { cumulative_g: e.target.value })}
                  placeholder="50"
                  inputMode="decimal"
                />
                <input
                  className="input-sm rounded-none border-0 bg-espresso-900/40"
                  value={step.time}
                  onChange={(e) => updateStep(i, { time: e.target.value })}
                  placeholder="0:45"
                />
                <input
                  className="input-sm rounded-none border-0 bg-espresso-900/40"
                  value={step.note}
                  onChange={(e) => updateStep(i, { note: e.target.value })}
                  placeholder="spiral"
                />
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="flex items-center justify-center bg-espresso-900/40 px-2 text-cream-mute transition hover:text-red-400"
                  aria-label="Remove pour"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {form.pour_schedule.length === 0 && (
              <div className="flex items-center gap-2 bg-espresso-900/40 px-3 py-3 text-xs text-cream-mute">
                <GripVertical className="h-3.5 w-3.5" /> No pours yet — add one above.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Target total time">
            <TextInput
              value={form.target_time}
              onChange={(e) => set("target_time", e.target.value)}
              placeholder="2:30"
            />
          </Field>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-cream">
              <input
                type="checkbox"
                checked={form.is_favorite}
                onChange={(e) => set("is_favorite", e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              Pin to Quick Log
            </label>
          </div>
        </div>

        <Field label="Notes">
          <TextArea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Agitation, kettle, water recipe, intentions…"
          />
        </Field>
      </div>
    </Modal>
  );
}
