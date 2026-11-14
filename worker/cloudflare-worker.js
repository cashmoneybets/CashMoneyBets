/**
 * CASHMONEYBETS — Proxy LLM gratuit (Cloudflare Worker)
 * =====================================================
 * Rôle : cacher la clé API et relayer les questions du bot vers un LLM gratuit.
 * Aucune clé n'apparaît jamais dans le code du site.
 *
 * INSTALLATION (5 minutes, 100 % gratuit, sans carte bancaire) :
 *
 * 1. Crée un compte sur https://dash.cloudflare.com (plan Free)
 * 2. Menu gauche : "Workers & Pages" -> "Create" -> "Create Worker"
 *    (nom ex. cashmoney-bot -> Deploy -> "Edit code")
 * 3. Efface le code d'exemple, colle CE FICHIER en entier -> Deploy
 * 4. Retourne dans le Worker -> Settings -> Bindings/Variables :
 *    - Option A (zéro clé) : Add binding -> type "AI" (Workers AI, gratuit
 *      ~10k neurons/jour) -> nom de la variable : AI
 *    - Option B (meilleure qualité) : Add -> Secret -> nom GEMINI_API_KEY,
 *      valeur = clé gratuite créée sur https://aistudio.google.com/apikey
 *      (Gemini 2.0 Flash, quelques centaines de requêtes/jour gratuites)
 *    Les deux peuvent coexister : Gemini est utilisé s'il est présent.
 * 5. Copie l'URL du worker (https://cashmoney-bot.<ton-sous-domaine>.workers.dev)
 *    et donne-la moi : je la branche dans bot.js et je déploie.
 *
 * Sécurité : CORS verrouillé sur le domaine GitHub Pages du site.
 * Quotas : Workers gratuit = 100 000 requêtes/jour (le proxy lui-même).
 */

const CORS = {
  "Access-Control-Allow-Origin": "https://cashmoneybets.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const SYSTEM = {
  fr: `Tu es le bot paris football de CashMoneyBets. Tu réponds en français, en moins de 160 mots, de façon directe et concrète. Tu t'appuies UNIQUEMENT sur les données du site fournies ci-dessous (matchs, cotes, Safe Score, marchés buts, TV, live). Si une info manque dans les données, dis-le honnêtement. Rappelle brièvement de jouer responsable. Ne promets jamais de gains.`,
  en: `You are the football betting bot of CashMoneyBets. Answer in English, under 160 words, direct and concrete. Rely ONLY on the site data provided below (matches, odds, Safe Score, goals markets, TV, live). If information is missing from the data, say so honestly. Briefly remind to gamble responsibly. Never promise winnings.`,
  de: `Du bist der Fußball-Wettbot von CashMoneyBets. Antworte auf Deutsch, unter 160 Wörtern, direkt und konkret. Stütze dich NUR auf die unten gelieferten Website-Daten (Spiele, Quoten, Safe Score, Tor-Märkte, TV, Live). Fehlen Daten, sage es ehrlich. Erinnere kurz an verantwortungsvolles Spielen. Versprich nie Gewinne.`,
  sq: `Ti je boti i bastit të futbollit i CashMoneyBets. Përgjigju në shqip, nën 160 fjalë, drejtpërdrejt dhe konkretisht. Mbështetu VETËM në të dhënat e faqes më poshtë (ndeshje, koeficientë, Safe Score, treget e golave, TV, live). Nëse mungojnë të dhëna, thuaje sinqerisht. Kujto shkurt të luash me përgjegjësi. Mos premtoj kurrë fitore.`,
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: "bad json" }, 400); }

    const q = String(body.q || "").slice(0, 500);
    const lang = ["fr", "en", "de", "sq"].includes(body.lang) ? body.lang : "en";
    const context = String(body.context || "").slice(0, 6000);
    if (!q) return json({ error: "empty q" }, 400);

    const sys = SYSTEM[lang] + "\n\n=== DONNÉES DU SITE / SITE DATA ===\n" + context;

    try {
      if (env.GEMINI_API_KEY) {
        const r = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + env.GEMINI_API_KEY,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: sys }] },
              contents: [{ role: "user", parts: [{ text: q }] }],
              generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
            }),
          }
        );
        if (!r.ok) return json({ error: "gemini " + r.status }, 502);
        const d = await r.json();
        const reply = (d.candidates?.[0]?.content?.parts || []).map(p => p.text).join("");
        return json({ reply });
      }

      if (env.AI) {
        const d = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
          messages: [
            { role: "system", content: sys },
            { role: "user", content: q },
          ],
          max_tokens: 400,
        });
        return json({ reply: d.response || "" });
      }

      return json({ error: "no model configured (add AI binding or GEMINI_API_KEY)" }, 500);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 502);
    }
  },
};
