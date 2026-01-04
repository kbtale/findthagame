import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  setPlatformId,
  setYearRange,
  toggleGenreId,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Multiselect } from '@/components/ui/multiselect';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PLATFORMS, GENRES, THEMES, GAME_MODES, PERSPECTIVES, AGE_RATING_ORGANIZATIONS, AGE_RATING_VALUES, GAME_CATEGORIES, GAME_STATUSES} from '@/config/constants.ts'

interface FilterPanelProps {
  onSearch: () => void;
}

export const FilterPanel = ({ onSearch }: FilterPanelProps) => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.detective);

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
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Platform</Label>
            <Select 
              value={filters.platformId?.toString() ?? ''} 
              onValueChange={(val) => dispatch(setPlatformId(val ? Number(val) : null))}
            >
              <SelectTrigger className="w-full h-9 bg-background shadow-sm"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="48">PS5</SelectItem>
                <SelectItem value="167">PS4</SelectItem>
                <SelectItem value="6">PC (Win)</SelectItem>
                <SelectItem value="130">Switch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Status</Label>
            <Select 
              value={filters.statusId?.toString() ?? ''} 
              onValueChange={(val) => dispatch(setStatusId(val ? Number(val) : null))}
            >
              <SelectTrigger className="w-full h-9 bg-background shadow-sm"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Released</SelectItem>
                <SelectItem value="2">Alpha</SelectItem>
                <SelectItem value="3">Beta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-heading">Developer</Label>
          <Input 
            placeholder="e.g. Kojima" 
            className="h-9 bg-background font-base shadow-sm"
            value={filters.developerId?.toString() ?? ''}
            onChange={(e) => dispatch(setDeveloperId(e.target.value ? Number(e.target.value) : null))}
          />
        </div>
        
        <div className="space-y-1.5">
           <Label className="text-xs uppercase font-heading">Category</Label>
           <Select 
             value={filters.categoryId?.toString() ?? ''} 
             onValueChange={(val) => dispatch(setCategoryId(val ? Number(val) : null))}
           >
              <SelectTrigger className="w-full h-9 bg-background shadow-sm"><SelectValue placeholder="Main Game" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Main Game</SelectItem>
                <SelectItem value="1">DLC</SelectItem>
                <SelectItem value="2">Expansion</SelectItem>
              </SelectContent>
            </Select>
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

        <div className="space-y-2">
          <Label className="text-xs uppercase font-heading">Genre (Multiselect)</Label>
          
          {/* ScrollArea with Neo-Brutal styling */}
          <ScrollArea className="h-32 rounded-base border-2 border-border bg-background p-3 shadow-shadow">
            <div className="flex flex-col gap-2">
              {GENRES.map((genre) => (
                <div key={genre.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`g-${genre.id}`} 
                    checked={filters.genreIds.includes(genre.id)}
                    onCheckedChange={() => dispatch(toggleGenreId(genre.id))}
                  />
                  <label 
                    htmlFor={`g-${genre.id}`} 
                    className="text-xs font-bold uppercase cursor-pointer select-none hover:text-main transition-colors"
                  >
                    {genre.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Mode</Label>
            <Select 
              value={filters.gameModeId?.toString() ?? ''} 
              onValueChange={(val) => dispatch(setGameModeId(val ? Number(val) : null))}
            >
              <SelectTrigger className="w-full h-9 bg-background shadow-sm"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Single</SelectItem>
                <SelectItem value="2">Multi</SelectItem>
                <SelectItem value="3">Co-op</SelectItem>
              </SelectContent>
            </Select>
           </div>
           <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">View</Label>
            <Select 
              value={filters.perspectiveId?.toString() ?? ''} 
              onValueChange={(val) => dispatch(setPerspectiveId(val ? Number(val) : null))}
            >
              <SelectTrigger className="w-full h-9 bg-background shadow-sm"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First</SelectItem>
                <SelectItem value="2">Third</SelectItem>
                <SelectItem value="3">Iso</SelectItem>
              </SelectContent>
            </Select>
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
           <Select 
             value={filters.ageRatingOrg?.toString() ?? ''} 
             onValueChange={(val) => dispatch(setAgeRatingOrg(val ? Number(val) : null))}
           >
             <SelectTrigger className="h-9 bg-background shadow-sm"><SelectValue placeholder="Org" /></SelectTrigger>
             <SelectContent>
               <SelectItem value="1">ESRB</SelectItem>
               <SelectItem value="2">PEGI</SelectItem>
             </SelectContent>
           </Select>
           <Select 
             value={filters.ageRatingValue?.toString() ?? ''} 
             onValueChange={(val) => dispatch(setAgeRatingValue(val ? Number(val) : null))}
           >
             <SelectTrigger className="h-9 bg-background shadow-sm"><SelectValue placeholder="Rating" /></SelectTrigger>
             <SelectContent>
               <SelectItem value="1">E (Everyone)</SelectItem>
               <SelectItem value="2">T (Teen)</SelectItem>
               <SelectItem value="3">M (Mature)</SelectItem>
             </SelectContent>
           </Select>
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