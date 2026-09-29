/**
 * src/lib/optionLabels.ts
 * Resolves i18n labels for option values that arrive from IGDB as English names
 * (game detail badges, favorites list, etc.) by mapping the name back to its
 * IGDB ID and looking up the corresponding translation key.
 */

import type { TFunction } from 'i18next';
import {
  GENRES_BY_NAME,
  THEMES_BY_NAME,
  GAME_MODES_BY_NAME,
  PERSPECTIVES_BY_NAME,
  PLATFORMS_BY_NAME,
} from '@/config/constants';

export type OptionNamespace = 'genres' | 'themes' | 'gameModes' | 'perspectives' | 'platforms';

const NAMESPACE_MAPS: Record<OptionNamespace, Map<string, number>> = {
  genres: GENRES_BY_NAME,
  themes: THEMES_BY_NAME,
  gameModes: GAME_MODES_BY_NAME,
  perspectives: PERSPECTIVES_BY_NAME,
  platforms: PLATFORMS_BY_NAME,
};

/**
 * Returns the translated label for an English option name, or the original
 * name when no translation key exists for it.
 */
export const optionLabel = (t: TFunction, namespace: OptionNamespace, name: string): string => {
  const id = NAMESPACE_MAPS[namespace].get(name.toLowerCase().trim());
  if (id === undefined) return name;
  return t(`${namespace}.${id}`, name);
};