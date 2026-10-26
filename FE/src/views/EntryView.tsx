import type { FormEvent } from "react";
import { AlertCircle, ArrowRight, DoorOpen, Gamepad2, LockKeyhole, QrCode, Radio, ShieldCheck, UsersRound, Wrench } from "lucide-react";
import { Alerts } from "../components/ui";

export function EntryView(props: {
  username: string; password: string; roomInput: string; wantsAdmin: boolean; busy: boolean; error: string; notice: string;
  totalRounds: number; onUsername: (v: string) => void; onPassword: (v: string) => void; onRoom: (v: string) => void;
  onSubmit: (event: FormEvent) => void; onSoloPlay: () => void;
}) {
  const { wantsAdmin, busy } = props;
  return <section className="entry-layout">
    <div className="intro-panel">
      <div className="eyebrow"><span className="eyebrow-line" /> PIXEL BOSS RUSH · 4 PHASE · 40 CÂU HỎI</div>
      <h1>Giải cứu<br /><em>xưởng máy.</em></h1>
      <p className="intro-text">Điều khiển Công Nhân Tiên Phong bằng <b>WASD / D-Pad</b>, chạm trạm năng lượng <b>[?]</b> để tung đòn tri thức hạ gục 4 Trùm Tư Bản (mỗi Phase 10 câu hỏi, trúng 6 đòn sẽ hạ Boss qua màn)!</p>
      <div className="mission-stats">
        <div><strong>04</strong><span>PHASE BOSS</span></div>
        <i />
        <div><strong>40</strong><span>CÂU HỎI MLN122</span></div>
        <i />
        <div><strong>06</strong><span>ĐÒN HẠ 1 BOSS</span></div>
      </div>
      <div className="blueprint-art" aria-hidden="true">
        <div className="blueprint-grid" />
        <div className="gear gear-large spin-slow"><Wrench size={44} /></div>
        <div className="gear gear-small spin-reverse"><Wrench size={27} /></div>
        <div className="blueprint-tag">PIXEL ARENA · WASD + SPACE</div>
        <div className="blueprint-stamp">BOSS<br />RUSH</div>
        <div className="blueprint-label label-one">GIÁ TRỊ<br />THẶNG DƯ</div>
        <div className="blueprint-label label-two">TÍCH LŨY<br />TƯ BẢN</div>
      </div>
      <div style={{ marginTop: 18 }}>
        <button type="button" className="button button-primary" onClick={props.onSoloPlay}>
          <Gamepad2 size={17} /> ⚔️ CHƠI NGAY (SOLO PIXEL WASD — KHÔNG CẦN MÃ PHÒNG)
        </button>
      </div>
    </div>

    <div className="entry-card-wrap">
      <div className="card-index"><span>01</span><span>ĐIỂM DANH VÀO XƯỞNG</span></div>
      <div className="entry-card">
        <div className="card-icon"><DoorOpen size={22} /></div>
        <h2>{wantsAdmin ? "Xác thực quản trị" : "Vào phòng đua Top cả lớp"}</h2>
        <p>{wantsAdmin ? "Đăng nhập bằng tài khoản Admin đã được cấp quyền." : "Nhập tên hiển thị và mã phòng để thi đấu cùng cả lớp."}</p>
        <form onSubmit={props.onSubmit} className="entry-form">
          <label className="field-label" htmlFor="username">{wantsAdmin ? "TÊN TÀI KHOẢN" : "TÊN HIỂN THỊ"}</label>
          <div className="input-wrap"><UsersRound size={17} /><input id="username" autoComplete="username" value={props.username} onChange={(e) => props.onUsername(e.target.value)} placeholder="Ví dụ: Minh Anh" maxLength={32} required /></div>
          {wantsAdmin ? <>
            <div className="admin-email-hint"><ShieldCheck size={15} /> Email Admin được lấy từ cấu hình bảo mật.</div>
            <label className="field-label" htmlFor="password">MẬT KHẨU</label>
            <div className="input-wrap"><LockKeyhole size={17} /><input id="password" type="password" autoComplete="current-password" value={props.password} onChange={(e) => props.onPassword(e.target.value)} placeholder="Mật khẩu tài khoản Admin" required /></div>
          </> : <>
            <label className="field-label" htmlFor="room-code">MÃ PHÒNG</label>
            <div className="input-wrap code-input"><QrCode size={17} /><input id="room-code" autoComplete="off" inputMode="text" autoCapitalize="characters" value={props.roomInput} onChange={(e) => props.onRoom(e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 6))} placeholder="ABC234" maxLength={6} required /><span>6 KÝ TỰ</span></div>
            <div className="field-caption"><Radio size={13} /> Quét QR trên màn hình chiếu để tự điền mã phòng.</div>
          </>}
          <Alerts error={props.error} notice={props.notice} />
          <button className="button button-primary entry-submit" disabled={busy} type="submit">
            {busy ? <span className="spinner" /> : wantsAdmin ? <ShieldCheck size={17} /> : <ArrowRight size={17} />}
            {busy ? "ĐANG KẾT NỐI…" : wantsAdmin ? "ĐĂNG NHẬP ADMIN" : "VÀO PHÒNG CHƠI"}
          </button>
        </form>
        <div className="auth-note"><LockKeyhole size={13} /> Người chơi được xác thực ẩn danh bởi Firebase.</div>
      </div>
      <div className="entry-foot"><span>WASD để di chuyển</span><span>·</span><span>6 đòn hạ 1 Boss</span><span>·</span><span>Quản trò: gõ tên “admin”</span></div>
    </div>
  </section>;
}

export function SetupScreen({ missing, onSoloPlay }: { missing: string[]; onSoloPlay: () => void }) {
  return <div className="setup-screen"><div className="setup-card">
    <div className="card-icon"><AlertCircle size={22} /></div>
    <p className="eyebrow">CHƯA CẤU HÌNH FIREBASE CHO PHÒNG NHIỀU NGƯỜI</p>
    <h1>Bạn có thể chơi chế độ Solo ngay!</h1>
    <p>Để tạo phòng QR cho cả lớp trên Vercel, hãy thêm các biến môi trường bên dưới trong mục <b>Vercel → Settings → Environment Variables</b> (chỉ cần gói Firebase Spark miễn phí, không cần thẻ Visa):</p>
    <code>{missing.join(" · ")}</code>
    <div style={{ marginTop: 18 }}>
      <button type="button" className="button button-primary" style={{ width: "100%" }} onClick={onSoloPlay}>
        <Gamepad2 size={17} /> ⚔️ CHƠI NGAY (SOLO PIXEL WASD — KHÔNG CẦN FIREBASE)
      </button>
    </div>
  </div></div>;
}

export function LoadingScreen({ label = "Đang kết nối xưởng…" }: { label?: string }) {
  return <div className="setup-screen"><div className="connect-panel"><span className="spinner dark-spinner" /><div><strong>{label}</strong><span>Vui lòng chờ trong giây lát.</span></div></div></div>;
}
