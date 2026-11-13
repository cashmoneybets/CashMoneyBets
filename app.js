/* ============ HUD CLOCK (heure locale de l'utilisateur) ============ */
function tickClock() {
  const el = document.getElementById("hud-clock");
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour12: false });
}
setInterval(tickClock, 1000);
tickClock();

/* ============ VIEW ROUTER (Accueil / LIVE / BUTS) ============ */
const VIEWS = ["home", "live", "buts", "avenir", "acc"];
function showView(name) {
  document.querySelectorAll(".view").forEach(v =>
    v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll("[data-view]").forEach(a =>
    a.classList.toggle("active", a.dataset.view === name));
  window.scrollTo(0, 0);
  positionFx();
  requestAnimationFrame(() => requestAnimationFrame(positionFx));
  observeReveals();
}
function routeFromHash() {
  const h = location.hash.replace("#", "");
  showView(VIEWS.includes(h) ? h : "home");
}
addEventListener("hashchange", routeFromHash);

const CC_MAP = { SC: "gb-sct" };
function flagUrl(cc) { return "https://flagcdn.com/w80/" + (CC_MAP[cc] || cc).toLowerCase() + ".png"; }
function flagImg(cc) { return `<img class="flag-img" src="${flagUrl(cc)}" alt="${cc}" width="24" height="16" loading="lazy">`; }
function ccB(m) { return `<span class="ccb">${flagImg(m.cc[0])}${flagImg(m.cc[1])}</span>`; }
function ccOne(m, side) { return `<span class="ccb">${flagImg(m.cc[side])}</span>`; }

/* ============ TICKER ============ */
function buildTicker() {
  const items = [...MATCHES]
    .sort((a, b) => safeScore(b) - safeScore(a))
    .map(m => {
      const arrow = safeScore(m) >= 85 ? "▲" : safeScore(m) >= 78 ? "▶" : "▼";
      const cls = safeScore(m) >= 85 ? "up" : safeScore(m) >= 78 ? "" : "lbl";
      return `<span><span class="lbl">${ccB(m)} ${tn(m.home).toUpperCase()}-${tn(m.away).toUpperCase()}</span> <b class="${cls}">${m.odds[m.pick].toFixed(2)}</b> <span class="${cls}">${arrow}</span> <span class="lbl">SCORE ${safeScore(m)}</span></span>`;
    }).join("");
  document.getElementById("ticker").innerHTML =
    `<div class="ticker-track">${items}${items}</div>`;
}
window.buildTicker = buildTicker;

/* ============ CARTES DE PARIS (accueil + buts) ============ */
const topGrid = document.getElementById("top-grid");
const butsGrid = document.getElementById("buts-grid");
const BEST_SCORE = Math.max(...MATCHES.map(m => safeScore(m)));
const BEST_OVER = Math.max(...MATCHES.map(m => marketsOf(m).over15));
function flashCls(score, tier) {
  if (score >= BEST_SCORE) return " neon-green";
  if (tier.cls === "value") return " neon-red";
  return "";
}
function rollBall() {
  return `<span class="roll-ball">⚽</span>`;
}
function formChips(form) {
  return form.map(r => `<span class="chip chip-${r}">${r === "W" ? "V" : r === "D" ? "N" : "D"}</span>`).join("");
}

function teamsRow(m) {
  return `
    <div class="teams">
      <div class="team home">
        <span class="name">${tn(m.home)}</span>
        <span class="form">${formChips(m.formHome)}</span>
      </div>
      <div class="vs">VS</div>
      <div class="team away">
        <span class="name">${tn(m.away)}</span>
        <span class="form">${formChips(m.formAway)}</span>
      </div>
    </div>`;
}

function tvRow(m) {
  const chans = (m.tv && (m.tv[LANG] || m.tv.fr)) || [];
  if (!chans.length) return "";
  return `
    <div class="tv-row">
      <small class="tv-lbl">📺 ${t("tv_watch")}</small>
      <div class="tv-chips">${chans.map(c => `<span class="tv-chip">${c}</span>`).join("")}</div>
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
  const pickTeam = tn(m.pick === "1" ? m.home : m.away);
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
    <i class="card-bg"></i>
    ${rollBall()}
    <header class="card-head">
      <span class="comp">${ccB(m)} ${compLbl}</span>
      <span class="kick">🕗 ${m.kickoff} CET</span>
    </header>
    ${teamsRow(m)}
    ${tvRow(m)}
    <div class="pick-box tier-${tier.cls}${flashCls(score, tier)}${score >= BEST_SCORE ? " on-fire" : ""}">
      <div class="pick-left">
        <small>🎯 ${t("mkt_pick")}</small>
        <strong>${pickLbl}</strong>
      </div>
      <div class="pick-odds">${m.odds[m.pick].toFixed(2)}</div>
    </div>
    <div class="probs">
      <small class="probs-title">${t("mkt_1x2")}</small>
      ${bar(tn(m.home), mk.pH, "c-home")}
      ${bar(t("mkt_draw"), mk.pD, "c-draw")}
      ${bar(tn(m.away), mk.pA, "c-away")}
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
  const pickTeam = tn(m.pick === "1" ? m.home : m.away);
  const pickLbl = t("mkt_pick_win").replace("{team}", pickTeam);
  const gbar = (label, pct, cls, isBest) => `
    <div class="g-market${pct >= 60 ? " safe" : ""}${isBest ? " g-star" : ""}">
      ${pct >= 60 ? `<span class="g-safe">✓ ${t("g_safe")}</span>` : ""}
      <small>${label}</small>
      <b>${pct}%</b>
      <div class="g-track"><div class="g-fill ${cls}" data-p="${pct}"></div></div>
      <em>@ ${(100 / pct).toFixed(2)}</em>
    </div>`;
  return `
  <article class="card g-card tilt" data-id="${m.id}">
    <i class="card-bg"></i>
    ${rollBall()}
    <header class="card-head">
      <span class="comp">${ccB(m)} ${compLbl}</span>
      <span class="kick">🕗 ${m.kickoff} CET</span>
    </header>
    ${teamsRow(m)}
    <div class="pick-box tier-${tier.cls}${flashCls(score, tier)}${score >= BEST_SCORE ? " on-fire" : ""}">
      <div class="pick-left">
        <small>🎯 ${t("mkt_pick")}</small>
        <strong>${pickLbl}</strong>
      </div>
      <div class="pick-odds">${m.odds[m.pick].toFixed(2)}</div>
    </div>
    <div class="g-grid">
      ${gbar(t("mkt_over15"), mk.over15, "g1", best.key === "mkt_over15")}
      ${gbar(t("mkt_over25"), mk.over25, "g2", best.key === "mkt_over25")}
      ${gbar(t("mkt_btts"), mk.btts, "g3", false)}
    </div>
    <div class="g-best${best.pct >= BEST_OVER ? " neon-green" : tier.cls === "value" ? " neon-red" : ""}">🎯 ${t("g_best")} : <b>${t(best.key)} · ${best.pct}%</b> <em>@ ${(100 / best.pct).toFixed(2)}</em></div>
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

/* ============ VUE GAMES TO COME ============ */
function renderUpcoming() {
  const upGrid = document.getElementById("up-grid");
  if (!upGrid) return;
  const list = [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a));
  upGrid.innerHTML = list.map(matchCard).join("");
  bindCards();
  requestAnimationFrame(animateRings);
  requestAnimationFrame(animateBars);
  observeReveals();
}
window.renderUpcoming = renderUpcoming;


/* ============ VUE ACCUMULATEUR — combinés du bot ============ */
function apPlayer() {
  return `<svg class="acc-player" viewBox="0 0 90 150" aria-hidden="true">
    <defs>
      <linearGradient id="apk1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#f5c451"/><stop offset="1" stop-color="#b8860b"/>
      </linearGradient>
      <linearGradient id="aps1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4d7b0"/><stop offset="1" stop-color="#c98d5f"/>
      </linearGradient>
      <radialGradient id="aph1" cx=".35" cy=".3" r="1">
        <stop offset="0" stop-color="#f7ddba"/><stop offset=".7" stop-color="#dba675"/><stop offset="1" stop-color="#b07f4f"/>
      </radialGradient>
    </defs>
    <ellipse cx="45" cy="144" rx="24" ry="5" fill="rgba(0,0,0,0.45)"/>
    <rect x="34" y="96" width="9" height="34" rx="4" fill="url(#aps1)"/>
    <rect x="47" y="96" width="9" height="34" rx="4" fill="url(#aps1)"/>
    <rect x="34" y="118" width="9" height="10" rx="3" fill="#b8860b"/>
    <rect x="47" y="118" width="9" height="10" rx="3" fill="#b8860b"/>
    <rect x="31" y="128" width="14" height="7" rx="3" fill="#14141a"/>
    <rect x="46" y="128" width="14" height="7" rx="3" fill="#14141a"/>
    <rect x="31" y="84" width="28" height="16" rx="5" fill="#1d232e"/>
    <path d="M33 52 Q45 46 57 52 L59 88 Q45 93 31 88 Z" fill="url(#apk1)"/>
    <text x="45" y="78" font-size="12" text-anchor="middle" fill="#14141a" font-family="Orbitron, sans-serif" font-weight="bold">9</text>
    <rect x="25" y="54" width="8" height="30" rx="4" fill="url(#aps1)" transform="rotate(10 29 56)"/>
    <g class="ap-arm">
      <rect x="57" y="52" width="9" height="36" rx="4.5" fill="url(#aps1)" transform="rotate(-34 61 54)"/>
      <circle cx="75" cy="86" r="5.5" fill="url(#aps1)"/>
      <rect x="72.5" y="88" width="4.5" height="10" rx="2.2" fill="url(#aps1)"/>
    </g>
    <circle cx="45" cy="36" r="14" fill="url(#aph1)"/>
    <path d="M31 34 Q33 19 45 19 Q57 19 59 34 Q52 25 45 26 Q38 25 31 34 Z" fill="#2a2118"/>
    <g class="ap-hint">
      <path d="M74 102 L67 112 L74 122" fill="none" stroke="#2effa0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`;
}

function apMoneyPlayer() {
  const bx = [6, 16, 27, 38, 50, 61, 72, 83, 90, 22, 46, 68];
  const bills = Array.from({ length: 12 }, (_, i) => {
    const land = (74 + (i % 4) * 4.5 + (i > 7 ? 3 : 0)).toFixed(1);
    const rrot = (-95 + (i % 5) * 8 - 4).toFixed(0);
    const dur = (3.6 + (i % 3) * 0.6).toFixed(2);
    return `<i style="left:${bx[i]}%;--land:${land}%;--rrot:${rrot}deg;animation-delay:${(i * 0.55).toFixed(2)}s;animation-duration:${dur}s">💵</i>`;
  }).join("");
  return `<span class="ap-bills">${bills}</span>
  <svg class="acc-player acc-player-money" viewBox="0 0 90 150" aria-hidden="true">
    <defs>
      <linearGradient id="apk2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#f5c451"/><stop offset="1" stop-color="#b8860b"/>
      </linearGradient>
      <linearGradient id="aps2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4d7b0"/><stop offset="1" stop-color="#c98d5f"/>
      </linearGradient>
      <radialGradient id="aph2" cx=".35" cy=".3" r="1">
        <stop offset="0" stop-color="#f7ddba"/><stop offset=".7" stop-color="#dba675"/><stop offset="1" stop-color="#b07f4f"/>
      </radialGradient>
    </defs>
    <ellipse cx="45" cy="144" rx="24" ry="5" fill="rgba(0,0,0,0.45)"/>
    <rect x="34" y="96" width="9" height="34" rx="4" fill="url(#aps2)"/>
    <rect x="47" y="96" width="9" height="34" rx="4" fill="url(#aps2)"/>
    <rect x="34" y="118" width="9" height="10" rx="3" fill="#b8860b"/>
    <rect x="47" y="118" width="9" height="10" rx="3" fill="#b8860b"/>
    <rect x="31" y="128" width="14" height="7" rx="3" fill="#14141a"/>
    <rect x="46" y="128" width="14" height="7" rx="3" fill="#14141a"/>
    <rect x="31" y="84" width="28" height="16" rx="5" fill="#1d232e"/>
    <path d="M33 52 Q45 46 57 52 L59 88 Q45 93 31 88 Z" fill="url(#apk2)"/>
    <text x="45" y="80" font-size="12" text-anchor="middle" fill="#14141a" font-family="Orbitron, sans-serif" font-weight="bold">10</text>
    <g class="apm-arm-l">
      <rect x="25" y="54" width="8" height="26" rx="4" fill="url(#aps2)" transform="rotate(58 29 58)"/>
      <circle cx="36" cy="64" r="5" fill="url(#aps2)"/>
      <g class="apm-hold">
        <rect x="28" y="57" width="18" height="11" rx="2" fill="#2effa0" stroke="#0c6e3f" stroke-width="1.5"/>
        <rect x="30" y="54" width="14" height="4" rx="1" fill="#7dffb8" stroke="#0c6e3f" stroke-width="1"/>
        <text x="37" y="66" font-size="8" text-anchor="middle" fill="#0c6e3f" font-family="Orbitron, sans-serif" font-weight="bold">$</text>
      </g>
    </g>
    <g class="apm-arm-r">
      <rect x="57" y="52" width="9" height="36" rx="4.5" fill="url(#aps2)"/>
      <circle cx="61.5" cy="90" r="5.5" fill="url(#aps2)"/>
      <rect x="59" y="92" width="4.5" height="9" rx="2.2" fill="url(#aps2)"/>
    </g>
    <g class="apm-head">
      <circle cx="45" cy="32" r="14" fill="url(#aph2)"/>
      <path d="M31 30 Q33 15 45 15 Q57 15 59 30 Q52 21 45 22 Q38 21 31 30 Z" fill="#2a2118"/>
    </g>
  </svg>`;
}

function comboCard(nameKey, ids, best) {
  const ms = ids.map(id => MATCHES.find(m => m.id === id)).filter(Boolean);
  const odds = ms.reduce((a, m) => a * m.odds[m.pick], 1);
  const conf = ms.reduce((a, m) => a + safeScore(m), 0) / ms.length;
  const legs = ms.map(m => {
    const team = tn(m.pick === "1" ? m.home : m.away);
    return `<div class="acc-leg"><span class="al-flag">${ccOne(m, m.pick === "1" ? 0 : 1)}</span><span class="al-team">${team}</span><span class="al-pick">${t("mkt_pick_win").replace("{team}", team)}</span><b class="al-odds">${m.odds[m.pick].toFixed(2)}</b></div>`;
  }).join("");
  return `
  <article class="card acc-card${best ? " acc-best" : ""}">
    <i class="card-bg"></i>
    ${best ? `<span class="acc-best-tag">👑 ${t("acc_best")}</span>` : ""}
    ${best ? apMoneyPlayer() : apPlayer()}
    <h3 class="acc-name">${t(nameKey)}</h3>
    <small class="acc-legs-lbl">${t("acc_legs")} · ${ms.length}</small>
    <div class="acc-legs">${legs}</div>
    <div class="acc-foot">
      <div class="acc-conf"><small>${t("acc_conf")}</small><b>${conf.toFixed(1)}</b></div>
      <div class="acc-odds-big"><small>${t("parlay_lbl")}</small><b>${odds.toFixed(2)}</b></div>
    </div>
  </article>`;
}

function renderAcc() {
  const accGrid = document.getElementById("acc-grid");
  if (!accGrid) return;
  const byScore = [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a));
  const byOdds = byScore.filter(m => safeScore(m) >= 78)
    .sort((a, b) => b.odds[b.pick] - a.odds[a.pick]);
  const combos = [
    ["acc_safe", byScore.slice(0, 2).map(m => m.id), false],
    ["acc_triple", byScore.slice(0, 3).map(m => m.id), true],
    ["acc_value", byOdds.slice(0, 3).map(m => m.id), false],
  ];
  accGrid.innerHTML = combos.map(([k, ids, best]) => comboCard(k, ids, best)).join("");
  observeReveals();
}
window.renderAcc = renderAcc;

