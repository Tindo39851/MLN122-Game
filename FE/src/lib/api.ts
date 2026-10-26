import { ref, runTransaction } from "firebase/database";
import { auth, database } from "./firebase";
import { PHASES, SCORING, TOTAL_PHASES } from "./phases";
import type { LeaderboardEntry, Player, PublicRoom } from "./contracts";

type Room = { roomCode: string };

export interface SubmitBossHitPayload {
  roomCode: string;
  phase: number;
  questionId: string;
  answer: string;
  elapsedMs?: number;
}

export interface SubmitBossHitResult {
  accepted: boolean;
  correct?: boolean;
  points?: number;
  bossDefeatedNow?: boolean;
  phase?: number;
  bossHp?: number;
  bossesDefeated?: number;
  explanation?: string;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PLAYERS = 30;

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

function buildLeaderboard(playerMap: Record<string, Player> = {}): Record<string, LeaderboardEntry> {
  const players = Object.values(playerMap).sort((a, b) =>
    (b.bossesDefeated ?? 0) - (a.bossesDefeated ?? 0) ||
    (b.score ?? 0) - (a.score ?? 0) ||
    (b.correctCount ?? 0) - (a.correctCount ?? 0) ||
    (a.clearedAt ?? Infinity) - (b.clearedAt ?? Infinity) ||
    String(a.uid).localeCompare(String(b.uid)),
  );
  const leaderboard: Record<string, LeaderboardEntry> = {};
  let rank = 0;
  let prev: Player | undefined;
  players.forEach((p, idx) => {
    if (
      !prev ||
      p.score !== prev.score ||
      p.correctCount !== prev.correctCount ||
      (p.bossesDefeated ?? 0) !== (prev.bossesDefeated ?? 0)
    ) {
      rank = idx + 1;
    }
    leaderboard[String(idx + 1).padStart(3, "0")] = {
      uid: p.uid,
      displayName: p.displayName,
      score: p.score ?? 0,
      correctCount: p.correctCount ?? 0,
      streak: p.streak ?? 0,
      phase: p.phase ?? 1,
      bossHp: p.bossHp ?? PHASES[0].bossHp,
      bossesDefeated: p.bossesDefeated ?? 0,
      clearedAt: p.clearedAt ?? null,
      rank,
    };
    prev = p;
  });
  return leaderboard;
}

async function mutatePublicRoom(code: string, fn: (room: PublicRoom) => void): Promise<PublicRoom> {
  let notFound = false;
  const result = await runTransaction(ref(database, `rooms/${code}/public`), (current: PublicRoom | null) => {
    if (current === null) {
      notFound = true;
      return current;
    }
    notFound = false;
    fn(current);
    return current;
  });
  if (notFound || !result.snapshot.exists()) throw Object.assign(new Error("Không tìm thấy phòng chơi."), { code: "not-found" });
  return result.snapshot.val() as PublicRoom;
}

// ponytail: Ghi trực tiếp lên Realtime Database để chạy trên Vercel + gói Firebase Spark miễn phí (không cần thẻ Visa / Cloud Functions).
export async function createRoom(_payload: Record<string, never> = {}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw Object.assign(new Error("Cần đăng nhập Admin."), { code: "unauthenticated" });
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const res = await runTransaction(ref(database, `rooms/${code}`), (existing) => {
      if (existing) return;
      return {
        public: {
          code,
          status: "waiting",
          currentRound: 0,
          totalRounds: TOTAL_PHASES,
          maxPlayers: MAX_PLAYERS,
          createdAt: Date.now(),
        },
        private: { createdBy: uid },
      };
    });
    if (res.committed) return { data: { roomCode: code, status: "waiting" as const } };
  }
  throw new Error("Không tạo được phòng; vui lòng thử lại.");
}

export async function joinRoom({ roomCode, displayName }: { roomCode: string; displayName: string }) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw Object.assign(new Error("Cần đăng nhập."), { code: "unauthenticated" });
  const code = roomCode.trim().toUpperCase();
  const name = displayName.trim().replace(/\s+/g, " ");
  await mutatePublicRoom(code, (room) => {
    if (room.status === "ended") throw Object.assign(new Error("Phòng đã kết thúc."), { code: "failed-precondition" });
    room.players ??= {};
    const existing = room.players[uid];
    if (!existing && Object.keys(room.players).length >= MAX_PLAYERS) {
      throw Object.assign(new Error("Phòng đã đủ 30 người."), { code: "resource-exhausted" });
    }
    room.players[uid] = {
      uid,
      displayName: name,
      joinedAt: existing?.joinedAt ?? Date.now(),
      score: existing?.score ?? 0,
      correctCount: existing?.correctCount ?? 0,
      streak: existing?.streak ?? 0,
      phase: existing?.phase ?? 1,
      bossHp: existing?.bossHp ?? PHASES[0].bossHp,
      bossesDefeated: existing?.bossesDefeated ?? 0,
      clearedAt: existing?.clearedAt ?? null,
    };
    room.leaderboard = buildLeaderboard(room.players);
  });
  return { data: { roomCode: code, uid, displayName: name } };
}

export async function startGame({ roomCode }: Room) {
  await mutatePublicRoom(roomCode, (room) => {
    room.status = "active";
    room.currentRound = 1;
    room.roundStartedAt = Date.now();
  });
  return { data: { status: "active" as const, currentRound: 1 as const } };
}

