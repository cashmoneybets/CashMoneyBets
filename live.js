/* ============ LIVE SCORES — ESPN public feed ============ */
const LEAGUES = [
  { code: "uefa.champions", name: "CHAMPIONS LEAGUE" },
  { code: "uefa.europa", name: "EUROPA LEAGUE" },
  { code: "uefa.europa.conf", name: "CONFERENCE LEAGUE" },
  { code: "uefa.nations", name: "NATIONS LEAGUE" },
  { code: "eng.1", name: "PREMIER LEAGUE" },
  { code: "eng.2", name: "CHAMPIONSHIP" },
  { code: "esp.1", name: "LA LIGA" },
  { code: "ger.1", name: "BUNDESLIGA" },
  { code: "ita.1", name: "SERIE A" },
  { code: "fra.1", name: "LIGUE 1" },
  { code: "ned.1", name: "EREDIVISIE" },
  { code: "por.1", name: "LIGA PORTUGAL" },
  { code: "sco.1", name: "SCOTTISH PL" },
  { code: "tur.1", name: "SUPER LIG" },
  { code: "ksa.1", name: "SAUDI PRO LEAGUE" },
  { code: "bra.1", name: "BRASILEIRAO" },
  { code: "arg.1", name: "LIGA ARGENTINA" },
  { code: "usa.1", name: "MLS" },
  { code: "mex.1", name: "LIGA MX" },
  { code: "fifa.friendly", name: "AMICAUX INT." },
  { code: "caf.nations", name: "CAN" },
  { code: "fifa.worldq.uefa", name: "ELIM. CD EUROPE" },
  { code: "fifa.worldq.conmebol", name: "ELIM. CD AM. SUD" },
  { code: "fifa.worldq.caf", name: "ELIM. CD AFRIQUE" },
  { code: "fifa.worldq.concacaf", name: "ELIM. CD CONCACAF" },
  { code: "fifa.worldq.afc", name: "ELIM. CD ASIE" },
];

const POLL_MS = 45000;

