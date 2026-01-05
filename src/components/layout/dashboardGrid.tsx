import { useState } from 'react';
import { FilterPanel } from '@/features/dashboard/filterPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState } from '@/models/AppTypes';

export const DashboardGrid = () => {
  // STATE 1: Controls Mobile Filter visibility (The "Accordion" logic)
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // STATE 2: Shared Search Term (Controlled by both Top and Left inputs)
  const [searchTerm, setSearchTerm] = useState('');

  // HANDLER: When search executes, hide the mobile menu and log filters
  const handleSearchExecute = (filters: FilterState) => {
    setMobileFiltersOpen(false);
    // Combine search term with filters and make API call
    console.log('Search executed with filters:', { ...filters, search: searchTerm });
    // TODO: Dispatch your API call here...
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-base flex flex-col lg:grid lg:grid-cols-[390px_1fr] overflow-hidden">
      
      {/* =========================================================================
          REGION 1: DESKTOP SIDEBAR (Visible ≥ 1024px)
      ========================================================================= */}
      <aside className="hidden lg:flex flex-col h-full border-r-2 border-border bg-background overflow-hidden relative z-20">
        
        {/* Brand Header */}
        <div className="p-6 border-b-2 border-border bg-main text-main-foreground">
          <h1 className="text-2xl font-heading italic tracking-tighter">FindThaGame</h1>
        </div>

        {/* Scrollable Control Center */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* 1. DESKTOP SEARCH (Anchored at top of sidebar) */}
          <div className="space-y-2">
            <label className="text-xs font-heading uppercase tracking-widest">Game name</label>
            <div className="relative">
              <Input 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary-background border-border shadow-shadow font-base" 
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 opacity-50" />
            </div>
          </div>

          {/* 2. FILTER PANEL (The 11 Parameters) */}
          <FilterPanel onSearch={handleSearchExecute} />
        </div>

        {/* Bottom Anchor: Recent Searches */}
        <div className="p-5 border-t-2 border-border bg-secondary-background">
          <div className="flex items-center gap-2 mb-3 text-xs font-heading uppercase opacity-70">
            <History className="w-3 h-3" /> Recent Inquiries
          </div>
          <div className="flex flex-col gap-2">
            {['Metal Gear', 'Silent Hill', 'Castlevania'].map((s) => (
              <button key={s} className="text-sm font-bold text-left hover:text-main transition-colors truncate">
                &gt; {s}
              </button>
            ))}
          </div>
        </div>
      </aside>


      {/* =========================================================================
          REGION 2: MOBILE HEADER (Visible < 1024px)
      ========================================================================= */}
      <header className="lg:hidden z-50 bg-background border-b-2 border-border flex flex-col relative shadow-sm">
        
        {/* Top Bar: Always Visible */}
        <div className="p-4 flex items-center gap-3 bg-background z-20 relative">
          <div className="relative flex-1">
            <Input 
              placeholder="Tap to configure parameters..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary-background font-bold border-border shadow-none focus:shadow-shadow transition-all"
              // CRITICAL: Focus triggers the dropdown
              onFocus={() => setMobileFiltersOpen(true)} 
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 opacity-50" />
          </div>
          
          {/* Toggle Button */}
          <Button 
            variant="neutral" 
            size="icon" 
            onClick={() => setMobileFiltersOpen(!isMobileFiltersOpen)}
            className="shrink-0"
          >
            {isMobileFiltersOpen ? <X /> : <SlidersHorizontal />}
          </Button>
        </div>

        {/* The Accordion Panel (Options appear below) */}
        <div className={cn(
          "overflow-hidden transition-[max-height] duration-500 ease-in-out w-full border-border bg-background absolute top-full left-0 z-10",
          isMobileFiltersOpen ? "max-h-[85vh] border-b-2 shadow-shadow" : "max-h-0 border-none"
        )}>
          <div className="p-6 overflow-y-auto max-h-[75vh]">
            <FilterPanel onSearch={handleSearchExecute} />
          </div>
        </div>
      </header>


      {/* =========================================================================
          REGION 3: THE RESULTS GRID (Fluid Right Panel)
      ========================================================================= */}
      <main className="flex-1 h-full overflow-y-auto bg-background p-4 lg:p-8 relative z-10">
        
        {/* Desktop Title */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <h2 className="text-4xl font-heading uppercase tracking-tight">Data Grid</h2>
          <div className="bg-main text-main-foreground px-4 py-1 text-sm font-heading rounded-base border-2 border-border shadow-shadow">
            STATUS: READY
          </div>
        </div>

        {/* Responsive Grid System */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
          
          {/* Placeholder Cards using your CSS variables */}
          {Array.from({ length: 12 }).map((_, i) => (
             <div 
               key={i} 
               className="group relative aspect-[264/374] bg-white border-2 border-border rounded-base shadow-shadow flex flex-col justify-between overflow-hidden hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
             >
                {/* Image Area */}
                <div className="w-full h-full bg-secondary-background flex items-center justify-center">
                   <span className="font-heading opacity-20">IMG_0{i}</span>
                </div>
                
                {/* Meta Overlay */}
                <div className="absolute bottom-0 w-full p-3 bg-background/90 border-t-2 border-border backdrop-blur-sm">
                   <h4 className="font-heading text-sm truncate">PROTOCOL #{i + 800}</h4>
                   <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-base opacity-70">2024</span>
                      <span className="text-xs font-heading text-main">98% MATCH</span>
                   </div>
                </div>
             </div>
          ))}

        </div>
      </main>

    </div>
  );
};