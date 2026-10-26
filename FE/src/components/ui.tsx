import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, Check, Volume2, VolumeX } from "lucide-react";
import { isMuted, onMuteChange, setMuted } from "../lib/sound";

export function StatusBadge({ status }: { status?: string }) {
  const label = status === "active" ? "ĐANG DIỄN RA" : status === "ended" ? "ĐÃ KẾT THÚC" : status === "waiting" ? "ĐANG CHỜ" : "ĐANG TẢI";
  return <span className={`status-badge status-${status || "unknown"}`}><span />{label}</span>;
}

export function Alerts({ error, notice, wide }: { error?: string; notice?: string; wide?: boolean }) {
  return <>
    {error && <div role="alert" className={`alert alert-error ${wide ? "wide-alert" : ""}`}><AlertCircle size={16} />{error}</div>}
    {notice && <div role="status" className={`alert alert-success ${wide ? "wide-alert" : ""}`}><Check size={16} />{notice}</div>}
  </>;
}

export function SoundToggle({ compact }: { compact?: boolean }) {
  const [muted, setState] = useState(isMuted());
  useEffect(() => onMuteChange(setState), []);
  return <button type="button" className={`sound-toggle ${compact ? "compact" : ""}`} onClick={() => setMuted(!muted)}
    aria-pressed={!muted} aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"} title={muted ? "Bật âm thanh" : "Tắt âm thanh"}>
    {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}{!compact && <span>{muted ? "TẮT TIẾNG" : "ÂM THANH"}</span>}
  </button>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <span className="card-kicker">{children}</span>;
}

export const letter = (index: number) => String.fromCharCode(65 + index);
export const pad2 = (value: number) => String(value).padStart(2, "0");
