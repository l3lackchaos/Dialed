import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBrewLog, fetchRecipes, createBrewLog, updateBrewLog } from "../lib/queries";
import { todayISO } from "../lib/format";
import { TASTE_AXES, type TasteAxis } from "../lib/constants";
import { FormScreen, Field, TextInput, TextArea, Select, PageLoader } from "../components/ui";
import ScoreSlider from "../components/ScoreSlider";
import TasteRadar from "../components/TasteRadar";
import { useToast } from "../components/Toast";
import type { BrewLogInsert } from "../lib/types";

type Scores = Record<TasteAxis, number>;
const defaultScores: Scores = {
  acidity: 3, body: 3, sweetness: 3, bitterness: 3, clarity: 3, overall: 3,
};

export default function LogEdit() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const presetRecipe = params.get("recipe") ?? "";

  const recipesQ = useQuery(fetchRecipes);
  const logQ = useQuery(() => (id ? fetchBrewLog(id) : Promise.resolve(null)));
  const recipes = recipesQ.data ?? [];

  const [recipeId, setRecipeId] = useState(presetRecipe);
  const [brewDate, setBrewDate] = useState(todayISO());
  const [actualTime, setActualTime] = useState("");
  const [scores, setScores] = useState<Scores>({ ...defaultScores });
  const [flavor, setFlavor] = useState("");
  const [aroma, setAroma] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const l = logQ.data;
    if (l) {
      setRecipeId(l.recipe_id);
      setBrewDate(l.brew_date);
      setActualTime(l.actual_time ?? "");
      setScores({
        acidity: l.acidity ?? 3, body: l.body ?? 3, sweetness: l.sweetness ?? 3,
        bitterness: l.bitterness ?? 3, clarity: l.clarity ?? 3, overall: l.overall ?? 3,
      });
      setFlavor(l.flavor_notes ?? "");
      setAroma(l.aroma_notes ?? "");
      setNext(l.next_adjustment ?? "");
    }
  }, [logQ.data]);

  const selected = recipes.find((r) => r.id === recipeId);

  function close() {
    navigate("/logs");
  }

  async function save() {
    if (!recipeId) return notify(t("logs.errRecipe"), "error");
    setSaving(true);
    try {
      const payload: BrewLogInsert = {
        recipe_id: recipeId,
        brew_date: brewDate || todayISO(),
        actual_time: actualTime || null,
        ...scores,
        flavor_notes: flavor || null,
        aroma_notes: aroma || null,
        next_adjustment: next || null,
      };
      if (id) {
        await updateBrewLog(id, payload);
        notify(t("logs.updated"));
      } else {
        await createBrewLog(payload);
        notify(t("logs.saved"));
      }
      close();
    } catch (err) {
      notify(err instanceof Error ? err.message : t("logs.errRecipe"), "error");
    } finally {
      setSaving(false);
    }
  }

  if ((id && logQ.loading) || recipesQ.loading) {
    return <PageLoader label={t("session.opening")} />;
  }

  return (
    <FormScreen
      title={id ? t("logs.edit") : t("logs.new")}
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
      <div className="space-y-5">
        <Field label={t("logs.fieldRecipe")}>
          <Select
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            options={recipes.map((r) => ({ value: r.id, label: `${r.name} — ${r.bean?.name ?? "?"}` }))}
            placeholder={t("logs.selectRecipe")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("logs.fieldDate")}>
            <TextInput type="date" value={brewDate} onChange={(e) => setBrewDate(e.target.value)} />
          </Field>
          <Field
            label={t("logs.fieldActual")}
            optionalText={t("common.optional")}
            hint={selected?.target_time ? t("logs.target", { time: selected.target_time }) : undefined}
          >
            <TextInput
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              placeholder={t("logs.phActual")}
              inputMode="numeric"
            />
          </Field>
        </div>

        {/* Live radar + sliders */}
        <div className="rounded-2xl bg-espresso-800 p-3">
          <TasteRadar height={220} series={[{ name: "", color: "#C8963A", values: scores }]} />
        </div>
        <div className="space-y-4">
          <p className="text-sm font-semibold text-cream-dim">{t("logs.scores")}</p>
          {TASTE_AXES.map((axis) => (
            <ScoreSlider
              key={axis.key}
              label={t(`taste.${axis.key}` as const)}
              value={scores[axis.key]}
              onChange={(v) => setScores((s) => ({ ...s, [axis.key]: v }))}
            />
          ))}
        </div>

        <Field label={t("logs.fieldFlavor")} optionalText={t("common.optional")}>
          <TextArea value={flavor} onChange={(e) => setFlavor(e.target.value)} placeholder={t("logs.phFlavor")} />
        </Field>
        <Field label={t("logs.fieldAroma")} optionalText={t("common.optional")}>
          <TextArea value={aroma} onChange={(e) => setAroma(e.target.value)} placeholder={t("logs.phAroma")} />
        </Field>
        <Field label={t("logs.fieldNext")} optionalText={t("common.optional")}>
          <TextArea value={next} onChange={(e) => setNext(e.target.value)} placeholder={t("logs.phNext")} />
        </Field>
      </div>
    </FormScreen>
  );
}
