import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "./Toast";
import { useT } from "../i18n";

/** Share a brew session: native share, LINE, copy-link, and a scannable QR. */
export default function ShareSession({
  open, onClose, logId, title,
}: {
  open: boolean;
  onClose: () => void;
  logId: string;
  title: string;
}) {
  const t = useT();
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/s/${logId}`;
  const shareText = `${title} — Dialed`;

  async function nativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: "Dialed", text: shareText, url }); } catch { /* cancelled */ }
    } else {
      copyLink();
    }
  }
  function shareToLine() {
    const href = `https://line.me/R/msg/text/?${encodeURIComponent(`${shareText}\n${url}`)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify(t("share.copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      notify(t("share.errCopy"), "error");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("share.title")} subtitle={t("share.subtitle")}>
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-cream/10 bg-white p-3 shadow-pop">
            <QRCodeSVG value={url} size={168} fgColor="#23241D" bgColor="#FFFFFF" level="M" />
          </div>
          <p className="text-xs text-cream-mute">{t("share.scan")}</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cream/12 bg-espresso-700 p-1.5 pl-3">
          <span className="flex-1 truncate text-sm text-cream-dim">{url}</span>
          <button onClick={copyLink} className="btn-quiet h-10 shrink-0 px-3" aria-label={t("common.share")}>
            {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={shareToLine} className="btn text-white" style={{ background: "#06C755" }}>
            <MessageCircle className="h-4 w-4" /> {t("share.line")}
          </button>
          <button onClick={nativeShare} className="btn-primary">
            <Share2 className="h-4 w-4" /> {t("common.share")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
