/* ============ NEBULA BACKGROUND ============ */
const canvas = document.getElementById("nebula");
const ctx = canvas.getContext("2d");
let W, H, stars = [], clouds = [], shooting = [], mouse = { x: 0.5, y: 0.5 };

const CLOUD_COLORS = [
  [0, 240, 255, 0.10],
  [139, 92, 246, 0.12],
  [255, 45, 149, 0.08],
  [182, 255, 46, 0.04],
];

function resize() {
  W = canvas.width = innerWidth * devicePixelRatio;
  H = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  buildStars();
}

function buildStars() {
  stars = [];
  const n = Math.min(340, Math.floor((innerWidth * innerHeight) / 4000));
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.4 + 0.3) * devicePixelRatio,
      tw: Math.random() * Math.PI * 2,
      ts: 0.008 + Math.random() * 0.02,
      depth: Math.random() * 0.8 + 0.2,
      hue: Math.random() < 0.12 ? (Math.random() < 0.5 ? "0,240,255" : "255,45,149") : "255,255,255",
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

function drawNebula() {
  ctx.clearRect(0, 0, W, H);
  for (const c of clouds) {
    c.x += c.vx; c.y += c.vy; c.ph += 0.004;
    if (c.x < -0.3) c.x = 1.3; if (c.x > 1.3) c.x = -0.3;
    if (c.y < -0.3) c.y = 1.3; if (c.y > 1.3) c.y = -0.3;
    const px = (c.x + (mouse.x - 0.5) * 0.05) * W;
    const py = (c.y + (mouse.y - 0.5) * 0.05) * H;
    const r = c.r * Math.max(W, H) * (1 + Math.sin(c.ph) * 0.12);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    const [cr, cg, cb, ca] = c.c;
    g.addColorStop(0, `rgba(${cr},${cg},${cb},${ca})`);
    g.addColorStop(0.55, `rgba(${cr},${cg},${cb},${ca * 0.4})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }
  for (const s of stars) {
    s.tw += s.ts;
    const a = 0.35 + Math.abs(Math.sin(s.tw)) * 0.65;
    const px = s.x + (mouse.x - 0.5) * 24 * s.depth * devicePixelRatio;
    const py = s.y + (mouse.y - 0.5) * 24 * s.depth * devicePixelRatio;
    ctx.fillStyle = `rgba(${s.hue},${a * 0.9})`;
    ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fill();
  }
  if (Math.random() < 0.006 && shooting.length < 2) {
    shooting.push({
      x: Math.random() * W * 0.8, y: Math.random() * H * 0.35,
      vx: (6 + Math.random() * 6) * devicePixelRatio,
      vy: (2.5 + Math.random() * 3) * devicePixelRatio,
      life: 1,
    });
  }
  for (let i = shooting.length - 1; i >= 0; i--) {
    const s = shooting[i];
    s.x += s.vx; s.y += s.vy; s.life -= 0.02;
    if (s.life <= 0) { shooting.splice(i, 1); continue; }
    const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8);
    grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6 * devicePixelRatio;
    ctx.beginPath(); ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8); ctx.stroke();
  }
  requestAnimationFrame(drawNebula);
}

addEventListener("mousemove", e => { mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight; });
addEventListener("resize", resize);
resize(); buildClouds(); drawNebula();

/* ============ HUD CLOCK ============ */
setInterval(() => {
  const el = document.getElementById("hud-clock");
  if (el) el.textContent = new Date().toISOString().slice(11, 19) + " UTC";
}, 1000);

/* ============ TICKER ============ */
function buildTicker() {
  const items = [...MATCHES]
    .sort((a, b) => safeScore(b) - safeScore(a))
    .map(m => {
      const arrow = safeScore(m) >= 85 ? "▲" : safeScore(m) >= 78 ? "▶" : "▼";
      const cls = safeScore(m) >= 85 ? "up" : safeScore(m) >= 78 ? "" : "lbl";
      return `<span><span class="lbl">${m.flag} ${m.home.toUpperCase()}-${m.away.toUpperCase()}</span> <b class="${cls}">${m.odds[m.pick].toFixed(2)}</b> <span class="${cls}">${arrow}</span> <span class="lbl">SCORE ${safeScore(m)}</span></span>`;
    }).join("");
  document.getElementById("ticker").innerHTML =
    `<div class="ticker-track">${items}${items}</div>`;
}
window.buildTicker = buildTicker;

/* ============ SAFE BET CARDS ============ */
const grid = document.getElementById("grid");

function formChips(form) {
  return form.map(r => `<span class="chip chip-${r}">${r === "W" ? "V" : r === "D" ? "N" : "D"}</span>`).join("");
}

function matchCard(m) {
  const score = safeScore(m);
  const tier = tierOf(score);
  const tierLbl = (TIER_I18N[tier.label] || {})[LANG] || tier.label;
  const compLbl = tr(COMP_I18N[m.comp]) || m.comp;
  const mk = marketsOf(m);
  const pickTeam = m.pick === "1" ? m.home : m.away;
  const pickLbl = t("mkt_pick_win").replace("{team}", pickTeam);
  const R = 34, CIRC = 2 * Math.PI * R;
  const bar = (label, pct, cls) => `
    <div class="prob-row">
      <span class="prob-name">${label}</span>
      <div class="prob-track"><div class="prob-fill ${cls}" data-p="${pct}"></div></div>
      <b class="prob-val">${pct}%</b>
    </div>`;
  const mkt = (label, pct) => `
    <div class="mkt">
      <small>${label}</small>
      <b>${pct}%</b>
      <div class="mkt-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  return `
  <article class="card tilt" data-id="${m.id}">
    <header class="card-head">
      <span class="comp">${m.flag} ${compLbl}</span>
      <span class="kick">🕗 ${m.kickoff} CET</span>
    </header>
    <div class="teams">
      <div class="team home">
        <span class="name">${m.home}</span>
        <span class="form">${formChips(m.formHome)}</span>
      </div>
      <div class="vs">VS</div>
      <div class="team away">
        <span class="name">${m.away}</span>
        <span class="form">${formChips(m.formAway)}</span>
      </div>
    </div>
    <div class="pick-box tier-${tier.cls}">
      <div class="pick-left">
        <small>🎯 ${t("mkt_pick")}</small>
        <strong>${pickLbl}</strong>
      </div>
      <div class="pick-odds">${m.odds[m.pick].toFixed(2)}</div>
    </div>
    <div class="probs">
      <small class="probs-title">${t("mkt_1x2")}</small>
      ${bar(m.home, mk.pH, "c-home")}
      ${bar(t("mkt_draw"), mk.pD, "c-draw")}
      ${bar(m.away, mk.pA, "c-away")}
    </div>
    <div class="mkts-wrap">
      <small class="probs-title">${t("mkt_goals")}</small>
      <div class="mkts">
        ${mkt(t("mkt_over15"), mk.over15)}
        ${mkt(t("mkt_over25"), mk.over25)}
        ${mkt(t("mkt_btts"), mk.btts)}
      </div>
    </div>
    <p class="note">${tr(m.note)}</p>
    <div class="card-foot">
      <div class="score-ring" data-score="${score}">
        <svg viewBox="0 0 80 80">
          <circle class="ring-bg" cx="40" cy="40" r="${R}"/>
          <circle class="ring-fg tier-${tier.cls}" cx="40" cy="40" r="${R}"
            stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
        </svg>
        <div class="score-num"><b>${score}</b><small>/100</small></div>
        <span class="tier tier-${tier.cls}">${tierLbl}</span>
      </div>
    </div>
  </article>`;
}

function render(filter = "all", sort = "score") {
  let list = [...MATCHES];
  if (filter === "elite") list = list.filter(m => safeScore(m) >= 85);
  if (filter === "solid") list = list.filter(m => safeScore(m) >= 78 && safeScore(m) < 85);
  if (filter === "value") list = list.filter(m => safeScore(m) < 78);
  if (filter === "can") list = list.filter(m => m.comp.includes("CAN"));
  if (filter === "nl") list = list.filter(m => m.comp.includes("Nations"));
  if (sort === "score") list.sort((a, b) => safeScore(b) - safeScore(a));
  if (sort === "odds") list.sort((a, b) => a.odds[a.pick] - b.odds[b.pick]);
  if (sort === "time") list.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  grid.innerHTML = list.map(matchCard).join("");
  bindCards();
  requestAnimationFrame(animateRings);
  requestAnimationFrame(animateBars);
  observeReveals();
}

function animateBars() {
  document.querySelectorAll(".prob-fill").forEach(fill => {
    fill.style.width = "0%";
    fill.style.transition = "width 1.2s cubic-bezier(.22,1,.36,1)";
    requestAnimationFrame(() => fill.style.width = fill.dataset.p + "%");
  });
}

document.querySelectorAll(".filters button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.filter, document.querySelector(".sorts button.active")?.dataset.sort || "score");
  });
});
document.querySelectorAll(".sorts button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sorts button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render(document.querySelector(".filters button.active")?.dataset.filter || "all", btn.dataset.sort);
  });
});

function bindCards() {
  document.querySelectorAll(".tilt").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

function animateRings() {
  document.querySelectorAll(".ring-fg").forEach(ring => {
    const holder = ring.closest(".score-ring");
    const score = parseFloat(holder.dataset.score);
    const CIRC = 2 * Math.PI * 34;
    ring.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)";
    requestAnimationFrame(() => ring.style.strokeDashoffset = CIRC * (1 - score / 100));
  });
}

/* ============ COUNTERS ============ */
function animateCounter(el, target, decimals = 0) {
  const dur = 1600, start = performance.now();
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const avgScore = MATCHES.reduce((a, m) => a + safeScore(m), 0) / MATCHES.length;
const countersDone = new Set();
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting || countersDone.has(en.target.id)) return;
    countersDone.add(en.target.id);
    if (en.target.id === "stat-matches") animateCounter(en.target, MATCHES.length);
    if (en.target.id === "stat-score") animateCounter(en.target, avgScore, 1);
    if (en.target.id === "stat-elite") animateCounter(en.target, MATCHES.filter(m => safeScore(m) >= 85).length);
  });
}, { threshold: 0.5 });
document.querySelectorAll(".stat b[id]").forEach(el => counterObserver.observe(el));

/* ============ CHARTS ============ */
const chartColors = { elite: "#00f0ff", solid: "#8b5cf6", value: "#ffb020" };

function drawBars() {
  const cv = document.getElementById("chart-bars");
  const c = cv.getContext("2d");
  const dpr = devicePixelRatio || 1;
  const w = cv.width = cv.clientWidth * dpr;
  const h = cv.height = 300 * dpr;
  const sorted = [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a));
  const pad = 30 * dpr, bw = (w - pad * 2) / sorted.length;
  let t = 0;
  function frame() {
    t = Math.min(1, t + 0.03);
    const ease = 1 - Math.pow(1 - t, 3);
    c.clearRect(0, 0, w, h);
    sorted.forEach((m, i) => {
      const s = safeScore(m);
      const tier = tierOf(s);
      const bh = ((h - pad * 2.2) * (s / 100)) * ease;
      const x = pad + i * bw + bw * 0.15;
      const y = h - pad - bh;
      c.fillStyle = chartColors[tier.cls] + "cc";
      c.shadowColor = chartColors[tier.cls];
      c.shadowBlur = 10 * dpr;
      c.fillRect(x, y, bw * 0.7, bh);
      c.shadowBlur = 0;
      if (t === 1) {
        c.fillStyle = "#7d8bb0";
        c.font = `${9 * dpr}px "Share Tech Mono"`;
        c.textAlign = "center";
        c.save();
        c.translate(x + bw * 0.35, h - pad + 14 * dpr);
        c.rotate(-Math.PI / 4);
        c.fillText(m.home.slice(0, 8).toUpperCase(), 0, 0);
        c.restore();
        c.fillStyle = "#eaf6ff";
        c.fillText(String(s), x + bw * 0.35, y - 6 * dpr);
      }
    });
    if (t < 1) requestAnimationFrame(frame);
  }
  frame();
}

function drawDonut() {
  const cv = document.getElementById("chart-donut");
  const c = cv.getContext("2d");
  const dpr = devicePixelRatio || 1;
  const w = cv.width = cv.clientWidth * dpr;
  const h = cv.height = 300 * dpr;
  const tiers = ["elite", "solid", "value"];
  const labels = { elite: t("tier_elite"), solid: t("tier_solid"), value: t("tier_value") };
  const counts = tiers.map(t => MATCHES.filter(m => tierOf(safeScore(m)).cls === t).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.32;
  let t = 0;
  function frame() {
    t = Math.min(1, t + 0.03);
    const ease = 1 - Math.pow(1 - t, 3);
    c.clearRect(0, 0, w, h);
    let angle = -Math.PI / 2;
    tiers.forEach((tier, i) => {
      const frac = (counts[i] / total) * ease;
      const a2 = angle + frac * Math.PI * 2;
      c.beginPath();
      c.arc(cx, cy, R, angle, a2);
      c.strokeStyle = chartColors[tier];
      c.lineWidth = 34 * dpr;
      c.shadowColor = chartColors[tier];
      c.shadowBlur = 14 * dpr;
      c.stroke();
      c.shadowBlur = 0;
      if (t === 1 && frac > 0.02) {
        const mid = (angle + a2) / 2;
        c.fillStyle = "#eaf6ff";
        c.font = `700 ${13 * dpr}px Orbitron`;
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(counts[i], cx + Math.cos(mid) * R, cy + Math.sin(mid) * R);
      }
      angle = a2;
    });
    c.fillStyle = "#eaf6ff";
    c.font = `900 ${26 * dpr}px Orbitron`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(total, cx, cy);
    c.fillStyle = "#7d8bb0";
    c.font = `${9 * dpr}px "Share Tech Mono"`;
    c.fillText("MATCHS", cx, cy + 20 * dpr);
    if (t < 1) requestAnimationFrame(frame);
  }
  frame();
  document.getElementById("donut-legend").innerHTML = tiers
    .map(t2 => `<span><i style="background:${chartColors[t2]}"></i>${labels[t2]} : ${MATCHES.filter(m => tierOf(safeScore(m)).cls === t2).length}</span>`)
    .join("");
}

const chartsDone = new Set();
const chartObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting || chartsDone.has(en.target.id)) return;
    chartsDone.add(en.target.id);
    if (en.target.id === "chart-bars") drawBars();
    if (en.target.id === "chart-donut") drawDonut();
  });
}, { threshold: 0.3 });
["chart-bars", "chart-donut"].forEach(id => chartObserver.observe(document.getElementById(id)));

/* ============ REVEAL ON SCROLL ============ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add("visible");
      revealObserver.unobserve(en.target);
    }
  });
}, { threshold: 0.1 });

function observeReveals() {
  document.querySelectorAll(".card, .live-card, .section-title, .stat, .chart-panel").forEach(el => {
    if (!el.classList.contains("visible")) revealObserver.observe(el);
  });
}

document.querySelectorAll('a[href^="#"]').forEach(a =>
  a.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
  }));

/* ============ LIVE COUNT HOOK ============ */
window.onLiveCount = function (n) {
  const el = document.getElementById("stat-live");
  if (el) el.textContent = n;
};

/* ============ INIT ============ */
window.renderSafeBets = render;
render();
observeReveals();

document.querySelectorAll(".lang-btn").forEach(btn =>
  btn.addEventListener("click", () => setLang(btn.dataset.lang)));

const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobile-menu");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
});
mobileMenu.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    mobileMenu.classList.remove("open");
  }));

let resizeTimer;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (chartsDone.has("chart-bars")) drawBars();
    if (chartsDone.has("chart-donut")) drawDonut();
  }, 250);
});

document.querySelectorAll(".btn-hud").forEach(btn => {
  btn.addEventListener("mousemove", e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.25 - 2}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
});

applyI18n();
document.querySelectorAll(".lang-btn").forEach(b =>
  b.classList.toggle("active", b.dataset.lang === LANG));
