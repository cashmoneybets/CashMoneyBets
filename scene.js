/* ============ CASHMONEY·BETS — NEBULA BACKGROUND ============ */
const scene = document.getElementById("scene");
const sctx = scene.getContext("2d");
let SW, SH, stars = [], clouds = [], shooting = [], smouse = { x: 0.5, y: 0.5 };

const CLOUD_COLORS = [
  [245, 196, 81, 0.10],
  [139, 92, 246, 0.12],
  [46, 255, 160, 0.07],
  [255, 210, 74, 0.04],
];

function sceneResize() {
  SW = scene.width = innerWidth * devicePixelRatio;
  SH = scene.height = innerHeight * devicePixelRatio;
  scene.style.width = innerWidth + "px";
  scene.style.height = innerHeight + "px";
  buildStars();
}

function buildStars() {
  stars = [];
  const n = Math.min(340, Math.floor((innerWidth * innerHeight) / 4000));
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * SW, y: Math.random() * SH,
      r: (Math.random() * 1.4 + 0.3) * devicePixelRatio,
      tw: Math.random() * Math.PI * 2,
      ts: 0.008 + Math.random() * 0.02,
      depth: Math.random() * 0.8 + 0.2,
      hue: Math.random() < 0.12 ? (Math.random() < 0.5 ? "245,196,81" : "46,255,160") : "255,255,255",
    });
  }
}

function buildClouds() {
  clouds = [];
  for (let i = 0; i < 7; i++) {
    clouds.push({
      x: Math.random(), y: Math.random(),
      r: 0.28 + Math.random() * 0.4,
      c: CLOUD_COLORS[i % CLOUD_COLORS.length],
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.0001,
      ph: Math.random() * Math.PI * 2,
    });
  }
}

function drawScene() {
  sctx.clearRect(0, 0, SW, SH);
  for (const c of clouds) {
    c.x += c.vx; c.y += c.vy; c.ph += 0.004;
    if (c.x < -0.3) c.x = 1.3; if (c.x > 1.3) c.x = -0.3;
    if (c.y < -0.3) c.y = 1.3; if (c.y > 1.3) c.y = -0.3;
    const px = (c.x + (smouse.x - 0.5) * 0.05) * SW;
    const py = (c.y + (smouse.y - 0.5) * 0.05) * SH;
    const r = c.r * Math.max(SW, SH) * (1 + Math.sin(c.ph) * 0.12);
    const g = sctx.createRadialGradient(px, py, 0, px, py, r);
    const [cr, cg, cb, ca] = c.c;
    g.addColorStop(0, `rgba(${cr},${cg},${cb},${ca})`);
    g.addColorStop(0.55, `rgba(${cr},${cg},${cb},${ca * 0.4})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    sctx.fillStyle = g;
    sctx.beginPath(); sctx.arc(px, py, r, 0, Math.PI * 2); sctx.fill();
  }
  for (const s of stars) {
    s.tw += s.ts;
    const a = 0.35 + Math.abs(Math.sin(s.tw)) * 0.65;
    const px = s.x + (smouse.x - 0.5) * 24 * s.depth * devicePixelRatio;
    const py = s.y + (smouse.y - 0.5) * 24 * s.depth * devicePixelRatio;
    sctx.fillStyle = `rgba(${s.hue},${a * 0.9})`;
    sctx.beginPath(); sctx.arc(px, py, s.r, 0, Math.PI * 2); sctx.fill();
  }
  if (Math.random() < 0.006 && shooting.length < 2) {
    shooting.push({
      x: Math.random() * SW * 0.8, y: Math.random() * SH * 0.35,
      vx: (6 + Math.random() * 6) * devicePixelRatio,
      vy: (2.5 + Math.random() * 3) * devicePixelRatio,
      life: 1,
    });
  }
  for (let i = shooting.length - 1; i >= 0; i--) {
    const s = shooting[i];
    s.x += s.vx; s.y += s.vy; s.life -= 0.02;
    if (s.life <= 0) { shooting.splice(i, 1); continue; }
    const grad = sctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8);
    grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    sctx.strokeStyle = grad;
    sctx.lineWidth = 1.6 * devicePixelRatio;
    sctx.beginPath(); sctx.moveTo(s.x, s.y);
    sctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8); sctx.stroke();
  }
  requestAnimationFrame(drawScene);
}

addEventListener("mousemove", e => { smouse.x = e.clientX / innerWidth; smouse.y = e.clientY / innerHeight; });
addEventListener("resize", sceneResize);
sceneResize(); buildClouds(); drawScene();
