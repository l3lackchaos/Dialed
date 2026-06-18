import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Plus, Trash2, Star } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchRecipe, fetchBeans, createRecipe, updateRecipe } from "../lib/queries";
import { computeRatio, parsePourSchedule } from "../lib/format";
import { DRIPPERS, GRINDERS } from "../lib/constants";
import { FormScreen, Field, TextInput, TextArea, Select, PageLoader } from "../components/ui";
import { useToast } from "../components/Toast";
import type { PourStep, RecipeInsert } from "../lib/types";

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

export default function RecipeEdit() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const presetBean = params.get("bean") ?? "";

  const beansQ = useQuery(fetchBeans);
  const recipeQ = useQuery(() => (id ? fetchRecipe(id) : Promise.resolve(null)));
  const beans = beansQ.data ?? [];

  const [form, setForm] = useState<FormState>({
    bean_id: presetBean,
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
    pour_schedule: [{ pour: t("pour.bloom"), cumulative_g: "", time: "0:00", note: "" }],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = recipeQ.data;
    if (r) {
      setForm({
        bean_id: r.bean_id,
        name: r.name,
        dripper: r.dripper ?? "",
        grinder: r.grinder ?? "",
        click_setting: r.click_setting ?? "",
        water_temp: r.water_temp?.toString() ?? "",
        dose_g: r.dose_g?.toString() ?? "",
        water_g: r.water_g?.toString() ?? "",
        target_time: r.target_time ?? "",
        notes: r.notes ?? "",
        is_favorite: r.is_favorite,
        pour_schedule: parsePourSchedule(r.pour_schedule),
      });
    }
  }, [recipeQ.data]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const ratio = computeRatio(Number(form.dose_g), Number(form.water_g));

  function updateStep(i: number, patch: Partial<PourStep>) {
    setForm((f) => ({
      ...f,
      pour_schedule: f.pour_schedule.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  }
  function addStep() {
    setForm((f) => ({
      ...f,
      pour_schedule: [...f.pour_schedule, { pour: "", cumulative_g: "", time: "", note: "" }],
    }));
  }
  function removeStep(i: number) {
    setForm((f) => ({ ...f, pour_schedule: f.pour_schedule.filter((_, idx) => idx !== i) }));
  }

  function close() {
    navigate("/recipes");
  }

  async function save() {
    if (!form.bean_id) return notify(t("recipes.errBean"), "error");
    if (!form.name.trim()) return notify(t("recipes.errName"), "error");
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
      if (id) {
        await updateRecipe(id, payload);
        notify(t("recipes.updated"));
      } else {
        await createRecipe(payload);
        notify(t("recipes.saved"));
      }
      close();
    } catch (err) {
      notify(err instanceof Error ? err.message : t("recipes.errName"), "error");
    } finally {
      setSaving(false);
    }
  }

  if ((id && recipeQ.loading) || beansQ.loading) {
    return <PageLoader label={t("session.opening")} />;
  }

  return (
    <FormScreen
      title={id ? t("recipes.edit") : t("recipes.new")}
      onClose={close}
      closeLabel={t("common.back")}
      footer={
        <>
          <button className="btn-quiet flex-1" onClick={close} disabled={saving}>
            {t("common.cancel")}
          </button>
          <button className="btn-primary flex-[2]" onClick={save} disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("recipes.fieldBean")}>
          <Select
            value={form.bean_id}
            onChange={(e) => set("bean_id", e.target.value)}
            options={beans.map((b) => ({ value: b.id, label: b.name }))}
            placeholder={t("recipes.selectBean")}
          />
        </Field>
        <Field label={t("recipes.fieldName")}>
          <TextInput
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("recipes.phName")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("recipes.fieldDripper")}>
            <Select
              value={form.dripper}
              onChange={(e) => set("dripper", e.target.value)}
              options={DRIPPERS}
              placeholder={t("recipes.selectDripper")}
            />
          </Field>
          <Field label={t("recipes.fieldGrinder")}>
            <Select
              value={form.grinder}
              onChange={(e) => set("grinder", e.target.value)}
              options={GRINDERS}
              placeholder={t("recipes.selectGrinder")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("recipes.fieldClick")} optionalText={t("common.optional")}>
            <TextInput
              value={form.click_setting}
              onChange={(e) => set("click_setting", e.target.value)}
              placeholder={t("recipes.phClick")}
            />
          </Field>
          <Field label={t("recipes.fieldTemp")} optionalText={t("common.optional")}>
            <TextInput
              type="number"
              inputMode="decimal"
              value={form.water_temp}
              onChange={(e) => set("water_temp", e.target.value)}
              placeholder={t("recipes.phTemp")}
            />
          </Field>
        </div>

        {/* Dose / water / ratio */}
        <div className="grid grid-cols-3 items-end gap-3 rounded-2xl bg-espresso-800 p-3">
          <Field label={t("recipes.fieldDose")}>
            <TextInput
              type="number"
              inputMode="decimal"
              value={form.dose_g}
              onChange={(e) => set("dose_g", e.target.value)}
              placeholder={t("recipes.phDose")}
            />
          </Field>
          <Field label={t("recipes.fieldWater")}>
            <TextInput
              type="number"
              inputMode="decimal"
              value={form.water_g}
              onChange={(e) => set("water_g", e.target.value)}
              placeholder={t("recipes.phWater")}
            />
          </Field>
          <div>
            <span className="label">{t("recipes.fieldRatio")}</span>
            <div className="flex h-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/8 text-lg font-bold text-gold tnum">
              {ratio ?? "—"}
            </div>
          </div>
        </div>

        {/* Pour schedule */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label mb-0">{t("recipes.fieldSchedule")}</span>
            <button type="button" onClick={addStep} className="btn-ghost h-9 px-2.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> {t("pour.add")}
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-cream/10">
            <div className="grid grid-cols-[1.3fr_0.9fr_0.9fr_1.3fr_auto] gap-px bg-cream/10 text-2xs font-semibold uppercase tracking-wide text-cream-dim">
              {[t("pour.pour"), t("pour.cumulative"), t("pour.time"), t("pour.note")].map((h) => (
                <div key={h} className="bg-espresso-700 px-2 py-1.5">{h}</div>
              ))}
              <div className="bg-espresso-700 px-2 py-1.5" />
            </div>
            {form.pour_schedule.map((step, i) => (
              <div key={i} className="grid grid-cols-[1.3fr_0.9fr_0.9fr_1.3fr_auto] gap-px bg-cream/5">
                <input
                  className="min-h-[44px] border-0 bg-espresso-800 px-2 text-sm text-cream outline-none focus:bg-espresso-700"
                  value={step.pour}
                  onChange={(e) => updateStep(i, { pour: e.target.value })}
                  placeholder={i === 0 ? t("pour.bloom") : t("pour.nth", { n: i + 1 })}
                />
                <input
                  className="min-h-[44px] border-0 bg-espresso-800 px-2 text-sm text-cream outline-none tnum focus:bg-espresso-700"
                  value={step.cumulative_g}
                  onChange={(e) => updateStep(i, { cumulative_g: e.target.value })}
                  placeholder={t("pour.phWater")}
                  inputMode="decimal"
                />
                <input
                  className="min-h-[44px] border-0 bg-espresso-800 px-2 text-sm text-cream outline-none tnum focus:bg-espresso-700"
                  value={step.time}
                  onChange={(e) => updateStep(i, { time: e.target.value })}
                  placeholder="0:45"
                />
                <input
                  className="min-h-[44px] border-0 bg-espresso-800 px-2 text-sm text-cream outline-none focus:bg-espresso-700"
                  value={step.note}
                  onChange={(e) => updateStep(i, { note: e.target.value })}
                  placeholder={t("pour.phSpiral")}
                />
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="flex items-center justify-center bg-espresso-800 px-2.5 text-cream-mute transition-colors hover:text-danger"
                  aria-label={t("common.remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {form.pour_schedule.length === 0 && (
              <p className="bg-espresso-800 px-3 py-3 text-xs text-cream-mute">{t("pour.empty")}</p>
            )}
          </div>
        </div>

        <Field label={t("recipes.fieldTarget")} optionalText={t("common.optional")}>
          <TextInput
            value={form.target_time}
            onChange={(e) => set("target_time", e.target.value)}
            placeholder={t("recipes.phTarget")}
          />
        </Field>

        <Field label={t("recipes.fieldNotes")} optionalText={t("common.optional")}>
          <TextArea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder={t("recipes.phNotes")}
          />
        </Field>

        <button
          type="button"
          onClick={() => set("is_favorite", !form.is_favorite)}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
            form.is_favorite
              ? "border-gold/40 bg-gold/10 text-cream"
              : "border-cream/12 bg-espresso-700 text-cream-dim"
          }`}
        >
          {t("recipes.favorite")}
          <Star className={`h-5 w-5 ${form.is_favorite ? "fill-gold text-gold" : "text-cream-mute"}`} />
        </button>
      </div>
    </FormScreen>
  );
}
