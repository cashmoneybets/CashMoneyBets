/* ============================================================
   v7.7 — ANALYSE MATCH : mise en page stats type SofaScore
   Un clic sur n'importe quelle carte (live, à venir, top picks,
   buts, accumulateur) ouvre cette vue avec le détail du match :
   - LIVE  : stats ESPN (possession, tirs, cadrés, corners) en
     barres duales + moteur Live Bet + 1X2 (cotes ESPN) + live
     History (momentum) déjà dans la vue GRAPHIQUES.
   - PRE   : Poisson (pH/pD/pA, Over 2.5, BTTS), forme, pick,
     coup d'envoi, où regarder.
   Bug évité : les ids prémontage du pool sont "espn-<id>" alors
   que __lastLive garde l'id ESPN brut -> on normalise.
   ============================================================ */

function anaReg(id) { return document.getElementById(id); }

function anaLookup(id) {
  id = String(id);
  const raw = id.replace(/^espn-/, "");
  const es = (window.__lastLive || []).find(x => String(x.id) === raw) || null;
  const pm = (mpool() || []).find(x => String(x.id) === id) || null;
  if (!es && !pm) return null;
  return { es, pm };
}

/* Ligne type SofaScore :   valeur — barre — LABEL — barre — valeur   */
function anaRow(hv, label, av, emph) {
  const num = v => typeof v === "number" ? v : (parseFloat(String(v).replace("%", "")) || 0);
  const h = num(hv), a = num(av), tot = h + a;
  const hp = tot ? (h / tot) * 100 : 50;
  const cls = emph ? "ana-row emph" : "ana-row";
  return `
  <div class="${cls}">
    <b class="ana-val h">${hv}</b>
    <div class="ana-bar h"><i style="width:${hp.toFixed(1)}%"></i></div>
    <span class="ana-lbl">${label}</span>
    <div class="ana-bar a"><i style="width:${(100 - hp).toFixed(1)}%"></i></div>
    <b class="ana-val a">${av}</b>
  </div>`;
}

function anaSec(title, inner) {
  return `<h3 class="ana-sec">${title}</h3>${inner}`;
}

function anaProbs1x2(pH, pD, pA) {
  const row = (label, pct, cls) => `
  <div class="prob-row">
    <span class="prob-name">${label}</span>
    <div class="prob-track"><div class="prob-fill ${cls}" data-p="${pct}"></div></div>
    <b class="prob-val">${pct}%</b>
  </div>`;
  return anaSec(t("ana_1x2"),
    row(tn(anaNameHome), pH, "c-home") + row(t("mkt_draw"), pD, "c-draw") + row(tn(anaNameAway), pA, "c-away"));
}

let anaNameHome = "", anaNameAway = "";

function anaOdds1x2fromEs(m) {
  const ml = (m.oddsRaw && m.oddsRaw.moneyline) || {};
  const d = side => {
    const x = ml[side] && ml[side].close && ml[side].close.odds;
    const v = x ? amToDec(x) : null;
    return v ? 1 / v : null;
  };
  const pH = d("home"), pD = d("draw"), pA = d("away");
  if (!pH || !pD || !pA) return null;
  const s = pH + pD + pA;
  return { pH: Math.round(pH / s * 100), pD: Math.round(pD / s * 100), pA: Math.round(pA / s * 100) };
}

