/* ============ NEBULA BACKGROUND ============ */
const canvas = document.getElementById("nebula");
const ctx = canvas.getContext("2d");
let W, H, stars = [], clouds = [], mouse = { x: 0.5, y: 0.5 }, shooting = [];

const CLOUD_COLORS = [
  [124, 58, 237, 0.16],   // violet
  [6, 182, 212, 0.13],    // cyan
  [236, 72, 153, 0.11],   // magenta
  [59, 130, 246, 0.12],   // blue
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
  const n = Math.min(320, Math.floor((innerWidth * innerHeight) / 4200));
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.4 + 0.3) * devicePixelRatio,
      tw: Math.random() * Math.PI * 2,
      ts: 0.008 + Math.random() * 0.02,
      depth: Math.random() * 0.8 + 0.2,
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

function spawnShooting() {
  if (Math.random() < 0.006 && shooting.length < 2) {
    shooting.push({
      x: Math.random() * W * 0.8, y: Math.random() * H * 0.35,
      vx: (6 + Math.random() * 6) * devicePixelRatio,
      vy: (2.5 + Math.random() * 3) * devicePixelRatio,
      life: 1,
    });
  }
}

let t = 0;
function drawNebula() {
  t++;
  ctx.clearRect(0, 0, W, H);

  // clouds
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
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // stars
  for (const s of stars) {
    s.tw += s.ts;
    const a = 0.35 + Math.abs(Math.sin(s.tw)) * 0.65;
    const px = s.x + (mouse.x - 0.5) * 24 * s.depth * devicePixelRatio;
    const py = s.y + (mouse.y - 0.5) * 24 * s.depth * devicePixelRatio;
    ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`;
    ctx.beginPath();
    ctx.arc(px, py, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // shooting stars
  spawnShooting();
  for (let i = shooting.length - 1; i >= 0; i--) {
    const s = shooting[i];
    s.x += s.vx; s.y += s.vy; s.life -= 0.02;
    if (s.life <= 0) { shooting.splice(i, 1); continue; }
    const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8);
    grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6 * devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
    ctx.stroke();
  }

  requestAnimationFrame(drawNebula);
}

addEventListener("mousemove", (e) => {
  mouse.x = e.clientX / innerWidth;
  mouse.y = e.clientY / innerHeight;
});
addEventListener("resize", resize);
resize();
buildClouds();
drawNebula();

/* ============ RENDER MATCHES ============ */
const grid = document.getElementById("grid");
const slip = [];
const slipList = document.getElementById("slip-list");
const slipOdds = document.getElementById("slip-odds");
const slipCount = document.getElementById("slip-count");
const stakeInput = document.getElementById("stake");
const slipReturn = document.getElementById("slip-return");

function formChips(form) {
  return form.map(r => `<span class="chip chip-${r}">${r === "W" ? "V" : r === "D" ? "N" : "D"}</span>`).join("");
}

function matchCard(m) {
  const score = safeScore(m);
  const tier = tierOf(score);
  const inSlip = slip.includes(m.id);
  const R = 34, CIRC = 2 * Math.PI * R;
  return `
  <article class="card tilt ${inSlip ? "selected" : ""}" data-id="${m.id}">
    <div class="card-glow"></div>
    <header class="card-head">
      <span class="comp">${m.flag} ${m.comp}</span>
      <span class="kick">🕐 ${m.kickoff} CET</span>
    </header>
    <div class="teams">
      <div class="team home">
        <span class="pick-tag ${m.pick === "1" ? "on" : ""}">1</span>
        <span class="name">${m.home}</span>
        <span class="form">${formChips(m.formHome)}</span>
      </div>
      <div class="vs">VS</div>
      <div class="team away">
        <span class="pick-tag ${m.pick === "2" ? "on" : ""}">2</span>
        <span class="name">${m.away}</span>
        <span class="form">${formChips(m.formAway)}</span>
      </div>
    </div>
    <p class="note">${m.note}</p>
    <div class="card-foot">
      <div class="score-ring" data-score="${score}">
        <svg viewBox="0 0 80 80">
          <circle class="ring-bg" cx="40" cy="40" r="${R}"/>
          <circle class="ring-fg tier-${tier.cls}" cx="40" cy="40" r="${R}"
            stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
        </svg>
        <div class="score-num"><b>${score}</b><small>/100</small></div>
        <span class="tier tier-${tier.cls}">${tier.label}</span>
      </div>
      <div class="odds-box">
        <small>Cote du pari</small>
        <strong>${m.odds[m.pick].toFixed(2)}</strong>
      </div>
      <button class="add-btn ${inSlip ? "added" : ""}" data-id="${m.id}">
        ${inSlip ? "✓ Dans le combiné" : "+ Combiné"}
      </button>
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
  observeReveals();
}

/* ============ FILTERS ============ */
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

/* ============ BET SLIP ============ */
function bindCards() {
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSlip(btn.dataset.id);
    });
  });
  document.querySelectorAll(".tilt").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

