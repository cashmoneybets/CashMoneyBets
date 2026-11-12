/* ============ CASHMONEY·BETS — STADIUM SCENE (interactive scroll-parallax) ============ */
const scene = document.getElementById("scene");
const sctx = scene.getContext("2d");
let SW, SH, scY = 0, scVel = 0, scGlow = 0;
const smouse = { x: 0.5, y: 0.5 };
let crowd = [], dust = [];

const CROWD_COLORS = ["255,244,214", "255,244,214", "245,196,81", "46,255,160", "139,92,246"];

function sceneResize() {
  SW = scene.width = innerWidth * devicePixelRatio;
  SH = scene.height = innerHeight * devicePixelRatio;
  scene.style.width = innerWidth + "px";
  scene.style.height = innerHeight + "px";
  buildCrowd();
  buildDust();
}

function buildCrowd() {
  crowd = [];
  const n = Math.min(950, Math.floor(innerWidth * 0.95));
  for (let i = 0; i < n; i++) crowd.push({
    u: Math.random(),
    v: Math.pow(Math.random(), 0.85),
    r: (Math.random() * 1.1 + 0.4) * devicePixelRatio,
    sp: Math.random() * 2.2 + 0.5,
    ph: Math.random() * Math.PI * 2,
    col: CROWD_COLORS[Math.floor(Math.random() * CROWD_COLORS.length)],
    a: Math.random() * 0.5 + 0.22,
  });
}

function buildDust() {
  dust = [];
  const n = Math.min(80, Math.floor(innerWidth / 16));
  for (let i = 0; i < n; i++) dust.push({
    x: Math.random() * SW, y: Math.random() * SH,
    r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
    vy: (Math.random() * 0.2 + 0.05) * devicePixelRatio,
    vx: (Math.random() - 0.5) * 0.1 * devicePixelRatio,
    a: Math.random() * 0.4 + 0.1, ph: Math.random() * Math.PI * 2,
  });
}

