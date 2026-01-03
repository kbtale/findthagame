import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// 1. Data Shape
interface FilterState {
  platformId: string | null;
  yearRange: [number, number]; 
  genreIds: string[];
  themeIds: string[];
  gameModeId: string | null;
  perspectiveId: string | null;
  categoryId: string | null;
  statusId: string | null;
  developerId: string;
  minRating: number | null;
  ageRatingOrg: string | null;
  ageRatingValue: string | null;
}

interface FilterPanelProps {
  state?: FilterState; 
  onSearch: () => void; // Trigger to close mobile menu
}

export const FilterPanel = ({ onSearch }: FilterPanelProps) => {

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
            <Select>
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
            <Select>
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
          />
        </div>
        
        <div className="space-y-1.5">
           <Label className="text-xs uppercase font-heading">Category</Label>
           <Select>
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
                <span className="bg-foreground text-background text-xs font-heading px-1 py-0.5 rounded-[2px]">1980</span>
                <span className="text-foreground font-heading">-</span>
                <span className="bg-foreground text-background text-xs font-heading px-1 py-0.5 rounded-[2px]">2025</span>
            </div>
          </div>
          
          <Slider 
            defaultValue={[1980, 2025]} 
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
              {['RPG', 'Shooter', 'Strategy', 'Indie', 'Adventure', 'Simulator', 'Sport', 'Racing', 'Fighting', 'Puzzle'].map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox id={`g-${genre}`} />
                  <label 
                    htmlFor={`g-${genre}`} 
                    className="text-xs font-bold uppercase cursor-pointer select-none hover:text-main transition-colors"
                  >
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-1.5">
            <Label className="text-xs uppercase font-heading">Mode</Label>
            <Select>
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
            <Select>
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
            <span className="text-xs font-heading text-main">80%</span>
           </div>
           <Slider defaultValue={[80]} min={0} max={100} step={5} />
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-3 mt-4">
           <Select>
             <SelectTrigger className="h-9 bg-background shadow-sm"><SelectValue placeholder="Org" /></SelectTrigger>
             <SelectContent>
               <SelectItem value="1">ESRB</SelectItem>
               <SelectItem value="2">PEGI</SelectItem>
             </SelectContent>
           </Select>
           <Select>
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