/**
 * src/config/constants.ts
 * * Static data used across the application.
 * These IDs correspond strictly to the IGDB database IDs.
 * We hardcode them to save API calls for data that rarely changes.
 */

export const PLATFORMS = [
  { id: 6, name: 'PC (Microsoft Windows)' },
  { id: 7, name: 'PlayStation' },
  { id: 8, name: 'PlayStation 2' },
  { id: 9, name: 'PlayStation 3' },
  { id: 48, name: 'PlayStation 4' },
  { id: 167, name: 'PlayStation 5' },
  { id: 11, name: 'Xbox' },
  { id: 12, name: 'Xbox 360' },
  { id: 49, name: 'Xbox One' },
  { id: 169, name: 'Xbox Series X|S' },
  { id: 18, name: 'NES' },
  { id: 19, name: 'SNES' },
  { id: 4, name: 'Nintendo 64' },
  { id: 21, name: 'GameCube' },
  { id: 130, name: 'Nintendo Switch' },
  { id: 29, name: 'Sega Genesis/Mega Drive' },
  { id: 32, name: 'Sega Saturn' },
  { id: 23, name: 'Dreamcast' },
];

export const GENRES = [
  { id: 4, name: 'Fighting' },
  { id: 5, name: 'Shooter' },
  { id: 7, name: 'Music' },
  { id: 8, name: 'Platform' },
  { id: 9, name: 'Puzzle' },
  { id: 10, name: 'Racing' },
  { id: 11, name: 'Real Time Strategy (RTS)' },
  { id: 12, name: 'Role-playing (RPG)' },
  { id: 13, name: 'Simulator' },
  { id: 14, name: 'Sport' },
  { id: 15, name: 'Strategy' },
  { id: 31, name: 'Adventure' },
  { id: 33, name: 'Arcade' },
];

export const THEMES = [
  { id: 17, name: 'Fantasy' },
  { id: 18, name: 'Science fiction' },
  { id: 19, name: 'Horror' },
  { id: 20, name: 'Thriller' },
  { id: 21, name: 'Survival' },
  { id: 22, name: 'Historical' },
  { id: 23, name: 'Stealth' },
  { id: 27, name: 'Comedy' },
  { id: 28, name: 'Business' },
  { id: 31, name: 'Drama' },
  { id: 32, name: 'Non-fiction' },
  { id: 33, name: 'Sandbox' },
  { id: 34, name: 'Educational' },
  { id: 35, name: 'Kids' },
  { id: 38, name: 'Open world' },
  { id: 39, name: 'Warfare' },
  { id: 40, name: 'Party' },
  { id: 41, name: '4X (Explore, Expand, Exploit, Exterminate)' },
  { id: 42, name: 'Erotic' },
  { id: 43, name: 'Mystery' },
  { id: 44, name: 'Romance' },
];

export const GAME_MODES = [
  { id: 1, name: 'Single player' },
  { id: 2, name: 'Multiplayer' },
  { id: 3, name: 'Co-operative' },
  { id: 4, name: 'Split screen' },
  { id: 5, name: 'Massively Multiplayer Online (MMO)' },
  { id: 6, name: 'Battle Royale' },
];

export const PERSPECTIVES = [
  { id: 1, name: 'First person' },
  { id: 2, name: 'Third person' },
  { id: 3, name: 'Bird view / Isometric' },
  { id: 4, name: 'Side view' },
  { id: 5, name: 'Text' },
  { id: 6, name: 'Auditory' },
  { id: 7, name: 'Virtual Reality' },
];

export const AGE_RATING_ORGANIZATIONS = [
  { id: 1, name: 'ESRB' },
  { id: 2, name: 'PEGI' },
  { id: 3, name: 'CERO' },
  { id: 4, name: 'USK' },
  { id: 5, name: 'GRAC' },
  { id: 6, name: 'CLASS IND' },
  { id: 7, name: 'ACB' },
];

export const AGE_RATING_VALUES = [
  // ESRB & General (Organization ID: 1)
  { id: 6,  name: 'RP' },
  { id: 7,  name: 'EC' },
  { id: 8,  name: 'E' },
  { id: 9,  name: 'E10' },
  { id: 10, name: 'T' },
  { id: 11, name: 'M' },
  { id: 12, name: 'AO' },

  // PEGI (Organization ID: 2)
  { id: 1,  name: 'Three' },
  { id: 2,  name: 'Seven' },
  { id: 3,  name: 'Twelve' },
  { id: 4,  name: 'Sixteen' },
  { id: 5,  name: 'Eighteen' },

  // CERO (Organization ID: 3)
  { id: 13, name: 'CERO A' },
  { id: 14, name: 'CERO B' },
  { id: 15, name: 'CERO C' },
  { id: 16, name: 'CERO D' },
  { id: 17, name: 'CERO Z' },

  // USK (Organization ID: 4)
  { id: 18, name: 'USK 0' },
  { id: 19, name: 'USK 6' },
  { id: 20, name: 'USK 12' },
  { id: 21, name: 'USK 16' },
  { id: 22, name: 'USK 18' },

  // GRAC (Organization ID: 5)
  { id: 23, name: 'GRAC ALL' },
  { id: 24, name: 'GRAC Twelve' },
  { id: 25, name: 'GRAC Fifteen' },
  { id: 26, name: 'GRAC Eighteen' },
  { id: 27, name: 'GRAC TESTING' },

  // CLASS IND (Organization ID: 6)
  { id: 28, name: 'CLASS IND L' },
  { id: 29, name: 'CLASS IND Ten' },
  { id: 30, name: 'CLASS IND Twelve' },
  { id: 31, name: 'CLASS IND Fourteen' },
  { id: 32, name: 'CLASS IND Sixteen' },
  { id: 33, name: 'CLASS IND Eighteen' },

  // ACB (Organization ID: 7)
  { id: 34, name: 'ACB G' },
  { id: 35, name: 'ACB PG' },
  { id: 36, name: 'ACB M' },
  { id: 37, name: 'ACB MA15' },
  { id: 38, name: 'ACB R18' },
  { id: 39, name: 'ACB RC' },
];

export const GAME_CATEGORIES = [
  { id: 0, name: 'Main Game' },
  { id: 1, name: 'DLC / Addon' },
  { id: 2, name: 'Expansion' },
  { id: 3, name: 'Bundle' },
  { id: 4, name: 'Standalone Expansion' },
  { id: 5, name: 'Mod' },
  { id: 6, name: 'Episode' },
  { id: 7, name: 'Season' },
  { id: 8, name: 'Remake' },
  { id: 9, name: 'Remaster' },
  { id: 10, name: 'Expanded Game' },
  { id: 11, name: 'Port' },
  { id: 12, name: 'Fork' },
  { id: 13, name: 'Pack' },
  { id: 14, name: 'Update' },
];

export const GAME_STATUSES = [
  { id: 0, name: 'Released' },
  { id: 2, name: 'Alpha' },
  { id: 3, name: 'Beta' },
  { id: 4, name: 'Early Access' },
  { id: 5, name: 'Offline' },
  { id: 6, name: 'Cancelled' },
  { id: 7, name: 'Rumored' },
  { id: 8, name: 'Delisted' },
];