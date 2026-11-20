const MOBS = [
  { name: "Зомби",      emoji: "🧟" },
  { name: "Скелет",     emoji: "💀" },
  { name: "Крипер",     emoji: "💥" },
  { name: "Паук",       emoji: "🕷️" },
  { name: "Эндермен",   emoji: "🖤" },
  { name: "Слизень",    emoji: "🟢" },
  { name: "Гаст",       emoji: "👻" },
  { name: "Пиглин",     emoji: "🐷" },
  { name: "Хоглин",     emoji: "🐗" },
  { name: "Витер",      emoji: "☠️" },
  { name: "Дракон Края", emoji: "🐉" },
  { name: "Железный голем", emoji: "🤖" },
  { name: "Деревенский житель", emoji: "🧑‍🌾" },
  { name: "Корова",     emoji: "🐄" },
  { name: "Свинья",     emoji: "🐖" },
  { name: "Курица",     emoji: "🐔" },
];

// Пиксельная палитра
const COLORS = [
  "#aa0000", "#800080", "#0000aa", "#000080",
  "#008080", "#00aa00", "#ff5555", "#5c3a21"
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const fxCanvas = document.getElementById("fx");
const fx = fxCanvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const resultEl = document.getElementById("result");

const N = MOBS.length;
const SEG = (Math.PI * 2) / N;
const R = canvas.width / 2;
const CX = R, CY = R;

let angle = 0;
let spinning = false;
let fxActive = false;
let fxStart = 0;
let hitColor = "#fff";

// Отключаем сглаживание на канвасах для четких пикселей
ctx.imageSmoothingEnabled = false;
fx.imageSmoothingEnabled = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < N; i++) {
    const start = i * SEG + angle;
    const end = start + SEG;

    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R - 8, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    
    // Жирная черная обводка секторов
    ctx.strokeStyle = "#1b1b1f";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Текст с обводкой
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(start + SEG / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    // Название моба (пиксельный шрифт)
    ctx.font = "16px 'Minecraft', monospace";
    
    // Черная тень
    ctx.fillStyle = "#1b1b1f";
    ctx.fillText(MOBS[i].name, R - 14, 2);
    ctx.fillText(MOBS[i].name, R - 16, 2);
    
    // Белый текст
    ctx.fillStyle = "#fff";
    ctx.fillText(MOBS[i].name, R - 15, 0);
    
    // Эмодзи
    ctx.font = "20px sans-serif"; // Эмодзи оставляем обычным
    ctx.fillText(MOBS[i].emoji, R - 150, 0);
    ctx.restore();
  }

  // Центральный круг с жесткой пиксельной обводкой
  ctx.beginPath();
  ctx.arc(CX, CY, 34, 0, Math.PI * 2);
  ctx.fillStyle = "#1b1b1f";
  ctx.fill();
  ctx.strokeStyle = "#aaaaaa";
  ctx.lineWidth = 6;
  ctx.stroke();
}

function startFx(color) {
  hitColor = color;
  fxActive = true;
  fxStart = performance.now();
  requestAnimationFrame(animateFx);
}

function animateFx(now) {
  if (!fxActive) return;
  const t = (now - fxStart) / 1400; // 1.4 сек

  if (t >= 1) {
    fxActive = false;
    fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    return;
  }

  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  const easeOut = 1 - Math.pow(1 - t, 2);
  const alpha = 1 - t;

  // 1. Пиксельные квадратные лучи вместо линий
  const rayCount = 24;
  const maxLen = R * 0.9;
  fx.save();
  fx.translate(CX, CY);
  fx.fillStyle = hitColor;
  fx.globalAlpha = alpha;
  
  for (let i = 0; i < rayCount; i++) {
    const a = (Math.PI * 2 / rayCount) * i;
    const len = maxLen * easeOut * (0.5 + Math.random() * 0.5);
    const x = Math.cos(a) * len;
    const y = Math.sin(a) * len;
    
    // Рисуем квадраты (пиксели)
    fx.fillRect(x - 4, y - 4, 8, 8);
    fx.fillRect(Math.cos(a) * (len * 0.5) - 2, Math.sin(a) * (len * 0.5) - 2, 4, 4);
  }
  fx.restore();

  // 2. Кольца (рисуем пунктиром для пиксельности)
  const rings = 3;
  for (let i = 0; i < rings; i++) {
    const ringProgress = Math.max(0, t - i * 0.15);
    if (ringProgress <= 0) continue;
    const ringR = 40 + (R * 0.85) * (1 - Math.pow(1 - ringProgress, 2));
    fx.beginPath();
    fx.arc(CX, CY, ringR, 0, Math.PI * 2);
    fx.strokeStyle = hitColor;
    fx.lineWidth = 8;
    fx.setLineDash([10, 10]); // Квадратный пунктир
    fx.globalAlpha = (1 - ringProgress) * 0.8;
    fx.stroke();
  }
  fx.setLineDash([]);

  // 3. Вспышка в центре
  if (t < 0.3) {
    const flashT = t / 0.3;
    fx.fillStyle = `rgba(255,255,255,${0.9 * (1 - flashT)})`;
    fx.globalAlpha = 1;
    fx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);
  }

  fx.globalAlpha = 1;
  requestAnimationFrame(animateFx);
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = "…";

  fxActive = false;
  fx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  const extraTurns = 6 + Math.random() * 4;
  const target = angle + extraTurns * Math.PI * 2 + Math.random() * Math.PI * 2;
  const start = angle;
  const duration = 4200;
  const t0 = performance.now();

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    const t = Math.min((now - t0) / duration, 1);
    angle = start + (target - start) * easeOutCubic(t);
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      angle = target % (Math.PI * 2);
      spinning = false;
      spinBtn.disabled = false;
      showResult();
    }
  }
  requestAnimationFrame(frame);
}

function showResult() {
  const pointer = (-Math.PI / 2 - angle) % (Math.PI * 2);
  const norm = (pointer + Math.PI * 2) % (Math.PI * 2);
  const index = Math.floor(norm / SEG) % N;
  const mob = MOBS[index];
  resultEl.textContent = `Выпал: ${mob.emoji} ${mob.name}`;

  const color = COLORS[index % COLORS.length];
  startFx(color);
}

spinBtn.addEventListener("click", spin);
drawWheel();
