import { useMemo } from "react";
import { Flame, LogOut, Radio, RefreshCw, Trophy } from "lucide-react";
import type { PublicRoom } from "../lib/contracts";
import { submitAnswer } from "../lib/api";
import { Alerts, SoundToggle, StatusBadge } from "../components/ui";
import { Leaderboard, sortBoard } from "../components/Leaderboard";
import { Confetti, Podium } from "../components/GameWidgets";
import { PixelArena, type BossHitEvent } from "../components/PixelArena";

export type PlayerSession = { uid: string; roomCode: string; displayName: string };

export function PlayerView({ session, room, roomError, onLeave }: {
  session: PlayerSession; room: PublicRoom | null; roomError: string; onLeave: () => void;
}) {
  const board = useMemo(() => sortBoard(room?.leaderboard), [room?.leaderboard]);
  const me = room?.players?.[session.uid];
  const myRank = board.find((entry) => entry.uid === session.uid)?.rank;

  const handleBossHit = (event: BossHitEvent) => {
    void submitAnswer({
      roomCode: session.roomCode,
      phase: event.phase,
      questionId: event.questionId,
      answer: event.answer,
      elapsedMs: event.elapsedMs,
    }).catch(() => {});
  };

  return (
    <section className="dashboard player-dashboard">
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> TRẠM CHIẾN ĐẤU PIXEL · {session.roomCode}</div>
          <h1>Chiến binh <em>{session.displayName}.</em></h1>
          <p>Điều khiển công nhân bằng WASD / D-Pad, chạm trạm [?] để nạp đòn tri thức hạ 4 Boss!</p>
        </div>
        <div className="heading-actions">
          <SoundToggle compact />
          <button className="button button-quiet" onClick={onLeave}><LogOut size={16} /> Rời phòng</button>
        </div>
      </div>
      <Alerts error={roomError} wide />

      {!room ? (
        <div className="panel connect-panel">
          <span className="spinner dark-spinner" />
          <div><strong>Đang kết nối với phòng {session.roomCode}</strong><span>Đang tải dữ liệu xưởng máy…</span></div>
        </div>
      ) : (
        <>
          <div className="player-summary">
            <div className="summary-status">
              <StatusBadge status={room.status} />
              <span className="live-label"><Radio size={14} /> ĐỒNG BỘ REALTIME</span>
            </div>
            <div className="summary-score">
              <div><span>HẠNG</span><strong>{myRank ? `#${myRank}` : "—"}</strong></div>
              <div className="score-divider" />
              <div><span>ĐIỂM</span><strong className="score-pop" key={me?.score}>{me?.score ?? 0}<small>đ</small></strong></div>
              <div className="score-divider" />
              <div><span>BOSS HẠ</span><strong>{me?.bossesDefeated ?? 0}<small>/4</small></strong></div>
              {(me?.streak ?? 0) >= 2 && (
                <>
                  <div className="score-divider" />
                  <div><span>CHUỖI</span><strong className="streak-value"><Flame size={16} />{me?.streak}</strong></div>
                </>
              )}
            </div>
          </div>

          {room.status === "waiting" && (
            <div className="waiting-banner panel">
              <div className="waiting-icon"><RefreshCw size={22} className="spin-slow" /></div>
              <div>
                <span className="card-kicker">ĐÃ VÀO XƯỞNG · CHUẨN BỊ CHIẾN ĐẤU</span>
                <h2>Chờ quản trò phát lệnh tấn công!</h2>
                <p>Khi bắt đầu, bạn sẽ điều khiển nhân vật bằng <b>WASD / Phím mũi tên</b> (hoặc nút D-Pad trên điện thoại) vượt qua 4 Phase Boss (mỗi Boss 6 HP = 6 câu đúng trên 10 câu).</p>
              </div>
              <span className="waiting-count">{Object.keys(room.players || {}).length}<small>/{room.maxPlayers ?? 30}</small></span>
            </div>
          )}

          {room.status === "active" && (
            <div className="player-game-grid">
              <PixelArena
                playerName={session.displayName}
                initialPhase={me?.phase ?? 1}
                initialScore={me?.score ?? 0}
                onBossHit={handleBossHit}
              />
              <Leaderboard board={board} players={room.players} currentUid={session.uid} limit={12} />
            </div>
          )}

          {room.status === "ended" && (
            <div className="ended-layout">
              {myRank && myRank <= 3 && <Confetti />}
              <div className="ended-banner panel">
                <Trophy size={28} />
                <div>
                  <span className="card-kicker">CHIẾN DỊCH HOÀN TẤT</span>
                  <h2>{myRank === 1 ? "Bạn là Anh Hùng Giải Cứu Xưởng Máy! 🏆" : "Chiến dịch đã khép lại!"}</h2>
                  <p>Hạng #{myRank ?? "—"} · {me?.score ?? 0} điểm · Hạ {me?.bossesDefeated ?? 0}/4 Boss ({me?.correctCount ?? 0} đòn chuẩn xác).</p>
                </div>
              </div>
              <div className="panel podium-panel"><Podium board={board} /></div>
              <Leaderboard board={board} players={room.players} currentUid={session.uid} title="Bảng vàng chung cuộc" limit={15} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
