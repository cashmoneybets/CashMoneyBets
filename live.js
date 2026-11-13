/* ============ LIVE SCORES — ESPN public feed ============ */
const LEAGUES = [
  { code: "uefa.nations", name: "NATIONS LEAGUE" },
  { code: "eng.1", name: "PREMIER LEAGUE" },
  { code: "esp.1", name: "LA LIGA" },
  { code: "ger.1", name: "BUNDESLIGA" },
  { code: "ita.1", name: "SERIE A" },
  { code: "fra.1", name: "LIGUE 1" },
  { code: "ned.1", name: "EREDIVISIE" },
  { code: "por.1", name: "LIGA PORTUGAL" },
  { code: "bra.1", name: "BRASILEIRAO" },
  { code: "arg.1", name: "LIGA ARGENTINA" },
  { code: "usa.1", name: "MLS" },
  { code: "mex.1", name: "LIGA MX" },
  { code: "fifa.friendly", name: "AMICAUX INT." },
  { code: "caf.nations", name: "CAN" },
];

const POLL_MS = 45000;
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
    <div class="live-clock">
      <span>${m.state === "in" ? `<span class="min">${m.displayClock}</span>` : m.league}</span>
      <span>${m.home.record ? `${t("season")} ${m.home.record}` : ""}</span>
    </div>
  </article>`;
}

function renderLive(all) {
  /* v5.8 : on n'affiche que les matchs reellement en direct ou termines —
     les matchs pas encore commences polluent la page Live (ils sont deja dans Matchs a venir) */
  const matches = all.filter(m => m.state !== "pre");
  const order = { in: 0, post: 2 };
  matches.sort((a, b) => order[a.state] - order[b.state] || a.id.localeCompare(b.id));
  const shown = matches.slice(0, 15);
  if (shown.length === 0) {
    liveGrid.innerHTML = `<div class="live-loading">${t("live_none")}</div>`;
  } else {
    liveGrid.innerHTML = shown.map(liveCard).join("");
    requestAnimationFrame(() =>
      liveGrid.querySelectorAll(".live-card").forEach(c => c.classList.add("visible")));
  }
  const liveCount = matches.filter(m => m.state === "in").length;
  statLive.textContent = liveCount;
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
