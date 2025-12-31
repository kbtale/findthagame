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