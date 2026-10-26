import { useMemo, useState } from "react";
import { Gamepad2, QrCode, Trophy, UsersRound } from "lucide-react";
import type { PublicRoom } from "../lib/contracts";
import { joinUrl, useQrCode } from "../lib/join";
import { SoundToggle, StatusBadge } from "../components/ui";
import { Leaderboard, sortBoard } from "../components/Leaderboard";
import { Confetti, Podium } from "../components/GameWidgets";
import { PixelArena } from "../components/PixelArena";
import { BossRaidOverview } from "./AdminView";

export function PresenterView({ roomCode, room, error }: { roomCode: string; room: PublicRoom | null; error: string }) {
  const link = joinUrl(roomCode);
  const qr = useQrCode(link, 360);
  const [showDemo, setShowDemo] = useState(false);
  const board = useMemo(() => sortBoard(room?.leaderboard), [room?.leaderboard]);
  const playerCount = Object.keys(room?.players || {}).length;

  return <section className="dashboard presenter-dashboard">
    <div className="dashboard-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line" /> MÀN HÌNH CHIẾU · PHÒNG {roomCode}</div>
        <h1>
          {room?.status === "ended" ? <>Tổng kết <em>chiến dịch.</em></> :
            room?.status === "active" ? <>Chiến dịch <em>Đánh 4 Boss Pixel.</em></> :
              <>Quét mã để <em>vào xưởng.</em></>}
        </h1>
      </div>
      <div className="heading-actions">
        <button type="button" className="button button-quiet" onClick={() => setShowDemo(!showDemo)}>
          <Gamepad2 size={16} /> {showDemo ? "XEM TIẾN ĐỘ LỚP" : "ĐÁNH BOSS TRỰC TIẾP TRÊN MÁY CHIẾU"}
        </button>
        <SoundToggle />
        <StatusBadge status={room?.status} />
      </div>
    </div>

    {error && <div className="alert alert-error wide-alert">{error}</div>}
    {!room ? <div className="panel connect-panel"><span className="spinner dark-spinner" /><div><strong>Đang kết nối phòng {roomCode}…</strong><span>Hãy mở trang này từ tài khoản Admin hoặc sau khi đã vào phòng.</span></div></div> : <>
      {room.status === "waiting" && <div className="presenter-lobby">
        <div className="panel presenter-qr-panel">
          {qr ? <img className="presenter-qr" src={qr} alt={`QR phòng ${roomCode}`} /> : <QrCode size={120} />}
          <div>
            <span className="card-kicker">MÃ PHÒNG</span>
            <div className="presenter-code">{roomCode}</div>
            <p className="presenter-url">{link.replace(/^https?:\/\//, "")}</p>
            <div className="presenter-count"><UsersRound size={20} /> {playerCount} / {room.maxPlayers ?? 30} chiến binh đã sẵn sàng</div>
          </div>
        </div>
        <Leaderboard board={board} players={room.players} title="Đội hình đã điểm danh" limit={15} />
      </div>}

      {room.status === "active" && <div className="presenter-stage">
        <div className="panel presenter-question">
          {showDemo ? (
            <PixelArena playerName="Máy Chiếu" />
          ) : (
            <>
              <span className="card-kicker">TRỰC TIẾP · 4 PHASE × 10 CÂU HỎI (ĐÚNG 6 CÂU HẠ BOSS)</span>
              <h2 className="presenter-prompt">Ai sẽ phá đảo cả 4 Trùm Xưởng Máy nhanh nhất?</h2>
              <BossRaidOverview room={room} />
            </>
          )}
        </div>
        <Leaderboard board={board} players={room.players} limit={12} />
      </div>}

      {room.status === "ended" && <div className="ended-layout">
        <Confetti />
        <div className="ended-banner panel"><Trophy size={32} /><div><span className="card-kicker">CHIẾN DỊCH HOÀN TẤT</span><h2>Bảng vàng giải cứu xưởng máy</h2></div></div>
        <div className="panel podium-panel"><Podium board={board} /></div>
        <Leaderboard board={board} players={room.players} title="Xếp hạng toàn xưởng" limit={15} />
      </div>}
    </>}
  </section>;
}
