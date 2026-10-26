import { Check, Medal, Trophy } from "lucide-react";
import type { CurrentQuestion, LeaderboardEntry, PublicAnswer } from "../lib/contracts";
import { letter } from "./ui";

/** Đồng hồ vòng tròn. Màu đổi theo thời gian còn lại; số giây luôn hiển thị để không phụ thuộc màu. */
export function Countdown({ remaining, fraction, size = "md", label = "GIÂY" }: {
  remaining: number | null; fraction: number; size?: "md" | "lg"; label?: string;
}) {
  if (remaining === null) return null;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const level = remaining <= 5 ? "danger" : remaining <= 10 ? "warn" : "ok";
  return <div className={`countdown countdown-${size} countdown-${level}`} role="timer" aria-live={remaining <= 5 ? "assertive" : "off"} aria-label={`Còn ${remaining} giây`}>
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle className="countdown-track" cx="50" cy="50" r={radius} />
      <circle className="countdown-bar" cx="50" cy="50" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - fraction)} />
    </svg>
    <div className="countdown-value"><strong>{remaining}</strong><span>{remaining === 0 ? "HẾT GIỜ" : label}</span></div>
  </div>;
}

/** Biểu đồ phân bố đáp án sau khi công bố. */
export function Distribution({ question, answer, large }: { question: CurrentQuestion; answer: PublicAnswer; large?: boolean }) {
  const counts = answer.distribution ?? {};
  const total = Math.max(1, answer.answeredCount ?? Object.values(counts).reduce((a, b) => a + b, 0));
  return <div className={`distribution ${large ? "distribution-lg" : ""}`}>
    {question.options.map((option, i) => {
      const count = counts[option.id] ?? 0;
      const percent = Math.round((count / total) * 100);
      const correct = option.id === answer.correctAnswer;
      return <div key={option.id} className={`dist-row ${correct ? "dist-correct" : ""}`}>
        <span className="dist-letter">{letter(i)}</span>
        <div className="dist-body">
          <div className="dist-label"><span>{option.label}</span>{correct && <span className="dist-tag"><Check size={12} /> ĐÁP ÁN ĐÚNG</span>}</div>
          <div className="dist-track"><div className="dist-fill" style={{ width: `${percent}%` }} /></div>
        </div>
        <span className="dist-count"><strong>{count}</strong><small>{percent}%</small></span>
      </div>;
    })}
    <p className="dist-foot">{answer.answeredCount ?? 0}/{answer.totalPlayers ?? 0} người đã trả lời</p>
  </div>;
}

/** Bục vinh danh Top 3. */
export function Podium({ board }: { board: LeaderboardEntry[] }) {
  const top = board.slice(0, 3);
  if (!top.length) return null;
  const order = [top[1], top[0], top[2]].filter(Boolean) as LeaderboardEntry[];
  return <div className="podium" aria-label="Bục vinh danh">
    {order.map((entry) => {
      const place = board.indexOf(entry) + 1;
      return <div key={entry.uid} className={`podium-slot podium-${place}`}>
        <div className="podium-avatar">{place === 1 ? <Trophy size={22} /> : <Medal size={20} />}</div>
        <strong className="podium-name">{entry.displayName}</strong>
        <span className="podium-score">{entry.score}đ · {entry.correctCount} đúng</span>
        <div className="podium-block"><span>{entry.rank}</span></div>
      </div>;
    })}
  </div>;
}

const COLORS = ["#d8f06f", "#24634f", "#f2c14e", "#e07a5f", "#81b29a", "#ffffff"];
/** Hoa giấy chúc mừng — tự ẩn khi người dùng bật giảm chuyển động (CSS). */
export function Confetti({ pieces = 70 }: { pieces?: number }) {
  return <div className="confetti" aria-hidden="true">
    {Array.from({ length: pieces }, (_, i) => <i key={i} style={{
      left: `${(i * 37) % 100}%`,
      background: COLORS[i % COLORS.length],
      animationDelay: `${(i % 14) * 0.08}s`,
      animationDuration: `${2.4 + (i % 7) * 0.25}s`,
      transform: `rotate(${i * 29}deg)`,
    }} />)}
  </div>;
}
