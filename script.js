// file: script.js
// Спрайты мобов вшиты как пиксельные карты: 8x8 на моба, палитра символами.
// Никаких внешних запросов — работает офлайн и на GitHub Pages.

const SPRITES = {
  "Зомби": {
    weight: 20,
    palette: { g: "#3fa34d", d: "#2b6f35", k: "#1b1b1b", s: "#6b4f2a", w: "#e8f0e8" },
    map: [
      "gggggggg",
      "gwwggwwg",
      "gkggggkg",
      "ggkkkkgg",
      "gddggddg",
      "gsdggdsg",
      "gggggggg",
      "gddggddg",
    ],
  },
  "Скелет": {
    weight: 18,
    palette: { w: "#e8e8e0", d: "#b8b8b0", k: "#1b1b1b" },
    map: [
      "wwwwwwww",
      "wkwwwwkw",
      "wwwwwwww",
      "wwwkkwww",
      "wwdwwdww",
      "wwwwwwww",
      "wdwwwwdw",
      "wwwwwwww",
    ],
  },
  "Паук": {
    weight: 16,
    palette: { k: "#2a2a2a", d: "#141414", r: "#c03030" },
    map: [
      "kddkkddk",
      "dkdkkdkd",
      "kkrk krkk".replace(" ", "k"),
      "dkrkkrkd",
      "kkkkkkkk",
      "dkdkkdkd",
      "kdkddkdk",
      "dkkddkkd",
    ],
  },
  "Крипер": {
    weight: 14,
    palette: { g: "#4fbf5f", d: "#2f8f3f", k: "#0f2f17" },
    map: [
      "gggggggg",
      "gkkggkkg",
      "gkkggkkg",
      "gggkkggg",
      "ggkkkkgg",
      "ggkggkgg",
      "gggggggg",
      "gdgggdgg",
    ],
  },
  "Ведьма": {
    weight: 10,
    palette: { p: "#6b4f8a", d: "#3d2b52", s: "#c9a06b", k: "#1b1b1b" },
    map: [
      "pppppppp",
      "pdpddpdp",
      "dppppppd",
      "dksssskd",
      "dssssssd",
      "dpsssspd",
      "dppppppd",
      "dppddppd",
    ],
  },
  "Эндермен": {
    weight: 8,
    palette: { k: "#141418", p: "#7a4fbf", m: "#c98aff" },
    map: [
      "kkkkkkkk",
      "kmkkkkmk",
      "kkkkkkkk",
      "kkmmmmkk",
      "kkkkkkkk",
      "kppkkppk",
      "kkkkkkkk",
      "kpkkkkpk",
    ],
  },
  "Ифрит": {
    weight: 6,
    palette: { y: "#ffcc33", o: "#e07a1f", k: "#3a1f0a" },
    map: [
      "yyyyyyyy",
      "ykkyykky",
      "yyyyyyyy",
      "yykkkkyy",
      "yyyyyyyy",
      "yoyyyyoy",
      "yyoyyoyy",
      "yyyyyyyy",
    ],
  },
  "Свинозомби": {
    weight: 5,
    palette: { g: "#3fa34d", p: "#e08aa8", d: "#2b6f35", k: "#1b1b1b" },
    map: [
      "gggggggg",
      "gkggggkg",
      "ggppppgg",
      "ggpkkpgg",
      "gddggddg",
      "gggggggg",
      "gddggddg",
      "gggggggg",
    ],
  },
  "Гаст": {
    weight: 3,
    palette: { w: "#e8e8e8", d: "#b8b8b8", k: "#1b1b1b", t: "#9aa0a6" },
    map: [
      "wwwwwwww",
      "wkwwwwkw",
      "wwwwwwww",
      "wwkkkkww",
      "wwwwwwww",
      "wdwwwwdw",
      "wwddddww",
      "twwwwwwt",
    ],
  },
  "Иссушитель": {
    weight: 1,
    palette: { k: "#1a1a1a", d: "#0a0a0a", b: "#3a5a8a" },
    map: [
      "kkkkkkkk",
      "kbkkkkbk",
      "kkkkkkkk",
      "kkbkkbkk",
      "kkkkkkkk",
      "kdkddkdk",
      "kkkkkkkk",
      "kdkkkkdk",
    ],
  },
};

