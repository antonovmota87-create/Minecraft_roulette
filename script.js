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

const COLORS = [
  "#e53935", "#8e24aa", "#3949ab", "#1e88e5",
  "#00897b", "#43a047", "#f4511e", "#6d4c41"
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const resultEl = document.getElementById("result");

const N = MOBS.length;
const SEG = (Math.PI * 2) / N;
const R = canvas.width / 2;
const CX = R, CY = R;

let angle = 0;
let spinning = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < N; i++) {
    const start = i * SEG + angle;
    const end = start + SEG;

    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R - 4, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "#1b1b1f";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(start + SEG / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.fillText(MOBS[i].name, R - 18, 0);
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText(MOBS[i].emoji, R - 150, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(CX, CY, 34, 0, Math.PI * 2);
  ctx.fillStyle = "#1b1b1f";
  ctx.fill();
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = "…";

  // Скрываем оверлей с прошлого раза, если он еще висит
  const reveal = document.getElementById("mob-reveal");
  reveal.classList.add("hidden");
  reveal.classList.remove("show");

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

  // Показ оверлея с анимацией
  const reveal = document.getElementById("mob-reveal");
  const emojiEl = document.getElementById("reveal-emoji");
  const nameEl = document.getElementById("reveal-name");

  emojiEl.textContent = mob.emoji;
  nameEl.textContent = mob.name;

  // Перезапуск анимации (сброс классов и перезапись)
  reveal.classList.remove("hidden", "show");
  emojiEl.style.animation = "none";
  nameEl.style.animation = "none";

  // Принудительный reflow для перезапуска анимации
  void emojiEl.offsetWidth;
  void nameEl.offsetWidth;

  emojiEl.style.animation = "";
  nameEl.style.animation = "";

  reveal.classList.add("show");

  // Скрыть через 3 секунды
  setTimeout(() => {
    reveal.classList.remove("show");
    setTimeout(() => reveal.classList.add("hidden"), 300);
  }, 3000);
}

spinBtn.addEventListener("click", spin);
drawWheel();
