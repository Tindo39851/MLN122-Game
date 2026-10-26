import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** URL người chơi dùng để vào phòng (đích của mã QR). */
export function joinUrl(roomCode: string): string {
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const configured = import.meta.env.VITE_PUBLIC_JOIN_URL?.trim();
  const base = (isLocal && configured) ? configured : `${location.origin}${location.pathname}`;
  const url = new URL(base);
  url.search = `?room=${roomCode}`;
  url.hash = "";
  return url.toString();
}

export function presenterUrl(roomCode: string): string {
  const url = new URL(location.href);
  url.search = `?presenter=${roomCode}`;
  url.hash = "";
  return url.toString();
}

export function useQrCode(text: string, width = 224): string {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    if (!text) { setDataUrl(""); return; }
    let cancelled = false;
    QRCode.toDataURL(text, { width, margin: 1, color: { dark: "#173b32", light: "#ffffff" } })
      .then((url) => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setDataUrl(""); });
    return () => { cancelled = true; };
  }, [text, width]);
  return dataUrl;
}
