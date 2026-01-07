import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import type { FilterState } from '@/models/AppTypes';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Multiselect } from '@/components/ui/multiselect';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { 
  PLATFORMS, 
  GENRES, 
  THEMES, 
  GAME_MODES, 
  PERSPECTIVES, 
  AGE_RATING_ORGANIZATIONS, 
  AGE_RATING_VALUES, 
  GAME_CATEGORIES, 
  GAME_STATUSES
} from '@/config/constants';

// Maps each age rating organization to its valid rating value IDs
const AGE_RATING_ORG_TO_VALUES: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5, 6, 7],       // ESRB: RP, EC, E, E10+, T, M, AO
  2: [8, 9, 10, 11, 12],          // PEGI: 3, 7, 12, 16, 18
  3: [13, 14, 15, 16, 17],        // CERO: A, B, C, D, Z
  4: [18, 19, 20, 21, 22],        // USK: 0, 6, 12, 16, 18
  5: [23, 24, 25, 26, 40, 27],    // GRAC: ALL, 12+, 15+, 19+, 18+, TESTING
  6: [28, 29, 30, 31, 32, 33],    // CLASS IND: L, 10, 12, 14, 16, 18
  7: [34, 35, 36, 37, 38, 39],    // ACB: G, PG, M, MA 15+, R 18+, RC
};

// Initial state for the filter form
const initialState: FilterState = {
  search: '',
  platformId: null,
  yearRange: [1970, 2026],
  genreIds: [],
  themeIds: [],
  gameModeId: null,
  perspectiveId: null,
  categoryId: null,
  statusId: null,
  developerName: '',
  minRating: null,
  ageRatingOrg: null,
  ageRatingValue: null
};

// Action types for the reducer
type FilterAction =
  | { type: 'SET_PLATFORM_ID'; payload: number | null }
  | { type: 'SET_YEAR_RANGE'; payload: [number, number] }
  | { type: 'SET_GENRE_IDS'; payload: number[] }
  | { type: 'SET_THEME_IDS'; payload: number[] }
  | { type: 'SET_GAME_MODE_ID'; payload: number | null }
  | { type: 'SET_PERSPECTIVE_ID'; payload: number | null }
  | { type: 'SET_CATEGORY_ID'; payload: number | null }
  | { type: 'SET_STATUS_ID'; payload: number | null }
  | { type: 'SET_DEVELOPER_NAME'; payload: string }
  | { type: 'SET_MIN_RATING'; payload: number | null }
  | { type: 'SET_AGE_RATING_ORG'; payload: number | null }
  | { type: 'SET_AGE_RATING_VALUE'; payload: number | null }
  | { type: 'RESET' }
  | { type: 'RESET_CORE' }
  | { type: 'RESET_TIMELINE' }
  | { type: 'RESET_CLASSIFICATION' }
  | { type: 'RESET_METRICS' };

// Reducer function
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_PLATFORM_ID':
      return { ...state, platformId: action.payload };
    case 'SET_YEAR_RANGE':
      return { ...state, yearRange: action.payload };
    case 'SET_GENRE_IDS':
      return { ...state, genreIds: action.payload };
    case 'SET_THEME_IDS':
      return { ...state, themeIds: action.payload };
    case 'SET_GAME_MODE_ID':
      return { ...state, gameModeId: action.payload };
    case 'SET_PERSPECTIVE_ID':
      return { ...state, perspectiveId: action.payload };
    case 'SET_CATEGORY_ID':
      return { ...state, categoryId: action.payload };
    case 'SET_STATUS_ID':
      return { ...state, statusId: action.payload };
    case 'SET_DEVELOPER_NAME':
      return { ...state, developerName: action.payload };
    case 'SET_MIN_RATING':
      return { ...state, minRating: action.payload };
    case 'SET_AGE_RATING_ORG':
      return { ...state, ageRatingOrg: action.payload, ageRatingValue: null };
    case 'SET_AGE_RATING_VALUE':
      return { ...state, ageRatingValue: action.payload };
    case 'RESET':
      return initialState;
    case 'RESET_CORE':
      return { ...state, categoryId: null, statusId: null, platformId: null, developerName: '' };
    case 'RESET_TIMELINE':
      return { ...state, yearRange: [1970, 2026] };
    case 'RESET_CLASSIFICATION':
      return { ...state, genreIds: [], themeIds: [], gameModeId: null, perspectiveId: null };
    case 'RESET_METRICS':
      return { ...state, minRating: null, ageRatingOrg: null, ageRatingValue: null };
    default:
      return state;
  }
}

interface FilterPanelProps {
  onSearch: (filters: FilterState) => void;
  onClearAll?: () => void;
}

