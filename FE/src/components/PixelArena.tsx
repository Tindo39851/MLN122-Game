import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Flame, Heart, RotateCcw, Shield, ShieldAlert, Skull, Sparkles, Swords, Trophy, X, Zap } from "lucide-react";
import { PHASES, SCORING, TOTAL_PHASES, type PhaseQuestion } from "../lib/phases";
import { sfx, unlockAudio } from "../lib/sound";
import { Confetti, RulesModal } from "./GameWidgets";
import { letter } from "./ui";

interface Orb {
  id: number;
  x: number;
  y: number;
  bob: number;
}

interface Medkit {
  x: number;
  y: number;
  life: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  r: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface Beam {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  life: number;
}

export interface BossHitEvent {
  phase: number;
  questionId: string;
  answer: string;
  elapsedMs: number;
  correct: boolean;
  points: number;
  bossHpLeft: number;
  bossesDefeated: number;
}

const W = 640;
const H = 360;

// Bảng màu sprite pixel
const PALETTE: Record<string, string> = {
  Y: "#f4d35e", // mũ bảo hộ vàng
  R: "#e63946", // sao đỏ / khăn
  S: "#f4a261", // da
  B: "#1d3557", // áo công nhân xanh đậm
  C: "#457b9d", // quần xanh
  W: "#ffffff", // mắt / sáng
  K: "#111618", // viền tối
  L: "#d8f06f", // năng lượng xanh chuối
  O: "#ff9f1c", // lửa cam
  P: "#9d4edd", // tím độc quyền
  M: "#8d99ae", // thép máy
};

const WORKER_SPRITE = [
  "....YYYY....",
  "...YYRYYY...",
  "...YSSSSY...",
  "...SKSSKS...",
  "....SSSS....",
  "..BBBBBBBB..",
  ".BBBLBBLBBB.",
  ".BB.BBBB.BB.",
  "....CCCC....",
  "...CC..CC...",
  "...CC..CC...",
  "..KK....KK..",
];

const BOSS_SPRITES: string[][] = [
  // Phase 1: Quản Đốc Ca Đêm
  [
    "....KKKKKK....",
    "...KKKKKKKK...",
    "..KKKKKKKKKK..",
    "...SSKSSKSS...",
    "...SSRRRRSS...",
    ".BBBBYYYYBBBB.",
    "BBBBYYKYYBBBBB",
    "BBBBYYYYYBBBBB",
    ".BBBBBBBBBBBB.",
    "..BBBB..BBBB..",
    "..KKKK..KKKK..",
  ],
  // Phase 2: Cỗ Máy Kéo Giờ
  [
    ".MM..MMMMMM..MM.",
    "MMMM.MLLLLMM.MMM",
    ".MMM.MKLKLM.MMM.",
    "..MMMMMMMMMMMM..",
    "OO.MMYYYYYYMM.OO",
    "OO.MMYKKKKYMM.OO",
    "..MM.YYYYYY.MM..",
    ".MMM.MMMMMM.MMM.",
    "MMMM..MMMM..MMMM",
    ".MM...KKKK...MM.",
  ],
  // Phase 3: Lò Nung Siêu Ngạch
  [
    "...OO..RR..OO...",
    "..OOOO.RR.OOOO..",
    ".OOOOOOOOOOOOOO.",
    ".OOMMMMMMMMMMOO.",
    ".MMKRRRRRRRRKMM.",
    "MMMRRYYYYYYRRMMM",
    "MMMRRYWWWWYRRMMM",
    ".MMRRRRRRRRRRMM.",
    "..MMMMMMMMMMMM..",
    "...KKKKKKKKKK...",
  ],
  // Phase 4: Đại Tư Bản Độc Quyền
  [
    "..YYYY.YY.YYYY..",
    ".YYYYYYYYYYYYYY.",
    "..PPPPPPPPPPPP..",
    ".PPPKWPPPPWKPPP.",
    "PPPPPPPPPPPPPPPP",
    "PPYYYYPPPPYYYYPP",
    "PPYOOYPPPPYOOYPP",
    ".PPPPPPPPPPPPPP.",
    "..PPPP.PP.PPPP..",
    "..KKKK.KK.KKKK..",
  ],
];

function drawSprite(ctx: CanvasRenderingContext2D, grid: string[], cx: number, cy: number, scale: number, flash = false) {
  const rows = grid.length;
  const cols = grid[0].length;
  const startX = Math.round(cx - (cols * scale) / 2);
  const startY = Math.round(cy - (rows * scale) / 2);
  for (let r = 0; r < rows; r++) {
    const row = grid[r];
    for (let c = 0; c < cols; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      ctx.fillStyle = flash ? "#ffffff" : (PALETTE[ch] || "#ffffff");
      ctx.fillRect(startX + c * scale, startY + r * scale, scale, scale);
    }
  }
}

export function PixelArena({
  playerName,
  initialPhase = 1,
  initialScore = 0,
  onBossHit,
  onVictory,
}: {
  playerName: string;
  initialPhase?: number;
  initialScore?: number;
  onBossHit?: (event: BossHitEvent) => void;
  onVictory?: (totalScore: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(Math.max(0, Math.min(TOTAL_PHASES - 1, initialPhase - 1)));
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const currentPhase = PHASES[phaseIdx];

  // Trộn ngẫu nhiên 10 câu hỏi của Phase hiện tại mỗi khi vào Phase hoặc Phục thù lại Phase
  const phaseQuestions = useMemo(() => {
    const copy = [...currentPhase.questions];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [currentPhase.questions, shuffleSeed]);

  const [bossHp, setBossHp] = useState(currentPhase.bossHp);
  const [playerHp, setPlayerHp] = useState(5);
  const [hasShield, setHasShield] = useState(false);
  const [score, setScore] = useState(initialScore);
  const [phaseStartScore, setPhaseStartScore] = useState(initialScore);
  const [streak, setStreak] = useState(0);
  const [correctTotal, setCorrectTotal] = useState(0);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<PhaseQuestion | null>(null);
  const [questionOpenedAt, setQuestionOpenedAt] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(25);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    timeout?: boolean;
    points: number;
    correctLabel: string;
    explanation: string;
  } | null>(null);
  const [phaseCleared, setPhaseCleared] = useState(false);
  const [allCleared, setAllCleared] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<"out_of_hearts" | "not_enough_questions" | null>(null);
  const [showRules, setShowRules] = useState(false);

  // Số câu hỏi tối đa được phép sai trong 1 Phase (10 câu - 6 HP Boss = tối đa 4 câu sai; sai câu thứ 5 là thua)
  const maxAllowedWrong = currentPhase.questions.length - currentPhase.bossHp;

  // Trạng thái vật lý trong Canvas (ref để vòng lặp 60fps không re-render React)
  const stateRef = useRef({
    px: 130,
    py: H / 2,
    vx: 0,
    vy: 0,
    invuln: 0,
    bossX: W - 125,
    bossY: H / 2,
    bossDir: 1,
    bossFlash: 0,
    shotCooldown: 70,
    frame: 0,
    keys: new Set<string>(),
    touchDir: { x: 0, y: 0 },
    orbs: [] as Orb[],
    medkit: null as Medkit | null,
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    floats: [] as FloatText[],
    beams: [] as Beam[],
    portalOpen: false,
  });

  const spawnOrbs = useCallback(() => {
    const s = stateRef.current;
    s.orbs = [
      { id: 1, x: 180 + Math.random() * 140, y: 75 + Math.random() * 65, bob: 0 },
      { id: 2, x: 160 + Math.random() * 160, y: H - 85 - Math.random() * 60, bob: 2 },
      { id: 3, x: 260 + Math.random() * 110, y: H / 2 + (Math.random() - 0.5) * 90, bob: 4 },
    ];
  }, []);

  useEffect(() => {
    spawnOrbs();
  }, [phaseIdx, shuffleSeed, spawnOrbs]);

  const pickNextQuestion = useCallback((): PhaseQuestion | null => {
    const unasked = phaseQuestions.filter((q) => !askedIds.includes(q.id));
    return unasked.length > 0 ? unasked[0] : null;
  }, [phaseQuestions, askedIds]);

  const openQuestionModal = useCallback(() => {
    if (activeQuestion || feedback || phaseCleared || allCleared || gameOverReason) return;
    const q = pickNextQuestion();
    if (!q) {
      setGameOverReason("not_enough_questions");
      return;
    }
    unlockAudio();
    sfx.select();
    // Xóa đạn đang bay sát người & cấp khiên bảo vệ tạm thời khi vừa mở/đóng câu hỏi
    stateRef.current.bullets = [];
    stateRef.current.shotCooldown = 85;
    stateRef.current.invuln = 160;
    setActiveQuestion(q);
    setQuestionOpenedAt(Date.now());
    setQuestionTimer(25);
  }, [activeQuestion, feedback, phaseCleared, allCleared, gameOverReason, pickNextQuestion]);

  const spawnExplosion = (x: number, y: number, color: string, count = 28) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 4.5;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : "#ffffff",
        life: 28 + Math.floor(Math.random() * 18),
        size: 4 + Math.floor(Math.random() * 4),
      });
    }
  };

  const resetArenaEntities = () => {
    const s = stateRef.current;
    s.bullets = [];
    s.medkit = null;
    s.portalOpen = false;
    s.px = 110;
    s.py = H / 2;
    s.invuln = 0;
  };

  const retryCurrentPhase = useCallback(() => {
    unlockAudio();
    sfx.start();
    resetArenaEntities();
    setBossHp(currentPhase.bossHp);
    setPlayerHp(5);
    setHasShield(false);
    setStreak(0);
    setScore(phaseStartScore);
    setAskedIds([]);
    setWrongIds([]);
    setPhaseCleared(false);
    setFeedback(null);
    setGameOverReason(null);
    setShuffleSeed((n) => n + 1);
  }, [currentPhase.bossHp, phaseStartScore]);

  const restartFromPhaseOne = useCallback(() => {
    unlockAudio();
    sfx.start();
    resetArenaEntities();
    setPhaseIdx(0);
    setBossHp(PHASES[0].bossHp);
    setPlayerHp(5);
    setHasShield(false);
    setStreak(0);
    setScore(0);
    setPhaseStartScore(0);
    setCorrectTotal(0);
    setAskedIds([]);
    setWrongIds([]);
    setPhaseCleared(false);
    setAllCleared(false);
    setFeedback(null);
    setGameOverReason(null);
    setShuffleSeed((n) => n + 1);
  }, []);

  const goNextPhase = useCallback(() => {
    unlockAudio();
    sfx.start();
    resetArenaEntities();
    if (phaseIdx + 1 < TOTAL_PHASES) {
      const next = phaseIdx + 1;
      setPhaseIdx(next);
      setBossHp(PHASES[next].bossHp);
      setPlayerHp(5);
      setPhaseStartScore(score);
      setAskedIds([]);
      setWrongIds([]);
      setPhaseCleared(false);
      setFeedback(null);
      setGameOverReason(null);
      setShuffleSeed((n) => n + 1);
    } else {
      setAllCleared(true);
      sfx.fanfare();
      onVictory?.(score);
    }
  }, [phaseIdx, onVictory, score]);

  const handleAnswer = useCallback((optionId: string) => {
    if (!activeQuestion) return;
    unlockAudio();
    const q = activeQuestion;
    const isTimeout = optionId === "__TIMEOUT__";
    const elapsedMs = isTimeout ? 25_000 : Math.max(200, Date.now() - questionOpenedAt);
    const correct = !isTimeout && optionId === q.correct;
    const s = stateRef.current;

    const nextAskedIds = askedIds.includes(q.id) ? askedIds : [...askedIds, q.id];
    setAskedIds(nextAskedIds);
    setActiveQuestion(null);

    let gained = 0;
    let nextHp = bossHp;
    let nextPlayerHp = playerHp;
    let nextWrongIds = wrongIds;
    let defeatedCount = phaseIdx;

    if (correct) {
      sfx.correct();
      const speedBonus = Math.round(SCORING.speedBonus * Math.max(0, 1 - elapsedMs / 25_000));
      const nextStreak = streak + 1;
      const streakBonus = Math.min((nextStreak - 1) * SCORING.streakBonus, SCORING.maxStreakBonus);
      gained = SCORING.base + speedBonus + streakBonus;
      nextHp = Math.max(0, bossHp - 1);

      // Đạt chuỗi 3 câu đúng liên tiếp -> Kích hoạt Khiên Công Đoàn đỡ 1 đạn Boss
      if (nextStreak >= 3 && !hasShield) {
        setHasShield(true);
        s.floats.push({ x: s.px - 24, y: s.py - 36, text: "🛡️ KHIÊN COMBO x3!", color: "#52b788", life: 55 });
      }

      // Hiệu ứng tia chưởng từ Công Nhân sang Boss
      s.beams.push({
        fromX: s.px + 18,
        fromY: s.py,
        toX: s.bossX,
        toY: s.bossY,
        color: currentPhase.accent,
        life: 22,
      });
      s.bossFlash = 18;
      spawnExplosion(s.bossX, s.bossY, currentPhase.accent, 34);

      if (nextHp === 0) {
        gained += SCORING.bossKillBonus;
        defeatedCount = phaseIdx + 1;
        spawnExplosion(s.bossX, s.bossY, "#ffd166", 65);
        s.floats.push({ x: s.bossX - 40, y: s.bossY - 30, text: `HẠ BOSS! +${SCORING.bossKillBonus}đ`, color: "#ffd166", life: 65 });
        s.portalOpen = true;
        s.bullets = [];
        s.medkit = null;
        setPhaseCleared(true);
        sfx.fanfare();
      } else {
        s.floats.push({ x: s.bossX - 30, y: s.bossY - 25, text: `-1 HP! +${gained}đ`, color: "#d8f06f", life: 45 });
      }

      setBossHp(nextHp);
      setStreak(nextStreak);
      setCorrectTotal((c) => c + 1);
      setScore((prev) => prev + gained);
    } else {
      sfx.wrong();
      setStreak(0);
      nextWrongIds = wrongIds.includes(q.id) ? wrongIds : [...wrongIds, q.id];
      setWrongIds(nextWrongIds);
      nextPlayerHp = Math.max(0, playerHp - 1);
      setPlayerHp(nextPlayerHp);

      // Boss phản đòn
      s.beams.push({
        fromX: s.bossX - 24,
        fromY: s.bossY,
        toX: s.px,
        toY: s.py,
        color: "#e63946",
        life: 20,
      });
      s.invuln = 180;
      spawnExplosion(s.px, s.py, "#e63946", 22);
      s.floats.push({
        x: s.px - 24,
        y: s.py - 24,
        text: isTimeout ? "HẾT GIỜ! -1 TIM" : "SAI! -1 TIM",
        color: "#ff6b6b",
        life: 45,
      });
    }

    // Dọn sạch đạn đang bay và cấp 3 giây bất tử sau khi trả lời xong để không bị đạn đánh úp
    s.bullets = [];
    s.shotCooldown = 90;
    s.invuln = 180;

    // Kiểm tra điều kiện THUA CUỘC:
    // 1. Hết sạch 5 Tim (nextPlayerHp <= 0)
    // 2. Số câu hỏi còn lại trong Phase (10 - đã hỏi) < số HP còn lại của Boss (tức đã sai >= 5 câu)
    const remainingQuestions = currentPhase.questions.length - nextAskedIds.length;
    const willGameOver =
      nextPlayerHp <= 0
        ? "out_of_hearts"
        : nextHp > remainingQuestions
          ? "not_enough_questions"
          : null;

    const correctOpt = q.options.find((o) => o.id === q.correct)?.label ?? "";
    setFeedback({
      correct,
      timeout: isTimeout,
      points: gained,
      correctLabel: correctOpt,
      explanation: q.explanation,
    });

    if (willGameOver) {
      s.bullets = [];
      setGameOverReason(willGameOver);
    } else if (s.orbs.length < 2 && nextHp > 0) {
      spawnOrbs();
    }

    onBossHit?.({
      phase: currentPhase.phase,
      questionId: q.id,
      answer: optionId,
      elapsedMs,
      correct,
      points: gained,
      bossHpLeft: nextHp,
      bossesDefeated: defeatedCount,
    });
  }, [activeQuestion, questionOpenedAt, askedIds, bossHp, playerHp, wrongIds, phaseIdx, streak, hasShield, currentPhase, spawnOrbs, onBossHit]);

  // Đồng hồ đếm ngược 25s khi mở câu hỏi (về 0s tự động xử thua câu đó)
  useEffect(() => {
    if (!activeQuestion) return;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionOpenedAt) / 1000);
      const left = Math.max(0, 25 - elapsed);
      setQuestionTimer(left);
      if (left <= 5 && left > 0) sfx.tick();
      if (left === 0) {
        window.clearInterval(timer);
        handleAnswer("__TIMEOUT__");
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [activeQuestion, questionOpenedAt, handleAnswer]);

  // Lắng nghe phím WASD / Mũi tên / Space / Phím tắt 1-4 khi mở câu hỏi
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (activeQuestion) {
        const idx = ["1", "2", "3", "4"].indexOf(k) >= 0 ? ["1", "2", "3", "4"].indexOf(k) : ["a", "b", "c", "d"].indexOf(k);
        if (idx >= 0 && activeQuestion.options[idx]) {
          e.preventDefault();
          handleAnswer(activeQuestion.options[idx].id);
        }
        return;
      }
      if (feedback) {
        if (k === " " || k === "enter") {
          e.preventDefault();
          setFeedback(null);
        }
        return;
      }
      if (gameOverReason) return;
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
        stateRef.current.keys.add(k);
      } else if (k === " " || k === "e" || k === "enter") {
        e.preventDefault();
        if (phaseCleared) goNextPhase();
        else openQuestionModal();
      }
    };
    const up = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [activeQuestion, feedback, gameOverReason, phaseCleared, handleAnswer, openQuestionModal, goNextPhase]);

  // Vòng lặp game 60 FPS trên Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const paused = !!activeQuestion || !!feedback || allCleared || !!gameOverReason || showRules;

    const tick = () => {
      const s = stateRef.current;
      s.frame++;

      if (!paused) {
        // 1. Di chuyển nhân vật bằng WASD / Arrow / Touch D-Pad
        let dx = s.touchDir.x;
        let dy = s.touchDir.y;
        if (s.keys.has("w") || s.keys.has("arrowup")) dy -= 1;
        if (s.keys.has("s") || s.keys.has("arrowdown")) dy += 1;
        if (s.keys.has("a") || s.keys.has("arrowleft")) dx -= 1;
        if (s.keys.has("d") || s.keys.has("arrowright")) dx += 1;
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }
        const speed = 3.35;
        s.px = Math.max(36, Math.min(W - 190, s.px + dx * speed));
        s.py = Math.max(46, Math.min(H - 42, s.py + dy * speed));
        if (s.invuln > 0) s.invuln--;

        // 2. Sinh Hộp Cứu Thương Công Đoàn [+] nếu người chơi mất máu do đạn
        if (!s.portalOpen && playerHp < 5 && !s.medkit && s.frame % 360 === 0) {
          s.medkit = {
            x: 110 + Math.random() * 210,
            y: 70 + Math.random() * (H - 140),
            life: 420,
          };
        }
        if (s.medkit) {
          s.medkit.life--;
          if (Math.hypot(s.px - s.medkit.x, s.py - s.medkit.y) < 24) {
            s.medkit = null;
            sfx.correct();
            spawnExplosion(s.px, s.py, "#52b788", 16);
            s.floats.push({ x: s.px - 22, y: s.py - 24, text: "+1 TIM CỨU THƯƠNG!", color: "#52b788", life: 45 });
            setPlayerHp((hp) => Math.min(5, hp + 1));
          } else if (s.medkit.life <= 0) {
            s.medkit = null;
          }
        }

        // 3. Di chuyển Boss & bắn đạn (nếu Boss chưa bị hạ)
        if (!s.portalOpen) {
          s.bossY += s.bossDir * (0.95 + phaseIdx * 0.25);
          if (s.bossY < 72) { s.bossY = 72; s.bossDir = 1; }
          if (s.bossY > H - 72) { s.bossY = H - 72; s.bossDir = -1; }
          if (s.bossFlash > 0) s.bossFlash--;

          s.shotCooldown--;
          if (s.shotCooldown <= 0) {
            s.shotCooldown = Math.max(58, 96 - phaseIdx * 10);
            const angle = Math.atan2(s.py - s.bossY, s.px - s.bossX);
            const spread = phaseIdx >= 2 ? [-0.24, 0, 0.24] : [-0.14, 0.14];
            for (const offset of spread) {
              const spd = 1.65 + phaseIdx * 0.22;
              s.bullets.push({
                x: s.bossX - 28,
                y: s.bossY,
                vx: Math.cos(angle + offset) * spd,
                vy: Math.sin(angle + offset) * spd,
                color: currentPhase.accent,
                r: 6,
              });
            }
          }
        }

        // 4. Cập nhật đạn Boss & va chạm với Công Nhân
        s.bullets = s.bullets.filter((b) => {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < 10 || b.x > W - 10 || b.y < 10 || b.y > H - 10) return false;
          if (s.invuln <= 0 && Math.hypot(b.x - s.px, b.y - s.py) < 17) {
            s.invuln = 180; // 3 giây khiên bất tử sau khi trúng đạn hoặc vỡ khiên
            if (hasShield) {
              setHasShield(false);
              sfx.select();
              spawnExplosion(s.px, s.py, "#52b788", 24);
              s.floats.push({ x: s.px - 28, y: s.py - 22, text: "🛡️ KHIÊN ĐỠ + 3s BẤT TỬ!", color: "#52b788", life: 50 });
              return false;
            }
            sfx.wrong();
            spawnExplosion(s.px, s.py, "#e63946", 16);
            s.floats.push({ x: s.px - 18, y: s.py - 20, text: "-1 TIM!", color: "#ff6b6b", life: 35 });
            setPlayerHp((hp) => {
              const next = hp - 1;
              if (next <= 0) {
                s.bullets = [];
                setGameOverReason("out_of_hearts");
                return 0;
              }
              return next;
            });
            return false;
          }
          return true;
        });

        // 5. Chạm Trạm Năng Lượng (?) -> mở câu hỏi đánh Boss
        if (!s.portalOpen) {
          for (let i = 0; i < s.orbs.length; i++) {
            const o = s.orbs[i];
            if (Math.hypot(s.px - o.x, s.py - o.y) < 26) {
              s.orbs.splice(i, 1);
              openQuestionModal();
              break;
            }
          }
        } else {
          // Chạm cổng dịch chuyển khi đã hạ Boss
          const portalX = W / 2;
          const portalY = H / 2;
          if (Math.hypot(s.px - portalX, s.py - portalY) < 34) {
            goNextPhase();
          }
        }
      }

      // 6. Vẽ nền xưởng máy Pixel
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#12231d";
      ctx.fillRect(0, 0, W, H);

      // Lưới gạch sàn xưởng
      ctx.strokeStyle = "rgba(216, 240, 111, 0.08)";
      ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Dải băng chuyền trên & dưới
      ctx.fillStyle = "#1d382e";
      ctx.fillRect(0, 0, W, 26);
      ctx.fillRect(0, H - 26, W, 26);
      ctx.fillStyle = currentPhase.color;
      for (let x = (s.frame * 2) % 24 - 24; x < W; x += 24) {
        ctx.fillRect(x, 4, 12, 6);
        ctx.fillRect(W - x, H - 10, 12, 6);
      }

      // Vạch ranh giới vùng Boss
      ctx.strokeStyle = "rgba(255, 107, 107, 0.28)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(W - 180, 26);
      ctx.lineTo(W - 180, H - 26);
      ctx.stroke();
      ctx.setLineDash([]);

      // 7. Vẽ Trạm Năng Lượng Câu Hỏi (?)
      for (const o of s.orbs) {
        const by = o.y + Math.sin(s.frame * 0.08 + o.bob) * 4;
        ctx.fillStyle = "rgba(216, 240, 111, 0.22)";
        ctx.fillRect(o.x - 15, by - 15, 30, 30);
        ctx.fillStyle = "#d8f06f";
        ctx.fillRect(o.x - 11, by - 11, 22, 22);
        ctx.fillStyle = "#173b32";
        ctx.font = "bold 14px 'DM Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("?", o.x, by + 5);
      }

      // 7b. Vẽ Hộp Cứu Thương Công Đoàn [+]
      if (s.medkit) {
        const my = s.medkit.y + Math.sin(s.frame * 0.12) * 3;
        ctx.fillStyle = "rgba(82, 183, 136, 0.28)";
        ctx.fillRect(s.medkit.x - 14, my - 14, 28, 28);
        ctx.fillStyle = "#52b788";
        ctx.fillRect(s.medkit.x - 10, my - 10, 20, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px 'DM Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("+", s.medkit.x, my + 5);
      }

      // 8. Vẽ Cổng Dịch Chuyển nếu đã hạ Boss
      if (s.portalOpen) {
        const px = W / 2;
        const py = H / 2;
        const r = 26 + Math.sin(s.frame * 0.12) * 4;
        ctx.strokeStyle = "#d8f06f";
        ctx.lineWidth = 4;
        ctx.strokeRect(px - r, py - r, r * 2, r * 2);
        ctx.fillStyle = "rgba(216, 240, 111, 0.28)";
        ctx.fillRect(px - r + 4, py - r + 4, (r - 4) * 2, (r - 4) * 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px 'DM Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("CỔNG QUA PHASE", px, py - r - 8);
      }

      // 9. Vẽ Nhân Vật Công Nhân & Khiên Bảo Hộ
      const bobY = (s.keys.size > 0 || s.touchDir.x !== 0 || s.touchDir.y !== 0) ? Math.sin(s.frame * 0.35) * 2 : 0;
      if (hasShield || s.invuln > 0) {
        ctx.strokeStyle = hasShield ? "#52b788" : "#f4d35e";
        ctx.lineWidth = 2;
        ctx.strokeRect(s.px - 22, s.py + bobY - 22, 44, 44);
      }
      if (s.invuln % 4 < 3) {
        drawSprite(ctx, WORKER_SPRITE, s.px, s.py + bobY, 3);
        ctx.fillStyle = "#d8f06f";
        ctx.font = "bold 10px 'Be Vietnam Pro', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(playerName.slice(0, 12), s.px, s.py - 24);
      }

      // 10. Vẽ Boss (nếu chưa nổ tung)
      if (!s.portalOpen) {
        const bossSprite = BOSS_SPRITES[phaseIdx] ?? BOSS_SPRITES[0];
        drawSprite(ctx, bossSprite, s.bossX, s.bossY, 5, s.bossFlash > 0);
        // Thanh máu ngay trên đầu Boss
        const barW = 84;
        const hpRatio = Math.max(0, bossHp / currentPhase.bossHp);
        ctx.fillStyle = "#111618";
        ctx.fillRect(s.bossX - barW / 2 - 2, s.bossY - 46, barW + 4, 10);
        ctx.fillStyle = "#e63946";
        ctx.fillRect(s.bossX - barW / 2, s.bossY - 44, Math.round(barW * hpRatio), 6);
      }

      // 11. Vẽ Đạn Boss
      for (const b of s.bullets) {
        ctx.fillStyle = "#111618";
        ctx.fillRect(b.x - b.r - 1, b.y - b.r - 1, (b.r + 1) * 2, (b.r + 1) * 2);
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.r + 1, b.y - b.r + 1, (b.r - 1) * 2, (b.r - 1) * 2);
      }

      // 12. Vẽ Tia Chưởng Năng Lượng
      s.beams = s.beams.filter((bm) => {
        bm.life--;
        ctx.strokeStyle = bm.color;
        ctx.lineWidth = Math.max(2, bm.life / 2);
        ctx.beginPath();
        ctx.moveTo(bm.fromX, bm.fromY);
        ctx.lineTo(bm.toX, bm.toY);
        ctx.stroke();
        return bm.life > 0;
      });

      // 13. Vẽ Hạt Nổ Pixel
      s.particles = s.particles.filter((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        return pt.life > 0;
      });

      // 14. Vẽ Chữ Nổi (-1 HP, +Điểm)
      s.floats = s.floats.filter((fl) => {
        fl.y -= 0.7;
        fl.life--;
        ctx.fillStyle = fl.color;
        ctx.font = "bold 12px 'DM Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(fl.text, fl.x, fl.y);
        return fl.life > 0;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [activeQuestion, feedback, allCleared, gameOverReason, phaseIdx, bossHp, playerHp, hasShield, currentPhase, playerName, openQuestionModal, goNextPhase]);

  const setTouch = (x: number, y: number) => {
    stateRef.current.touchDir = { x, y };
  };

  if (allCleared) {
    return (
      <section className="panel pixel-victory-card">
        <Confetti pieces={80} />
        <div className="pixel-victory-badge"><Trophy size={36} /></div>
        <span className="card-kicker">PHÁ ĐẢO CẢ 4 PHASE BOSS!</span>
        <h2>Xưởng máy đã được giải phóng hoàn toàn!</h2>
        <p>Chúc mừng <strong>{playerName}</strong> đã đánh bại cả 4 trùm tư bản bằng tri thức Kinh tế chính trị Mác – Lênin!</p>
        <div className="pixel-victory-stats">
          <div><span>TỔNG ĐIỂM</span><strong>{score}đ</strong></div>
          <div><span>ĐÒN TRÚNG ĐÍCH</span><strong>{correctTotal} câu</strong></div>
          <div><span>BOSS ĐÃ HẠ</span><strong>4 / 4</strong></div>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={restartFromPhaseOne}
        >
          <Swords size={16} /> ĐÁNH LẠI TỪ PHASE 1
        </button>
      </section>
    );
  }

  return (
    <div className="pixel-arena-wrap">
      {phaseCleared && <Confetti pieces={50} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Thanh HUD Pixel trên cùng */}
      <div className="pixel-hud panel">
        <div className="pixel-hud-left">
          <span className="pixel-phase-tag">PHASE {currentPhase.phase}/{TOTAL_PHASES}</span>
          <strong>{currentPhase.name}</strong>
          <div className="pixel-hearts" aria-label={`Máu công nhân ${playerHp} trên 5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <Heart key={i} size={15} className={i < playerHp ? "heart-full" : "heart-empty"} fill={i < playerHp ? "#e63946" : "none"} />
            ))}
          </div>
          {hasShield && <span className="streak-chip"><Shield size={12} /> KHIÊN ĐỠ ĐẠN</span>}
        </div>

        <div className="pixel-boss-bar-wrap">
          <div className="pixel-boss-meta">
            <span><ShieldAlert size={14} /> BOSS: <b>{currentPhase.bossName}</b></span>
            <span>
              HP: <b>{bossHp}/{currentPhase.bossHp}</b> · Câu còn: <b>{currentPhase.questions.length - askedIds.length}</b> (Sai: {wrongIds.length}/{maxAllowedWrong + 1})
            </span>
          </div>
          <div className="pixel-boss-track">
            <div className="pixel-boss-fill" style={{ width: `${(bossHp / currentPhase.bossHp) * 100}%` }} />
          </div>
        </div>

        <div className="pixel-hud-right">
          <div><span>ĐIỂM</span><strong>{score}đ</strong></div>
          {streak >= 2 && <span className="streak-chip"><Flame size={12} /> x{streak}</span>}
          <button type="button" className="button button-ghost" style={{ padding: "5px 9px", fontSize: 12 }} onClick={() => setShowRules(true)}>
            <BookOpen size={14} /> Luật chơi
          </button>
        </div>
      </div>

      {/* Khung Canvas 2D Pixel */}
      <div className="pixel-stage-frame">
        <canvas ref={canvasRef} width={W} height={H} className="pixel-canvas" />

        {/* Hộp thoại câu hỏi bật lên khi chạm trạm (?) hoặc bấm Space */}
        {activeQuestion && (
          <div className="pixel-modal-backdrop" role="dialog" aria-modal="true">
            <div className="pixel-modal">
              <div className="pixel-modal-head">
                <span className="round-pill">⚡ ĐÒN TẤN CÔNG TRI THỨC · CÂU {askedIds.length + 1}/10</span>
                <span className={`pixel-timer ${questionTimer <= 5 ? "danger" : ""}`}>⏱ {questionTimer}s</span>
              </div>
              <h3>{activeQuestion.prompt}</h3>
              <div className="pixel-options">
                {activeQuestion.options.map((opt, idx) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="pixel-option-btn"
                    onClick={() => handleAnswer(opt.id)}
                  >
                    <span className="answer-letter">{letter(idx)}</span>
                    <span>{opt.label}</span>
                    <kbd className="pixel-kbd">{idx + 1}</kbd>
                  </button>
                ))}
              </div>
              <p className="pixel-modal-foot">Mẹo: Bấm phím <b>1 – 4</b> hoặc <b>A – D</b> trên bàn phím để tung đòn cực nhanh!</p>
            </div>
          </div>
        )}

        {/* Thông báo kết quả đòn đánh + giải thích kiến thức */}
        {feedback && (
          <div className="pixel-modal-backdrop" role="dialog" aria-modal="true">
            <div className={`pixel-modal pixel-feedback ${feedback.correct ? "is-hit" : "is-miss"}`}>
              <div className="pixel-feedback-head">
                <span className="result-icon">{feedback.correct ? <Check size={20} /> : <X size={20} />}</span>
                <div>
                  <strong>
                    {feedback.correct
                      ? bossHp === 0
                        ? `💥 KẾT LIỄU ${currentPhase.bossName}! (+${feedback.points}đ)`
                        : `⚡ TRÚNG ĐÍCH! BOSS -1 HP (+${feedback.points}đ)`
                      : feedback.timeout
                        ? "⏱ HẾT GIỜ! BOSS PHẢN CÔNG (-1 TIM)"
                        : "🛡️ ĐÒN ĐÁNH BỊ CHẶN! BOSS PHẢN CÔNG (-1 TIM)"}
                  </strong>
                  {!feedback.correct && <small>Đáp án đúng: <b>{feedback.correctLabel}</b></small>}
                </div>
              </div>
              <p className="pixel-explanation">{feedback.explanation}</p>
              <div className="pixel-feedback-actions">
                {bossHp === 0 ? (
                  <button type="button" className="button button-primary" onClick={goNextPhase}>
                    <Sparkles size={16} /> {phaseIdx + 1 < TOTAL_PHASES ? `VÀO PHASE ${phaseIdx + 2}` : "NHẬN CÚP CHIẾN THẮNG"}
                  </button>
                ) : gameOverReason ? (
                  <button type="button" className="button button-danger" onClick={() => setFeedback(null)}>
                    <Skull size={16} /> XEM KẾT QUẢ CA ĐẤU
                  </button>
                ) : (
                  <button type="button" className="button button-primary" onClick={() => setFeedback(null)}>
                    <Swords size={16} /> TIẾP TỤC CHIẾN ĐẤU (SPACE)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Màn hình GAME OVER khi hết sạch 5 Tim hoặc sai quá 4 câu trong 1 Phase */}
        {!feedback && gameOverReason && (
          <div className="pixel-modal-backdrop" role="dialog" aria-modal="true">
            <div className="pixel-modal pixel-feedback is-miss">
              <div className="pixel-feedback-head">
                <span className="result-icon"><Skull size={22} /></span>
                <div>
                  <strong>
                    {gameOverReason === "out_of_hearts"
                      ? `💔 CA KÍP GỤC NGÃ — HẾT SẠCH 5 TIM TẠI PHASE ${currentPhase.phase}!`
                      : `🚨 KHÔNG ĐỦ ĐÒN HẠ BOSS — ĐÃ SAI ${wrongIds.length}/10 CÂU!`}
                  </strong>
                  <small>
                    {gameOverReason === "out_of_hearts"
                      ? `Bạn đã cạn kiệt cả 5 Tim trước ${currentPhase.bossName}.`
                      : `Boss còn ${bossHp} HP nhưng trong Phase ${currentPhase.phase} chỉ còn ${currentPhase.questions.length - askedIds.length} câu hỏi (cần đúng ít nhất 6/10 câu để qua Phase).`}
                  </small>
                </div>
              </div>
              <div className="pixel-victory-stats" style={{ margin: "12px 0" }}>
                <div><span>DỪNG TẠI</span><strong>Phase {currentPhase.phase}/{TOTAL_PHASES}</strong></div>
                <div><span>ĐIỂM HIỆN TẠI</span><strong>{score}đ</strong></div>
                <div><span>BOSS ĐÃ HẠ</span><strong>{phaseIdx} / 4</strong></div>
              </div>
              <div className="pixel-feedback-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="button button-primary" onClick={retryCurrentPhase}>
                  <RotateCcw size={16} /> PHỤC THÙ LẠI PHASE {currentPhase.phase} (HỒI 5 TIM)
                </button>
                <button type="button" className="button button-ghost" onClick={restartFromPhaseOne}>
                  <Swords size={16} /> CHƠI MỚI TỪ PHASE 1
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Điều khiển: Hướng dẫn WASD + Nút nạp đòn nhanh + D-Pad cảm ứng cho điện thoại */}
      <div className="pixel-controls-bar panel">
        <div className="pixel-dpad" aria-label="Điều khiển di chuyển">
          <button
            type="button"
            className="dpad-btn dpad-up"
            onPointerDown={() => setTouch(0, -1)}
            onPointerUp={() => setTouch(0, 0)}
            onPointerLeave={() => setTouch(0, 0)}
          >W / ▲</button>
          <div className="dpad-mid">
            <button
              type="button"
              className="dpad-btn"
              onPointerDown={() => setTouch(-1, 0)}
              onPointerUp={() => setTouch(0, 0)}
              onPointerLeave={() => setTouch(0, 0)}
            >A / ◀</button>
            <button
              type="button"
              className="dpad-btn"
              onPointerDown={() => setTouch(1, 0)}
              onPointerUp={() => setTouch(0, 0)}
              onPointerLeave={() => setTouch(0, 0)}
            >D / ▶</button>
          </div>
          <button
            type="button"
            className="dpad-btn dpad-down"
            onPointerDown={() => setTouch(0, 1)}
            onPointerUp={() => setTouch(0, 0)}
            onPointerLeave={() => setTouch(0, 0)}
          >S / ▼</button>
        </div>

        <div className="pixel-guide">
          <strong>{currentPhase.bossTitle}</strong>
          <p>{currentPhase.intro}</p>
          <small>
            Luật: Đúng <b>6/10 câu</b> để hạ Boss · Sai <b>5 câu</b> hoặc mất hết <b>5 Tim ❤️</b> sẽ Thất bại! Chuỗi <b>Combo x3</b> bật Khiên đỡ đạn, nhặt <b>[+]</b> hồi Tim.
          </small>
        </div>

        <div className="pixel-action-btns">
          {phaseCleared ? (
            <button type="button" className="button button-primary attention" onClick={goNextPhase}>
              <Sparkles size={16} /> QUA PHASE {phaseIdx + 2}
            </button>
          ) : (
            <button type="button" className="button button-primary" onClick={openQuestionModal}>
              <Zap size={16} /> MỞ CÂU HỎI ĐÁNH BOSS (SPACE)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