/* ============ v6.9 — VRAIS MATCHS DU JOUR (fixtures + cotes ESPN) ============ */
/* Ligues de clubs : drapeau = pays de la ligue. Sélections : code FIFA -> ISO2. */
const LEAGUE_CC = {
  "eng.1": "gb-eng", "eng.2": "gb-eng", "esp.1": "es", "ger.1": "de", "ita.1": "it", "fra.1": "fr",
  "ned.1": "nl", "por.1": "pt", "sco.1": "gb-sct", "tur.1": "tr", "ksa.1": "sa",
  "bra.1": "br", "arg.1": "ar", "usa.1": "us", "mex.1": "mx",
};
const FIFA_CC = {
  ALG: "dz", MAR: "ma", EGY: "eg", NGA: "ng", TAN: "tz", KEN: "ke", RSA: "za", GAB: "ga",
  LEO: "ls", CPV: "cv", LBR: "lr", MWI: "mw", ECU: "ec", CRC: "cr", SCO: "gb-sct", MKD: "mk",
  LIE: "li", AZE: "az", SVK: "sk", FRO: "fo", COL: "co", CHI: "cl", NED: "nl", GRE: "gr",
  ARG: "ar", URU: "uy", GER: "de", FRA: "fr", ESP: "es", ITA: "it", ENG: "gb-eng", POR: "pt",
  USA: "us", MEX: "mx", BRA: "br", PUR: "pr", DMA: "dm", CRO: "hr", SUI: "ch", AUT: "at",
  BEL: "be", DEN: "dk", TUR: "tr", WAL: "gb-wls", IRL: "ie", NIR: "gb-nir", ISR: "il",
  SEN: "sn", CIV: "ci", CMR: "cm", GHA: "gh", MLI: "ml", BFA: "bf", ZAM: "zm", MOZ: "mz", TUN: "tn",
  PAR: "py", PER: "pe", VEN: "ve", BOL: "bo", HON: "hn", JAM: "jm", PAN: "pa", SLV: "sv",
  GUI: "gn", BEN: "bj", TOG: "tg", SUD: "sd", ANG: "ao", UGA: "ug", NIG: "ne",
  KOR: "kr", JPN: "jp", IRN: "ir", AUS: "au", KSA: "sa", IRQ: "iq", UAE: "ae", QAT: "qa",
};
function teamCc(team, lg) {
  if (LEAGUE_CC[lg.code]) return LEAGUE_CC[lg.code];
  return FIFA_CC[(team.abbreviation || "").toUpperCase()] || null;
}
function amToDec(ml) {
  const v = parseFloat(ml);
  if (isNaN(v)) return null;
  return v < 0 ? 1 + 100 / Math.abs(v) : 1 + v / 100;
}
function buildRealMatches(all) {
  /* v7.0 : on écarte les faux "pre" (matchs passés reportés, vieux slates) puis
     fenêtre progressive : aujourd'hui d'abord ; journée creuse -> prochaines journées
     (dates affichées sur les cartes). Jamais de match dont le coup d'envoi est passé. */
  const nowKey = d => { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`; };
  const now = Date.now();
  const todayKey = nowKey(now);
  const cand = [];
  for (const m of all) {
    if (m.state !== "pre" || !m.oddsRaw || !m.date) continue;
    const t = new Date(m.date).getTime();
    if (isNaN(t) || t < now - 3 * 3600e3) continue;
    cand.push({ m, t });
  }
  cand.sort((a, b) => a.t - b.t);
  let windowMs = 30 * 3600e3;
  let sel = cand.filter(c => c.t <= now + windowMs);
  while (sel.length < 6 && windowMs < 8 * 86400e3) {
    windowMs *= 2;
    sel = cand.filter(c => c.t <= now + windowMs);
  }
  const out = sel.map(({ m, t }) => {
    const ml = m.oddsRaw.moneyline || {};
    const dec = side => {
      const x = ml[side] && ml[side].close && ml[side].close.odds;
      return x ? amToDec(x) : null;
    };
    const d1 = dec("home"), dX = dec("draw"), d2 = dec("away");
    if (!d1 || !dX || !d2) return null;
    const r2 = x => Math.round(x * 100) / 100;
    const odds = { "1": r2(d1), "X": r2(dX), "2": r2(d2) };
    const pick = d1 <= dX && d1 <= d2 ? "1" : d2 <= dX ? "2" : "X";
    const d = new Date(t);
    const hm = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const isToday = nowKey(t) === todayKey;
    const kickoff = isToday ? hm : `${d.getDate()}/${d.getMonth() + 1} ${hm}`;
    const f = s => (s || "").split("").filter(c => "WDL".includes(c)).slice(-5);
    const chans = (m.broadcasts || []).map(b => (b.names || []).join(" · ")).filter(Boolean);
    return {
      id: "espn-" + m.id, home: m.home.name, away: m.away.name, comp: m.league,
      cc: m.ccH || m.ccA ? [m.ccH, m.ccA] : null,
      kickoff, date: m.date || "", odds, pick, today: isToday,
      tv: chans.length ? { fr: chans, en: chans, de: chans, sq: chans } : null,
      venue: m.venue || "", pitch: "grass",
      formHome: f(m.formH), formAway: f(m.formA),
      real: true,
    };
  }).filter(Boolean);
  out.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return out;
}
let __realSig = "";
window.__applyRealPool = function () {
  if (typeof renderTopPicks !== "function") return;
  try {
    renderTopPicks(); renderButs(); renderUpcoming(); renderAcc(); buildTicker(); renderStatCases(); renderParlay();
  } catch (e) {}
};
const liveGrid = document.getElementById("live-grid");
const liveStatus = document.getElementById("live-status");
const refreshInfo = document.getElementById("refresh-info");
const statLive = document.getElementById("stat-live");

let prevScores = {};
try { prevScores = JSON.parse(localStorage.getItem("cmb_scores") || "{}"); } catch (e) { prevScores = {}; }

function saveScores() {
  try { localStorage.setItem("cmb_scores", JSON.stringify(prevScores)); } catch (e) {}
}

async function fetchLeague(lg) {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.code}/scoreboard`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events || []).map(ev => {
      const comp = ev.competitions[0];
      const home = comp.competitors.find(c => c.homeAway === "home");
      const away = comp.competitors.find(c => c.homeAway === "away");
      const lastGoal = [...(comp.details || [])].reverse().find(d => d.scoringPlay);
      return {
        id: ev.id,
        league: lg.name,
        state: comp.status.type.state,
        clock: comp.status.type.shortDetail || comp.status.type.detail,
        displayClock: comp.status.displayClock || "",
        venue: comp.venue?.fullName || "",
        home: {
          name: home.team.shortDisplayName || home.team.displayName,
          score: parseInt(home.score) || 0,
          logo: home.team.logo,
          color: "#" + (home.team.color || "f5c451"),
          record: home.records?.[0]?.summary || "",
        },
        away: {
          name: away.team.shortDisplayName || away.team.displayName,
          score: parseInt(away.score) || 0,
          logo: away.team.logo,
          color: "#" + (away.team.color || "2effa0"),
          record: away.records?.[0]?.summary || "",
        },
        stats: extractStats(home, away),
        lastScorer: lastGoal ? lastGoal.athletesInvolved?.[0]?.displayName : null,
        date: ev.date,
        ccH: teamCc(home.team, lg), ccA: teamCc(away.team, lg),
        formH: home.form || "", formA: away.form || "",
        oddsRaw: (comp.odds && comp.odds[0]) || null,
        broadcasts: comp.broadcasts || [],
      };
    });
  } catch (e) { return []; }
}

