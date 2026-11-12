/* CASHMONEY·BETS — Données réelles du vendredi 13 novembre 2026
   Cotes moyennes 1X2 relevées le 12/11/2026 (sources publiques : WinDrawWin, Winner364).
   safeScore = proba implicite du pari (100 / cote), arrondie. */

const MATCHES = [
  { id: "mar-nig", home: "Maroc", away: "Niger", comp: "Qualifs CAN", flag: "🇲🇦🇳🇪",
    kickoff: "21:00", odds: { "1": 1.04, "X": 10.5, "2": 23.0 }, pick: "1",
    formHome: ["W", "W", "D"], formAway: ["W", "L", "L"],
    note: "Invaincu à domicile, écart de niveau énorme. Le pari le plus sûr du slate." },

  { id: "egy-mal", home: "Égypte", away: "Malawi", comp: "Qualifs CAN", flag: "🇪🇬🇲🇼",
    kickoff: "20:00", odds: { "1": 1.10, "X": 7.5, "2": 18.0 }, pick: "1",
    formHome: ["D", "L", "D"], formAway: ["L", "L", "D"],
    note: "Les Pharaons à domicile contre l'un des attacks les plus faibles du groupe." },

  { id: "nga-tan", home: "Nigeria", away: "Tanzanie", comp: "Qualifs CAN", flag: "🇳🇬🇹🇿",
    kickoff: "17:00", odds: { "1": 1.14, "X": 6.5, "2": 15.0 }, pick: "1",
    formHome: ["D", "L", "W"], formAway: ["D", "L", "L"],
    note: "Super Eagles intouchables à home. Solide même à cote basse." },

  { id: "sco-mkd", home: "Écosse", away: "Macédoine du Nord", comp: "Nations League", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿🇲🇰",
    kickoff: "20:45", odds: { "1": 1.18, "X": 6.5, "2": 13.0 }, pick: "1",
    formHome: ["D", "L", "W"], formAway: ["L", "L", "L", "L", "L"],
    note: "5 défaites d'affilée pour la Macédoine. Hampden Park sera bouillant." },

  { id: "gab-les", home: "Gabon", away: "Lesotho", comp: "Qualifs CAN", flag: "🇬🇦🇱🇸",
    kickoff: "17:00", odds: { "1": 1.20, "X": 5.5, "2": 12.0 }, pick: "1",
    formHome: ["L", "L", "L", "L", "W"], formAway: ["W", "D", "L", "L", "L"],
    note: "Le Gabon doit gagner pour rester en course. Pression = motivation." },

  { id: "pur-dom", home: "Porto Rico", away: "Dominique", comp: "Nations League C", flag: "🇵🇷🇩🇲",
    kickoff: "20:00", odds: { "1": 1.20, "X": 6.0, "2": 9.5 }, pick: "1",
    formHome: ["L", "W", "W", "W"], formAway: ["W", "D", "L", "L", "L"],
    note: "3 victoires de suite pour Porto Rico, Dominique en difficulté." },

  { id: "ecu-crc", home: "Équateur", away: "Costa Rica", comp: "Amical", flag: "🇪🇨🇨🇷",
    kickoff: "01:00", odds: { "1": 1.25, "X": 5.75, "2": 11.0 }, pick: "1",
    formHome: ["W", "W", "D"], formAway: ["L", "D", "L"],
    note: "La Tri est une forteresse à Quito (altitude). Amical, mais l'écart reste net." },

  { id: "cpv-lbr", home: "Cap-Vert", away: "Liberia", comp: "Qualifs CAN", flag: "🇨🇻🇱🇷",
    kickoff: "17:00", odds: { "1": 1.26, "X": 4.7, "2": 11.0 }, pick: "1",
    formHome: ["D", "D", "D", "L", "L"], formAway: ["D", "L", "W", "L", "L"],
    note: "Les Requins Bleus restent sur une qualification historique. Dynamique supérieure." },

  { id: "rsa-ken", home: "Afrique du Sud", away: "Kenya", comp: "Qualifs CAN", flag: "🇿🇦🇰🇪",
    kickoff: "17:00", odds: { "1": 1.26, "X": 4.8, "2": 10.5 }, pick: "1",
    formHome: ["W", "L", "W", "W", "W"], formAway: ["D", "W", "D", "L", "D"],
    note: "4 victoires sur 5 pour les Bafana Bafana. Broos a trouvé sa formule." },

  { id: "srb-ger", home: "Serbie", away: "Allemagne", comp: "Nations League", flag: "🇷🇸🇩🇪",
    kickoff: "20:45", odds: { "1": 8.5, "X": 5.75, "2": 1.26 }, pick: "2",
    formHome: ["L", "L", "L", "L"], formAway: ["D", "L", "W", "D"],
    note: "4 défaites de suite pour la Serbie. La Mannschaft ne peut pas glisser ici." },

  { id: "svk-fao", home: "Slovaquie", away: "Îles Féroé", comp: "Nations League", flag: "🇸🇰🇫🇴",
    kickoff: "20:45", odds: { "1": 1.36, "X": 4.6, "2": 8.0 }, pick: "1",
    formHome: ["W", "W", "D", "W"], formAway: ["D", "D", "D", "D"],
    note: "Les Féroé jouent bien le nul, mais la Slovaquie à domicile reste supérieure." },

  { id: "col-chi", home: "Colombie", away: "Chili", comp: "Amical", flag: "🇨🇴🇨🇱",
    kickoff: "01:00", odds: { "1": 1.43, "X": 4.5, "2": 7.0 }, pick: "1",
    formHome: ["D", "L", "W"], formAway: ["L", "L", "W"],
    note: "La Tricolor à Miami, public acquis. Le Chili reconstruit tout." },

  { id: "ned-gre", home: "Pays-Bas", away: "Grèce", comp: "Nations League", flag: "🇳🇱🇬🇷",
    kickoff: "20:45", odds: { "1": 1.53, "X": 4.2, "2": 5.25 }, pick: "1",
    formHome: ["D", "D", "W", "D", "W"], formAway: ["L", "W", "W", "D", "D"],
    note: "Invaincus sur 5. Oranje à l'Amsterdam Arena reste une valeur sûre." },

  { id: "arg-uru", home: "Argentine", away: "Uruguay", comp: "Amical", flag: "🇦🇷🇺🇾",
    kickoff: "00:00", odds: { "1": 1.57, "X": 3.9, "2": 5.75 }, pick: "1",
    formHome: ["W", "W", "W"], formAway: ["L", "W", "W"],
    note: "Le Clásico del Río de la Plata. L'Albiceleste reste la référence mondiale." },

  { id: "lie-aze", home: "Liechtenstein", away: "Azerbaïdjan", comp: "Nations League", flag: "🇱🇮🇦🇿",
    kickoff: "20:45", odds: { "1": 11.0, "X": 5.0, "2": 1.26 }, pick: "2",
    formHome: ["L", "L", "L", "D", "L"], formAway: ["W", "W", "D", "D", "W"],
    note: "Le Liechtenstein n'a presque jamais gagné. L'Azerbaïdjan roule sur le groupe." },
];

const PARLAY_OF_THE_DAY = ["mar-nig", "nga-tan", "gab-les"];

function tierOf(score) {
  if (score >= 85) return { label: "ÉLITE", cls: "elite" };
  if (score >= 78) return { label: "SOLIDE", cls: "solid" };
  return { label: "VALUE", cls: "value" };
}

function safeScore(m) {
  return Math.round((100 / m.odds[m.pick]) * 10) / 10;
}
