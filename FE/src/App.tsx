import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Factory, LogOut, Sparkles, Wrench } from "lucide-react";
import {
  getIdTokenResult, onAuthStateChanged,
  signInAnonymously, signInWithEmailAndPassword, signOut,
} from "firebase/auth";
import { auth, missingFirebaseConfig, usingEmulator } from "./lib/firebase";
import {
  advanceRound, createRoom, endGame, errorMessage, joinRoom,
  kickPlayer, resetRoom, revealAnswer, startGame,
} from "./lib/api";
import { unlockAudio } from "./lib/sound";
import { useRoom } from "./hooks/useRoom";
import { SoundToggle } from "./components/ui";
import { PixelArena } from "./components/PixelArena";
import { EntryView, LoadingScreen, SetupScreen } from "./views/EntryView";
import { AdminView } from "./views/AdminView";
import { PlayerView, type PlayerSession } from "./views/PlayerView";
import { PresenterView } from "./views/PresenterView";

const SESSION_KEY = "mln122-player-session";
const ADMIN_ROOM_KEY = "mln122-admin-room";

function readPlayerSession(): PlayerSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as PlayerSession | null; }
  catch { return null; }
}

const DEFAULT_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "admin@mln122.local").trim().toLowerCase();

function isAdminUser(email?: string | null, claims?: Record<string, unknown>): boolean {
  return claims?.admin === true || (!!email && email.toLowerCase() === DEFAULT_ADMIN_EMAIL);
}