export const FilterPanel = ({ onSearch, onClearAll }: FilterPanelProps) => {
  const { t } = useTranslation();
  const [filters, dispatch] = useReducer(filterReducer, initialState);

  // Filter age rating values based on selected organization
  const filteredAgeRatingValues = filters.ageRatingOrg
    ? AGE_RATING_VALUES.filter(rating => 
        AGE_RATING_ORG_TO_VALUES[filters.ageRatingOrg!]?.includes(rating.id)
      )
    : [];

  const handleClearAll = () => {
    dispatch({ type: 'RESET' });
    onClearAll?.();
  };

  return (
    <TooltipProvider>
    <div className="space-y-8 pb-20 lg:pb-0 font-base text-foreground">

      {/* ==================================================
          SECTION 1: CORE IDENTITY
      ================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-1">
          <span className="bg-foreground text-background text-xs font-heading px-1">01</span>
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">{t('filters.coreSpecs')}</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => dispatch({ type: 'RESET_CORE' })}
                className="ml-auto text-xs font-heading uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {t('filters.clear')}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('filters.clearSection')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 min-[395px]:grid-cols-2 gap-3">
          {/* Category - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">{t('filters.category')}</Label>
            <Combobox
              options={GAME_CATEGORIES.map(c => ({ value: c.id.toString(), label: c.name }))}
              value={filters.categoryId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_CATEGORY_ID', payload: val ? Number(val) : null })}
              placeholder={t('filters.anyCategory')}
              searchPlaceholder={t('filters.searchCategories')}
              emptyText={t('filters.noCategoryFound')}
              className="h-9 shadow-shadow"
            />
          </div>

          {/* Status - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">{t('filters.status')}</Label>
            <Combobox
              options={GAME_STATUSES.map(s => ({ value: s.id.toString(), label: s.name }))}
              value={filters.statusId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_STATUS_ID', payload: val ? Number(val) : null })}
              placeholder={t('filters.anyStatus')}
              searchPlaceholder={t('filters.searchStatuses')}
              emptyText={t('filters.noStatusFound')}
              className="h-9 shadow-shadow"
            />
          </div>
        </div>

        {/* Developer - Input */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">{t('filters.developer')}</Label>
          <Input
            placeholder={t('filters.developerPlaceholder')}
            className="h-9 bg-background font-base shadow-shadow"
            value={filters.developerName}
            onChange={(e) => dispatch({ type: 'SET_DEVELOPER_NAME', payload: e.target.value })}
          />
        </div>
        
        {/* Platform - Combobox */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">{t('filters.platform')}</Label>
          <Combobox
            options={PLATFORMS.map(p => ({ value: p.id.toString(), label: p.name }))}
            value={filters.platformId?.toString() ?? null}
            onValueChange={(val) => dispatch({ type: 'SET_PLATFORM_ID', payload: val ? Number(val) : null })}
            placeholder={t('filters.anyPlatform')}
            searchPlaceholder={t('filters.searchPlatforms')}
            emptyText={t('filters.noPlatformFound')}
            className="h-9 shadow-shadow"
          />
        </div>
      </section>


      {/* ==================================================
          SECTION 2: TIMELINE
      ================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-1">
          <span className="bg-foreground text-background text-xs font-heading px-1">02</span>
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">{t('filters.timeline')}</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => dispatch({ type: 'RESET_TIMELINE' })}
                className="ml-auto text-xs font-heading uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {t('filters.clear')}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('filters.clearSection')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-4 px-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-heading uppercase">{t('filters.releaseWindow')}</span>
            <div className="flex gap-1">
                <span className="bg-foreground text-background text-xs font-heading px-1 py-0.5 rounded-[2px]">{filters.yearRange[0]}</span>
                <span className="text-foreground font-heading">-</span>
                <span className="bg-foreground text-background text-xs font-heading px-1 py-0.5 rounded-[2px]">{filters.yearRange[1]}</span>
            </div>
          </div>
          
          <Slider 
            value={filters.yearRange}
            onValueChange={(val) => dispatch({ type: 'SET_YEAR_RANGE', payload: val as [number, number] })}
            min={1970} 
            max={2026} 
            step={1} 
            className="cursor-pointer"
          />
        </div>
      </section>


      {/* ==================================================
          SECTION 3: CLASSIFICATION
      ================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-1">
          <span className="bg-foreground text-background text-xs font-heading px-1">03</span>
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">{t('filters.dataClass')}</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => dispatch({ type: 'RESET_CLASSIFICATION' })}
                className="ml-auto text-xs font-heading uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {t('filters.clear')}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('filters.clearSection')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Genre - Multiselect */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">{t('filters.genres')}</Label>
          <Multiselect
            options={GENRES.map(g => ({ value: g.id.toString(), label: g.name }))}
            value={filters.genreIds.map(id => id.toString())}
            onValueChange={(newValues) => dispatch({ type: 'SET_GENRE_IDS', payload: newValues.map(Number) })}
            placeholder={t('filters.selectGenres')}
            searchPlaceholder={t('filters.searchGenres')}
            emptyText={t('filters.noGenreFound')}
            maxDisplayItems={2}
            className="shadow-shadow"
          />
        </div>

        {/* Theme - Multiselect */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">{t('filters.themes')}</Label>
          <Multiselect
            options={THEMES.map(t => ({ value: t.id.toString(), label: t.name }))}
            value={filters.themeIds.map(id => id.toString())}
            onValueChange={(newValues) => dispatch({ type: 'SET_THEME_IDS', payload: newValues.map(Number) })}
            placeholder={t('filters.selectThemes')}
            searchPlaceholder={t('filters.searchThemes')}
            emptyText={t('filters.noThemeFound')}
            maxDisplayItems={2}
            className="shadow-shadow"
          />
        </div>

        <div className="grid grid-cols-1 min-[395px]:grid-cols-2 gap-3">
          {/* Game Mode - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">{t('filters.mode')}</Label>
            <Combobox
              options={GAME_MODES.map(m => ({ value: m.id.toString(), label: m.name }))}
              value={filters.gameModeId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_GAME_MODE_ID', payload: val ? Number(val) : null })}
              placeholder={t('filters.anyMode')}
              searchPlaceholder={t('filters.searchModes')}
              emptyText={t('filters.noModeFound')}
              className="h-9 shadow-shadow"
            />
          </div>

          {/* Perspective - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">{t('filters.view')}</Label>
            <Combobox
              options={PERSPECTIVES.map(p => ({ value: p.id.toString(), label: p.name }))}
              value={filters.perspectiveId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_PERSPECTIVE_ID', payload: val ? Number(val) : null })}
              placeholder={t('filters.anyView')}
              searchPlaceholder={t('filters.searchViews')}
              emptyText={t('filters.noViewFound')}
              className="h-9 shadow-shadow"
            />
          </div>
        </div>
      </section>


      {/* ==================================================
          SECTION 4: METRICS
      ================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-1">
          <span className="bg-foreground text-background text-xs font-heading px-1">04</span>
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">{t('filters.metrics')}</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => dispatch({ type: 'RESET_METRICS' })}
                className="ml-auto text-xs font-heading uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {t('filters.clear')}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('filters.clearSection')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-3 px-1">
           <div className="flex justify-between items-center">
            <Label className="text-xs uppercase font-heading">{t('filters.minScore')}</Label>
            <span className="bg-foreground text-background text-xs font-heading px-1 py-0.5 rounded-[2px]">{filters.minRating ?? 0}%</span>
           </div>
           <Slider 
             value={[filters.minRating ?? 0]} 
             onValueChange={(val) => dispatch({ type: 'SET_MIN_RATING', payload: val[0] })}
             min={0} 
             max={100} 
             step={5} 
           />
        </div>

        <div className="grid grid-cols-1 min-[395px]:grid-cols-[1fr_2fr] gap-3 mt-4">
          {/* Age Rating Org - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">{t('filters.ratingOrg')}</Label>
            <Combobox
              options={AGE_RATING_ORGANIZATIONS.map(o => ({ value: o.id.toString(), label: o.name }))}
              value={filters.ageRatingOrg?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_AGE_RATING_ORG', payload: val ? Number(val) : null })}
              placeholder={t('filters.orgPlaceholder')}
              searchPlaceholder={t('filters.searchOrgs')}
              emptyText={t('filters.noOrgFound')}
              className="h-9 shadow-shadow"
            />
          </div>

          {/* Age Rating Value - Combobox (dependent on Org) */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">{t('filters.rating')}</Label>
            <Combobox
              options={filteredAgeRatingValues.map(r => ({ value: r.id.toString(), label: r.name }))}
              value={filters.ageRatingValue?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_AGE_RATING_VALUE', payload: val ? Number(val) : null })}
              placeholder={t('filters.selectRating')}
              searchPlaceholder={t('filters.searchRatings')}
              emptyText={t('filters.selectOrgFirst')}
              disabled={!filters.ageRatingOrg}
              className="h-9 shadow-shadow"
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          ACTION BUTTONS
      ================================================== */}
      <div className="space-y-3">
        <Button 
          onClick={() => onSearch(filters)}
          className="w-full h-12 text-lg font-heading uppercase tracking-widest bg-main text-main-foreground border-2 border-border shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
        >
          {t('filters.search')}
        </Button>
        
        <Button 
          onClick={handleClearAll}
          className="w-full h-10 text-sm font-heading uppercase tracking-widest bg-[var(--chart-3)] text-white border-2 border-border shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
        >
          {t('filters.clearAll')}
        </Button>
      </div>

    </div>
    </TooltipProvider>
  );
};