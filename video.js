/* ============================================================
   v7.2 — AI STUDIO : générateur de clips vidéo 100 % client
   Images IA : Pollinations (open-source, gratuit, sans clé API)
   Montage : canvas Ken Burns + fondus · Export : MediaRecorder
   Aucune clé, aucun compte, rien envoyé sur un autre serveur.
   ============================================================ */

const VID_RATIOS = { "16:9": [1024, 576], "9:16": [576, 1024], "1:1": [768, 768] };
const VID_SUFFIX = {
  cinema: ", cinematic film still, dramatic lighting, 35mm, shallow depth of field",
  stadium: ", professional football stadium, night match, bright floodlights, wide angle",
  cyberpunk: ", cyberpunk neon style, futuristic city, glowing gold and emerald",
  anime: ", anime style, vibrant colors, studio quality"
};
let vidFrames = [], vidAnimRAF = null, vidBusy = false, vidAbort = false;

function vidQ(id) { return document.getElementById(id); }

function vidPollUrl(prompt, w, h, seed, model) {
  let u = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) +
    "?width=" + w + "&height=" + h + "&seed=" + seed + "&nologo=true&model=" + model;
  const tok = localStorage.getItem("cmb_pol_token");
  if (tok) u += "&token=" + encodeURIComponent(tok);
  return u;
}
window.vidPollUrl = vidPollUrl;

function vidLoadImg(url, timeoutMs) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    const to = setTimeout(() => rej(new Error("timeout")), timeoutMs || 60000);
    im.onload = () => { clearTimeout(to); res(im); };
    im.onerror = () => { clearTimeout(to); rej(new Error("img")); };
    im.src = url;
  });
}

/* --- Ken Burns : zoom lent + léger pan sur toute l'image --- */
function vidDraw(ctx, im, pr, W, H) {
  const s = Math.max(W / im.width, H / im.height) * (1.06 + 0.18 * pr);
  const w = im.width * s, h = im.height * s;
  const x = (W - w) / 2 + Math.sin(pr * Math.PI) * W * 0.015;
  const y = (H - h) / 2;
  ctx.drawImage(im, x, y, w, h);
}

async function vidGenerate() {
  if (vidBusy) { vidAbort = true; return; }   // 2e clic = annule
  const btn = vidQ("vid-go"), status = vidQ("vid-status"), gal = vidQ("vid-gal");
  const cv = vidQ("vid-canvas"), exp = vidQ("vid-export");
  if (!btn || !status) return;
  const p = ((vidQ("vid-prompt") || {}).value || "").trim();
  if (!p) { status.textContent = t("vid_need"); return; }
  vidBusy = true;
  btn.disabled = true; exp.disabled = true;
  status.innerHTML = '<span class="vid-spin"></span> ' + t("vid_wait");
  gal.innerHTML = ""; vidFrames = [];
  if (vidAnimRAF) cancelAnimationFrame(vidAnimRAF);
  cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);

  const style = vidQ("vid-style").value;
  const n = parseInt(vidQ("vid-n").value, 10) || 8;
  const [w, h] = VID_RATIOS[vidQ("vid-ratio").value] || VID_RATIOS["16:9"];
  const model = vidQ("vid-model").value || "flux";
  const seed = Math.floor(Math.random() * 1e6);
  const full = p + (VID_SUFFIX[style] || "");

  /* v7.3 : tier anonyme Pollinations tres limite (402 des la 2e image de salve)
     generation SEQUENTIELLE avec pauses + retries exponentiels, resultat partiel accepte */
  const backoff = [0, 6000, 15000, 30000];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < n; i++) {
    let im = null;
    for (let r = 0; r < backoff.length && !im; r++) {
      if (backoff[r]) { await sleep(backoff[r]); if (vidAbort) break; }
      status.textContent = (i + 1) + "/" + n + " " + t("vid_wait") + (r ? " (+" + r + ")" : "");
      try { im = await vidLoadImg(vidPollUrl(full, w, h, seed + i * 7, model), 90000); }
      catch (e) { im = null; }
      if (vidAbort) break;   // annule par un nouveau clic
    }
    if (im) { vidFrames.push(im); vidThumbs(); }
    else if (vidAbort) break;
    await sleep(1600);
    if (vidAbort) break;
  }

  const wasAborted = vidAbort;
  vidBusy = false; vidAbort = false;
  btn.disabled = false;
  if (!vidFrames.length) { status.textContent = wasAborted ? t("vid_cancel") : t("vid_limit"); return; }
  vidThumbs();
  status.textContent = t("vid_ready") + " " + vidFrames.length + "/" + n;
  exp.disabled = false;
  vidPlay(0);
  window.__vidGenArgs = [full, w, h, seed, model, n];
}
window.vidGenerate = vidGenerate;