function fxCard(card) {
  const ball = card.querySelector(":scope > .roll-ball");
  const mkts = card.querySelectorAll(".mkt, .g-market");
  mkts.forEach(el => el.classList.remove("mkt-target"));
  if (!ball || !mkts.length) return;
  let bestMkt = null, bv = -1;
  mkts.forEach(el => {
    const b = el.querySelector("b");
    const v = b ? parseFloat(b.textContent) || 0 : 0;
    if (v > bv) { bv = v; bestMkt = el; }
  });
  if (!bestMkt) return;
  bestMkt.classList.add("mkt-target");
  const cr = card.getBoundingClientRect();
  const mr = bestMkt.getBoundingClientRect();
  if (!cr.width || !mr.width) return;
  const half = Math.max(20, ball.offsetWidth / 2);
  ball.style.setProperty("--drop-x", (mr.left - cr.left + mr.width / 2 - half).toFixed(0) + "px");
  ball.style.setProperty("--drop-y", (mr.top - cr.top + mr.height / 2 - half).toFixed(0) + "px");
}

function bindCards() {
  document.querySelectorAll(".tilt").forEach((card, i) => {
    card.style.animationDelay = `-${((i * 1.3) % 7).toFixed(1)}s`;
    fxCard(card);
    card.addEventListener("mousemove", e => {
      card.classList.add("tilting");
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -9;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("tilting");
      card.style.transform = "";
    });
  });
  if (window.initFire) window.initFire();
}

