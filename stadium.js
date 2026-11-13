/* ============ v3.1 — STADE VIVANT : foule + joueurs + ballon ============ */
(function () {
  const stands = document.querySelector(".st-stands");
  const crowd = document.getElementById("crowd-canvas");
  const homeView = document.getElementById("view-home");
  const ballEl = document.getElementById("st-ball");
  if (!stands || !crowd || !ballEl) return;

  const players = [
    { el: document.getElementById("sp-a1"), team: "a", u: 0.18, v: 0.30, tu: 0.18, tv: 0.30, speed: 0.10, wait: 1.2 },
    { el: document.getElementById("sp-a2"), team: "a", u: 0.38, v: 0.68, tu: 0.38, tv: 0.68, speed: 0.11, wait: 0 },
    { el: document.getElementById("sp-b1"), team: "b", u: 0.62, v: 0.34, tu: 0.62, tv: 0.34, speed: 0.11, wait: 0 },
    { el: document.getElementById("sp-b2"), team: "b", u: 0.83, v: 0.70, tu: 0.83, tv: 0.70, speed: 0.10, wait: 0 },
  ];
  const ball = { holder: players[0], u: 0.18, v: 0.30, lift: 0, flight: null };

  const FAN_COLORS = ["245,196,81", "46,255,160", "139,92,246", "255,255,255", "255,210,74", "255,138,101"];
  let fans = [], cw = 0, ch = 0;

  function sizeCrowd() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = stands.offsetWidth;
    ch = stands.offsetHeight;
    crowd.width = Math.max(1, cw * dpr);
    crowd.height = Math.max(1, ch * dpr);
    crowd.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    buildFans();
  }

  function buildFans() {
    fans = [];
    const rows = Math.max(10, Math.floor(ch / 11));
    const rowH = ch / rows;
    for (let r = 0; r < rows; r++) {
      const inRow = Math.max(8, Math.floor(cw / 9));
      for (let i = 0; i < inRow; i++) {
        if (Math.random() < 0.18) continue;
        fans.push({
          x: (i + 0.2 + Math.random() * 0.6) * (cw / inRow),
          y: (r + 0.3 + Math.random() * 0.4) * rowH,
          c: FAN_COLORS[(Math.random() * FAN_COLORS.length) | 0],
          ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.6,
          s: 0.9 + Math.random() * 0.9,
          jump: Math.random() < 0.22,
        });
      }
    }
  }

  function drawCrowd(t) {
    const ctx = crowd.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);
    const wave = ((t * 0.00006) % 1.4) - 0.2;
    for (const f of fans) {
      let a = 0.30 + 0.22 * Math.sin(t * 0.001 * f.sp + f.ph);
      const d = Math.abs(f.x / cw - wave);
      if (d < 0.06) a += 0.55 * (1 - d / 0.06);
      let y = f.y;
      if (f.jump) {
        const j = Math.sin(t * 0.004 + f.ph);
        if (j > 0.4) y -= (j - 0.4) * 5;
      }
      ctx.globalAlpha = Math.min(1, a);
      ctx.fillStyle = "rgb(" + f.c + ")";
      ctx.beginPath();
      ctx.arc(f.x, y, f.s, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function newTarget(p) {
    const lo = p.team === "a" ? 0.08 : 0.54;
    const hi = p.team === "a" ? 0.46 : 0.92;
    p.tu = lo + Math.random() * (hi - lo);
    p.tv = 0.18 + Math.random() * 0.68;
  }

  function stepPlayers(dt) {
    for (const p of players) {
      const dx = p.tu - p.u, dy = p.tv - p.v;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.015) {
        p.el.classList.remove("running");
        if (ball.holder !== p) {
          p.wait -= dt;
          if (p.wait <= 0) {
            newTarget(p);
            p.wait = Math.random() * 0.5;
          }
        }
      } else {
        const sp = p.speed * (ball.holder === p ? 0.9 : 1.25) * dt;
        const k = Math.min(sp, dist) / dist;
        p.u += dx * k;
        p.v += dy * k;
        p.el.classList.add("running");
      }
      p.el.style.left = (p.u * 100).toFixed(2) + "%";
      p.el.style.top = (p.v * 100).toFixed(2) + "%";
    }
  }

  function stepBall(dt) {
    if (ball.flight) {
      const f = ball.flight;
      f.k = Math.min(1, f.k + dt / f.dur);
      const e = f.k < 0.5 ? 2 * f.k * f.k : 1 - Math.pow(-2 * f.k + 2, 2) / 2;
      ball.u = f.u1 + (f.to.u - f.u1) * e;
      ball.v = f.v1 + (f.to.v + 0.02 - f.v1) * e;
      ball.lift = Math.sin(f.k * Math.PI) * 24;
      if (f.k >= 1) {
        ball.holder = f.to;
        ball.flight = null;
        ball.lift = 0;
        newTarget(f.to);
        f.to.wait = 0.8 + Math.random() * 1.4;
      }
    } else {
      const p = ball.holder;
      p.wait -= dt;
      ball.u = p.u + (p.team === "a" ? 1 : -1) * 0.035;
      ball.v = p.v + 0.012;
      ball.lift = 0;
      if (p.wait <= 0) {
        const mate = players.find(q => q.team === p.team && q !== p);
        ball.flight = { u1: ball.u, v1: ball.v, to: mate, k: 0, dur: 0.55 + Math.random() * 0.45 };
      }
    }
    ballEl.style.left = (ball.u * 100).toFixed(2) + "%";
    ballEl.style.top = (ball.v * 100).toFixed(2) + "%";
    ballEl.style.setProperty("--lift", ball.lift.toFixed(1) + "px");
  }

  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!homeView || !homeView.classList.contains("active")) return;
    drawCrowd(now);
    stepPlayers(dt);
    stepBall(dt);
  }

  sizeCrowd();
  addEventListener("resize", sizeCrowd);
  requestAnimationFrame(loop);
})();
