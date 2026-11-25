/* ============================================================
   v7.6 — GRAPHIQUES DYNAMIQUES (canvas vanilla, sans lib)
   Prematch : probabilités 1X2 + marchés buts (Poisson sur mpool)
   Live : buts × minute + momentum (historique des cotes __oddsHist)
   Tout est redessiné à chaque poll ESPN (45 s) + à chaque affichage.
   ============================================================ */

const CH_GOLD = "#f5c451", CH_GRA = "#6e6e64", CH_EME = "#2effa0";

function chQ(id) { return document.getElementById(id); }

function chCtx(cv, h) {
  if (!cv) return null;
  const w = cv.clientWidth || cv.parentElement.clientWidth;
  if (!w || w < 40) return null;
  const H = h || Math.max(210, Math.round(w * 0.52));
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(H * dpr);
  cv.style.height = H + "px";
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, H);
  return { ctx, w, H };
}

function chNote(cv, txt) {
  const c = chCtx(cv, 160);
  if (!c) return;
  c.ctx.fillStyle = "#8d8d84";
  c.ctx.font = "12px 'Share Tech Mono', monospace";
  c.ctx.textAlign = "center";
  c.ctx.fillText(txt, c.w / 2, c.H / 2);
}

function chGrid(c, rows) {
  const { ctx, w, H } = c;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= rows; i++) {
    const y = Math.round(8 + (H - 24) * i / rows) + 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

function chLabel(ctx, txt, x, y, size, color, align) {
  ctx.fillStyle = color || "#cfcfc6";
  ctx.font = (size || 10) + "px 'Share Tech Mono', monospace";
  ctx.textAlign = align || "left";
  ctx.fillText(txt, x, y);
}

/* ---------- 1. PROBAS 1X2 (barres empilées, top 8 par Safe Score) ---------- */
function chDraw1x2() {
  const cv = chQ("ch-1x2");
  const list = [...mpool()].sort((a, b) => safeScore(b) - safeScore(a)).slice(0, 8);
  if (!list.length) { chNote(cv, t("ch_none")); return; }
  const c = chCtx(cv, list.length * 34 + 26);
  if (!c) return;
  const { ctx, w, H } = c;
  const L = 118, R = 46;
  list.forEach((m, i) => {
    const mk = marketsOf(m);
    const y = 18 + i * 34, bh = 16;
    const x0 = L, tot = w - L - R, sc = tot / 100;
    chLabel(ctx, tn(m.home).slice(0, 9) + "-" + tn(m.away).slice(0, 9), x0 - 6, y + bh - 4, 9.5, "#cfcfc6", "right");
    const segs = [
      [mk.pH, CH_GOLD], [mk.pD, CH_GRA], [mk.pA, CH_EME],
    ];
    let x = x0;
    const sum = mk.pH + mk.pD + mk.pA || 1;
    segs.forEach(([v, col]) => {
      const bw = Math.max(2, (v / sum) * 100 * sc);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, bw, bh);
      ctx.globalAlpha = 1;
      if (v / sum >= 0.14) chLabel(ctx, Math.round(v) + "%", x + bw / 2, y + 12, 9, "#08080a", "center");
      x += bw;
    });
    chLabel(ctx, m.pick + " @" + m.odds[m.pick].toFixed(2), w - R + 6, y + 12, 9, CH_GOLD, "left");
  });
}

/* ---------- 2. MARCHÉS BUTS : Over 2.5 + BTTS (groupées) ---------- */
function chDrawButs() {
  const cv = chQ("ch-buts");
  const list = [...mpool()].sort((a, b) => marketsOf(b).over25 - marketsOf(a).over25).slice(0, 8);
  if (!list.length) { chNote(cv, t("ch_none")); return; }
  const c = chCtx(cv, list.length * 34 + 34);
  if (!c) return;
  const { ctx, w, H } = c;
  const L = 118, R = 8, tot = w - L - R;
  chGrid(c, 5);
  list.forEach((m, i) => {
    const mk = marketsOf(m);
    const y = 18 + i * 34;
    chLabel(ctx, tn(m.home).slice(0, 9) + "-" + tn(m.away).slice(0, 9), L - 6, y + 12, 9.5, "#cfcfc6", "right");
    ctx.fillStyle = CH_GOLD;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(L, y, Math.max(2, (mk.over25 / 100) * tot), 7);
    ctx.globalAlpha = 1;
    ctx.fillStyle = CH_EME;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(L, y + 9, Math.max(2, (mk.btts / 100) * tot), 7);
    ctx.globalAlpha = 1;
    chLabel(ctx, Math.round(mk.over25) + "%", L + Math.max(2, (mk.over25 / 100) * tot) + 5, y + 7.5, 8.5, CH_GOLD);
  });
  chLabel(ctx, t("ch_over") + " 2.5", w - 108, H - 4, 8.5, CH_GOLD);
  chLabel(ctx, "BTTS", w - 34, H - 4, 8.5, CH_EME);
}

