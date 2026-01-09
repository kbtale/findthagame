import { useState, useEffect, Suspense, lazy, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { X, SlidersHorizontal, PanelLeft, PanelLeftClose, Github, History, Trash2, Heart, Bookmark, Dice5, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { RecentSearch } from '@/hooks/useRecentSearches';

// Lazy load Lottie for easter egg cats
const Lottie = lazy(() => import('lottie-react'));

// Random cat animation URLs
const EASTER_EGG_CATS = [
  '/cats/RandomCat.json',
  '/cats/RandomCat2.json',
];

interface DashboardLayoutProps {
  brandHeader?: ReactNode;
  searchBar?: ReactNode;
  sidebar?: ReactNode;
  main?: ReactNode;
  mobileSearch?: ReactNode;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  isSidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  isLoading?: boolean;
  resultsCount?: number;
  recentSearches?: RecentSearch[];
  onSelectSearch?: (search: RecentSearch) => void;
  onDeleteSearch?: (id: string) => void;
  onClearHistory?: () => void;
  onToggleBookmark?: (id: string) => void;
  // Action button handlers
  onRandomize?: () => void;
  onOpenFavorites?: () => void;
  onOpenSavedSearches?: () => void;
}

export const DashboardLayout = ({
  brandHeader,
  searchBar,
  sidebar,
  main,
  mobileSearch,
  isMobileOpen = false,
  onMobileToggle,
  isSidebarCollapsed = false,
  onSidebarToggle,
  isLoading = false,
  resultsCount = 0,
  recentSearches,
  onSelectSearch,
  onDeleteSearch,
  onClearHistory,
  onToggleBookmark,
  onRandomize,
  onOpenFavorites,
  onOpenSavedSearches,
}: DashboardLayoutProps) => {
  const [isRecentSearchesOpen, setRecentSearchesOpen] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);
  const [easterEggCat, setEasterEggCat] = useState<object | null>(null);
  const { t } = useTranslation();

  // Fetch GitHub stars on mount
  useEffect(() => {
    fetch('https://api.github.com/repos/kbtale/findthagame')
      .then(res => res.json())
      .then(data => setStarCount(data.stargazers_count ?? null))
      .catch(() => setStarCount(null));
  }, []);

  // Get result text for the button
  const getResultText = () => {
    if (isLoading) return t('dashboard.waitingForResults');
    if (resultsCount === 0) return null;
    if (resultsCount >= 50) return t('dashboard.gamesFoundPlus', { count: 50 });
    return t('dashboard.gamesFound', { count: resultsCount });
  };

  return (
    <div className={cn(
      "min-h-screen w-full bg-background text-foreground font-base flex flex-col lg:grid overflow-y-auto transition-all duration-300",
      isSidebarCollapsed ? "lg:grid-cols-[0px_1fr]" : "lg:grid-cols-[390px_1fr]"
    )}>
      
      {/* =========================================================================
          REGION 1: DESKTOP SIDEBAR (Visible ≥ 1024px)
      ========================================================================= */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-full bg-main relative z-20 transition-all duration-300 p-4 pr-0 mr-[3cm] border-r-6 border-black",
          isSidebarCollapsed 
            ? "w-0 opacity-0 p-0 overflow-hidden" 
            : "w-full opacity-100 overflow-visible"
        )}
      >
        
        {/* Logo + Action Buttons Row */}
        <div className="flex items-center gap-2 ml-[12px] mb-[-33px] z-10 relative">
          {/* Logo Box - clickable for easter egg */}
          {brandHeader && (
            <div 
              className="h-18 px-4 flex items-center justify-center border-2 border-border bg-main shadow-shadow rounded-base cursor-pointer"
              onClick={() => {
                const catUrl = EASTER_EGG_CATS[Math.floor(Math.random() * EASTER_EGG_CATS.length)];
                fetch(catUrl).then(r => r.json()).then(data => {
                  setEasterEggCat(data);
                  setTimeout(() => setEasterEggCat(null), 3000);
                });
              }}
            >
              {brandHeader}
            </div>
          )}
          
          {/* Action Buttons */}
          <Button
            variant="neutral"
            size="icon"
            className="bg-main"
            onClick={onOpenFavorites}
            title="Favorites"
          >
            <Heart className="w-5 h-5" fill="currentColor" />
          </Button>
          <Button
            variant="neutral"
            size="icon"
            className="bg-main"
            onClick={onOpenSavedSearches}
            title="Saved Searches"
          >
            <Bookmark className="w-5 h-5" fill="currentColor" />
          </Button>
          <Button
            variant="neutral"
            size="icon"
            className="bg-main"
            onClick={onRandomize}
            title="Randomize Filters"
          >
            <Dice5 className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Filter Panel Box - floating on orange, extends right */}
        <div className="flex-1 border-2 border-border bg-background shadow-shadow overflow-y-auto mr-[-18px] rounded-base">
          {/* Scrollable Control Center */}
          <div className="p-6 pt-8 space-y-6 mt-[12px]">
            {/* Search Bar Slot */}
            {searchBar}
            
            {/* Sidebar Content Slot */}
            {sidebar}
          </div>
        </div>
      </aside>


      {/* =========================================================================
          REGION 2: MOBILE HEADER (Visible < 1024px)
      ========================================================================= */}
      <header className="lg:hidden z-50 bg-background border-b-2 border-border flex flex-col relative shadow-sm">
        
        {/* Brand Header - Mobile */}
        <div className="p-4 pb-2 bg-main border-b-2 border-border flex items-center justify-between">
          <div className="h-12">
            {brandHeader}
          </div>
          <Button
            variant="neutral"
            size="icon"
            onClick={() => window.open('https://github.com/kbtale/findthagame', '_blank')}
          >
            <Github className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Top Bar: Search + Toggle */}
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

        {/* The Accordion Panel */}
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
      <main id="results-area" className="flex-1 h-full overflow-y-auto bg-background p-4 lg:p-8 relative z-10 scrollbar-neo">
        {/* Main Header Slot (Desktop only) */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            {onSidebarToggle && (
              <Button
                variant="neutral"
                size="icon"
                onClick={onSidebarToggle}
                className="mr-4"
              >
                {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </Button>
            )}
            {/* Show brand header when sidebar is collapsed */}
            <div className={cn(
              "h-12 transition-all duration-300",
              isSidebarCollapsed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
            )}>
              {brandHeader}
            </div>
          </div>
          
          {/* Right: Menu Buttons */}
          <div className="flex items-center gap-2">
            {/* Results Count Button - clickable for easter egg */}
            {getResultText() && (
              <Button 
                variant="neutral" 
                onClick={() => {
                  const catUrl = EASTER_EGG_CATS[Math.floor(Math.random() * EASTER_EGG_CATS.length)];
                  fetch(catUrl).then(r => r.json()).then(data => {
                    setEasterEggCat(data);
                    setTimeout(() => setEasterEggCat(null), 3000);
                  });
                }}
              >
                {getResultText()}
              </Button>
            )}
            <Button variant="neutral" onClick={() => setRecentSearchesOpen(true)}>
              <History className="w-4 h-4 mr-2" />
              {t('dashboard.recentInquiries')}
            </Button>
            <Button
              variant="neutral"
              onClick={() => window.open('https://github.com/kbtale/findthagame', '_blank')}
            >
              <Github className="w-4 h-4" />
              {starCount !== null && starCount}
            </Button>
          </div>
        </div>

        {/* Main Content Slot */}
        {main}
      </main>

      {/* Recent Searches Dialog */}
      <Dialog open={isRecentSearchesOpen} onOpenChange={setRecentSearchesOpen}>
        <DialogContent className="pr-16">
          {/* Clear button */}
          {recentSearches && recentSearches.length > 0 && onClearHistory && (
            <Button
              variant="neutral"
              size="sm"
              onClick={onClearHistory}
              className="absolute top-4 right-16"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t('dashboard.clearHistory')}
            </Button>
          )}
          <DialogHeader>
            <DialogTitle>{t('dashboard.recentInquiries')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.recentSearchesDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 pr-2 max-h-[400px] overflow-y-auto overflow-x-hidden">
            {!recentSearches || recentSearches.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {t('dashboard.noRecentSearches')}
              </div>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="group flex items-center gap-2 p-3 bg-secondary-background border-2 border-border rounded-base cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-shadow transition-all"
                    onClick={() => {
                      onSelectSearch?.(search);
                      setRecentSearchesOpen(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm truncate">
                        {search.filters.search || t('dashboard.noSearchTerm')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {search.resultCount} {t('dashboard.results')} • {new Date(search.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="neutral"
                      size="icon"
                      className={cn(
                        "shrink-0",
                        search.isBookmarked ? "visible" : "invisible group-hover:visible"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark?.(search.id);
                      }}
                      title={search.isBookmarked ? 'Remove bookmark' : 'Bookmark this search'}
                    >
                      {search.isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-main" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="neutral"
                      size="icon"
                      className="shrink-0 invisible group-hover:visible"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSearch?.(search.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Easter Egg Cat - fixed bottom right */}
      {easterEggCat && (
        <Suspense fallback={null}>
          <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Lottie
              animationData={easterEggCat}
              loop
              autoplay
              className="w-32 h-32"
            />
          </div>
        </Suspense>
      )}

    </div>
  );
};
