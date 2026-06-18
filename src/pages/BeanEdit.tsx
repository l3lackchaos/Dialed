import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useT } from "../i18n";
import { useQuery } from "../hooks/useQuery";
import { fetchBean, createBean, updateBean } from "../lib/queries";
import { PROCESSES, ROAST_LEVELS } from "../lib/constants";
import { FormScreen, Field, TextInput, TextArea, Select, PageLoader } from "../components/ui";
import { useToast } from "../components/Toast";
import type { BeanInsert } from "../lib/types";

const empty: BeanInsert = {
  name: "",
  origin: "",
  process: "",
  roast_level: "",
  roast_date: "",
  roaster: "",
  tasting_notes: "",
};

export default function BeanEdit() {
  const t = useT();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: bean, loading } = useQuery(() =>
    id ? fetchBean(id) : Promise.resolve(null),
  );

  const [form, setForm] = useState<BeanInsert>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bean) {
      setForm({
        name: bean.name,
        origin: bean.origin ?? "",
        process: bean.process ?? "",
        roast_level: bean.roast_level ?? "",
        roast_date: bean.roast_date ?? "",
        roaster: bean.roaster ?? "",
        tasting_notes: bean.tasting_notes ?? "",
      });
    }
  }, [bean]);

  const set = <K extends keyof BeanInsert>(k: K, v: BeanInsert[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function close() {
    navigate("/beans");
  }

  async function save() {
    if (!form.name?.trim()) return notify(t("beans.errName"), "error");
    setSaving(true);
    try {
      const payload: BeanInsert = {
        name: form.name.trim(),
        origin: form.origin || null,
        process: form.process || null,
        roast_level: form.roast_level || null,
        roast_date: form.roast_date || null,
        roaster: form.roaster || null,
        tasting_notes: form.tasting_notes || null,
      };
      if (id) {
        await updateBean(id, payload);
        notify(t("beans.updated"));
      } else {
        await createBean(payload);
        notify(t("beans.added"));
      }
      close();
    } catch (err) {
      notify(err instanceof Error ? err.message : t("beans.errName"), "error");
    } finally {
      setSaving(false);
    }
  }

  if (id && loading) return <PageLoader label={t("session.opening")} />;

  return (
    <FormScreen
      title={id ? t("beans.edit") : t("beans.new")}
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
        <Field label={t("beans.fieldName")}>
          <TextInput
            value={form.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("beans.phName")}
            autoFocus={!id}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("beans.fieldOrigin")} optionalText={t("common.optional")}>
            <TextInput
              value={form.origin ?? ""}
              onChange={(e) => set("origin", e.target.value)}
              placeholder={t("beans.phOrigin")}
            />
          </Field>
          <Field label={t("beans.fieldRoaster")} optionalText={t("common.optional")}>
            <TextInput
              value={form.roaster ?? ""}
              onChange={(e) => set("roaster", e.target.value)}
              placeholder={t("beans.phRoaster")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("beans.fieldProcess")}>
            <Select
              value={form.process ?? ""}
              onChange={(e) => set("process", e.target.value)}
              options={PROCESSES}
              placeholder={t("beans.selectProcess")}
            />
          </Field>
          <Field label={t("beans.fieldRoast")}>
            <Select
              value={form.roast_level ?? ""}
              onChange={(e) => set("roast_level", e.target.value)}
              options={ROAST_LEVELS}
              placeholder={t("beans.selectRoast")}
            />
          </Field>
        </div>

        <Field label={t("beans.fieldRoastDate")} optionalText={t("common.optional")}>
          <TextInput
            type="date"
            value={form.roast_date ?? ""}
            onChange={(e) => set("roast_date", e.target.value)}
          />
        </Field>

        <Field label={t("beans.fieldNotes")} optionalText={t("common.optional")}>
          <TextArea
            value={form.tasting_notes ?? ""}
            onChange={(e) => set("tasting_notes", e.target.value)}
            placeholder={t("beans.phNotes")}
          />
        </Field>
      </div>
    </FormScreen>
  );
}
