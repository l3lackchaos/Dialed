import { useState } from "react";
import Modal from "./Modal";
import { Field, TextInput, TextArea, Select } from "./ui";
import { PROCESSES, ROAST_LEVELS } from "../lib/constants";
import { createBean, updateBean } from "../lib/queries";
import { useToast } from "./Toast";
import type { Bean, BeanInsert } from "../lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  bean?: Bean | null;
};

const empty: BeanInsert = {
  name: "",
  origin: "",
  process: "",
  roast_level: "",
  roast_date: "",
  roaster: "",
  tasting_notes: "",
};

export default function BeanForm({ open, onClose, onSaved, bean }: Props) {
  const { notify } = useToast();
  const [form, setForm] = useState<BeanInsert>(empty);
  const [saving, setSaving] = useState(false);

  // Re-seed the form whenever the modal opens for a different bean.
  const [seededFor, setSeededFor] = useState<string | null>("__init__");
  const key = bean?.id ?? "new";
  if (open && seededFor !== key) {
    setForm(
      bean
        ? {
            name: bean.name,
            origin: bean.origin ?? "",
            process: bean.process ?? "",
            roast_level: bean.roast_level ?? "",
            roast_date: bean.roast_date ?? "",
            roaster: bean.roaster ?? "",
            tasting_notes: bean.tasting_notes ?? "",
          }
        : empty,
    );
    setSeededFor(key);
  }
  if (!open && seededFor !== null) setSeededFor(null);

  const set = <K extends keyof BeanInsert>(k: K, v: BeanInsert[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name.trim()) {
      notify("Bean name is required", "error");
      return;
    }
    setSaving(true);
    try {
      // Clean empties to null so the DB stays tidy.
      const payload: BeanInsert = {
        name: form.name.trim(),
        origin: form.origin || null,
        process: form.process || null,
        roast_level: form.roast_level || null,
        roast_date: form.roast_date || null,
        roaster: form.roaster || null,
        tasting_notes: form.tasting_notes || null,
      };
      if (bean) {
        await updateBean(bean.id, payload);
        notify("Bean updated");
      } else {
        await createBean(payload);
        notify("Bean added to your shelf");
      }
      onSaved();
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save bean", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bean ? "Edit bean" : "New bean"}
      subtitle="What's on the shelf"
      footer={
        <>
          <button className="btn-subtle" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : bean ? "Save changes" : "Add bean"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Bean name">
          <TextInput
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Geisha Esmeralda"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Origin">
            <TextInput
              value={form.origin ?? ""}
              onChange={(e) => set("origin", e.target.value)}
              placeholder="Panama, Boquete"
            />
          </Field>
          <Field label="Roaster">
            <TextInput
              value={form.roaster ?? ""}
              onChange={(e) => set("roaster", e.target.value)}
              placeholder="Roaster name"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Process">
            <Select
              value={form.process ?? ""}
              onChange={(e) => set("process", e.target.value)}
              options={PROCESSES}
              placeholder="Select process"
            />
          </Field>
          <Field label="Roast level">
            <Select
              value={form.roast_level ?? ""}
              onChange={(e) => set("roast_level", e.target.value)}
              options={ROAST_LEVELS}
              placeholder="Select roast"
            />
          </Field>
        </div>

        <Field label="Roast date">
          <TextInput
            type="date"
            value={form.roast_date ?? ""}
            onChange={(e) => set("roast_date", e.target.value)}
          />
        </Field>

        <Field label="Tasting notes (from the bag)">
          <TextArea
            value={form.tasting_notes ?? ""}
            onChange={(e) => set("tasting_notes", e.target.value)}
            placeholder="Jasmine, bergamot, white peach, honey…"
          />
        </Field>
      </div>
    </Modal>
  );
}
