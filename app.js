/* ============ HUD CLOCK ============ */
setInterval(() => {
  const el = document.getElementById("hud-clock");
  if (el) el.textContent = new Date().toISOString().slice(11, 19) + " UTC";
}, 1000);

/* ============ VIEW ROUTER (Accueil / LIVE / BUTS) ============ */
const VIEWS = ["home", "live", "buts"];
function showView(name) {
  document.querySelectorAll(".view").forEach(v =>
    v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll("[data-view]").forEach(a =>
    a.classList.toggle("active", a.dataset.view === name));
  window.scrollTo(0, 0);
  observeReveals();
}
function routeFromHash() {
  const h = location.hash.replace("#", "");
  showView(VIEWS.includes(h) ? h : "home");
}
addEventListener("hashchange", routeFromHash);

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

/* ============ CARTES DE PARIS (accueil + buts) ============ */
const topGrid = document.getElementById("top-grid");
const butsGrid = document.getElementById("buts-grid");

function formChips(form) {
  return form.map(r => `<span class="chip chip-${r}">${r === "W" ? "V" : r === "D" ? "N" : "D"}</span>`).join("");
}

function teamsRow(m) {
  return `
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
    </div>`;
}

function confidenceBlock(score, tier, tierLbl) {
  const R = 27, CIRC = 2 * Math.PI * R;
  return `
    <div class="confidence tier-${tier.cls}" data-score="${score}">
      <div class="conf-ring">
        <svg viewBox="0 0 64 64">
          <circle class="ring-bg" cx="32" cy="32" r="${R}"/>
          <circle class="ring-fg tier-${tier.cls}" cx="32" cy="32" r="${R}"
            stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="${CIRC.toFixed(1)}"/>
        </svg>
        <b class="conf-num">${score}</b>
      </div>
      <div class="conf-info">
        <small>${t("conf_label")}</small>
        <div class="conf-val">${score}<span>/100</span></div>
        <span class="tier tier-${tier.cls}">${tierLbl}</span>
      </div>
    </div>`;
}

function matchCard(m) {
  const score = safeScore(m);
  const tier = tierOf(score);
  const tierLbl = (TIER_I18N[tier.label] || {})[LANG] || tier.label;
  const compLbl = tr(COMP_I18N[m.comp]) || m.comp;
  const mk = marketsOf(m);
  const pickTeam = m.pick === "1" ? m.home : m.away;
  const pickLbl = t("mkt_pick_win").replace("{team}", pickTeam);
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
    ${teamsRow(m)}
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
    ${confidenceBlock(score, tier, tierLbl)}
  </article>`;
}

function renderTopPicks() {
  const list = [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a)).slice(0, 3);
  topGrid.innerHTML = list.map(matchCard).join("");
  bindCards();
  requestAnimationFrame(animateRings);
  requestAnimationFrame(animateBars);
  observeReveals();
}
window.renderSafeBets = renderTopPicks;

/* ============ VUE BUTS — propositions over avec % ============ */
function goalsCard(m) {
  const mk = marketsOf(m);
  const compLbl = tr(COMP_I18N[m.comp]) || m.comp;
  const score = safeScore(m);
  const tier = tierOf(score);
  const tierLbl = (TIER_I18N[tier.label] || {})[LANG] || tier.label;
  const best = mk.over25 >= 55
    ? { key: "mkt_over25", pct: mk.over25 }
    : { key: "mkt_over15", pct: mk.over15 };
  const gbar = (label, pct, cls) => `
    <div class="g-market${pct >= 60 ? " safe" : ""}">
      ${pct >= 60 ? `<span class="g-safe">✓ ${t("g_safe")}</span>` : ""}
      <small>${label}</small>
      <b>${pct}%</b>
      <div class="g-track"><div class="g-fill ${cls}" data-p="${pct}"></div></div>
      <em>@ ${(100 / pct).toFixed(2)}</em>
    </div>`;
  return `
  <article class="card g-card tilt" data-id="${m.id}">
    <header class="card-head">
      <span class="comp">${m.flag} ${compLbl}</span>
      <span class="kick">🕗 ${m.kickoff} CET</span>
    </header>
    ${teamsRow(m)}
    <div class="g-grid">
      ${gbar(t("mkt_over15"), mk.over15, "g1")}
      ${gbar(t("mkt_over25"), mk.over25, "g2")}
      ${gbar(t("mkt_btts"), mk.btts, "g3")}
    </div>
    <div class="g-best">🎯 ${t("g_best")} : <b>${t(best.key)} · ${best.pct}%</b> <em>@ ${(100 / best.pct).toFixed(2)}</em></div>
    <small class="g-est-note">${t("g_est_note")}</small>
    <p class="note">${tr(m.note)}</p>
    ${confidenceBlock(score, tier, tierLbl)}
  </article>`;
}

function renderButs() {
  const list = [...MATCHES].sort((a, b) => marketsOf(b).over25 - marketsOf(a).over25);
  butsGrid.innerHTML = list.map(goalsCard).join("");
  bindCards();
  requestAnimationFrame(animateBars);
  observeReveals();
}
window.renderButs = renderButs;

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
    const holder = ring.closest("[data-score]");
    if (!holder) return;
    const score = parseFloat(holder.dataset.score);
    const CIRC = 2 * Math.PI * parseFloat(ring.getAttribute("r"));
    ring.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)";
    requestAnimationFrame(() => ring.style.strokeDashoffset = CIRC * (1 - score / 100));
  });
}

function animateBars() {
  document.querySelectorAll(".prob-fill, .g-fill").forEach(fill => {
    fill.style.width = "0%";
    fill.style.transition = "width 1.2s cubic-bezier(.22,1,.36,1)";
    requestAnimationFrame(() => fill.style.width = fill.dataset.p + "%");
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
  document.querySelectorAll(".card, .live-card, .section-title, .stat, .parlay-banner").forEach(el => {
    if (!el.classList.contains("visible")) revealObserver.observe(el);
  });
}

/* ============ LIVE COUNT HOOK ============ */
window.onLiveCount = function (n) {
  const el = document.getElementById("stat-live");
  if (el) el.textContent = n;
};

/* ============ INIT ============ */
renderTopPicks();
renderButs();
observeReveals();
routeFromHash();

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