function extractStats(home, away) {
  const get = (c, key) => c.statistics?.find(s => s.name === key)?.displayValue || "–";
  return [
    { label: t("s_poss"), h: get(home, "possessionPct"), a: get(away, "possessionPct"), bar: true },
    { label: t("s_shots"), h: get(home, "totalShots"), a: get(away, "totalShots"), bar: true },
    { label: t("s_sot"), h: get(home, "shotsOnTarget"), a: get(away, "shotsOnTarget"), bar: true },
    { label: t("s_corners"), h: get(home, "wonCorners"), a: get(away, "wonCorners"), bar: true },
  ];
}

/* ============ LIVE BET ENGINE (v6.6) — Over buts + momentum quantique ============ */
function liveBetAdvice(m) {
  const total = (m.home.score || 0) + (m.away.score || 0);
  const mm = String(m.displayClock || "").match(/(\d+)/);
  const min = mm ? Math.min(parseInt(mm[1], 10) || 0, 120) : 0;
  const remain = Math.max(0, 90 - min);
  /* régression vers la moyenne ligue (~2.7 buts/90) pour éviter les λ divergents */
  const rate = (total + 0.03 * min) / Math.max(min, 15);
  const lambda = Math.min(3.2, Math.max(0.08, rate * remain * 0.95));
  const pAtLeast = k => {
    let s = 0, p = Math.exp(-lambda);
    for (let i = 0; i < k; i++) { s += p; p *= lambda / (i + 1); }
    return Math.max(0.02, Math.min(0.97, 1 - s));
  };
  let k = 1;
  while (k < 4 && pAtLeast(k) > 0.85) k++;
  const pOver = pAtLeast(k);
  const line = (total + k - 0.5).toFixed(1);
  const st = m.stats || [];
  const num = i => (parseFloat(st[i] && st[i].h) || 0) + (parseFloat(st[i] && st[i].a) || 0);
  const sot = num(2), shots = num(1), cor = num(3);
  let mom = 0.42;
  mom += Math.min(0.22, sot * 0.024);
  mom += Math.min(0.12, shots * 0.007);
  mom += Math.min(0.08, cor * 0.016);
  if (Math.abs((m.home.score || 0) - (m.away.score || 0)) <= 1) mom += 0.08;
  mom += Math.min(0.12, Math.max(0, (rate - 0.028) * 4));
  if (min > 80) mom -= 0.18;
  if (remain <= 0) mom = 0.05;
  mom = Math.max(0.05, Math.min(0.95, mom));
  return { line, pOver, mom, go: mom >= 0.58 && remain > 0 && pOver >= 0.4 };
}