export async function submitAnswer(payload: SubmitBossHitPayload): Promise<{ data: SubmitBossHitResult }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw Object.assign(new Error("Cần đăng nhập."), { code: "unauthenticated" });
  const phaseNum = Math.max(1, Math.min(TOTAL_PHASES, Number(payload.phase || 1)));
  const phaseObj = PHASES[phaseNum - 1];
  const question = phaseObj.questions.find((q) => q.id === payload.questionId) ?? phaseObj.questions[0];
  const elapsedMs = Math.max(0, Math.min(25_000, Number(payload.elapsedMs ?? 5000)));
  let out: SubmitBossHitResult = { accepted: true };

  await mutatePublicRoom(payload.roomCode, (room) => {
    if (room.status !== "active") return;
    const player = room.players?.[uid];
    if (!player) return;
    const correct = payload.answer === question.correct;
    let points = 0;
    let bossDefeatedNow = false;
    if (correct) {
      const speedBonus = Math.round(SCORING.speedBonus * Math.max(0, 1 - elapsedMs / 25_000));
      player.streak = (player.streak ?? 0) + 1;
      const streakBonus = Math.min((player.streak - 1) * SCORING.streakBonus, SCORING.maxStreakBonus);
      points = SCORING.base + speedBonus + streakBonus;
      player.correctCount = (player.correctCount ?? 0) + 1;
      player.bossHp = Math.max(0, (player.bossHp ?? phaseObj.bossHp) - 1);
      if (player.bossHp === 0 && (player.bossesDefeated ?? 0) < phaseNum) {
        bossDefeatedNow = true;
        points += SCORING.bossKillBonus;
        player.bossesDefeated = phaseNum;
        if (phaseNum < TOTAL_PHASES) {
          player.phase = phaseNum + 1;
          player.bossHp = PHASES[phaseNum].bossHp;
        } else {
          player.phase = TOTAL_PHASES;
          player.bossHp = 0;
          player.clearedAt = Date.now();
        }
      }
      player.score = (player.score ?? 0) + points;
    } else {
      player.streak = 0;
    }
    room.answeredCount = (room.answeredCount ?? 0) + 1;
    room.leaderboard = buildLeaderboard(room.players);
    out = {
      accepted: true,
      correct,
      points,
      bossDefeatedNow,
      phase: player.phase,
      bossHp: player.bossHp,
      bossesDefeated: player.bossesDefeated,
      explanation: question.explanation,
    };
  });
  return { data: out };
}

export async function revealAnswer({ round }: Room & { round: number }) {
  return { data: { round, correctAnswer: "a", explanation: "" } };
}

export async function advanceRound({ roomCode }: Room) {
  const room = await mutatePublicRoom(roomCode, (r) => {
    r.currentRound = Math.min(TOTAL_PHASES, (r.currentRound ?? 1) + 1);
  });
  return { data: { currentRound: room.currentRound } };
}

export async function endGame({ roomCode }: Room) {
  await mutatePublicRoom(roomCode, (room) => {
    room.status = "ended";
    room.endedAt = Date.now();
    room.leaderboard = buildLeaderboard(room.players);
  });
  return { data: { status: "ended" as const } };
}

export async function kickPlayer({ roomCode, uid }: Room & { uid: string }) {
  await mutatePublicRoom(roomCode, (room) => {
    if (room.players) delete room.players[uid];
    room.leaderboard = buildLeaderboard(room.players);
  });
  return { data: { removed: true as const } };
}

export async function resetRoom({ roomCode }: Room) {
  await mutatePublicRoom(roomCode, (room) => {
    for (const p of Object.values(room.players ?? {})) {
      p.score = 0;
      p.correctCount = 0;
      p.streak = 0;
      p.phase = 1;
      p.bossHp = PHASES[0].bossHp;
      p.bossesDefeated = 0;
      p.clearedAt = null;
    }
    room.status = "waiting";
    room.currentRound = 0;
    room.totalRounds = TOTAL_PHASES;
    room.answeredCount = 0;
    delete room.endedAt;
    room.leaderboard = buildLeaderboard(room.players);
  });
  return { data: { status: "waiting" as const } };
}

const MESSAGES: Record<string, string> = {
  unauthenticated: "Phiên đăng nhập đã hết. Hãy đăng nhập lại.",
  "permission-denied": "Chưa bật quyền đọc/ghi trong Firebase Realtime Database Rules.",
  "invalid-argument": "Thông tin gửi lên chưa hợp lệ.",
  "not-found": "Không tìm thấy phòng chơi.",
  "failed-precondition": "Phòng đang ở trạng thái không phù hợp cho thao tác này.",
  "already-exists": "Bạn đã trả lời câu này rồi.",
  "resource-exhausted": "Phòng đã đủ 30 người. Hãy thử lại sau.",
  "auth/invalid-credential": "Sai mật khẩu hoặc chưa tạo tài khoản Admin trong Firebase Auth.",
  "auth/wrong-password": "Sai mật khẩu Admin.",
  "auth/user-not-found": "Chưa có tài khoản Admin với email đã cấu hình.",
  "auth/too-many-requests": "Thử quá nhiều lần. Đợi một lát rồi thử lại.",
  "auth/network-request-failed": "Không kết nối được Firebase. Kiểm tra mạng hoặc cấu hình biến môi trường.",
  "auth/admin-restricted-operation": "Chưa bật đăng nhập ẩn danh (Anonymous) trong Firebase Authentication.",
  "auth/operation-not-allowed": "Phương thức đăng nhập này chưa được bật trong Firebase Authentication.",
};

export function errorCode(error: unknown): string {
  return ((error as { code?: string })?.code ?? "").replace("functions/", "");
}

export function errorMessage(error: unknown): string {
  const code = errorCode(error);
  return MESSAGES[code] || (error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.");
}
