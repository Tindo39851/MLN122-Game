import { useMemo, useState } from "react";
import {
  Check, Clipboard, ExternalLink, Factory, Gamepad2, LogOut, MonitorPlay, Play, QrCode, Radio, RotateCcw,
  ShieldAlert, Square, UsersRound,
} from "lucide-react";
import type { LeaderboardEntry, PublicRoom } from "../lib/contracts";
import { PHASES } from "../lib/phases";
import { joinUrl, presenterUrl, useQrCode } from "../lib/join";
import { Alerts, StatusBadge, pad2 } from "../components/ui";
import { Leaderboard, sortBoard } from "../components/Leaderboard";
import { Podium } from "../components/GameWidgets";
import { PixelArena } from "../components/PixelArena";

export function RoundDots({ total, current, revealed, ended }: { total: number; current: number; revealed: boolean; ended?: boolean }) {
  return <ol className="round-dots" aria-label={`Phase ${current} trên ${total}`}>
    {Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      const state = ended || n < current || (n === current && revealed) ? "done" : n === current ? "current" : "todo";
      return <li key={n} className={`round-dot dot-${state}`}>{pad2(n)}</li>;
    })}
  </ol>;
}

export function BossRaidOverview({ room }: { room: PublicRoom }) {
  const players = Object.values(room.players || {});
  const clearedCount = players.filter((p) => (p.bossesDefeated ?? 0) >= 4).length;
  return (
    <div className="raid-overview">
      <div className="raid-phase-grid">
        {PHASES.map((ph) => {
          const fighting = players.filter((p) => (p.bossesDefeated ?? 0) < 4 && (p.phase ?? 1) === ph.phase).length;
          const passed = players.filter((p) => (p.bossesDefeated ?? 0) >= ph.phase).length;
          return (
            <div key={ph.phase} className="raid-phase-card" style={{ borderColor: ph.color }}>
              <div className="raid-phase-top">
                <span className="round-pill">PHASE 0{ph.phase} · {ph.bossHp} HP</span>
                <span className="raid-passed">{passed} đã vượt</span>
              </div>
              <strong><ShieldAlert size={14} /> {ph.bossName}</strong>
              <p>{ph.name} · 10 câu hỏi</p>
              <div className="raid-fighting">{fighting} người đang giao chiến</div>
            </div>
          );
        })}
      </div>
      <div className="raid-summary-bar">
        <span>⚡ Tổng đòn đã tung: <b>{room.answeredCount ?? 0}</b></span>
        <span>🏆 Phá đảo đủ 4 Boss: <b>{clearedCount}/{players.length}</b></span>
      </div>
    </div>
  );
}

