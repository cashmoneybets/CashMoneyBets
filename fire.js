/* v3.6 — vrai feu particules (canvas) autour de tout le contour du pari recommande */
(function () {
  const PADX = 26, PADT = 48, PADB = 30;

  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const sg = sprite.getContext("2d");
  const grad = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.2, "rgba(255,238,170,0.9)");
  grad.addColorStop(0.45, "rgba(255,150,30,0.6)");
  grad.addColorStop(0.75, "rgba(226,60,0,0.25)");
  grad.addColorStop(1, "rgba(120,20,0,0)");
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 64, 64);

  const fires = [];

  function setup(c) {
    if (c.__fire) return;
    c.__fire = true;
    fires.push({ c, parts: [], embers: [], t: Math.random() * 10, w: 0, h: 0, dpr: 1 });
  }

  window.initFire = function () {
    document.querySelectorAll("canvas.sp-fire").forEach(setup);
  };

  function size(f) {
    const c = f.c;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return false;
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    f.w = w; f.h = h; f.dpr = dpr;
    return true;
  }

  function spawn(f) {
    if (f.parts.length > 420) return;
    const x0 = PADX, y0 = PADT, x1 = f.w - PADX, y1 = f.h - PADB;
    const bw = x1 - x0, bh = y1 - y0;
    if (bw <= 0 || bh <= 0) return;
    const per = 2 * bw + 2 * bh;
    const n = Math.max(7, Math.round(per / 46));
    for (let i = 0; i < n; i++) {
      const p = Math.random() * per;
      let x, y, vx = 0, vy;
      if (p < bw) { x = x0 + p; y = y1 - 2; vy = -(30 + Math.random() * 52); vx = (Math.random() - 0.5) * 14; }
      else if (p < bw + bh) { x = x0 + 1; y = y0 + (p - bw); vy = -(24 + Math.random() * 44); vx = 8 + Math.random() * 16; }
      else if (p < 2 * bw + bh) { x = x1 - 1; y = y0 + (p - bw - bh); vy = -(24 + Math.random() * 44); vx = -8 - Math.random() * 16; }
      else { x = x0 + (p - 2 * bw - bh); y = y0 + 2; vy = -(20 + Math.random() * 36); vx = (Math.random() - 0.5) * 12; }
      f.parts.push({ x, y, vx, vy, life: 0, max: 0.6 + Math.random() * 0.85, s: 5 + Math.random() * 10, seed: Math.random() * 100 });
    }
    if (Math.random() < 0.35 && f.embers.length < 40) {
      f.embers.push({ x: x0 + Math.random() * bw, y: y1 - 4, vx: (Math.random() - 0.5) * 20, vy: -(60 + Math.random() * 70), life: 0, max: 0.8 + Math.random() * 0.9 });
    }
  }

  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (document.hidden) return;
    for (const f of fires) {
      const c = f.c;
      if (!c.isConnected || c.offsetParent === null) continue;
      if (!size(f)) continue;
      f.t += dt;
      const ctx = c.getContext("2d");
      ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0);
      ctx.clearRect(0, 0, f.w, f.h);
      ctx.globalCompositeOperation = "lighter";
      spawn(f);
      for (let i = f.parts.length - 1; i >= 0; i--) {
        const p = f.parts[i];
        p.life += dt;
        if (p.life >= p.max) { f.parts.splice(i, 1); continue; }
        const k = p.life / p.max;
        const turb = Math.sin(f.t * 5 + p.seed * 12) * 16;
        p.x += (p.vx + turb) * dt;
        p.y += p.vy * dt;
        p.vy -= 24 * dt;
        const s = p.s * (1.15 - k * 0.75);
        ctx.globalAlpha = Math.pow(1 - k, 1.15) * 0.9;
        ctx.drawImage(sprite, p.x - s, p.y - s, s * 2, s * 2);
        if (k < 0.35) {
          ctx.globalAlpha = (0.35 - k) * 2 * 0.85;
          const cs = s * 0.45;
          ctx.drawImage(sprite, p.x - cs, p.y - cs, cs * 2, cs * 2);
        }
      }
      for (let i = f.embers.length - 1; i >= 0; i--) {
        const e = f.embers[i];
        e.life += dt;
        if (e.life >= e.max) { f.embers.splice(i, 1); continue; }
        const k = e.life / e.max;
        e.x += (e.vx + Math.sin(f.t * 7 + e.y * 0.05) * 10) * dt;
        e.y += e.vy * dt;
        ctx.globalAlpha = (1 - k) * 0.95;
        ctx.fillStyle = k < 0.5 ? "#ffd24a" : "#ff7a1a";
        ctx.fillRect(e.x - 1.2, e.y - 1.2, 2.4, 2.4);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  }
  requestAnimationFrame(loop);
})();
