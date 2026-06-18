import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "./Toast";

/**
 * Share a brew session so other tasters can open it (and add their opinions).
 * Offers the native share sheet, a direct LINE share, copy-link, and a QR code
 * to scan in person.
 */
export default function ShareSession({
  open,
  onClose,
  logId,
  title,
}: {
  open: boolean;
  onClose: () => void;
  logId: string;
  title: string;
}) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/s/${logId}`;
  const shareText = `${title} · rate this brew on Dialed`;

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Dialed", text: shareText, url });
      } catch {
        /* user cancelled — ignore */
      }
    } else {
      copyLink();
    }
  }

  function shareToLine() {
    // Opens the LINE app (mobile) / share dialog with the link prefilled.
    const href = `https://line.me/R/msg/text/?${encodeURIComponent(`${shareText}\n${url}`)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Could not copy link", "error");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Share this session" subtitle="Let others rate it too">
      <div className="space-y-5">
        {/* QR */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-cream p-3 shadow-gold">
            <QRCodeSVG value={url} size={172} fgColor="#140C05" bgColor="#F0E4CC" level="M" />
          </div>
          <p className="text-xs text-cream-mute">Scan to open the session</p>
        </div>

        {/* Link row */}
        <div className="flex items-center gap-2 rounded-xl border border-gold/15 bg-espresso-900/60 p-1.5 pl-3">
          <span className="flex-1 truncate text-sm text-cream-dim">{url}</span>
          <button onClick={copyLink} className="btn-subtle shrink-0 px-3 py-2">
            {copied ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={shareToLine}
            className="btn text-white"
            style={{ background: "#06C755" }}
          >
            <MessageCircle className="h-4 w-4" /> LINE
          </button>
          <button onClick={nativeShare} className="btn-gold">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </Modal>
  );
}
