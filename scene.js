/* ============ CASHMONEY·BETS — SCÈNE FOOTBALL INTERACTIVE (scroll-parallax) ============ */
const scene = document.getElementById("scene");
const sctx = scene.getContext("2d");
let SW, SH, scY = 0, scVel = 0, scGlow = 0;
const smouse = { x: 0.5, y: 0.5 };
let dust = [];

function sceneResize() {
  SW = scene.width = innerWidth * devicePixelRatio;
  SH = scene.height = innerHeight * devicePixelRatio;
  scene.style.width = innerWidth + "px";
  scene.style.height = innerHeight + "px";
  buildDust();
}

function buildDust() {
  dust = [];
  const n = Math.min(100, Math.floor(innerWidth / 12));
  for (let i = 0; i < n; i++) dust.push({
    x: Math.random() * SW, y: Math.random() * SH,
    r: (Math.random() * 1.7 + 0.4) * devicePixelRatio,
    vy: (Math.random() * 0.22 + 0.06) * devicePixelRatio,
    vx: (Math.random() - 0.5) * 0.1 * devicePixelRatio,
    a: Math.random() * 0.45 + 0.12, ph: Math.random() * Math.PI * 2,
  });
}

let t0 = performance.now();
function drawScene(now) {
  const t = (now - t0) / 1000;
  const dpr = devicePixelRatio || 1;
  scVel = scY - (drawScene.last ?? scY);
  drawScene.last = scY;
  scGlow += (Math.min(1, Math.abs(scVel) / 40) - scGlow) * 0.08;
  sctx.clearRect(0, 0, SW, SH);

  const mx = (smouse.x - 0.5), my = (smouse.y - 0.5);

  /* ---- projecteurs (réagissent au scroll : plus tu scrolles, plus ça chauffe) ---- */
  const sway = Math.sin(t * 0.4) * 60 * dpr;
  const beamA = 0.05 + scGlow * 0.16;
  [[-0.08 + mx * 0.03, 0], [1.08 + mx * 0.03, 1]].forEach(([bx, side]) => {
    const x0 = bx * SW + (side ? sway : -sway);
    const g = sctx.createLinearGradient(x0, -50, SW * (0.5 + mx * 0.2), SH * 0.85);
    g.addColorStop(0, `rgba(255, 226, 150, ${beamA})`);
    g.addColorStop(0.5, `rgba(245, 196, 81, ${beamA * 0.45})`);
    g.addColorStop(1, "rgba(245, 196, 81, 0)");
    sctx.fillStyle = g;
    sctx.beginPath();
    sctx.moveTo(x0 - 30 * dpr, -60);
    sctx.lineTo(x0 + 30 * dpr, -60);
    sctx.lineTo(SW * (0.72 + side * 0.14), SH * 0.9);
    sctx.lineTo(SW * (0.2 + side * 0.14), SH * 0.9);
    sctx.closePath();
    sctx.fill();
  });

  /* ---- pelouse en perspective (parallaxe : glisse selon le scroll) ---- */
  const horizon = SH * (0.58 + my * 0.02) - scY * 0.22 * dpr;
  const scaleUp = 1 + Math.min(0.35, scY / (SH * 3));
  const bw = SW * 0.5 * scaleUp;
  const cx = SW * (0.5 - mx * 0.04);
  const fy = Math.max(SH * 0.25, horizon);
  const grad = sctx.createLinearGradient(0, fy, 0, SH);
  grad.addColorStop(0, "#07130c");
  grad.addColorStop(0.45, "#0a2013");
  grad.addColorStop(1, "#0d2b18");
  sctx.fillStyle = grad;
  sctx.beginPath();
  sctx.moveTo(cx - bw, fy);
  sctx.lineTo(cx + bw, fy);
  sctx.lineTo(SW * 1.25, SH);
  sctx.lineTo(-SW * 0.25, SH);
  sctx.closePath();
  sctx.fill();

  /* bandes de tonte */
  sctx.save();
  sctx.clip();
  for (let i = 0; i < 8; i++) {
    if (i % 2) continue;
    const b1 = fy + (SH - fy) * (i / 8), b2 = fy + (SH - fy) * ((i + 1) / 8);
    sctx.fillStyle = "rgba(255,255,255,0.016)";
    sctx.fillRect(0, b1, SW, b2 - b1);
  }
  sctx.restore();

  /* lignes dorées du terrain */
  sctx.strokeStyle = `rgba(245, 196, 81, ${0.22 + scGlow * 0.25})`;
  sctx.lineWidth = 1.4 * dpr;
  const line = (x1, y1, x2, y2) => { sctx.beginPath(); sctx.moveTo(x1, y1); sctx.lineTo(x2, y2); sctx.stroke(); };
  line(cx - bw, fy, cx + bw, fy);
  line(cx - bw, fy, -SW * 0.25, SH);
  line(cx + bw, fy, SW * 1.25, SH);
  line(cx - bw * 0.55, fy + (SH - fy) * 0.5, cx + bw * 0.55, fy + (SH - fy) * 0.5);
  sctx.beginPath();
  sctx.ellipse(cx, fy + (SH - fy) * 0.5, bw * 0.34, (SH - fy) * 0.14, 0, 0, Math.PI * 2);
  sctx.stroke();
  sctx.beginPath();
  sctx.ellipse(cx, fy + (SH - fy) * 0.5, 3 * dpr, 2 * dpr, 0, 0, Math.PI * 2);
  sctx.fillStyle = `rgba(245, 196, 81, ${0.5 + scGlow * 0.4})`;
  sctx.fill();

  /* ---- ballon interactif (suit la souris + monte quand tu scrolles) ---- */
  const bounce = Math.abs(Math.sin(t * 1.6)) * 26 * dpr;
  const bx2 = SW * (0.5 + mx * 0.14) + Math.sin(t * 0.7) * 40 * dpr;
  const by2 = SH * 0.42 - scY * 0.3 * dpr + bounce;
  const bg = sctx.createRadialGradient(bx2 - 6 * dpr, by2 - 8 * dpr, 2, bx2, by2, 26 * dpr);
  bg.addColorStop(0, "#ffffff");
  bg.addColorStop(0.55, "#f0e8d8");
  bg.addColorStop(1, "#8a7f66");
  sctx.fillStyle = bg;
  sctx.shadowColor = "rgba(245, 196, 81, 0.85)";
  sctx.shadowBlur = (26 + scGlow * 40) * dpr;
  sctx.beginPath();
  sctx.arc(bx2, by2, 15 * dpr, 0, Math.PI * 2);
  sctx.fill();
  sctx.shadowBlur = 0;
  sctx.strokeStyle = "rgba(20,20,20,0.55)";
  sctx.lineWidth = 1.2 * dpr;
  sctx.beginPath(); sctx.arc(bx2, by2, 15 * dpr, 0.4, 2.2); sctx.stroke();
  sctx.beginPath(); sctx.arc(bx2, by2, 15 * dpr, 3.4, 5.2); sctx.stroke();
  sctx.beginPath(); sctx.arc(bx2, by2, 6 * dpr, 0, Math.PI * 2); sctx.stroke();

  /* ---- poussière dorée ---- */
  for (const p of dust) {
    p.y -= p.vy; p.x += p.vx + Math.sin(t + p.ph) * 0.15 * dpr;
    p.y += scVel * 0.35 * dpr;
    if (p.y < -10) { p.y = SH + 10; p.x = Math.random() * SW; }
    if (p.y > SH + 10) { p.y = -10; p.x = Math.random() * SW; }
    sctx.fillStyle = `rgba(255, 214, 120, ${p.a * (0.6 + scGlow * 0.8)})`;
    sctx.beginPath(); sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); sctx.fill();
  }

  /* ---- vignette ---- */
  const v = sctx.createRadialGradient(SW / 2, SH / 2, SH * 0.3, SW / 2, SH / 2, SH * 0.95);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.55)");
  sctx.fillStyle = v;
  sctx.fillRect(0, 0, SW, SH);

  requestAnimationFrame(drawScene);
}

addEventListener("scroll", () => { scY = scrollY; }, { passive: true });
addEventListener("mousemove", e => { smouse.x = e.clientX / innerWidth; smouse.y = e.clientY / innerHeight; });
addEventListener("resize", sceneResize);
sceneResize();
requestAnimationFrame(drawScene);
