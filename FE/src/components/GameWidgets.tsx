import { BookOpen, Check, Heart, Medal, Shield, Skull, Swords, Trophy, X, Zap } from "lucide-react";
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

/** Hộp thoại Luật chơi & Hướng dẫn từ Thua đến Thắng. */
export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="pixel-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="pixel-modal" style={{ maxWidth: 680, maxHeight: "86vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="pixel-modal-head">
          <span className="round-pill"><BookOpen size={13} /> CẨM NANG CÔNG NHÂN · LUẬT CHƠI TỪ A–Z</span>
          <button type="button" className="button button-ghost" style={{ padding: "4px 10px" }} onClick={onClose}>
            <X size={15} /> Đóng
          </button>
        </div>

        <h3 style={{ marginBottom: 8 }}>⚔️ Cách chơi “Giải Cứu Xưởng Máy” (4 Phase Boss · 40 Câu hỏi)</h3>
        <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: 14 }}>
          Bạn điều khiển <b>Công Nhân Tiên Phong</b> vượt qua <b>4 Phase Trùm Tư Bản</b>. Mỗi Phase gồm <b>10 câu hỏi</b> trắc nghiệm Kinh tế chính trị Mác – Lênin và Boss có <b>6 HP</b>.
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          <div className="panel" style={{ padding: 12 }}>
            <strong>🎮 1. Điều khiển & Tấn công Boss</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55 }}>
              <li><b>Di chuyển né đạn</b>: Phím <b>W, A, S, D</b> hoặc <b>Mũi tên (▲▼◀▶)</b> trên máy tính, hoặc cụm <b>D-Pad cảm ứng</b> trên điện thoại.</li>
              <li><b>Nạp đòn đánh Boss</b>: Đi chạm vào ô năng lượng <b>[?]</b> màu vàng trên sân <i>(hoặc bấm phím <b>Space</b> / nút <b>Mở câu hỏi</b>)</i>.</li>
              <li><b>Trả lời nhanh trong 25 giây</b>: Bấm phím <b>1 – 4</b> hoặc <b>A – D</b>. Trả lời <b>ĐÚNG</b> sẽ bắn tia sét trừ <b>-1 HP Boss</b> và cộng điểm (<b>+100đ</b> gốc + thưởng tốc độ + thưởng chuỗi Combo).</li>
            </ul>
          </div>

          <div className="panel" style={{ padding: 12 }}>
            <strong><Shield size={15} style={{ verticalAlign: "-2px" }} /> 2. Vật phẩm hỗ trợ trên sân Pixel</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55 }}>
              <li><b>🛡️ Khiên Công Đoàn (Combo x3)</b>: Trả lời đúng <b>3 câu liên tiếp</b> sẽ bật vòng khiên xanh lá quanh người, giúp <b>chặn miễn phí 1 viên đạn của Boss</b> mà không mất Tim.</li>
              <li><b>➕ Hộp Cứu Thương [+]</b>: Khi bạn mất máu vì trúng đạn, định kỳ trên sàn xưởng sẽ xuất hiện ô <b>[+] màu xanh lá</b>. Chạy tới nhặt để <b>hồi +1 Tim ❤️</b> (tối đa 5 Tim).</li>
            </ul>
          </div>

          <div className="panel" style={{ padding: 12, borderLeft: "4px solid #e63946" }}>
            <strong><Skull size={15} style={{ verticalAlign: "-2px", color: "#e63946" }} /> 3. Khi nào bị xử THUA CUỘC (GAME OVER)?</strong>
            <p style={{ margin: "4px 0", fontSize: 13.5 }}>Bạn bắt đầu mỗi Phase với <b>5 Tim (<Heart size={12} fill="#e63946" color="#e63946" /> 5/5)</b>. Bạn sẽ bị xử <b>Thất bại</b> ngay lập tức nếu rơi vào 1 trong 2 trường hợp:</p>
            <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55 }}>
              <li><b>💔 Hết sạch 5 Tim (0/5 ❤️)</b>: Trả lời <b>SAI</b> (-1 Tim), để <b>hết giờ 25s</b> (-1 Tim), hoặc bị <b>đạn Boss bắn trúng</b> (-1 Tim) làm cạn sạch cả 5 Tim.</li>
              <li><b>🚨 Sai 5/10 câu hỏi trong 1 Phase (Không đủ đòn hạ Boss)</b>: Mỗi Phase chỉ có 10 câu hỏi nhưng Boss có <b>6 HP</b> (bắt buộc đúng ít nhất 6/10 câu). Nếu bạn trả lời <b>sai đến câu thứ 5</b>, số câu còn lại không đủ để hạ Boss nên sẽ xử thua ngay!</li>
              <li><b>🔄 Cơ chế Phục thù</b>: Khi thua, bạn có thể chọn <b>Phục thù lại Phase hiện tại</b> (hồi lại 5 Tim, Boss hồi 6 HP, trộn lại 10 câu hỏi, điểm quay về mốc đầu Phase) hoặc <b>Chơi mới từ Phase 1</b>.</li>
            </ul>
          </div>

          <div className="panel" style={{ padding: 12, borderLeft: "4px solid #2b8a3e" }}>
            <strong><Trophy size={15} style={{ verticalAlign: "-2px", color: "#2b8a3e" }} /> 4. Khi nào giành CHIẾN THẮNG (PHÁ ĐẢO)?</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55 }}>
              <li><b>Qua từng Phase (<Zap size={12} /> Hạ Boss)</b>: Trả lời đúng đủ <b>6 câu</b> trong Phase → Boss nổ tung (<b>+300đ thưởng hạ Boss</b>) và mở <b>Cổng Dịch Chuyển</b> giữa sân. Bước vào cổng để sang Phase tiếp theo (được hồi đầy lại 5 Tim).</li>
              <li><b>🏆 PHÁ ĐẢO CẢ 4 PHASE</b>: Đánh bại cả 4 Trùm Tư Bản (<i>Quản Đốc Ca Đêm → Cỗ Máy Kéo Giờ → Lò Nung Siêu Ngạch → Đại Tư Bản Độc Quyền</i>) để giải phóng hoàn toàn xưởng máy và ghi danh lên <b>Bảng Vàng Xếp Hạng</b>!</li>
            </ul>
          </div>
        </div>

        <div className="pixel-feedback-actions" style={{ marginTop: 14 }}>
          <button type="button" className="button button-primary" onClick={onClose}>
            <Swords size={16} /> ĐÃ HIỂU LUẬT — VÀO CHIẾN NGAY!
          </button>
        </div>
      </div>
    </div>
  );
}