function liveBetHTML(m) {
  const a = liveBetAdvice(m);
  return `
    <div class="live-bet">
      <div class="lb-head">
        <span class="lb-title">⚡ ${t("lb_engine")}</span>
        <span class="lb-line">OVER ${a.line}</span>
      </div>
      <div class="lb-gauge" title="${t("lb_scan")}">
        <div class="lb-gauge-fill" style="width:${Math.round(a.mom * 100)}%"></div>
        <span class="lb-gauge-val">${Math.round(a.mom * 100)}%</span>
      </div>
      <div class="lb-foot">
        <span class="lb-prob">${t("lb_prob")} <b>${Math.round(a.pOver * 100)}%</b> · ${t("lb_mom")} <b>${Math.round(a.mom * 100)}%</b></span>
        <span class="lb-btn ${a.go ? "go" : "wait"}">${a.go ? `🔥 ${t("lb_bet_now")}` : `⏳ ${t("lb_wait")}`}</span>
      </div>
    </div>`;
}

function liveCard(m) {
  const st = m.state === "in" ? "in" : m.state === "post" ? "post" : "pre";
  const label = m.state === "in" ? "● LIVE" : m.state === "post" ? t("live_finished") : t("live_upcoming");
  const statsHtml = m.state === "pre" ? "" : `
    <div class="live-stats">
      ${m.stats.map(s => {
        const hv = parseFloat(s.h) || 0, av = parseFloat(s.a) || 0;
        const tot = hv + av;
        const hp = tot ? (hv / tot) * 100 : 50;
        return `<div class="ls-row">
          <span class="val">${s.h}</span>
          ${s.bar ? `<div class="ls-bar"><i class="h" style="width:${hp}%"></i><i class="a" style="width:${100 - hp}%"></i></div>` : `<div class="ls-plain"><span>${s.label}</span></div>`}
          <span class="val">${s.a}</span>
        </div>`;
      }).join("")}
    </div>`;
  return `
  <article class="live-card ${st === "in" ? "is-live" : ""}" data-mid="${m.id}">
    <div class="live-head">
      <span class="live-league">${m.league}</span>
      <span class="live-status-badge ${st}">${label}</span>
    </div>
    <div class="live-row">
      <div class="live-team">
        <img src="${m.home.logo}" alt="" loading="lazy" />
        <span class="tname">${m.home.name}</span>
      </div>
      <div class="live-score">${m.home.score}<span class="sep"> : </span>${m.away.score}</div>
      <div class="live-team away">
        <img src="${m.away.logo}" alt="" loading="lazy" />
        <span class="tname">${m.away.name}</span>
      </div>
    </div>
    ${m.state === "pre" ? `<div class="live-note">🏟️ ${m.venue} · ${m.clock}</div>` : statsHtml}
    ${m.state === "in" ? liveBetHTML(m) : ""}
    <div class="live-clock">
      <span>${m.state === "in" ? `<span class="min">${m.displayClock}</span>` : m.league}</span>
      <span>${m.home.record ? `${t("season")} ${m.home.record}` : ""}</span>
    </div>
  </article>`;
}