function toggleSlip(id) {
  const i = slip.indexOf(id);
  if (i >= 0) slip.splice(i, 1); else slip.push(id);
  updateSlip();
  render(document.querySelector(".filters button.active")?.dataset.filter || "all",
         document.querySelector(".sorts button.active")?.dataset.sort || "score");
}

function combinedOdds() {
  return slip.reduce((acc, id) => {
    const m = MATCHES.find(x => x.id === id);
    return acc * m.odds[m.pick];
  }, 1);
}

function updateSlip() {
  slipCount.textContent = slip.length;
  slipList.innerHTML = slip.length === 0
    ? `<p class="empty">Clique sur « + Combiné » pour construire ton ticket.<br>Le moteur recommande le pari du jour ci-dessous ⚡</p>`
    : slip.map(id => {
        const m = MATCHES.find(x => x.id === id);
        const pickLabel = m.pick === "1" ? m.home : m.away;
        return `<div class="slip-item">
          <span>${pickLabel} <em>(${m.odds[m.pick].toFixed(2)})</em></span>
          <button data-id="${id}" class="rm">✕</button>
        </div>`;
      }).join("");
  slipList.querySelectorAll(".rm").forEach(b =>
    b.addEventListener("click", () => toggleSlip(b.dataset.id)));

  const odds = combinedOdds();
  slipOdds.textContent = slip.length ? odds.toFixed(2) : "—";
  const stake = parseFloat(stakeInput.value) || 0;
  slipReturn.textContent = slip.length ? (stake * odds).toFixed(2) + " €" : "—";
  document.getElementById("slip-badge").classList.toggle("pulse", slip.length > 0);
}

stakeInput.addEventListener("input", updateSlip);

["load-parlay", "load-parlay-2"].forEach(id =>
  document.getElementById(id).addEventListener("click", () => {
    slip.length = 0;
    PARLAY_OF_THE_DAY.forEach(pid => slip.push(pid));
    updateSlip();
    render("all", "score");
    document.getElementById("slip-panel").scrollIntoView({ behavior: "smooth", block: "end" });
  }));

/* ============ RINGS ANIMATION ============ */
function animateRings() {
  document.querySelectorAll(".ring-fg").forEach(ring => {
    const card = ring.closest(".score-ring");
    const score = parseFloat(card.dataset.score);
    const CIRC = 2 * Math.PI * 34;
    ring.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)";
    requestAnimationFrame(() =>
      ring.style.strokeDashoffset = CIRC * (1 - score / 100));
  });
}

/* ============ COUNTERS ============ */
function animateCounter(el, target, suffix, decimals = 0) {
  const dur = 1600, start = performance.now();
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const avgScore = (MATCHES.reduce((a, m) => a + safeScore(m), 0) / MATCHES.length).toFixed(1);
const countersDone = new Set();
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting || countersDone.has(en.target.id)) return;
    countersDone.add(en.target.id);
    if (en.target.id === "stat-matches") animateCounter(en.target, MATCHES.length, "");
    if (en.target.id === "stat-score") animateCounter(en.target, parseFloat(avgScore), "", 1);
    if (en.target.id === "stat-elite") animateCounter(en.target, MATCHES.filter(m => safeScore(m) >= 85).length, "");
    if (en.target.id === "stat-odds") animateCounter(en.target, 1.42, "", 2);
  });
}, { threshold: 0.5 });
document.querySelectorAll(".stat b").forEach(el => counterObserver.observe(el));

/* ============ REVEAL ON SCROLL ============ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add("visible");
      revealObserver.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });

function observeReveals() {
  document.querySelectorAll(".card, .section-title, .stat").forEach(el => {
    if (!el.classList.contains("visible")) revealObserver.observe(el);
  });
}

/* ============ SMOOTH SCROLL ============ */
document.querySelectorAll('a[href^="#"]').forEach(a =>
  a.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  }));

/* ============ INIT ============ */
render();
updateSlip();