function App() {
  const params = new URLSearchParams(location.search);
  const presenterCode = params.get("presenter")?.toUpperCase() || "";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roomInput, setRoomInput] = useState(() => params.get("room")?.toUpperCase() || "");
  const [authReady, setAuthReady] = useState(() => missingFirebaseConfig.length > 0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [soloMode, setSoloMode] = useState(false);
  const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null);
  const [adminRoomCode, setAdminRoomCode] = useState(() => localStorage.getItem(ADMIN_ROOM_KEY) || "");
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const wantsAdmin = username.trim().toLocaleLowerCase("vi") === "admin";
  const activeRoomCode = presenterCode || (isAdmin ? adminRoomCode : playerSession?.roomCode || "");
  const canListen = !missingFirebaseConfig.length && !!activeRoomCode && (isAdmin || !!playerSession || !!presenterCode);
  const { room, error: roomError, denied } = useRoom(activeRoomCode, canListen);

  useEffect(() => {
    if (missingFirebaseConfig.length) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) { setIsAdmin(false); setAuthReady(true); return; }
      try {
        const token = await getIdTokenResult(nextUser, true);
        if (isAdminUser(nextUser.email, token.claims)) { setIsAdmin(true); setAuthReady(true); return; }
        setIsAdmin(false);
        if (nextUser.isAnonymous) {
          const saved = readPlayerSession();
          if (saved?.uid === nextUser.uid) setPlayerSession(saved);
        }
      } catch {
        setIsAdmin(false); setPlayerSession(null);
        await signOut(auth).catch(() => {});
      } finally { setAuthReady(true); }
    });
  }, []);

  useEffect(() => {
    if (playerSession && denied) {
      localStorage.removeItem(SESSION_KEY);
      setPlayerSession(null);
      setError("Bạn không còn trong phòng chơi này.");
    }
  }, [playerSession, denied]);

  const leaveSession = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADMIN_ROOM_KEY);
    setPlayerSession(null); setAdminRoomCode(""); setIsAdmin(false); setSoloMode(false);
    setUsername(""); setPassword(""); setNotice(""); setError("");
    if (!missingFirebaseConfig.length) await signOut(auth).catch(() => {});
  }, []);

  const handleEntry = async (event: FormEvent) => {
    event.preventDefault(); unlockAudio(); setError(""); setNotice(""); setBusy(true);
    try {
      if (wantsAdmin) {
        const email = DEFAULT_ADMIN_EMAIL;
        if (!password) throw new Error("Nhập mật khẩu tài khoản Admin.");
        if (auth.currentUser) await signOut(auth);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const token = await getIdTokenResult(credential.user, true);
        if (!isAdminUser(credential.user.email, token.claims)) {
          await signOut(auth);
          throw new Error("Tài khoản không khớp với VITE_ADMIN_EMAIL.");
        }
        setIsAdmin(true); setPlayerSession(null);
        setNotice("Đã xác thực Admin. Tạo phòng để bắt đầu điều khiển trò chơi.");
      } else {
        const displayName = username.trim().replace(/\s+/g, " ");
        const code = roomInput.trim().toUpperCase();
        if (!displayName || displayName.length > 32) throw new Error("Tên hiển thị cần từ 1 đến 32 ký tự.");
        if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) throw new Error("Mã phòng gồm 6 chữ in hoa hoặc chữ số.");
        if (auth.currentUser && !auth.currentUser.isAnonymous) await signOut(auth);
        if (!auth.currentUser?.isAnonymous) await signInAnonymously(auth);
        const result = await joinRoom({ roomCode: code, displayName });
        const session = { uid: result.data.uid, roomCode: result.data.roomCode, displayName: result.data.displayName };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setIsAdmin(false); setPlayerSession(session);
      }
    } catch (caught) { setError(errorMessage(caught)); }
    finally { setBusy(false); }
  };

  const runAction = async (action: string, operation: () => Promise<unknown>, success = "") => {
    unlockAudio(); setError(""); setNotice(""); setBusyAction(action);
    try { await operation(); if (success) setNotice(success); }
    catch (caught) { setError(errorMessage(caught)); }
    finally { setBusyAction(""); }
  };

  const createNewRoom = () => runAction("create", async () => {
    const result = await createRoom({});
    const code = result.data.roomCode;
    localStorage.setItem(ADMIN_ROOM_KEY, code);
    setAdminRoomCode(code);
    const url = new URL(location.href); url.search = `?room=${code}`; history.replaceState({}, "", url);
  }, "Phòng mới đã sẵn sàng. Mở màn hình chiếu hoặc chia sẻ QR để cả lớp tham gia.");

  if (!soloMode && missingFirebaseConfig.length) {
    return <SetupScreen missing={missingFirebaseConfig} onSoloPlay={() => { unlockAudio(); setSoloMode(true); }} />;
  }
  if (!authReady) return <LoadingScreen />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); if (isAdmin || playerSession || soloMode) void leaveSession(); }}>
          <span className="brand-mark"><Factory size={21} strokeWidth={2.2} /></span>
          <span className="brand-copy"><strong>XƯỞNG MÁY</strong><small>CHIẾN DỊCH GIẢI CỨU PIXEL</small></span>
        </a>
        <div className="topbar-right">
          {usingEmulator && <span className="role-chip">EMULATOR</span>}
          {(isAdmin || playerSession || soloMode) && (
            <span className={`role-chip ${isAdmin ? "admin-chip" : "player-chip"}`}>
              <span className="pulse-dot" />
              {isAdmin ? "CHẾ ĐỘ ĐIỀU KHIỂN" : soloMode ? "SOLO PIXEL" : "NGƯỜI CHƠI"}
            </span>
          )}
          <span className="edition"><Wrench size={14} /> MẬT MÃ TÍCH LŨY</span>
        </div>
      </header>

      <main>
        {soloMode ? (
          <section className="dashboard">
            <div className="dashboard-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" /> CHẾ ĐỘ SOLO PIXEL · 4 PHASE BOSS</div>
                <h1>Đánh sập <em>4 Trùm Tư Bản.</em></h1>
                <p>Dùng phím WASD / Mũi tên chạy vào ô [?] hoặc bấm Space để mở câu hỏi nạp đòn đánh Boss (mỗi Boss 6 HP = 6 câu đúng/10 câu).</p>
              </div>
              <div className="heading-actions">
                <SoundToggle />
                <button className="button button-quiet" onClick={() => setSoloMode(false)}><LogOut size={16} /> Về trang chính</button>
              </div>
            </div>
            <PixelArena playerName={username.trim() || "Công Nhân Tiên Phong"} />
          </section>
        ) : presenterCode ? (
          <PresenterView roomCode={presenterCode} room={room} error={roomError} />
        ) : !isAdmin && !playerSession ? (
          <EntryView
            username={username} password={password} roomInput={roomInput} wantsAdmin={wantsAdmin}
            busy={busy} error={error} notice={notice} totalRounds={4}
            onUsername={setUsername} onPassword={setPassword} onRoom={setRoomInput}
            onSubmit={handleEntry}
            onSoloPlay={() => { unlockAudio(); setSoloMode(true); }}
          />
        ) : isAdmin ? (
          <AdminView
            roomCode={adminRoomCode} room={room} busyAction={busyAction} notice={notice} error={error || roomError}
            onCreate={createNewRoom}
            onStart={() => runAction("start", () => startGame({ roomCode: adminRoomCode }), "Chiến dịch Pixel 4 Boss đã bắt đầu!")}
            onReveal={() => runAction("reveal", () => revealAnswer({ roomCode: adminRoomCode, round: room!.currentRound }))}
            onAdvance={() => runAction("advance", () => advanceRound({ roomCode: adminRoomCode }))}
            onEnd={() => runAction("end", () => endGame({ roomCode: adminRoomCode }), "Trò chơi đã kết thúc.")}
            onReset={() => runAction("reset", () => resetRoom({ roomCode: adminRoomCode }), "Đã đặt lại phòng về trạng thái chờ.")}
            onKick={(entry) => { if (confirm(`Mời "${entry.displayName}" ra khỏi phòng?`)) void runAction("kick", () => kickPlayer({ roomCode: adminRoomCode, uid: entry.uid })); }}
            onLeave={() => void leaveSession()}
          />
        ) : playerSession ? (
          <PlayerView session={playerSession} room={room} roomError={roomError} onLeave={() => void leaveSession()} />
        ) : null}
      </main>
      <footer className="site-footer"><span>MLN 122 <b>·</b> PIXEL BOSS RUSH</span><span>WASD + SPACE ĐỂ CHIẾN ĐẤU <Sparkles size={13} /></span></footer>
    </div>
  );
}

export default App;
