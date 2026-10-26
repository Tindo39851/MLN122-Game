/**
 * Hiệu ứng âm thanh tổng hợp bằng Web Audio API — không cần file asset.
 * Trạng thái tắt/bật lưu trong localStorage.
 */
const MUTE_KEY = "mln122-muted";
let ctx: AudioContext | null = null;
let muted = localStorage.getItem(MUTE_KEY) === "1";
const listeners = new Set<(muted: boolean) => void>();

export function isMuted() { return muted; }
export function setMuted(next: boolean) {
  muted = next;
  localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  listeners.forEach((listener) => listener(next));
  if (!next) unlockAudio();
}
export function onMuteChange(listener: (muted: boolean) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Trình duyệt chỉ cho phát âm thanh sau thao tác của người dùng: gọi hàm này trong click handler. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch { /* trình duyệt không hỗ trợ */ }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.18) {
  if (muted || !ctx || ctx.state !== "running") return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  tick: () => tone(880, 0, 0.07, "square", 0.05),
  urgent: () => tone(1320, 0, 0.09, "square", 0.08),
  select: () => tone(620, 0, 0.08, "triangle", 0.12),
  submit: () => { tone(523, 0, 0.1, "triangle"); tone(784, 0.08, 0.14, "triangle"); },
  correct: () => { tone(523, 0, 0.12, "triangle"); tone(659, 0.1, 0.12, "triangle"); tone(1047, 0.2, 0.3, "triangle"); },
  wrong: () => { tone(220, 0, 0.18, "sawtooth", 0.08); tone(165, 0.16, 0.3, "sawtooth", 0.08); },
  reveal: () => { tone(392, 0, 0.12); tone(523, 0.12, 0.12); tone(659, 0.24, 0.2); },
  start: () => { [262, 330, 392, 523].forEach((f, i) => tone(f, i * 0.09, 0.16, "triangle")); },
  fanfare: () => { [523, 523, 523, 659, 784, 1047].forEach((f, i) => tone(f, [0, .14, .28, .42, .62, .82][i], i === 5 ? .6 : .16, "triangle", .16)); },
  timeUp: () => tone(196, 0, 0.5, "square", 0.08),
};
