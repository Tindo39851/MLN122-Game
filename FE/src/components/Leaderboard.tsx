import { useState } from "react";
import { ChevronRight, Flame, Shield, Trophy, UserX, UsersRound } from "lucide-react";
import type { LeaderboardEntry, Player } from "../lib/contracts";

export function sortBoard(source?: Record<string, LeaderboardEntry>): LeaderboardEntry[] {
  return Object.entries(source || {}).sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);
}

export function Leaderboard({ board, players, currentUid, onKick, title = "Tiến độ chiến dịch", limit = 8 }: {
  board: LeaderboardEntry[]; players?: Record<string, Player>; currentUid?: string;
  onKick?: (entry: LeaderboardEntry) => void; title?: string; limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? board : board.slice(0, limit);
  return <section className="panel leaderboard-panel" aria-label="Bảng xếp hạng">
    <div className="leaderboard-heading">
      <div><span className="card-kicker">BẢNG XẾP HẠNG REALTIME</span><h3>{title}</h3></div>
      <div className="leaderboard-total" title="Số người chơi"><UsersRound size={15} /> {Object.keys(players || {}).length}</div>
    </div>
    {!board.length ? <div className="empty-board"><UsersRound size={22} /><span>Chưa có người chơi tham gia.</span></div> :
      <ol className="leaderboard-list">{rows.map((entry, i) => {
        const defeated = entry.bossesDefeated ?? 0;
        const cleared = defeated >= 4;
        const phase = entry.phase ?? 1;
        const hp = entry.bossHp ?? 6;
        return (
          <li className={`leader-row ${entry.uid === currentUid ? "me-row" : ""} ${i < 3 ? `top-${i}` : ""} ${onKick ? "with-kick" : ""}`} key={entry.uid}>
            <span className="leader-rank">{entry.rank === 1 && entry.score > 0 ? <Trophy size={15} aria-label="Hạng 1" /> : String(entry.rank).padStart(2, "0")}</span>
            <span className="leader-avatar" aria-hidden="true">{entry.displayName.slice(0, 1).toLocaleUpperCase("vi")}</span>
            <span className="leader-name">
              {entry.displayName}
              {entry.uid === currentUid && <small>BẠN</small>}
              {(entry.streak ?? 0) >= 2 && <span className="streak-chip" title={`Chuỗi ${entry.streak} câu đúng`}><Flame size={11} />{entry.streak}</span>}
            </span>
            <span className="leader-correct" title="Phase và máu Boss hiện tại">
              {cleared ? "🏆 4/4 BOSS" : <><Shield size={10} /> P{phase} ({hp}HP)</>}
            </span>
            <strong className="leader-score">{entry.score}<small>đ</small></strong>
            {onKick && <button type="button" className="kick-button" onClick={() => onKick(entry)} aria-label={`Mời ${entry.displayName} rời phòng`} title="Mời rời phòng"><UserX size={14} /></button>}
          </li>
        );
      })}</ol>}
    {board.length > limit && <button type="button" className="show-more" onClick={() => setExpanded(!expanded)}>
      {expanded ? "Thu gọn" : `Xem tất cả ${board.length} người`} <ChevronRight size={14} className={expanded ? "rotate-up" : ""} />
    </button>}
  </section>;
}
