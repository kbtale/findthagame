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

export const AGE_RATINGS = [
  { id: 8, name: 'ESRB: E (Everyone)' },
  { id: 9, name: 'ESRB: E10+ (Everyone 10+)' },
  { id: 10, name: 'ESRB: T (Teen)' },
  { id: 11, name: 'ESRB: M (Mature)' },
  { id: 1, name: 'PEGI: 3' },
  { id: 2, name: 'PEGI: 7' },
  { id: 3, name: 'PEGI: 12' },
  { id: 4, name: 'PEGI: 16' },
  { id: 5, name: 'PEGI: 18' },
];