/* ============ v7.6 — HISTORIQUE LIVE (momentum des cotes) ============ */
function pushHist(matches) {
  const H = window.__oddsHist = window.__oddsHist || {};
  const now = Date.now();
  const amDec = v => {
    if (!v) return null;
    const x = parseInt(String(v).replace(/[^-\d]/g, ""), 10);
    return isNaN(x) ? null : (x < 0 ? 1 + 100 / Math.abs(x) : 1 + x / 100);
  };
  const ids = new Set();
  matches.forEach(m => {
    ids.add(m.id);
    const arr = (H[m.id] = H[m.id] || []);
    const ml = (m.oddsRaw && m.oddsRaw.moneyline) || {};
    arr.push({
      t: now,
      o1: amDec(ml.home && ml.home.close && ml.home.close.odds),
      o2: amDec(ml.away && ml.away.close && ml.away.close.odds),
    });
    if (arr.length > 60) arr.shift();
  });
  Object.keys(H).forEach(id => { if (!ids.has(id)) delete H[id]; });
}
window.pushHist = pushHist;

function renderLive(all) {
  /* v6.6 : uniquement les matchs reellement EN DIRECT — les terminés et les
     pas encore commences ne polluent plus la page Live */
  const matches = all.filter(m => m.state === "in");
  matches.sort((a, b) => a.id.localeCompare(b.id));
  pushHist(matches);   /* v7.6 : historique pour les graphiques momentum */
  const shown = matches.slice(0, 15);
  if (shown.length === 0) {
    liveGrid.innerHTML = `<div class="live-loading">${t("live_none")}</div>`;
  } else {
    liveGrid.innerHTML = shown.map(liveCard).join("");
    requestAnimationFrame(() =>
      liveGrid.querySelectorAll(".live-card").forEach(c => c.classList.add("visible")));
  }
  const liveCount = matches.length;
  if (statLive) statLive.textContent = liveCount;
  liveStatus.textContent = liveCount > 0
    ? `${liveCount} ${t("live_matches")}`
    : t("live_ok");
  refreshInfo.textContent = `· maj ${new Date().toLocaleTimeString("fr-FR")}`;
}

/* ============ GOAL DETECTION ============ */
const overlay = document.getElementById("goal-overlay");

function detectGoals(matches) {
  const goals = [];
  for (const m of matches) {
    ["home", "away"].forEach(side => {
      const key = `${m.id}:${side}`;
      const prev = prevScores[key];
      const cur = m[side].score;
      if (prev !== undefined && cur > prev && m.state === "in") {
        goals.push({ m, side });
      }
      prevScores[key] = cur;
    });
  }
  saveScores();
  return goals;
}

function showGoalAnimation({ m, side }) {
  const team = m[side];
  document.getElementById("goal-text").textContent = t("goal_text");
  document.getElementById("goal-team").textContent = team.name.toUpperCase();
  document.getElementById("goal-team").style.color = team.color === "#000000" ? "#ffffff" : team.color;
  document.getElementById("goal-scorer").textContent =
    m.lastScorer ? `⚽ ${m.lastScorer} · ${m.displayClock}` : `${m.displayClock} · ${m.league}`;
  document.getElementById("goal-score").textContent = `${m.home.score} : ${m.away.score}`;
  overlay.classList.add("show");
  const card = liveGrid.querySelector(`[data-mid="${m.id}"]`);
  if (card) card.classList.add("goal-flash");
  setTimeout(() => {
    overlay.classList.remove("show");
    if (card) card.classList.remove("goal-flash");
  }, 6000);
}

async function pollLive() {
  const results = await Promise.all(LEAGUES.map(fetchLeague));
  const matches = results.flat();
  window.__lastLive = matches;
  const real = buildRealMatches(matches);
  const sig = real.map(m => m.id + ":" + m.odds["1"] + "/" + m.odds["X"] + "/" + m.odds["2"]).join("|");
  if (sig !== __realSig) {
    __realSig = sig;
    window.__REAL_MATCHES = real;
    window.__applyRealPool();
  }
  const goals = detectGoals(matches);
  renderLive(matches);
  if (goals.length > 0) showGoalAnimation(goals[0]);
  if (typeof window.onLiveCount === "function") window.onLiveCount(matches.filter(m => m.state === "in").length);
}

pollLive();
setInterval(pollLive, POLL_MS);

window.renderLiveFromCache = function () {
  if (window.__lastLive) renderLive(window.__lastLive);
};