export function AdminView(props: {
  roomCode: string; room: PublicRoom | null; busyAction: string; notice: string; error: string;
  onCreate: () => void; onStart: () => void; onReveal: () => void; onAdvance: () => void; onEnd: () => void;
  onReset: () => void; onKick: (entry: LeaderboardEntry) => void; onLeave: () => void;
}) {
  const { roomCode, room, busyAction } = props;
  const [copied, setCopied] = useState(false);
  const [demoArena, setDemoArena] = useState(false);
  const link = roomCode ? joinUrl(roomCode) : "";
  const qr = useQrCode(link, 300);
  const board = useMemo(() => sortBoard(room?.leaderboard), [room?.leaderboard]);
  const playerCount = Object.keys(room?.players || {}).length;

  const copy = () => void navigator.clipboard.writeText(link || roomCode).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); });

  return <section className="dashboard">
    <div className="dashboard-heading">
      <div><div className="eyebrow"><span className="eyebrow-line" /> BÀN ĐIỀU KHIỂN · ADMIN</div><h1>Vận hành <em>chiến dịch Pixel.</em></h1><p>Quản lý phòng, mở chiến dịch 4 Phase Boss (40 câu hỏi) và theo dõi tiến độ cả lớp.</p></div>
      <div className="heading-actions">
        <button type="button" className="button button-quiet" onClick={() => setDemoArena(!demoArena)}>
          <Gamepad2 size={16} /> {demoArena ? "ẨN SÀN ĐẤU DEMO" : "CHƠI THỬ PIXEL TRÊN MÁY NÀY"}
        </button>
        {roomCode && <a className="button button-quiet" href={presenterUrl(roomCode)} target="_blank" rel="noopener"><MonitorPlay size={16} /> MỞ MÀN HÌNH CHIẾU</a>}
        <button className="button button-quiet" onClick={props.onLeave}><LogOut size={16} /> Thoát</button>
      </div>
    </div>
    <Alerts error={props.error} notice={props.notice} wide />

    {demoArena && (
      <div style={{ marginBottom: 20 }}>
        <PixelArena playerName="Quản Trò (Demo)" />
      </div>
    )}

    {!roomCode ? <div className="admin-create-card">
      <div className="create-illustration"><Factory size={58} /><span className="spark spark-a">✳</span><span className="spark spark-b">✦</span></div>
      <div><span className="card-kicker">SẴN SÀNG ĐIỀU PHỐI</span><h2>Tạo một phòng chơi mới</h2>
        <p>Mã phòng ngẫu nhiên sẽ được tạo tự động. Mở màn hình chiếu để cả lớp quét QR tham gia (tối đa 30 người).</p>
        <button className="button button-primary" onClick={props.onCreate} disabled={busyAction === "create"}>{busyAction === "create" ? <span className="spinner" /> : <Factory size={17} />} TẠO PHÒNG</button></div>
    </div> : <>
      <div className="admin-grid">
        <section className="room-control-card panel">
          <div className="panel-top"><div><span className="card-kicker">PHÒNG ĐANG ĐIỀU KHIỂN</span><div className="room-code-large">{roomCode}</div></div><StatusBadge status={room?.status} /></div>
          <div className="room-meta"><span><UsersRound size={15} /> {playerCount} / {room?.maxPlayers ?? 30} người</span><span><Radio size={14} /> {room ? "ĐANG ĐỒNG BỘ" : "ĐANG KẾT NỐI"}</span></div>
          <button className="copy-room" onClick={copy}><Clipboard size={15} /> {copied ? "ĐÃ SAO CHÉP LIÊN KẾT" : "SAO CHÉP LIÊN KẾT THAM GIA"}</button>

          {room?.status === "waiting" && <button className="button button-primary control-action" disabled={busyAction === "start" || !playerCount} onClick={props.onStart}>
            {busyAction === "start" ? <span className="spinner" /> : <Play size={17} fill="currentColor" />} {playerCount ? "PHÁT LỆNH TẤN CÔNG (BẮT ĐẦU 4 PHASE)" : "CHỜ NGƯỜI CHƠI THAM GIA…"}</button>}

          {room?.status === "active" && <div className="control-actions">
            <button className="button button-primary control-action" disabled={busyAction === "end"} onClick={props.onEnd}>
              {busyAction === "end" ? <span className="spinner" /> : <Check size={17} />} TỔNG KẾT & VINH DANH TOP 3
            </button>
            <button className="button button-danger-outline" disabled={busyAction === "reset"} onClick={() => { if (confirm("Đặt lại phòng về trạng thái chờ?")) props.onReset(); }}><Square size={13} /> Đặt lại phòng</button>
          </div>}

          {room?.status === "ended" && <div className="control-actions">
            <div className="ended-message"><Check size={18} /> Chiến dịch đã hoàn thành.</div>
            <button className="button button-primary control-action" disabled={busyAction === "reset"} onClick={() => { if (confirm("Chơi lại với cùng người chơi? Điểm sẽ về 0.")) props.onReset(); }}><RotateCcw size={16} /> CHƠI LẠI VỚI ĐỘI NÀY</button>
            <button className="button button-quiet" disabled={busyAction === "create"} onClick={props.onCreate}><Factory size={15} /> TẠO PHÒNG MỚI</button>
          </div>}
        </section>

        <section className="qr-card panel">
          <div className="qr-heading"><div><span className="card-kicker">LỐI VÀO NGƯỜI CHƠI (4G / WI-FI)</span><h3>Quét để tham gia</h3></div><QrCode size={20} /></div>
          {qr ? <img className="qr-image" src={qr} alt={`QR tham gia phòng ${roomCode}`} /> : <div className="qr-placeholder"><QrCode size={32} /></div>}
          <p><a className="join-link" href={link} target="_blank" rel="noopener">{link.replace(/^https?:\/\//, "")} <ExternalLink size={10} /></a></p>
        </section>
      </div>

      {room && <div className="game-admin-grid">
        <section className="panel question-panel">
          <div className="panel-heading">
            <div><span className="card-kicker">TIẾN ĐỘ CHIẾN DỊCH PIXEL 4 BOSS</span>
              <h2>{room.status === "waiting" ? "Đang chờ đội hình" : room.status === "ended" ? "Tổng kết chiến dịch" : "Đội hình đang công phá 4 Boss"}</h2></div>
          </div>
          {room.status === "active" && <BossRaidOverview room={room} />}
          {room.status === "waiting" && <div className="waiting-state"><div className="waiting-icon"><UsersRound size={24} /></div><div><strong>Đội hình đang tập hợp</strong><span>Khi bấm Bắt đầu, toàn bộ người chơi sẽ điều khiển nhân vật bằng WASD / D-Pad đánh 4 Phase Boss (10 câu/Phase, đúng 6 câu hạ Boss).</span></div></div>}
          {room.status === "ended" && <Podium board={board} />}
        </section>
        <Leaderboard board={board} players={room.players} onKick={props.onKick} limit={12} />
      </div>}
    </>}
  </section>;
}
