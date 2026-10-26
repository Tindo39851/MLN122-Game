import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "../lib/firebase";
import type { PlayerResult, PublicRoom } from "../lib/contracts";

let serverOffset = 0;
let offsetSubscribed = false;

/** Đồng hồ máy chủ (ms) cập nhật theo chu kỳ — dùng cho đồng hồ đếm ngược đồng bộ giữa mọi thiết bị. */
export function useServerNow(intervalMs = 250, enabled = true): number {
  const [now, setNow] = useState(() => Date.now() + serverOffset);
  useEffect(() => {
    if (!offsetSubscribed) {
      offsetSubscribed = true;
      onValue(ref(database, ".info/serverTimeOffset"), (snapshot) => { serverOffset = Number(snapshot.val()) || 0; });
    }
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now() + serverOffset), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}

/** Thời gian còn lại của vòng hiện tại (giây, làm tròn lên) hoặc null nếu không có đồng hồ. */
export function useRoundTimer(room: PublicRoom | null) {
  const running = !!room && room.status === "active" && !!room.roundEndsAt && room.publicAnswer?.round !== room.currentRound;
  const now = useServerNow(200, running);
  if (!room?.roundEndsAt || !room.currentQuestion) return { remaining: null, fraction: 0, expired: false, running: false };
  const totalMs = room.currentQuestion.timeLimitSec * 1000;
  const leftMs = Math.max(0, room.roundEndsAt - now);
  return { remaining: Math.ceil(leftMs / 1000), fraction: totalMs ? leftMs / totalMs : 0, expired: leftMs <= 0, running };
}

/** Lắng nghe rooms/{code}/public. */
export function useRoom(roomCode: string, enabled: boolean) {
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    setRoom(null); setError(""); setDenied(false);
    if (!roomCode || !enabled) return;
    return onValue(ref(database, `rooms/${roomCode}/public`), (snapshot) => {
      if (!snapshot.exists()) { setRoom(null); setError("Không tìm thấy phòng."); return; }
      setError("");
      setRoom(snapshot.val() as PublicRoom);
    }, (readError) => {
      setRoom(null);
      setDenied(readError.message.toLowerCase().includes("permission"));
      setError(readError.message || "Không thể nghe dữ liệu phòng.");
    });
  }, [roomCode, enabled]);
  return { room, error, denied };
}

/** Kết quả riêng của người chơi sau mỗi lần công bố. */
export function usePlayerResult(roomCode: string, uid: string | undefined) {
  const [result, setResult] = useState<PlayerResult | null>(null);
  useEffect(() => {
    setResult(null);
    if (!roomCode || !uid) return;
    return onValue(ref(database, `rooms/${roomCode}/results/${uid}`), (snapshot) => {
      setResult(snapshot.exists() ? snapshot.val() as PlayerResult : null);
    }, () => setResult(null));
  }, [roomCode, uid]);
  return result;
}
