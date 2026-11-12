# 💸 CASHMONEY·BETS — Safe Bets Football

Site web futuriste qui identifie les **matchs les plus sûrs à parier** du jour et les note
avec un **Safe Score /100** (probabilité implicite du marché + forme + contexte).

## ✨ Features

- 🌠 **Fond nébuleuse animé** (canvas : étoiles scintillantes, nuages de gaz en dérive, étoiles filantes, parallaxe souris) — moteur visuel « Nebula »
- 🎯 **Safe Score /100** par match : `100 ÷ cote`, avec anneaux SVG animés au scroll
- 🏷️ **Tiers** : 🔥 Élite (85+) · Solide (78-84) · Value (<78)
- 🎫 **Combiné interactif** : ajout en un clic, cote combinée live, calculateur de gains
- ⚡ **Parlay du jour** pré-construit par le moteur CashMoney
- 🔀 Filtres (Élite / Solide / Value / compétition) et tris (score, cote, heure)
- 🎨 Glassmorphism, tilt 3D sur les cartes, compteurs animés, reveal on scroll
- 📱 Responsive

## 🚀 Utilisation

Site 100% statique — aucune dépendance, aucun build :

```bash
# ouvrir directement index.html dans un navigateur
# ou servir localement :
python3 -m http.server 8080
```

## 📊 Données

Les matchs et cotes (vendredi 13 novembre 2026 : qualifications CAN, Nations League,
amicaux) sont dans `data.js`, relevés le 12/11/2026 depuis des sources publiques
(WinDrawWin, Winner364). Pour mettre à jour : éditer le tableau `MATCHES` dans `data.js`.

## ⚠️ Avertissement

Les paris sportifs comportent des risques. **Aucun pari n'est jamais garanti**, même avec
un Safe Score élevé. 18+, jouez responsable — Joueurs Info Service : 09 74 75 13 13.