/* ---------- 3. LIVE : buts totaux × minute ---------- */
function chDrawScatter() {
  const cv = chQ("ch-scatter");
  const live = (window.__lastLive || []).filter(m => m.state === "in");
  if (!live.length) { chNote(cv, t("ch_none")); return; }
  const c = chCtx(cv, 240);
  if (!c) return;
  const { ctx, w, H } = c;
  const L = 34, B = 26, W = w - L - 12, Hh = H - B - 12;
  chGrid(c, 4);
  /* axes */
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath(); ctx.moveTo(L, 8); ctx.lineTo(L, 8 + Hh); ctx.lineTo(L + W, 8 + Hh); ctx.stroke();
  [0, 15, 30, 45, 60, 75, 90].forEach(mi => {
    const x = L + (mi / 96) * W;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, 8 + Hh); ctx.stroke();
    chLabel(ctx, mi + "'", x, H - 10, 8.5, "#8d8d84", "center");
  });
  [0, 1, 2, 3, 4].forEach(g => {
    if (g > 4) return;
    const y = 8 + Hh - (g / 4) * Hh;
    chLabel(ctx, String(g), L - 7, y + 3, 8.5, "#8d8d84", "right");
  });
  live.forEach(m => {
    const mm = String(m.displayClock || "").match(/(\d+)/);
    const min = Math.min(96, mm ? parseInt(mm[1], 10) || 1 : 1);
    const total = Math.min(4, (m.home.score || 0) + (m.away.score || 0));
    const x = L + (min / 96) * W;
    const y = 8 + Hh - (total / 4) * Hh;
    ctx.fillStyle = m.home.color || CH_GOLD;
    ctx.globalAlpha = 0.92;
    ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = CH_GOLD; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
    if (total > 0) chLabel(ctx, m.home.score + ":" + m.away.score, x, y - 9, 8.5, "#fff", "center");
  });
  chLabel(ctx, t("ch_minute"), w / 2, H - 1, 8, "#8d8d84", "center");
}

/* ---------- 4. LIVE : momentum = écart de cotes dans le temps ---------- */
function chDrawMom() {
  const cv = chQ("ch-mom");
  const H = window.__oddsHist || {};
  const series = Object.entries(H)
    .map(([id, arr]) => {
      const m = (window.__lastLive || []).find(x => x.id === id) || {};
      return { arr, name: ((m.home && m.home.shortName) || (m.home && m.home.name) || id).slice(0, 8) + "-" + ((m.away && m.away.shortName) || (m.away && m.away.name) || "").slice(0, 8), color: (m.home && m.home.color) || CH_GOLD };
    })
    .filter(s => s.arr.length >= 2)
    .slice(0, 6);
  if (!series.length) { chNote(cv, t("ch_wait")); return; }
  const c = chCtx(cv, 240);
  if (!c) return;
  const { ctx, w, H: HH } = c;
  const L = 40, B = 24, W = w - L - 10, Hh = HH - B - 12;
  chGrid(c, 4);
  const nMax = Math.max(...series.map(s => s.arr.length));
  for (let i = 0; i < 3; i++) {
    const y = 8 + (Hh * i) / 2;
    chLabel(ctx, (i === 0 ? "+" : i === 2 ? "-" : "") + (i === 0 ? "DOM" : i === 2 ? "EXT" : ""), L - 6, y + 3, 7.5, "#8d8d84", "right");
  }
  series.forEach(s => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    s.arr.forEach((p, i) => {
      /* diff = o1 - o2 : positif = pression extérieur ? non — cote home basse = home favori */
      const base = (p.o1 && p.o2) ? (p.o2 - p.o1) : 0;
      const v = Math.max(-2.5, Math.min(2.5, base)) / 2.5;   /* -1..1 */
      const x = L + (i / Math.max(1, nMax - 1)) * W;
      const y = 8 + Hh / 2 - v * (Hh / 2 - 6);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  chLabel(ctx, "0' ", L, HH - 6, 8.5, "#8d8d84");
  chLabel(ctx, "maintenant", L + W, HH - 6, 8.5, "#8d8d84", "right");
  chLabel(ctx, series.map(s => s.name).join(" · "), L, 14, 8, "#cfcfc6");
}

/* ---------- orchestration ---------- */
function renderCharts() {
  try { chDraw1x2(); } catch (e) {}
  try { chDrawButs(); } catch (e) {}
  try { chDrawScatter(); } catch (e) {}
  try { chDrawMom(); } catch (e) {}
}
window.renderCharts = renderCharts;

setInterval(() => {
  const v = chQ("view-graph");
  if (v && v.classList.contains("active")) renderCharts();
}, 30000);
