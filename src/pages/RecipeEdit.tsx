import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchRecipe, createRecipe, updateRecipe } from "../lib/queries";
import { computeRatio, parsePourSchedule } from "../lib/format";
import { DRIPPERS, GRINDERS } from "../lib/constants";
import { FormScreen, Field, TextInput, TextArea, Select, PageLoader } from "../components/ui";
import { useToast } from "../components/Toast";
import type { PourStep, RecipeInsert } from "../lib/types";

type FormState = {
  name: string;
  bean_label: string;
  dripper: string;
  grinder: string;
  click_setting: string;
  water_temp: string;
  dose_g: string;
  water_g: string;
  target_time: string;
  notes: string;
  pour_schedule: PourStep[];
};

export default function RecipeEdit() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const recipeQ = useQuery(() => (id ? fetchRecipe(id) : Promise.resolve(null)));

  const [form, setForm] = useState<FormState>({
    name: "", bean_label: "", dripper: "", grinder: "", click_setting: "",
    water_temp: "", dose_g: "", water_g: "", target_time: "", notes: "",
    pour_schedule: [{ pour: t("pour.bloom"), cumulative_g: "", time: "0:00", note: "" }],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = recipeQ.data;
    if (r) {
      setForm({
        name: r.name,
        bean_label: r.bean_label ?? "",
        dripper: r.dripper ?? "",
        grinder: r.grinder ?? "",
        click_setting: r.click_setting ?? "",
        water_temp: r.water_temp?.toString() ?? "",
        dose_g: r.dose_g?.toString() ?? "",
        water_g: r.water_g?.toString() ?? "",
        target_time: r.target_time ?? "",
        notes: r.notes ?? "",
        pour_schedule: parsePourSchedule(r.pour_schedule),
      });
    }
  }, [recipeQ.data]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const ratio = computeRatio(Number(form.dose_g), Number(form.water_g));

  function updateStep(i: number, patch: Partial<PourStep>) {
    setForm((f) => ({ ...f, pour_schedule: f.pour_schedule.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  }
  const addStep = () => setForm((f) => ({ ...f, pour_schedule: [...f.pour_schedule, { pour: "", cumulative_g: "", time: "", note: "" }] }));
  const removeStep = (i: number) => setForm((f) => ({ ...f, pour_schedule: f.pour_schedule.filter((_, idx) => idx !== i) }));

  const close = () => navigate(id ? `/r/${id}` : "/");

  async function save() {
    if (!form.name.trim()) return notify(t("recipes.errName"), "error");
    setSaving(true);
    try {
      const payload: RecipeInsert = {
        name: form.name.trim(),
        bean_label: form.bean_label || null,
        dripper: form.dripper || null,
        grinder: form.grinder || null,
        click_setting: form.click_setting || null,
        water_temp: form.water_temp ? Number(form.water_temp) : null,
        dose_g: form.dose_g ? Number(form.dose_g) : null,
        water_g: form.water_g ? Number(form.water_g) : null,
        ratio,
        target_time: form.target_time || null,
        notes: form.notes || null,
        pour_schedule: form.pour_schedule.filter((s) => s.pour || s.cumulative_g || s.time || s.note),
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

  if (id && recipeQ.loading) return <PageLoader label={t("session.opening")} />;

  return (
    <FormScreen
      title={id ? t("recipes.edit") : t("recipes.new")}
      onClose={close}
      closeLabel={t("common.back")}
      footer={
        <>
          <button className="btn-quiet flex-1" onClick={close} disabled={saving}>{t("common.cancel")}</button>
          <button className="btn-primary flex-[2]" onClick={save} disabled={saving}>{saving ? t("common.saving") : t("common.save")}</button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("recipes.fieldName")}>
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("recipes.phName")} autoFocus={!id} />
        </Field>
        <Field label={t("recipes.fieldBean")} optionalText={t("common.optional")}>
          <TextInput value={form.bean_label} onChange={(e) => set("bean_label", e.target.value)} placeholder={t("recipes.phBean")} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("recipes.fieldDripper")}>
            <Select value={form.dripper} onChange={(e) => set("dripper", e.target.value)} options={DRIPPERS} placeholder={t("recipes.selectDripper")} />
          </Field>
          <Field label={t("recipes.fieldGrinder")}>
            <Select value={form.grinder} onChange={(e) => set("grinder", e.target.value)} options={GRINDERS} placeholder={t("recipes.selectGrinder")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("recipes.fieldClick")} optionalText={t("common.optional")}>
            <TextInput value={form.click_setting} onChange={(e) => set("click_setting", e.target.value)} placeholder={t("recipes.phClick")} />
          </Field>
          <Field label={t("recipes.fieldTemp")} optionalText={t("common.optional")}>
            <TextInput type="number" inputMode="decimal" value={form.water_temp} onChange={(e) => set("water_temp", e.target.value)} placeholder={t("recipes.phTemp")} />
          </Field>
        </div>

        <div className="grid grid-cols-3 items-end gap-3 rounded-2xl bg-espresso-700 p-3">
          <Field label={t("recipes.fieldDose")}>
            <TextInput type="number" inputMode="decimal" value={form.dose_g} onChange={(e) => set("dose_g", e.target.value)} placeholder={t("recipes.phDose")} />
          </Field>
          <Field label={t("recipes.fieldWater")}>
            <TextInput type="number" inputMode="decimal" value={form.water_g} onChange={(e) => set("water_g", e.target.value)} placeholder={t("recipes.phWater")} />
          </Field>
          <div>
            <span className="label">{t("recipes.fieldRatio")}</span>
            <div className="flex h-[52px] items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-lg font-bold text-gold tnum">{ratio ?? "—"}</div>
          </div>
        </div>

        {/* Pour schedule (optional) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label mb-0">{t("recipes.fieldSchedule")} <span className="font-normal text-cream-mute">· {t("common.optional")}</span></span>
            <button type="button" onClick={addStep} className="btn-ghost h-9 px-3 text-xs"><Plus className="h-3.5 w-3.5" /> {t("pour.add")}</button>
          </div>
          <div className="space-y-2">
            {form.pour_schedule.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className="field h-11 min-h-0 flex-1" value={step.pour} onChange={(e) => updateStep(i, { pour: e.target.value })} placeholder={i === 0 ? t("pour.bloom") : t("pour.nth", { n: i + 1 })} />
                <input className="field h-11 min-h-0 w-16 text-center" value={step.cumulative_g} onChange={(e) => updateStep(i, { cumulative_g: e.target.value })} placeholder={t("pour.phWater")} inputMode="decimal" />
                <input className="field h-11 min-h-0 w-16 text-center" value={step.time} onChange={(e) => updateStep(i, { time: e.target.value })} placeholder="0:45" />
                <button type="button" onClick={() => removeStep(i)} className="flex h-11 w-9 items-center justify-center text-cream-mute hover:text-danger" aria-label={t("common.remove")}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("recipes.fieldTarget")} optionalText={t("common.optional")}>
            <TextInput value={form.target_time} onChange={(e) => set("target_time", e.target.value)} placeholder={t("recipes.phTarget")} />
          </Field>
        </div>

        <Field label={t("recipes.fieldNotes")} optionalText={t("common.optional")}>
          <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder={t("recipes.phNotes")} />
        </Field>
      </div>
    </FormScreen>
  );
}