function positionFx() {
  document.querySelectorAll(".tilt").forEach(fxCard);
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
      if (en.target.classList.contains("tilt")) fxCard(en.target);
      revealObserver.unobserve(en.target);
    }
  });
}, { threshold: 0.1 });

function observeReveals() {
  document.querySelectorAll(".card, .live-card, .section-title, .stat, .parlay-banner, .n-tile").forEach(el => {
    if (!el.classList.contains("visible")) revealObserver.observe(el);
  });
}

/* ============ LIVE COUNT HOOK ============ */
window.onLiveCount = function (n) {
  window.__liveCount = n;
  const el = document.getElementById("stat-live");
  if (el) el.textContent = n;
  const d = document.getElementById("detail-live");
  if (d && document.getElementById("case-live")?.classList.contains("open")) {
    d.innerHTML = liveDetail();
  }
};

/* ============ CASES STATS INTERACTIVES (dans le stade) ============ */
function liveDetail() {
  const n = window.__liveCount || 0;
  return `<div class="sd-row"><span>${n} ${t("live_matches")}</span></div>
    <a class="sd-link" href="#live">${t("btn_live")}</a>`;
}

function statDetail(id) {
  if (id === "stat-matches") {
    const comps = {};
    MATCHES.forEach(m => {
      const k = tr(COMP_I18N[m.comp]) || m.comp;
      comps[k] = (comps[k] || 0) + 1;
    });
    return Object.entries(comps)
      .map(([c, n]) => `<div class="sd-row"><span>${c}</span><b>${n}</b></div>`).join("");
  }
  if (id === "stat-score") {
    return [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a)).slice(0, 3)
      .map(m => `<div class="sd-row"><span>${ccB(m)} ${tn(m.home)} - ${tn(m.away)}</span><b>${safeScore(m)}</b></div>`).join("");
  }
  if (id === "stat-elite") {
    const e = MATCHES.filter(m => safeScore(m) >= 85);
    return e.map(m => `<div class="sd-row"><span>${ccB(m)} ${tn(m.home)} - ${tn(m.away)}</span><b>${safeScore(m)}</b></div>`).join("");
  }
  if (id === "stat-live") return liveDetail();
  return "";
}

function renderStatCases() {
  [["case-matches", "stat-matches", "detail-matches"],
   ["case-score", "stat-score", "detail-score"],
   ["case-elite", "stat-elite", "detail-elite"],
   ["case-live", "stat-live", "detail-live"]].forEach(([cid, sid, did]) => {
    const box = document.getElementById(cid);
    if (!box) return;
    const det = document.getElementById(did);
    if (det && box.classList.contains("open")) det.innerHTML = statDetail(sid);
  });
}
window.renderStatCases = renderStatCases;

document.querySelectorAll(".st-case").forEach(btn => {
  btn.addEventListener("click", () => {
    const wasOpen = btn.classList.contains("open");
    document.querySelectorAll(".st-case.open").forEach(c => c.classList.remove("open"));
    if (!wasOpen) {
      btn.classList.add("open");
      const det = btn.querySelector(".st-detail");
      const sid = btn.querySelector("b[id]")?.id;
      if (det && sid) det.innerHTML = statDetail(sid);
    }
  });
});

/* ============ INIT ============ */
renderTopPicks();
renderButs();
renderUpcoming();
renderAcc();
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