function vidThumbs() {
  const gal = vidQ("vid-gal"); if (!gal) return;
  gal.innerHTML = vidFrames.map((im, i) =>
    `<button class="vid-thumb" data-i="${i}" aria-label="frame ${i + 1}"><img src="${im.src}" alt="frame ${i + 1}" loading="lazy"></button>`
  ).join("");
  gal.querySelectorAll(".vid-thumb").forEach(b =>
    b.addEventListener("click", () => vidPlay(parseInt(b.dataset.i, 10) || 0)));
}

/* --- lecteur en boucle : fondu 320 ms toutes les 1100 ms --- */
function vidPaint(ctx, cv, el, startAt) {
  const SHOT = 1100, XF = 320;
  const k = Math.floor(el / SHOT), pr = (el % SHOT) / SHOT;
  const i1 = (startAt + k) % vidFrames.length, i2 = (startAt + k + 1) % vidFrames.length;
  ctx.globalAlpha = 1;
  vidDraw(ctx, vidFrames[i1], pr, cv.width, cv.height);
  if (pr > 1 - XF / SHOT) {
    ctx.globalAlpha = (pr - (1 - XF / SHOT)) / (XF / SHOT);
    vidDraw(ctx, vidFrames[i2], 0, cv.width, cv.height);
  }
  ctx.globalAlpha = 1;
}

function vidPlay(startAt) {
  startAt = startAt || 0;
  const cv = vidQ("vid-canvas");
  if (!cv || !vidFrames.length) return;
  cv.width = vidFrames[0].naturalWidth || vidFrames[0].width;
  cv.height = vidFrames[0].naturalHeight || vidFrames[0].height;
  const ctx = cv.getContext("2d");
  let start = null;
  if (vidAnimRAF) cancelAnimationFrame(vidAnimRAF);
  const loop = ts => {
    if (!start) start = ts;
    vidPaint(ctx, cv, ts - start, startAt);
    vidAnimRAF = requestAnimationFrame(loop);
  };
  vidAnimRAF = requestAnimationFrame(loop);
}
window.vidPlay = vidPlay;

/* --- un seul passage, encapsulé par MediaRecorder puis téléchargé --- */
function vidPlayOnce(cv, startAt) {
  return new Promise(res => {
    const ctx = cv.getContext("2d"), SHOT = 1100;
    const total = SHOT * vidFrames.length;
    let start = null;
    const loop = ts => {
      if (!start) start = ts;
      const el = ts - start;
      if (el >= total) { res(); return; }
      vidPaint(ctx, cv, el, startAt || 0);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}

async function vidExport() {
  if (!vidFrames.length) return;
  const cv = vidQ("vid-canvas"), status = vidQ("vid-status");
  if (!window.MediaRecorder || !cv.captureStream) { status.textContent = t("vid_nomrec"); return; }
  const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]
    .find(m => MediaRecorder.isTypeSupported(m));
  if (!mime) { status.textContent = t("vid_nomrec"); return; }
  const exp = vidQ("vid-export");
  exp.disabled = true;
  status.innerHTML = '<span class="vid-spin"></span> ' + t("vid_exporting");
  const chunks = [];
  const rec = new MediaRecorder(cv.captureStream(30), { mimeType: mime, videoBitsPerSecond: 6000000 });
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  const done = new Promise(res => { rec.onstop = res; });
  rec.start();
  await vidPlayOnce(cv, 0);
  rec.stop();
  await done;
  const blob = new Blob(chunks, { type: mime.split(";")[0] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cashmoney-ai-clip." + (mime.indexOf("mp4") > -1 ? "mp4" : "webm");
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  exp.disabled = false;
  status.textContent = t("vid_done");
}
window.vidExport = vidExport;

/* --- branchement du formulaire --- */
(function vidInit() {
  const wire = () => {
    const ti = vidQ("vid-token");
    if (ti && !ti.dataset.vw) {
      ti.dataset.vw = "1";
      ti.value = localStorage.getItem("cmb_pol_token") || "";
      ti.addEventListener("input", () => localStorage.setItem("cmb_pol_token", ti.value.trim()));
    }
    const go = vidQ("vid-go");
    if (go && !go.dataset.vw) {
      go.dataset.vw = "1";
      go.addEventListener("click", vidGenerate);
    }
    const ex = vidQ("vid-export");
    if (ex && !ex.dataset.vw) {
      ex.dataset.vw = "1";
      ex.addEventListener("click", vidExport);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
