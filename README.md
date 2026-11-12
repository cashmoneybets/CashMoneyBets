# 💸 CASHMONEY·BETS — Live Scores & Safe Score HUD

Terminal de paris football futuriste organisé en **3 vues** : Accueil (top picks),
**LIVE** (scores temps réel) et **BUTS** (probabilités de buts). Fond animé :
scène de football interactive qui réagit au scroll (pelouse en perspective,
projecteurs, ballon).

## ✨ Features

### 🌍 Trilingue (nouveau v2.1)
- Sélecteur de langue avec drapeaux dans la nav : 🇫🇷 Français · 🇬🇧 English · 🇩🇪 Deutsch
- Interface, notes d'analyse et ticker **100% traduits** (langue mémorisée en localStorage)
- **Menu burger** mobile + layout **mobile-first** (grilles 1 colonne, cartes compactes)
- Design v2.1 : blobs **aurora** animés + **typographie cinétique** sur le titre

### 🔴 LIVE (v2.0)
- Scores **temps réel** via le flux public ESPN (14 championnats : PL, Liga, Bundesliga, Serie A, Ligue 1, Nations League, MLS, Brasileirão…)
- Rafraîchissement automatique toutes les **45 secondes**
- **Alerte BUT plein écran** : shockwave, nom du buteur, score — détection automatique quand un score bouge
- Stats par match : possession, tirs, cadrés, corners (barres animées)
- Matchs triés : LIVE → à venir → terminés

### 🎯 SAFE BETS (v2.2)
- **Safe Score /100** = probabilité implicite du marché (100 ÷ cote) + forme + contexte
- **Pari recommandé** mis en avant sur chaque carte (ex : « Maroc gagne · 1.04 »)
- **Probabilités de victoire 1X2** en barres animées (domicile / nul / extérieur)
- **Marchés buts estimés** (modèle de Poisson calibré sur les cotes) : +1.5 buts, +2.5 buts, les 2 équipes marquent
- Tiers : 🔥 ÉLITE (85+) · SOLIDE (78-84) · VALUE (<78)
- Anneaux SVG animés, filtres et tris

### 📊 STATS (v2.0)
- Histogramme animé de la distribution des Safe Scores (canvas)
- Donut animé de répartition par tier
- Ticker défilant façon trading desk + horloge HUD UTC

### 🌌 DESIGN HUD (v2.0)
- Fond nébuleuse (canvas) + grille néon en dérive + scanlines
- Panneaux à coins biseautés (clip-path), glitch, glow néon cyan/magenta
- Tilt 3D sur les cartes, reveal on scroll, compteurs animés

## 🚀 Utilisation

Site 100% statique — aucune dépendance, aucun build :

```bash
python3 -m http.server 8080   # puis ouvrir http://localhost:8080
```

## 📊 Données

- **Safe Bets** : `data.js` — matchs et cotes du vendredi 13 novembre 2026
  (qualifs CAN, Nations League, amicaux), relevés le 12/11/2026 (WinDrawWin, Winner364)
- **Live** : flux public ESPN (`site.api.espn.com`), sans clé API, appelé directement depuis le navigateur

## ⚠️ Avertissement

Les paris sportifs comportent des risques. **Aucun pari n'est jamais garanti**, même avec
un Safe Score élevé. 18+, jouez responsable — Joueurs Info Service : 09 74 75 13 13.
