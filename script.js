// file: script.js
// Пиксельные спрайты мобов через Minecraft Wiki CDN (можно заменить на локальные /assets)
const MOBS = [
  { name: "Зомби",        img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/5/5c/Zombie_JE5_BE2.png/revision/latest?cb=20210609080910", weight: 20 },
  { name: "Скелет",       img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/9/9e/Skeleton_JE2_BE1.png/revision/latest?cb=20210609073725", weight: 18 },
  { name: "Паук",         img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/6/6e/Spider_JE4_BE3.png/revision/latest?cb=20210609075631", weight: 16 },
  { name: "Крипер",       img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/5/5d/Creeper_JE2_BE1.png/revision/latest?cb=20210609074059", weight: 14 },
  { name: "Ведьма",       img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/4/4d/Witch_JE2_BE1.png/revision/latest?cb=20210609081210", weight: 10 },
  { name: "Эндермен",     img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/8/8e/Enderman_JE2_BE1.png/revision/latest?cb=20210609074656", weight: 8 },
  { name: "Ифрит",        img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/7a/Blaze_JE2_BE1.png/revision/latest?cb=20210609075339", weight: 6 },
  { name: "Свинозомби",   img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/6/6d/Zombified_Piglin_JE5_BE3.png/revision/latest?cb=20210609080542", weight: 5 },
  { name: "Гаст",         img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/9/9b/Ghast_JE2_BE1.png/revision/latest?cb=20210609074307", weight: 3 },
  { name: "Иссушитель",   img: "https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/3a/Wither_JE1_BE1.png/revision/latest?cb=20210609081626", weight: 1 },
];

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
let rotation = -Math.PI / 2; // верх колеса
let spinning = false;

// Загрузка картинок заранее
const images = {};
MOBS.forEach((m, i) => {
  const im = new Image();
  im.crossOrigin = "anonymous";
  im.src = m.img;
  images[i] = im;
});

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

  // Внешнее кольцо
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

    // Спрайт моба
    const mid = a0 + segAngle / 2;
    const imgR = r * 0.72;
    const ix = Math.cos(mid) * imgR;
    const iy = Math.sin(mid) * imgR;
    const size = Math.min(w, h) * 0.11;
    const im = images[i];
    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(mid + Math.PI / 2);
    if (im && im.complete && im.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(im, -size / 2, -size / 2, size, size);
    }
    ctx.restore();
  }
  ctx.restore();

  // Обод
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
  // центр сегмента должен оказаться под стрелкой (верх, -PI/2)
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
      // нормализуем
      rotation = ((rotation % TAU) + TAU) % TAU;
      showResult(idx);
    }
  }
  requestAnimationFrame(frame);
}

function showResult(idx) {
  const mob = MOBS[idx];
  resultImg.src = mob.img;
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

// перерисовка по мере загрузки картинок
let loaded = 0;
MOBS.forEach((m, i) => {
  const im = images[i];
  im.onload = () => { loaded++; drawWheel(); };
  im.onerror = () => { drawWheel(); };
});

window.addEventListener("load", setupCanvas);
setupCanvas();