const MOBS = Object.entries(SPRITES).map(([name, data], i) => ({ name, ...data, index: i }));
const COLORS = ["#2fe06a", "#1f8f4a", "#3ac77a", "#176b39", "#4be08f", "#239c55", "#2bb86a", "#1a7a42", "#57e89a", "#14532d"];
const SEG = MOBS.length;
const TAU = Math.PI * 2;

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const overlay = document.getElementById("overlay");
const resultImg = document.getElementById("result-img");
const resultName = document.getElementById("result-name");
const closeBtn = document.getElementById("close");

const DPR = Math.min(window.devicePixelRatio || 1, 2);
let rotation = -Math.PI / 2;
let spinning = false;

// Генерация спрайта моба в offscreen canvas
function renderSprite(mob, size = 64) {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const g = c.getContext("2d");
  const px = size / 8;
  g.imageSmoothingEnabled = false;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const ch = mob.map[y][x];
      const color = mob.palette[ch];
      if (color) { g.fillStyle = color; g.fillRect(x * px, y * px, px, px); }
    }
  }
  return c;
}

const SPRITE_CACHE = MOBS.map((m) => renderSprite(m, 128));
const SPRITE_SMALL = MOBS.map((m) => renderSprite(m, 64));

function setupCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * DPR;
  canvas.height = rect.height * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawWheel();
}

function drawWheel() {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2 - 4;
  const segAngle = TAU / SEG;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  for (let i = 0; i < SEG; i++) {
    const a0 = i * segAngle;
    const a1 = a0 + segAngle;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const mid = a0 + segAngle / 2;
    const imgR = r * 0.68;
    const ix = Math.cos(mid) * imgR;
    const iy = Math.sin(mid) * imgR;
    const size = Math.min(w, h) * 0.13;
    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(mid + Math.PI / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(SPRITE_SMALL[i], -size / 2, -size / 2, size, size);
    ctx.restore();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#0b0f14";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, 0, TAU);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(91,255,138,.5)";
  ctx.stroke();
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function weightedPick() {
  const total = MOBS.reduce((s, m) => s + m.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < MOBS.length; i++) {
    r -= MOBS[i].weight;
    if (r <= 0) return i;
  }
  return MOBS.length - 1;
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;

  const idx = weightedPick();
  const segAngle = TAU / SEG;
  const targetCenter = idx * segAngle + segAngle / 2;
  const extra = TAU * (6 + Math.floor(Math.random() * 4));
  const finalRotation = -Math.PI / 2 - targetCenter + extra;

  const startRot = rotation;
  const delta = ((finalRotation - startRot) % TAU + TAU) % TAU + TAU * 7;
  const duration = 4200 + Math.random() * 900;
  const t0 = performance.now();

  function frame(now) {
    const t = Math.min((now - t0) / duration, 1);
    rotation = startRot + delta * easeOutCubic(t);
    drawWheel();
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      rotation = ((rotation % TAU) + TAU) % TAU;
      showResult(idx);
    }
  }
  requestAnimationFrame(frame);
}

function showResult(idx) {
  const mob = MOBS[idx];
  // Результат — крупный data-URL из offscreen canvas
  const big = renderSprite(mob, 512);
  resultImg.src = big.toDataURL("image/png");
  resultImg.alt = mob.name;
  resultName.textContent = mob.name;
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
  spinning = false;
  spinBtn.disabled = false;
}

function hideResult() {
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
}

spinBtn.addEventListener("click", spin);
closeBtn.addEventListener("click", hideResult);
overlay.addEventListener("click", (e) => { if (e.target === overlay) hideResult(); });
window.addEventListener("resize", setupCanvas);

window.addEventListener("load", setupCanvas);
setupCanvas();