function anaMkts(mk) {
  const mkt = (label, pct) => `
    <div class="mkt">
      <small>${label}</small>
      <b>${pct}%</b>
      <div class="mkt-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  return `<div class="mkts-wrap">
    ${mkt(t("mkt_over15"), mk.over15)}
    ${mkt(t("mkt_over25"), mk.over25)}
    ${mkt(t("mkt_btts"), mk.btts)}
  </div>`;
}

function anaWatch(pm, es) {
  const chans = (pm && pm.tv && (pm.tv[LANG] || pm.tv.fr)) ||
    (es && es.broadcasts ? (es.broadcasts || []).map(b => (b.names || []).join(" · ")).filter(Boolean) : null);
  const venue = (pm && pm.venue) || (es && es.venue) || "";
  if ((chans && chans.length) || venue) {
    return `<div class="ana-meta">
      ${venue ? `<span class="ana-venue">🏟️ ${venue}</span>` : ""}
      ${(chans && chans.length) ? `<span class="ana-tv">📺 ${t("tv_watch")} : ${chans.join(" · ")}</span>` : ""}
    </div>`;
  }
  return venue ? `<div class="ana-meta"><span class="ana-venue">🏟️ ${venue}</span></div>` : "";
}

function anaHeader(m, es, pm) {
  const league = (es && es.league) || (pm && pm.comp) || "";
  const isIn = es && es.state === "in";
  const isPost = es && es.state === "post";
  const badge = isIn ? `<span class="live-status-badge in">● LIVE</span>`
    : isPost ? `<span class="ana-fin">${t("live_finished")}</span>`
    : `<span class="ana-clk-bad"><span class="min">🕒 ${(pm && pm.kickoff) || (es && es.clock) || ""}</span></span>`;
  return `
  <header class="ana-head">
    <span class="ana-league">${league}</span>
    ${badge}
  </header>`;
}

function anaScoreline(m, es, pm) {
  const logo = t => t && t.logo ? `<img class="ana-logo" src="${t.logo}" alt="" loading="lazy">` : "";
  const isIn = es && (es.state === "in" || es.state === "post");
  const esHome = es ? es.home : null, esAway = es ? es.away : null;
  const nh = anaNameHome = pm ? tn(pm.home) : (esHome ? esHome.name : "");
  const na = anaNameAway = pm ? tn(pm.away) : (esAway ? esAway.name : "");
  const score = isIn ? `<div class="ana-score">${esHome.score}<span class="sep"> : </span>${esAway.score}</div>` : "";
  const clock = es && es.state === "in" ? `<span class="ana-live-clk min">${es.displayClock}</span>` : "";
  return `
  <div class="ana-scoreline">
    <div class="ana-team">
      ${logo(esHome)}
      <b>${nh}</b>
    </div>
    <div class="ana-mid">
      ${score || `<div class="ana-vs">VS</div>`}
      ${clock}
    </div>
    <div class="ana-team away">
      <b>${na}</b>
      ${logo(esAway)}
    </div>
  </div>`;
}

function anaForm(pm, es) {
  const fh = (pm && pm.formHome && pm.formHome.length ? pm.formHome : null) ||
             (es && es.formH ? es.formH.split("").filter(c => "WDL".includes(c)).slice(-5) : null);
  const fa = (pm && pm.formAway && pm.formAway.length ? pm.formAway : null) ||
             (es && es.formA ? es.formA.split("").filter(c => "WDL".includes(c)).slice(-5) : null);
  if (!fh && !fa) return "";
  return anaSec(t("ana_form"), `
  <div class="ana-teams-form">
    <div class="atf-row"><small>${anaNameHome}</small><span>${fh ? formChips(fh) : "–"}</span></div>
    <div class="atf-row"><small>${anaNameAway}</small><span>${fa ? formChips(fa) : "–"}</span></div>
  </div>`);
}

function renderAnalyse() {
  const body = anaReg("ana-body");
  if (!body) return;
  const found = anaLookup(window.__anaId || "");
  if (!found) { body.innerHTML = `<div class="live-loading">${t("ana_missing")}</div>`; return; }
  const { es, pm } = found;
  let html = "";

  html += `<div class="card ana-card">`;
  html += anaHeader(found, es, pm);
  html += anaScoreline(found, es, pm);
  html += anaWatch(pm, es);
  html += `</div>`;

  /* ---- stats live type SofaScore ---- */
  if (es && es.state !== "pre" && es.stats && es.stats.length) {
    html += anaSec(t("ana_stats"), es.stats.map(s => anaRow(s.h, s.label, s.a, s.bar)).join(""));
  }

  /* ---- moteur live bet (v6.7) ---- */
  if (es && es.state === "in") {
    try { html += liveBetHTML(es); } catch (e) {}
  }

  /* ---- PROBABILITÉS 1X2 + marchés buts ---- */
  if (pm) {
    const mk = marketsOf(pm);
    html += anaProbs1x2(mk.pH, mk.pD, mk.pA);
    html += anaSec(t("ana_goals"), anaMkts(mk));
    /* pick + confiance */
    const score = safeScore(pm), tier = tierOf(score);
    const tierLbl = (TIER_I18N[tier.label] || {})[LANG] || tier.label;
    const pickTeam = tn(pm.pick === "1" ? pm.home : pm.away);
    html += `
    <div class="pick-box tier-${tier.cls}">
      <div class="pick-left">
        <small>🎯 ${t("mkt_pick")}</small>
        <strong>${t("mkt_pick_win").replace("{team}", pickTeam)}</strong>
      </div>
      <div class="pick-odds">${pm.odds[pm.pick].toFixed(2)}</div>
    </div>`;
  } else if (es) {
    /* live sans fiche pré : 1X2 depuis les cotes ESPN closes */
    const px = anaOdds1x2fromEs(es);
    if (px) html += anaProbs1x2(px.pH, px.pD, px.pA);
  }

  /* ---- forme ---- */
  html += anaForm(pm, es);

  body.innerHTML = html;
  if (typeof animateBars === "function") animateBars();
}
window.renderAnalyse = renderAnalyse;

window.anaOpen = function (id) {
  window.__anaId = String(id);
  showView("analyse");
};

/* délégation : un clic sur une carte ouvre l'analyse */
document.addEventListener("click", e => {
  if (!e || !e.target || !e.target.closest) return;
  const el = e.target.closest("[data-analyse]");
  if (!el) return;
  if (e.target.closest("[data-view]") || e.target.closest(".lb-btn")) return;
  e.preventDefault();
  anaOpen(el.getAttribute("data-analyse"));
}, true);

setInterval(() => {
  const v = anaReg("view-analyse");
  if (v && v.classList.contains("active") && window.__anaId && es_in_view()) renderAnalyse();
}, 45000);
function es_in_view() { return !!(anaLookup(window.__anaId || "") || {}).es; }