function drawStadium(now) {
  const t = now / 1000;
  const dpr = devicePixelRatio || 1;
  scVel = scY - (drawStadium.last ?? scY);
  drawStadium.last = scY;
  scGlow += (Math.min(1, Math.abs(scVel) / 40) - scGlow) * 0.08;
  sctx.clearRect(0, 0, SW, SH);
  const mx = smouse.x - 0.5, my = smouse.y - 0.5;

  /* ---- ciel nocturne ---- */
  const sky = sctx.createLinearGradient(0, 0, 0, SH);
  sky.addColorStop(0, "#050508");
  sky.addColorStop(0.55, "#0a0a14");
  sky.addColorStop(1, "#070706");
  sctx.fillStyle = sky;
  sctx.fillRect(0, 0, SW, SH);

  /* ---- géométrie du bowl (parallaxe scroll) ---- */
  const pStand = -scY * 0.07 * dpr, pPitch = -scY * 0.16 * dpr;
  const horizon = SH * (0.58 + my * 0.012) + pStand;
  const standTop = horizon - SH * 0.30;
  const standShift = mx * 10 * dpr;

  /* ---- tribune supérieure + crowd (lumières de téléphones qui scintillent) ---- */
  const sg = sctx.createLinearGradient(0, standTop, 0, horizon);
  sg.addColorStop(0, "#0d0d18");
  sg.addColorStop(1, "#121222");
  sctx.fillStyle = sg;
  sctx.beginPath();
  sctx.moveTo(SW * 0.05 + standShift, standTop);
  sctx.lineTo(SW * 0.95 + standShift, standTop);
  sctx.lineTo(SW * 1.02, horizon);
  sctx.lineTo(-SW * 0.02, horizon);
  sctx.closePath();
  sctx.fill();

  for (const c of crowd) {
    const px = (SW * 0.05 + c.u * SW * 0.9 + (c.u - 0.5) * SW * 0.14 * (1 - c.v) + standShift);
    const py = standTop + c.v * (horizon - standTop);
    const tw = 0.55 + 0.45 * Math.sin(t * c.sp + c.ph);
    sctx.fillStyle = `rgba(${c.col},${c.a * tw * (1 + scGlow * 0.7)})`;
    sctx.beginPath();
    sctx.arc(px, py, c.r, 0, Math.PI * 2);
    sctx.fill();
  }

  /* ---- toit + bande LED animée ---- */
  const roofH = SH * 0.045;
  sctx.fillStyle = "#0b0b12";
  sctx.fillRect(SW * 0.03 + standShift, standTop - roofH, SW * 0.94, roofH);
  const ledY = standTop - roofH * 0.28;
  const ledH = Math.max(2, SH * 0.006);
  const seg = 46 * dpr, off = (t * 55 * dpr) % (seg * 2);
  const ledCols = ["245,196,81", "46,255,160", "139,92,246"];
  for (let x = -seg * 2; x < SW + seg * 2; x += seg) {
    const xi = x - off;
    const idx = Math.abs(Math.floor((x + off) / seg)) % 3;
    sctx.fillStyle = `rgba(${ledCols[idx]},${0.35 + scGlow * 0.4})`;
    sctx.fillRect(xi, ledY, seg * 0.55, ledH);
  }

  /* ---- pylônes projecteurs + halos ---- */
  [[0.16, -1], [0.84, 1]].forEach(([fx, dir]) => {
    const px = SW * fx + mx * 14 * dpr + Math.sin(t * 0.35) * 8 * dpr * dir;
    const py = standTop - roofH - SH * 0.06;
    sctx.strokeStyle = "rgba(160,165,190,0.35)";
    sctx.lineWidth = 2.5 * dpr;
    sctx.beginPath(); sctx.moveTo(px, py + SH * 0.05); sctx.lineTo(px, py); sctx.stroke();
    const halo = sctx.createRadialGradient(px, py, 0, px, py, 60 * dpr);
    halo.addColorStop(0, `rgba(255,240,200,${0.5 + scGlow * 0.4})`);
    halo.addColorStop(1, "rgba(255,240,200,0)");
    sctx.fillStyle = halo;
    sctx.beginPath(); sctx.arc(px, py, 60 * dpr, 0, Math.PI * 2); sctx.fill();
    sctx.fillStyle = `rgba(255,248,225,${0.75 + scGlow * 0.25})`;
    sctx.beginPath(); sctx.arc(px, py, 5 * dpr, 0, Math.PI * 2); sctx.fill();

    const beam = sctx.createLinearGradient(px, py, SW * (0.45 + 0.1 * dir), SH * 0.8);
    const ba = 0.035 + scGlow * 0.12;
    beam.addColorStop(0, `rgba(255,236,180,${ba})`);
    beam.addColorStop(1, "rgba(255,236,180,0)");
    sctx.fillStyle = beam;
    sctx.beginPath();
    sctx.moveTo(px - 12 * dpr, py);
    sctx.lineTo(px + 12 * dpr, py);
    sctx.lineTo(SW * (0.62 + 0.16 * dir), SH * 0.85);
    sctx.lineTo(SW * (0.24 + 0.16 * dir), SH * 0.85);
    sctx.closePath();
    sctx.fill();
  });

  /* ---- panneaux LED publicitaires (au-dessus de la ligne de touche lointaine) ---- */
  const boardH = Math.max(6, SH * 0.022);
  const bL = SW * 0.16, bR = SW * 0.84;
  sctx.fillStyle = "#08080e";
  sctx.fillRect(bL, horizon - boardH - 2 * dpr, bR - bL, boardH);
  const bSeg = 60 * dpr, bOff = (t * 80 * dpr) % (bSeg * 3);
  for (let x = bL - bSeg * 3; x < bR + bSeg * 3; x += bSeg) {
    const xi = x - bOff;
    if (xi + bSeg * 0.6 < bL || xi > bR) continue;
    const idx = Math.abs(Math.floor((x + bOff) / bSeg)) % 3;
    sctx.fillStyle = `rgba(${ledCols[idx]},${0.55 + scGlow * 0.35})`;
    sctx.fillRect(Math.max(xi, bL), horizon - boardH, Math.min(bSeg * 0.6, bR - Math.max(xi, bL)), boardH * 0.62);
  }

  /* ---- pelouse en perspective ---- */
  const pitchTop = horizon + 2 * dpr + pPitch * 0.4;
  const fy = Math.max(SH * 0.2, pitchTop);
  const farL = SW * 0.28, farR = SW * 0.72;
  const nearL = -SW * 0.25, nearR = SW * 1.25;
  const grass = sctx.createLinearGradient(0, fy, 0, SH);
  grass.addColorStop(0, "#0a1f12");
  grass.addColorStop(0.4, "#0c2817");
  grass.addColorStop(1, "#0e3220");
  sctx.fillStyle = grass;
  sctx.beginPath();
  sctx.moveTo(farL, fy); sctx.lineTo(farR, fy);
  sctx.lineTo(nearR, SH); sctx.lineTo(nearL, SH);
  sctx.closePath(); sctx.fill();

  /* bandes de tonte */
  sctx.save();
  sctx.beginPath();
  sctx.moveTo(farL, fy); sctx.lineTo(farR, fy);
  sctx.lineTo(nearR, SH); sctx.lineTo(nearL, SH);
  sctx.closePath(); sctx.clip();
  for (let i = 0; i < 9; i++) {
    if (i % 2) continue;
    const b1 = fy + (SH - fy) * Math.pow(i / 9, 1.35);
    const b2 = fy + (SH - fy) * Math.pow((i + 1) / 9, 1.35);
    sctx.fillStyle = "rgba(255,255,255,0.02)";
    sctx.fillRect(0, b1, SW, b2 - b1);
  }
  sctx.restore();

  /* lignes dorées */
  sctx.strokeStyle = `rgba(245,196,81,${0.24 + scGlow * 0.3})`;
  sctx.lineWidth = 1.4 * dpr;
  const line = (x1, y1, x2, y2) => { sctx.beginPath(); sctx.moveTo(x1, y1); sctx.lineTo(x2, y2); sctx.stroke(); };
  line(farL, fy, farR, fy);
  line(farL, fy, nearL, SH);
  line(farR, fy, nearR, SH);
  const midY = fy + (SH - fy) * 0.42;
  const mw1 = farL + (nearL - farL) * 0.42, mw2 = farR + (nearR - farR) * 0.42;
  line(mw1, midY, mw2, midY);
  sctx.beginPath();
  sctx.ellipse((mw1 + mw2) / 2, midY, (mw2 - mw1) * 0.17, (SH - fy) * 0.075, 0, 0, Math.PI * 2);
  sctx.stroke();
  /* surface de réparation lointaine */
  const bDepth = (SH - fy) * 0.13;
  const bxL = farL + (farR - farL) * 0.22, bxR = farR - (farR - farL) * 0.22;
  line(bxL, fy, bxL - (farR - farL) * 0.03, fy + bDepth);
  line(bxR, fy, bxR + (farR - farL) * 0.03, fy + bDepth);
  line(bxL - (farR - farL) * 0.03, fy + bDepth, bxR + (farR - farL) * 0.03, fy + bDepth);

  /* ---- ballon interactif ---- */
  const bounce = Math.abs(Math.sin(t * 1.6)) * 24 * dpr;
  const bx2 = SW * (0.5 + mx * 0.14) + Math.sin(t * 0.7) * 36 * dpr;
  const by2 = SH * 0.42 - scY * 0.28 * dpr + bounce;
  const bg2 = sctx.createRadialGradient(bx2 - 6 * dpr, by2 - 8 * dpr, 2, bx2, by2, 26 * dpr);
  bg2.addColorStop(0, "#ffffff");
  bg2.addColorStop(0.55, "#f0e8d8");
  bg2.addColorStop(1, "#8a7f66");
  sctx.fillStyle = bg2;
  sctx.shadowColor = "rgba(245,196,81,0.85)";
  sctx.shadowBlur = (26 + scGlow * 40) * dpr;
  sctx.beginPath(); sctx.arc(bx2, by2, 15 * dpr, 0, Math.PI * 2); sctx.fill();
  sctx.shadowBlur = 0;
  sctx.strokeStyle = "rgba(20,20,20,0.55)";
  sctx.lineWidth = 1.2 * dpr;
  sctx.beginPath(); sctx.arc(bx2, by2, 15 * dpr, 0.4, 2.2); sctx.stroke();
  sctx.beginPath(); sctx.arc(bx2, by2, 15 * dpr, 3.4, 5.2); sctx.stroke();
  sctx.beginPath(); sctx.arc(bx2, by2, 6 * dpr, 0, Math.PI * 2); sctx.stroke();

  /* ---- poussière dorée ---- */
  for (const p of dust) {
    p.y -= p.vy; p.x += p.vx + Math.sin(t + p.ph) * 0.15 * dpr;
    p.y += scVel * 0.3 * dpr;
    if (p.y < -10) { p.y = SH + 10; p.x = Math.random() * SW; }
    if (p.y > SH + 10) { p.y = -10; p.x = Math.random() * SW; }
    sctx.fillStyle = `rgba(255,214,120,${p.a * (0.55 + scGlow * 0.8)})`;
    sctx.beginPath(); sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); sctx.fill();
  }

  /* ---- vignette ---- */
  const v = sctx.createRadialGradient(SW / 2, SH / 2, SH * 0.3, SW / 2, SH / 2, SH * 0.95);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.5)");
  sctx.fillStyle = v;
  sctx.fillRect(0, 0, SW, SH);

  requestAnimationFrame(drawStadium);
}

addEventListener("scroll", () => { scY = scrollY; }, { passive: true });
addEventListener("mousemove", e => { smouse.x = e.clientX / innerWidth; smouse.y = e.clientY / innerHeight; });
addEventListener("resize", sceneResize);
sceneResize();
requestAnimationFrame(drawStadium);
