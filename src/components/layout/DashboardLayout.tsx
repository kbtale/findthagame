import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  brandHeader?: ReactNode;
  searchBar?: ReactNode;
  sidebar?: ReactNode;
  sidebarFooter?: ReactNode;
  main?: ReactNode;
  mainHeader?: ReactNode;
  mobileSearch?: ReactNode;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export const DashboardLayout = ({
  brandHeader,
  searchBar,
  sidebar,
  sidebarFooter,
  main,
  mainHeader,
  mobileSearch,
  isMobileOpen = false,
  onMobileToggle,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground font-base flex flex-col lg:grid lg:grid-cols-[390px_1fr] overflow-hidden">
      
      {/* =========================================================================
          REGION 1: DESKTOP SIDEBAR (Visible ≥ 1024px)
      ========================================================================= */}
      <aside className="hidden lg:flex flex-col h-full border-r-2 border-border bg-background overflow-hidden relative z-20">
        
        {/* Brand Header Slot */}
        {brandHeader && (
          <div className="p-6 border-b-2 border-border bg-main text-main-foreground">
            {brandHeader}
          </div>
        )}

        {/* Scrollable Control Center */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Search Bar Slot */}
          {searchBar}
          
          {/* Sidebar Content Slot */}
          {sidebar}
        </div>

        {/* Sidebar Footer Slot */}
        {sidebarFooter && (
          <div className="p-5 border-t-2 border-border bg-secondary-background">
            {sidebarFooter}
          </div>
        )}
      </aside>


      {/* =========================================================================
          REGION 2: MOBILE HEADER (Visible < 1024px)
      ========================================================================= */}
      <header className="lg:hidden z-50 bg-background border-b-2 border-border flex flex-col relative shadow-sm">
        
        {/* Top Bar: Always Visible */}
        <div className="p-4 flex items-center gap-3 bg-background z-20 relative">
          {/* Mobile Search Slot */}
          <div className="flex-1">
            {mobileSearch}
          </div>
          
          {/* Toggle Button */}
          {onMobileToggle && (
            <Button 
              variant="neutral" 
              size="icon" 
              onClick={onMobileToggle}
              className="shrink-0"
            >
              {isMobileOpen ? <X /> : <SlidersHorizontal />}
            </Button>
          )}
        </div>

        {/* The Accordion Panel (Options appear below) */}
        <div className={cn(
          "overflow-hidden transition-[max-height] duration-500 ease-in-out w-full border-border bg-background absolute top-full left-0 z-10",
          isMobileOpen ? "max-h-[85vh] border-b-2 shadow-shadow" : "max-h-0 border-none"
        )}>
          <div className="p-6 overflow-y-auto max-h-[75vh]">
            {sidebar}
          </div>
        </div>
      </header>


      {/* =========================================================================
          REGION 3: MAIN CONTENT AREA
      ========================================================================= */}
      <main className="flex-1 h-full overflow-y-auto bg-background p-4 lg:p-8 relative z-10">
        {/* Main Header Slot (Desktop only) */}
        {mainHeader && (
          <div className="hidden lg:flex items-center justify-between mb-8">
            {mainHeader}
          </div>
        )}

        {/* Main Content Slot */}
        {main}
      </main>

    </div>
  );
};
