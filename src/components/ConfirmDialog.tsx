import Modal from "./Modal";
import { useT } from "../i18n";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useT();
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button className="btn-quiet flex-1" onClick={onCancel} disabled={busy}>
            {t("common.cancel")}
          </button>
          <button className="btn-danger flex-1" onClick={onConfirm} disabled={busy}>
            {busy ? t("common.working") : confirmLabel ?? t("common.delete")}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-cream-dim">{message}</p>
    </Modal>
  );
}
