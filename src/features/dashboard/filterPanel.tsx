import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  setPlatformId,
  setYearRange,
  toggleGenreId,
  toggleThemeId,
  setGameModeId,
  setPerspectiveId,
  setCategoryId,
  setStatusId,
  setDeveloperId,
  setMinRating,
  setAgeRatingOrg,
  setAgeRatingValue,
} from '@/store/slices/detectiveSlice';

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

interface FilterPanelProps {
  onSearch: () => void;
}

export const FilterPanel = ({ onSearch }: FilterPanelProps) => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.detective);

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
              onValueChange={(val) => dispatch(setCategoryId(val ? Number(val) : null))}
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
              onValueChange={(val) => dispatch(setStatusId(val ? Number(val) : null))}
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
            onChange={(e) => dispatch(setDeveloperId(e.target.value))}
          />
        </div>
        
        {/* Platform - Combobox */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">Platform</Label>
          <Combobox
            options={PLATFORMS.map(p => ({ value: p.id.toString(), label: p.name }))}
            value={filters.platformId?.toString() ?? null}
            onValueChange={(val) => dispatch(setPlatformId(val ? Number(val) : null))}
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
            onValueChange={(val) => dispatch(setYearRange(val as [number, number]))}
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
            onValueChange={(newValues) => {
              const newIds = newValues.map(Number);
              const currentIds = filters.genreIds;
              // Find added IDs (in new but not in current)
              newIds.filter(id => !currentIds.includes(id)).forEach(id => dispatch(toggleGenreId(id)));
              // Find removed IDs (in current but not in new)
              currentIds.filter(id => !newIds.includes(id)).forEach(id => dispatch(toggleGenreId(id)));
            }}
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
            onValueChange={(newValues) => {
              const newIds = newValues.map(Number);
              const currentIds = filters.themeIds;
              // Find added IDs (in new but not in current)
              newIds.filter(id => !currentIds.includes(id)).forEach(id => dispatch(toggleThemeId(id)));
              // Find removed IDs (in current but not in new)
              currentIds.filter(id => !newIds.includes(id)).forEach(id => dispatch(toggleThemeId(id)));
            }}
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
              onValueChange={(val) => dispatch(setGameModeId(val ? Number(val) : null))}
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
              onValueChange={(val) => dispatch(setPerspectiveId(val ? Number(val) : null))}
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
             onValueChange={(val) => dispatch(setMinRating(val[0]))}
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
              onValueChange={(val) => {
                dispatch(setAgeRatingOrg(val ? Number(val) : null));
                // Reset the rating value when org changes
                dispatch(setAgeRatingValue(null));
              }}
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
              onValueChange={(val) => dispatch(setAgeRatingValue(val ? Number(val) : null))}
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
        onClick={onSearch}
        className="w-full h-12 text-lg font-heading uppercase tracking-widest bg-main text-main-foreground border-2 border-border shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
      >
        Execute Search
      </Button>

    </div>
  );
};