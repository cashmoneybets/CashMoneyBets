/* ============ CASHMONEY·BETS — Données réelles du vendredi 13 novembre 2026
   Cotes moyennes 1X2 relevées le 12/11/2026 (sources publiques : WinDrawWin, Winner364).
   safeScore = proba implicite du pari (100 / cote). Notes trilingues {fr,en,de}. */

const MATCHES = [
  { id: "mar-nig", home: "Maroc", away: "Niger", comp: "Qualifs CAN", flag: "🇲🇦🇳🇪",
    kickoff: "21:00", odds: { "1": 1.04, "X": 10.5, "2": 23.0 }, pick: "1",
    formHome: ["W", "W", "D"], formAway: ["W", "L", "L"],
    note: {
      fr: "Invaincu à domicile, écart de niveau énorme. Le pari le plus sûr du slate.",
      en: "Unbeaten at home, huge class gap. The safest bet on the slate.",
      de: "Zu Hause ungeschlagen, riesiger Klassenunterschied. Die sicherste Wette des Tages." } },

  { id: "egy-mal", home: "Égypte", away: "Malawi", comp: "Qualifs CAN", flag: "🇪🇬🇲🇼",
    kickoff: "20:00", odds: { "1": 1.10, "X": 7.5, "2": 18.0 }, pick: "1",
    formHome: ["D", "L", "D"], formAway: ["L", "L", "D"],
    note: {
      fr: "Les Pharaons à domicile contre l'une des attaques les plus faibles du groupe.",
      en: "The Pharaohs at home against one of the weakest attacks in the group.",
      de: "Die Pharaonen zu Hause gegen einen der schwächsten Angriffe der Gruppe." } },

  { id: "nga-tan", home: "Nigeria", away: "Tanzanie", comp: "Qualifs CAN", flag: "🇳🇬🇹🇿",
    kickoff: "17:00", odds: { "1": 1.14, "X": 6.5, "2": 15.0 }, pick: "1",
    formHome: ["D", "L", "W"], formAway: ["D", "L", "L"],
    note: {
      fr: "Super Eagles intouchables à domicile. Solide même à cote basse.",
      en: "The Super Eagles are untouchable at home. Solid even at short odds.",
      de: "Die Super Eagles sind zu Hause unantastbar. Solid selbst mit niedriger Quote." } },

  { id: "sco-mkd", home: "Écosse", away: "Macédoine du Nord", comp: "Nations League", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿🇲🇰",
    kickoff: "20:45", odds: { "1": 1.18, "X": 6.5, "2": 13.0 }, pick: "1",
    formHome: ["D", "L", "W"], formAway: ["L", "L", "L", "L", "L"],
    note: {
      fr: "5 défaites d'affilée pour la Macédoine. Hampden Park sera bouillant.",
      en: "North Macedonia have lost 5 in a row. Hampden Park will be boiling.",
      de: "Nordmazedonien hat 5 Mal in Folge verloren. Hampden Park wird kochen." } },

  { id: "gab-les", home: "Gabon", away: "Lesotho", comp: "Qualifs CAN", flag: "🇬🇦🇱🇸",
    kickoff: "17:00", odds: { "1": 1.20, "X": 5.5, "2": 12.0 }, pick: "1",
    formHome: ["L", "L", "L", "L", "W"], formAway: ["W", "D", "L", "L", "L"],
    note: {
      fr: "Le Gabon doit gagner pour rester en course. Pression = motivation.",
      en: "Gabon must win to stay in the race. Pressure = motivation.",
      de: "Gabun muss gewinnen, um im Rennen zu bleiben. Druck = Motivation." } },

  { id: "pur-dom", home: "Porto Rico", away: "Dominique", comp: "Nations League C", flag: "🇵🇷🇩🇲",
    kickoff: "20:00", odds: { "1": 1.20, "X": 6.0, "2": 9.5 }, pick: "1",
    formHome: ["L", "W", "W", "W"], formAway: ["W", "D", "L", "L", "L"],
    note: {
      fr: "3 victoires de suite pour Porto Rico, Dominique en difficulté.",
      en: "Puerto Rico on a 3-game winning streak, Dominica struggling.",
      de: "Puerto Rico mit 3 Siegen in Folge, Dominica in der Krise." } },

  { id: "ecu-crc", home: "Équateur", away: "Costa Rica", comp: "Amical", flag: "🇪🇨🇨🇷",
    kickoff: "01:00", odds: { "1": 1.25, "X": 5.75, "2": 11.0 }, pick: "1",
    formHome: ["W", "W", "D"], formAway: ["L", "D", "L"],
    note: {
      fr: "La Tri est une forteresse à Quito (altitude). Amical, mais l'écart reste net.",
      en: "La Tri is a fortress in Quito (altitude). A friendly, but the gap is clear.",
      de: "La Tri ist eine Festung in Quito (Höhenlage). Freundschaftsspiel, aber der Unterschied ist klar." } },

  { id: "cpv-lbr", home: "Cap-Vert", away: "Liberia", comp: "Qualifs CAN", flag: "🇨🇻🇱🇷",
    kickoff: "17:00", odds: { "1": 1.26, "X": 4.7, "2": 11.0 }, pick: "1",
    formHome: ["D", "D", "D", "L", "L"], formAway: ["D", "L", "W", "L", "L"],
    note: {
      fr: "Les Requins Bleus restent sur une qualification historique. Dynamique supérieure.",
      en: "The Blue Sharks come off a historic qualification. Superior momentum.",
      de: "Die Blue Sharks kommen von einer historischen Qualifikation. Bessere Dynamik." } },

  { id: "rsa-ken", home: "Afrique du Sud", away: "Kenya", comp: "Qualifs CAN", flag: "🇿🇦🇰🇪",
    kickoff: "17:00", odds: { "1": 1.26, "X": 4.8, "2": 10.5 }, pick: "1",
    formHome: ["W", "L", "W", "W", "W"], formAway: ["D", "W", "D", "L", "D"],
    note: {
      fr: "4 victoires sur 5 pour les Bafana Bafana. Broos a trouvé sa formule.",
      en: "4 wins from 5 for Bafana Bafana. Broos has found the formula.",
      de: "4 Siege aus 5 Spielen für Bafana Bafana. Broos hat die Formel gefunden." } },

  { id: "srb-ger", home: "Serbie", away: "Allemagne", comp: "Nations League", flag: "🇷🇸🇩🇪",
    kickoff: "20:45", odds: { "1": 8.5, "X": 5.75, "2": 1.26 }, pick: "2",
    formHome: ["L", "L", "L", "L"], formAway: ["D", "L", "W", "D"],
    note: {
      fr: "4 défaites de suite pour la Serbie. La Mannschaft ne peut pas glisser ici.",
      en: "Serbia have lost 4 straight. Die Mannschaft cannot slip up here.",
      de: "Serbien hat 4 Mal in Folge verloren. Die Mannschaft darf hier nicht stolpern." } },

  { id: "lie-aze", home: "Liechtenstein", away: "Azerbaïdjan", comp: "Nations League", flag: "🇱🇮🇦🇿",
    kickoff: "20:45", odds: { "1": 11.0, "X": 5.0, "2": 1.26 }, pick: "2",
    formHome: ["L", "L", "L", "D", "L"], formAway: ["W", "W", "D", "D", "W"],
    note: {
      fr: "Le Liechtenstein n'a presque jamais gagné. L'Azerbaïdjan roule sur le groupe.",
      en: "Liechtenstein have almost never won. Azerbaijan are cruising through the group.",
      de: "Liechtenstein hat fast nie gewonnen. Aserbaidschan rollt durch die Gruppe." } },

  { id: "svk-fao", home: "Slovaquie", away: "Îles Féroé", comp: "Nations League", flag: "🇸🇰🇫🇴",
    kickoff: "20:45", odds: { "1": 1.36, "X": 4.6, "2": 8.0 }, pick: "1",
    formHome: ["W", "W", "D", "W"], formAway: ["D", "D", "D", "D"],
    note: {
      fr: "Les Féroé jouent bien le nul, mais la Slovaquie à domicile reste supérieure.",
      en: "The Faroe Islands draw well, but Slovakia at home are still superior.",
      de: "Die Färöer spielen gut unentschieden, aber die Slowakei ist zu Hause stärker." } },

  { id: "col-chi", home: "Colombie", away: "Chili", comp: "Amical", flag: "🇨🇴🇨🇱",
    kickoff: "01:00", odds: { "1": 1.43, "X": 4.5, "2": 7.0 }, pick: "1",
    formHome: ["D", "L", "W"], formAway: ["L", "L", "W"],
    note: {
      fr: "La Tricolor à Miami, public acquis. Le Chili reconstruit tout.",
      en: "La Tricolor in Miami with a supportive crowd. Chile are rebuilding everything.",
      de: "La Tricolor in Miami mit Publikum auf ihrer Seite. Chile baut komplett um." } },

  { id: "ned-gre", home: "Pays-Bas", away: "Grèce", comp: "Nations League", flag: "🇳🇱🇬🇷",
    kickoff: "20:45", odds: { "1": 1.53, "X": 4.2, "2": 5.25 }, pick: "1",
    formHome: ["D", "D", "W", "D", "W"], formAway: ["L", "W", "W", "D", "D"],
    note: {
      fr: "Invaincus sur 5. Oranje à domicile reste une valeur sûre.",
      en: "Unbeaten in 5. Oranje at home remain a safe value.",
      de: "Ungeschlagen in 5 Spielen. Oranje zu Hause bleibt eine sichere Bank." } },

  { id: "arg-uru", home: "Argentine", away: "Uruguay", comp: "Amical", flag: "🇦🇷🇺🇾",
    kickoff: "00:00", odds: { "1": 1.57, "X": 3.9, "2": 5.75 }, pick: "1",
    formHome: ["W", "W", "W"], formAway: ["L", "W", "W"],
    note: {
      fr: "Le Clásico del Río de la Plata. L'Albiceleste reste la référence mondiale.",
      en: "The Clásico del Río de la Plata. La Albiceleste remain the world benchmark.",
      de: "Das Clásico del Río de la Plata. La Albiceleste bleibt die weltweite Referenz." } },
];

const PARLAY_OF_THE_DAY = ["mar-nig", "nga-tan", "gab-les"];

function tierOf(score) {
  if (score >= 85) return { label: "elite", cls: "elite" };
  if (score >= 78) return { label: "solid", cls: "solid" };
  return { label: "value", cls: "value" };
}

function safeScore(m) {
  return Math.round((100 / m.odds[m.pick]) * 10) / 10;
}
