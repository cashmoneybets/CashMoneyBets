/* ============ v6.2 — ASK THE BOT (assistant paris, 100% client) ============ */
/* Le bot connaît les 15 matchs, Safe Scores, cotes, marchés buts (Poisson) et chaînes TV.
   Aucune requête externe : tout tourne dans le navigateur. */

function botNorm(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function botNum(s) {
  const m = botNorm(s).match(/(\d+(?:[.,]\d+)?)/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

function botCard(m, leg) {
  const score = safeScore(m);
  const cls = score >= 85 ? "elite" : score >= 78 ? "solid" : "value";
  const pickTeam = tn(m.pick === "1" ? m.home : m.away);
  return `
    <div class="bot-card">
      <div class="bc-head">
        <span class="bc-comp">${flagImg(m.cc[0])}${flagImg(m.cc[1])} ${m.kickoff}</span>
        <span class="bc-right">${leg ? `<span class="bc-leg">LEG ${leg}</span>` : ""}<span class="bc-odds">@ ${m.odds[m.pick].toFixed(2)}</span><span class="bc-score bc-${cls}">${score}</span></span>
      </div>
      <div class="bc-teams">${tn(m.home)} <i>vs</i> ${tn(m.away)}</div>
      <div class="bc-pick"><span>${t("mkt_pick_win").replace("{team}", pickTeam)}</span><b>${m.odds[m.pick].toFixed(2)}</b></div>
    </div>`;
}

function botKCombos(arr, k) {
  if (k === 1) return arr.map(x => [x]);
  const out = [];
  for (let i = 0; i <= arr.length - k; i++)
    for (const c of botKCombos(arr.slice(i + 1), k - 1)) out.push([arr[i], ...c]);
  return out;
}

function botBuildAcc(target) {
  const top = [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a));
  let best = null;
  for (let n = 2; n <= 5; n++) {
    for (const c of botKCombos(top, n)) {
      const prod = c.reduce((s, m) => s * m.odds[m.pick], 1);
      const conf = Math.round(c.reduce((s, m) => s + safeScore(m), 0) / c.length);
      const over = prod > target * 1.15;
      const penalty = (over ? 10 + (prod - target) : Math.abs(prod - target)) - conf / 100;
      if (!best || penalty < best.penalty) best = { legs: c, prod, conf, penalty };
    }
  }
  return best;
}

function botGoalsList() {
  return [...MATCHES]
    .map(m => {
      const mk = marketsOf(m);
      const entries = [
        { lbl: t("mkt_over15"), pct: mk.over15 },
        { lbl: t("mkt_over25"), pct: mk.over25 },
        { lbl: t("mkt_btts"), pct: mk.btts },
      ].sort((a, b) => b.pct - a.pct);
      return { m, best: entries[0], all: entries };
    })
    .sort((a, b) => b.best.pct - a.best.pct)
    .slice(0, 4);
}

function botAnswer(raw) {
  const q = botNorm(raw);
  const num = botNum(q);
  const has = (...ws) => ws.some(w => q.includes(w));

  if (has("accumul", "akumulator", "combi", "ticket", "parlay", "acca") ||
      (num !== null && num >= 2 && !has("over", "but", "goal", "tor", "gol", "btts"))) {
    const target = num && num >= 1.2 ? num : 4;
    const acc = botBuildAcc(target);
    const cards = acc.legs.map((m, i) => botCard(m, i + 1)).join("");
    const calc = acc.legs.map(m => m.odds[m.pick].toFixed(2)).join(" \u00d7 ");
    const done = t("bot_acc_done")
      .replace("{odds}", acc.prod.toFixed(2)).replace("{conf}", acc.conf);
    const capped = acc.prod < target * 0.85
      ? `<p>${t("bot_acc_max").replace("{target}", target).replace("{odds}", acc.prod.toFixed(2))}</p>`
      : "";
    return `${capped}<p>${t("bot_acc_intro").replace("{target}", target)}</p>${cards}<p class="bot-done">${done}<span class="bot-calc">${calc} = <b>${acc.prod.toFixed(2)}</b></span></p>`;
  }

  if (has("safe", "sur", "sure", "sicher", "sigurt", "fiable")) {
    const top = [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a)).slice(0, 3);
    return `<p>${t("bot_safe_intro").replace("{n}", top.length)}</p>${top.map(botCard).join("")}`;
  }

  if (has("over", "buts", "but ", "goals", "goal", "tor", "gol", "btts", "marquent", "1.5", "2.5")) {
    const list = botGoalsList();
    const cards = list.map(x => `
      <div class="bot-card">
        <div class="bc-head">
          <span class="bc-comp">${flagImg(x.m.cc[0])}${flagImg(x.m.cc[1])} ${x.m.kickoff}</span>
          <span class="bc-score bc-${x.best.pct >= 70 ? "elite" : x.best.pct >= 55 ? "solid" : "value"}">${x.best.pct}%</span>
        </div>
        <div class="bc-teams">${tn(x.m.home)} <i>vs</i> ${tn(x.m.away)}</div>
        <div class="bc-pick"><span>${x.best.lbl}</span><b>${x.best.pct}%</b></div>
        <div class="bc-mkt">${x.all.map(e => `<small>${e.lbl} ${e.pct}%</small>`).join("")}</div>
      </div>`).join("");
    return `<p>${t("bot_goals_intro")}</p>${cards}`;
  }

  if (has("chaine", "chaine ", "tv", "channel", "regarder", "watch", "schauen", "shikoj", "shikosh", "diffus")) {
    const top = [...MATCHES].sort((a, b) => safeScore(b) - safeScore(a)).slice(0, 5);
    const rows = top.map(m => {
      const chans = (m.tv && (m.tv[LANG] || m.tv.fr)) || [];
      return `<div class="bot-tv"><b>${flagImg(m.cc[0])}${flagImg(m.cc[1])} ${tn(m.home)} - ${tn(m.away)}</b>
        <span>${chans.length ? chans.join(" \u00b7 ") : "\u2014"}</span></div>`;
    }).join("");
    return `<p>${t("bot_tv_intro")}</p>${rows}`;
  }

  if (has("live", "direct", "en cours", "now")) {
    return `<p>${t("bot_live_intro")}</p><p><a class="bot-link" href="#live" data-view="live">\u27f6 LIVE</a></p>`;
  }

  if (has("salut", "bonjour", "hello", "hi ", "hey", "ciao", "pershendetje", "hallo")) {
    return `<p>${t("bot_hello")}</p>`;
  }

  return `<p>${t("bot_notfound")}</p>`;
}

function botEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function botAdd(who, html) {
  const chat = document.getElementById("bot-chat");
  if (!chat) return;
  const div = document.createElement("div");
  div.className = "msg " + who;
  if (who === "user") div.textContent = html;
  else div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (who === "bot") window.__lastBot = html;
}

function botCoreHTML() {
  return `
    <div class="bot-core">
      <span class="core-visual"><i class="cr cr1"></i><i class="cr cr2"></i><i class="cr cr3"></i><i class="cr-dot"></i></span>
      <span class="core-status" id="core-status">${t("bot_think1")}</span>
    </div>`;
}

function botAsk(raw) {
  if (!raw || !raw.trim()) return;
  botAdd("user", raw.trim());
  const chat = document.getElementById("bot-chat");
  if (!chat) return;
  const div = document.createElement("div");
  div.className = "msg bot bot-thinking";
  div.innerHTML = botCoreHTML();
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  window.__lastBot = div.innerHTML;
  const steps = [t("bot_think1"), t("bot_think2"), t("bot_think3"), t("bot_think4")];
  const st = div.querySelector("#core-status") || div.querySelector(".core-status");
  let i = 0;
  const iv = setInterval(() => {
    i = (i + 1) % steps.length;
    if (st) st.textContent = steps[i];
  }, 400);
  setTimeout(() => {
    clearInterval(iv);
    div.classList.remove("bot-thinking");
    div.innerHTML = botAnswer(raw);
    chat.scrollTop = chat.scrollHeight;
    window.__lastBot = div.innerHTML;
  }, 1500 + Math.random() * 500);
}

function botRenderStatic() {
  const input = document.getElementById("bot-input");
  if (input) input.placeholder = t("bot_ph");
  const sugs = document.getElementById("bot-sugs");
  if (sugs) sugs.innerHTML = [1, 2, 3].map(i =>
    `<button type="button" class="bot-sug" data-sug="${i}">${t("bot_sug" + i)}</button>`).join("");
  sugs && sugs.querySelectorAll(".bot-sug").forEach(b =>
    b.addEventListener("click", () => botAsk(b.textContent)));
}

function botWelcome() {
  const chat = document.getElementById("bot-chat");
  if (chat && !chat.children.length) botAdd("bot", t("bot_welcome"));
}

window.botAsk = botAsk;
window.botWelcome = botWelcome;
window.botRenderStatic = botRenderStatic;
window.__askBot = q => botAnswer(q);

document.querySelectorAll(".lang-btn").forEach(b =>
  b.addEventListener("click", () => {
    botRenderStatic();
    const chat = document.getElementById("bot-chat");
    if (chat && chat.children.length <= 1) {
      chat.innerHTML = "";
      botWelcome();
    }
  }));

(function botInit() {
  const form = document.getElementById("bot-form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("bot-input");
    botAsk(input.value);
    input.value = "";
  });
  botRenderStatic();
  botWelcome();
})();
