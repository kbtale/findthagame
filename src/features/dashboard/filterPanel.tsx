import { useReducer } from 'react';
import type { FilterState } from '@/models/AppTypes';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Multiselect } from '@/components/ui/multiselect';
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
  yearRange: [1980, 2025],
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
  | { type: 'RESET' };

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
    default:
      return state;
  }
}

interface FilterPanelProps {
  onSearch: (filters: FilterState) => void;
}

export const FilterPanel = ({ onSearch }: FilterPanelProps) => {
  const [filters, dispatch] = useReducer(filterReducer, initialState);

  // Filter age rating values based on selected organization
  const filteredAgeRatingValues = filters.ageRatingOrg
    ? AGE_RATING_VALUES.filter(rating => 
        AGE_RATING_ORG_TO_VALUES[filters.ageRatingOrg!]?.includes(rating.id)
      )
    : [];

  return (
    <div className="space-y-8 pb-20 lg:pb-0 font-base text-foreground">
      
      {/* ==================================================
          SECTION 1: CORE IDENTITY
      ================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-border pb-1">
          <span className="bg-foreground text-background text-xs font-heading px-1">01</span>
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">Core Specs</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Category - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Category</Label>
            <Combobox
              options={GAME_CATEGORIES.map(c => ({ value: c.id.toString(), label: c.name }))}
              value={filters.categoryId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_CATEGORY_ID', payload: val ? Number(val) : null })}
              placeholder="Any category..."
              searchPlaceholder="Search categories..."
              emptyText="No category found."
              className="h-9 shadow-shadow"
            />
          </div>

          {/* Status - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Status</Label>
            <Combobox
              options={GAME_STATUSES.map(s => ({ value: s.id.toString(), label: s.name }))}
              value={filters.statusId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_STATUS_ID', payload: val ? Number(val) : null })}
              placeholder="Any status..."
              searchPlaceholder="Search statuses..."
              emptyText="No status found."
              className="h-9 shadow-shadow"
            />
          </div>
        </div>

        {/* Developer - Input */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">Developer</Label>
          <Input
            placeholder="e.g. Kojima"
            className="h-9 bg-background font-base shadow-shadow"
            value={filters.developerName}
            onChange={(e) => dispatch({ type: 'SET_DEVELOPER_NAME', payload: e.target.value })}
          />
        </div>
        
        {/* Platform - Combobox */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">Platform</Label>
          <Combobox
            options={PLATFORMS.map(p => ({ value: p.id.toString(), label: p.name }))}
            value={filters.platformId?.toString() ?? null}
            onValueChange={(val) => dispatch({ type: 'SET_PLATFORM_ID', payload: val ? Number(val) : null })}
            placeholder="Any platform..."
            searchPlaceholder="Search platforms..."
            emptyText="No platform found."
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
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">Timeline</h3>
        </div>

        <div className="space-y-4 px-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-heading text-muted-foreground">Release Window</span>
            <div className="flex gap-1">
                <span className="bg-foreground text-background text-xs font-heading px-1 py-0.5 rounded-[2px]">{filters.yearRange[0]}</span>
                <span className="text-foreground font-heading">-</span>
                <span className="bg-foreground text-background text-xs font-heading px-1 py-0.5 rounded-[2px]">{filters.yearRange[1]}</span>
            </div>
          </div>
          
          <Slider 
            value={filters.yearRange}
            onValueChange={(val) => dispatch({ type: 'SET_YEAR_RANGE', payload: val as [number, number] })}
            min={1980} 
            max={2025} 
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
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">Data Class</h3>
        </div>

        {/* Genre - Multiselect */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">Genres</Label>
          <Multiselect
            options={GENRES.map(g => ({ value: g.id.toString(), label: g.name }))}
            value={filters.genreIds.map(id => id.toString())}
            onValueChange={(newValues) => dispatch({ type: 'SET_GENRE_IDS', payload: newValues.map(Number) })}
            placeholder="Select genres..."
            searchPlaceholder="Search genres..."
            emptyText="No genre found."
            maxDisplayItems={2}
            className="shadow-shadow"
          />
        </div>

        {/* Theme - Multiselect */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">Themes</Label>
          <Multiselect
            options={THEMES.map(t => ({ value: t.id.toString(), label: t.name }))}
            value={filters.themeIds.map(id => id.toString())}
            onValueChange={(newValues) => dispatch({ type: 'SET_THEME_IDS', payload: newValues.map(Number) })}
            placeholder="Select themes..."
            searchPlaceholder="Search themes..."
            emptyText="No theme found."
            maxDisplayItems={2}
            className="shadow-shadow"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Game Mode - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Mode</Label>
            <Combobox
              options={GAME_MODES.map(m => ({ value: m.id.toString(), label: m.name }))}
              value={filters.gameModeId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_GAME_MODE_ID', payload: val ? Number(val) : null })}
              placeholder="Any mode..."
              searchPlaceholder="Search modes..."
              emptyText="No mode found."
              className="h-9 shadow-shadow"
            />
          </div>

          {/* Perspective - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">View</Label>
            <Combobox
              options={PERSPECTIVES.map(p => ({ value: p.id.toString(), label: p.name }))}
              value={filters.perspectiveId?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_PERSPECTIVE_ID', payload: val ? Number(val) : null })}
              placeholder="Any view..."
              searchPlaceholder="Search views..."
              emptyText="No view found."
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
          <h3 className="text-sm font-heading uppercase tracking-widest text-muted-foreground">Metrics</h3>
        </div>

        <div className="space-y-3 px-1">
           <div className="flex justify-between items-center">
            <Label className="text-xs uppercase font-heading">Min Score</Label>
            <span className="text-xs font-heading text-main">{filters.minRating ?? 0}%</span>
           </div>
           <Slider 
             value={[filters.minRating ?? 0]} 
             onValueChange={(val) => dispatch({ type: 'SET_MIN_RATING', payload: val[0] })}
             min={0} 
             max={100} 
             step={5} 
           />
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-3 mt-4">
          {/* Age Rating Org - Combobox */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Rating Org</Label>
            <Combobox
              options={AGE_RATING_ORGANIZATIONS.map(o => ({ value: o.id.toString(), label: o.name }))}
              value={filters.ageRatingOrg?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_AGE_RATING_ORG', payload: val ? Number(val) : null })}
              placeholder="Org..."
              searchPlaceholder="Search..."
              emptyText="Not found."
              className="h-9 shadow-shadow"
            />
          </div>

          {/* Age Rating Value - Combobox (dependent on Org) */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Rating</Label>
            <Combobox
              options={filteredAgeRatingValues.map(r => ({ value: r.id.toString(), label: r.name }))}
              value={filters.ageRatingValue?.toString() ?? null}
              onValueChange={(val) => dispatch({ type: 'SET_AGE_RATING_VALUE', payload: val ? Number(val) : null })}
              placeholder="Select rating..."
              searchPlaceholder="Search ratings..."
              emptyText="Select an org first."
              disabled={!filters.ageRatingOrg}
              className="h-9 shadow-shadow"
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          ACTION BUTTON
      ================================================== */}
      <Button 
        onClick={() => onSearch(filters)}
        className="w-full h-12 text-lg font-heading uppercase tracking-widest bg-main text-main-foreground border-2 border-border shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
      >
        Execute Search
      </Button>

    </div>
  );
};