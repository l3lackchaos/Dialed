import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBrewLog, fetchRecipes, createBrewLog, updateBrewLog } from "../lib/queries";
import { todayISO } from "../lib/format";
import { GRINDERS } from "../lib/constants";
import { FormScreen, Field, TextInput, Select, PageLoader } from "../components/ui";
import { useToast } from "../components/Toast";
import type { BrewLogInsert } from "../lib/types";

/**
 * Logging a brew records how it was executed (recipe, finish time, grind clicks,
 * grinder) — fast to fill mid-brew. Taste is captured afterwards, per person,
 * in the Tasting comments thread.
 */
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
  const [click, setClick] = useState("");
  const [grinder, setGrinder] = useState("");
  const [saving, setSaving] = useState(false);
  const [touchedGear, setTouchedGear] = useState(false);

  // Load an existing log for editing.
  useEffect(() => {
    const l = logQ.data;
    if (l) {
      setRecipeId(l.recipe_id);
      setBrewDate(l.brew_date);
      setActualTime(l.actual_time ?? "");
      setClick(l.click_setting ?? "");
      setGrinder(l.grinder ?? "");
      setTouchedGear(true);
    }
  }, [logQ.data]);

  const selected = recipes.find((r) => r.id === recipeId);

  // For a new log, pre-fill clicks/grinder from the chosen recipe (until edited).
  useEffect(() => {
    if (id || touchedGear || !selected) return;
    setClick(selected.click_setting ?? "");
    setGrinder(selected.grinder ?? "");
  }, [selected, id, touchedGear]);

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
        click_setting: click || null,
        grinder: grinder || null,
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
      <div className="space-y-4">
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
            hint={selected?.target_time ? t("logs.target", { time: selected.target_time }) : undefined}
          >
            <TextInput value={actualTime} onChange={(e) => setActualTime(e.target.value)} placeholder={t("logs.phActual")} inputMode="numeric" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("logs.fieldClick")}>
            <TextInput
              value={click}
              onChange={(e) => { setClick(e.target.value); setTouchedGear(true); }}
              placeholder={t("recipes.phClick")}
            />
          </Field>
          <Field label={t("logs.fieldGrinder")}>
            <Select
              value={grinder}
              onChange={(e) => { setGrinder(e.target.value); setTouchedGear(true); }}
              options={GRINDERS}
              placeholder={t("logs.selectGrinder")}
            />
          </Field>
        </div>
        <p className="-mt-1 text-xs text-cream-mute">{t("logs.gearHint")}</p>

        <div className="flex items-start gap-2.5 rounded-xl border border-gold/25 bg-gold/8 px-3.5 py-3">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <p className="text-sm leading-relaxed text-cream-dim">{t("logs.tasteHint")}</p>
        </div>
      </div>
    </FormScreen>
  );
}
