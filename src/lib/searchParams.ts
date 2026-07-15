import type { FilterState } from '@/models/AppTypes';

interface RawSearchParams {
  q?: string;
  p?: string;
  yr0?: string;
  yr1?: string;
  g?: string;
  t?: string;
  gm?: string;
  pr?: string;
  c?: string;
  s?: string;
  dev?: string;
  mr?: string;
  arO?: string;
  arV?: string;
}

const parseNumArray = (val: string | undefined): number[] => {
  if (!val) return [];
  return val.split(',').map(Number).filter((n) => !isNaN(n));
};

const numArrayToString = (arr: number[]): string | undefined => {
  return arr.length > 0 ? arr.join(',') : undefined;
};

const optNum = (val: string | undefined): number | null => {
  if (val === undefined || val === '') return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
};

export const filterToSearchParams = (filter: FilterState): Record<string, string> => {
  const params: Record<string, string> = {};

  if (filter.search) params.q = filter.search;
  if (filter.platformId !== null) params.p = String(filter.platformId);
  if (filter.yearRange[0] !== 1970) params.yr0 = String(filter.yearRange[0]);
  if (filter.yearRange[1] !== 2026) params.yr1 = String(filter.yearRange[1]);
  const g = numArrayToString(filter.genreIds);
  if (g) params.g = g;
  const t = numArrayToString(filter.themeIds);
  if (t) params.t = t;
  if (filter.gameModeId !== null) params.gm = String(filter.gameModeId);
  if (filter.perspectiveId !== null) params.pr = String(filter.perspectiveId);
  if (filter.categoryId !== null) params.c = String(filter.categoryId);
  if (filter.statusId !== null) params.s = String(filter.statusId);
  if (filter.developerName) params.dev = filter.developerName;
  if (filter.minRating !== null) params.mr = String(filter.minRating);
  if (filter.ageRatingOrg !== null) params.arO = String(filter.ageRatingOrg);
  if (filter.ageRatingValue !== null) params.arV = String(filter.ageRatingValue);

  return params;
};

export const searchParamsToFilter = (params: Record<string, unknown>): FilterState => {
  const raw = params as RawSearchParams;
  return {
    search: raw.q ?? '',
    platformId: optNum(raw.p),
    yearRange: [
      raw.yr0 !== undefined ? (parseInt(raw.yr0, 10) || 1970) : 1970,
      raw.yr1 !== undefined ? (parseInt(raw.yr1, 10) || 2026) : 2026,
    ],
    genreIds: parseNumArray(raw.g),
    themeIds: parseNumArray(raw.t),
    gameModeId: optNum(raw.gm),
    perspectiveId: optNum(raw.pr),
    categoryId: optNum(raw.c),
    statusId: optNum(raw.s),
    developerName: raw.dev ?? '',
    minRating: optNum(raw.mr),
    ageRatingOrg: optNum(raw.arO),
    ageRatingValue: optNum(raw.arV),
  };
};

export const hasAnyFilter = (params: Record<string, unknown>): boolean => {
  return Object.keys(params).length > 0;
};
