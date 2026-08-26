import { useState, useEffect, useRef, Suspense, lazy, type ReactNode, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { X, SlidersHorizontal, PanelLeft, PanelLeftClose, Github, History, Trash2, Heart, Bookmark, Dice5, BookmarkCheck, Info, Coffee, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { RecentSearch } from '@/hooks/useRecentSearches';
import { AboutDialog } from '@/components/AboutDialog';

// Lazy load Lottie for easter egg cats (same pattern as ResultsGrid)
const Lottie = lazy(() => 
  import('lottie-react').then(mod => ({
    default: (mod as unknown as { default: { default: ComponentType<{ 
      animationData: object;
      loop?: boolean;
      autoplay?: boolean;
      className?: string;
      lottieRef?: React.MutableRefObject<{ setDirection: (dir: number) => void; play: () => void } | null>;
      onComplete?: () => void;
    }> } }).default.default
  }))
);

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
  isGameDetail?: boolean;
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
  isGameDetail = false,
}: DashboardLayoutProps) => {
  const [isRecentSearchesOpen, setRecentSearchesOpen] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);
  const [easterEggCat, setEasterEggCat] = useState<object | null>(null);
  const [isReversing, setIsReversing] = useState(false);
  const [lastEasterEggTime, setLastEasterEggTime] = useState<number>(0);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [topProgress, setTopProgress] = useState(0);
  const lottieRef = useRef<{ setDirection: (dir: number) => void; play: () => void } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let animationFrameId: number;
    let finishTimer: NodeJS.Timeout;

    if (isLoading) {
      const duration = 15000;
      const startTime = Date.now();

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const rawProgress = elapsed / duration;
        const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
        const newProgress = Math.min(easedProgress * 95, 95);
        setTopProgress(newProgress);

        if (newProgress < 95) {
          animationFrameId = requestAnimationFrame(animateProgress);
        }
      };

      animationFrameId = requestAnimationFrame(animateProgress);
    } else {
      finishTimer = setTimeout(() => {
        setTopProgress((prev) => {
          if (prev > 0 && prev < 100) {
            setTimeout(() => setTopProgress(0), 300);
            return 100;
          }
          return 0;
        });
      }, 0);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [isLoading]);

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
    return t('dashboard.gamesFound', { count: resultsCount });
  };

  return (
    <div className={cn(
      "min-h-screen w-full bg-background text-foreground font-base flex flex-col lg:grid overflow-hidden overflow-x-hidden transition-all duration-300",
      isSidebarCollapsed ? "lg:grid-cols-[0px_1fr]" : "lg:grid-cols-[390px_1fr]"
    )}>
      
      {/* =========================================================================
          REGION 1: DESKTOP SIDEBAR (Visible >= 1024px)
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
              className="h-18 px-4 flex items-center justify-center border-2 border-border bg-main shadow-shadow rounded-base cursor-pointer relative"
              onClick={() => {
                // Logo always shows RandomCat.json
                const now = Date.now();
                if (now - lastEasterEggTime > 10000) {
                  setLastEasterEggTime(now);
                  setIsReversing(false);
                  fetch('/cats/RandomCat.json').then(r => r.json()).then(data => {
                    setEasterEggCat(data);
                  });
                }
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
          <Button
            variant="neutral"
            size="icon"
            className="bg-main"
            onClick={() => setAboutOpen(true)}
            title="About"
          >
            <Info className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Filter Panel Box - floating on orange, extends right */}
        <div className="border-2 border-border bg-background shadow-shadow overflow-y-auto mr-[-18px] rounded-base">
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
          <div className="flex items-center gap-2">
            <div className="h-12">
              {brandHeader}
            </div>
            {/* Info button next to logo on mobile */}
            <Button
              variant="neutral"
              size="icon"
              onClick={() => setAboutOpen(true)}
              title="About"
              className="h-8 w-8"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {/* History - opens recent searches dialog */}
            <Button variant="neutral" size="icon" onClick={() => setRecentSearchesOpen(true)} title="Search History">
              <History className="w-5 h-5" />
            </Button>
            {onOpenSavedSearches && (
              <Button variant="neutral" size="icon" onClick={onOpenSavedSearches} title="Saved Searches">
                <BookmarkCheck className="w-5 h-5" />
              </Button>
            )}
            {onOpenFavorites && (
              <Button variant="neutral" size="icon" onClick={onOpenFavorites} title="Favorites">
                <Heart className="w-5 h-5" />
              </Button>
            )}
            {onRandomize && (
              <Button variant="neutral" size="icon" onClick={onRandomize} title="Random Search">
                <Dice5 className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="neutral"
              size="icon"
              onClick={() => window.open('https://github.com/kbtale/findthagame', '_blank')}
            >
              <Github className="w-5 h-5" />
            </Button>
          </div>
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
      <main className="flex flex-col min-h-full h-full overflow-hidden bg-background p-4 lg:p-8 relative z-10">
        {/* Top Progress Bar Overlay - Only visible when in game details */}
        <div 
          data-testid="search-progress-bar"
          className={cn(
            "absolute top-0 left-0 right-0 z-30 transition-opacity duration-300 pointer-events-none px-1 pt-1",
            isGameDetail && (isLoading || (topProgress > 0 && topProgress <= 100)) ? "opacity-100" : "opacity-0"
          )}
        >
          <Progress value={topProgress} className="h-2 rounded-none border-t-0 border-x-0 border-b-2 border-border shadow-none" />
        </div>

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
              "h-16 transition-all duration-300",
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
                  // Results button always shows RandomCat2.json
                  const now = Date.now();
                  if (now - lastEasterEggTime > 10000) {
                    setLastEasterEggTime(now);
                    setIsReversing(false);
                    fetch('/cats/RandomCat2.json').then(r => r.json()).then(data => {
                      setEasterEggCat(data);
                    });
                  }
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
        <div className="flex-1">
          {main}
        </div>

        {/* Footer */}
        <footer className="hidden lg:block mt-auto mx-0 mb-0 p-4 border-2 border-border bg-main shadow-shadow rounded-base">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-sm text-main-foreground">Powered by the</span>
            <Button 
              variant="neutral" 
              size="sm" 
              asChild
            >
              <a 
                href="https://www.igdb.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                IGDB API
              </a>
            </Button>
            <span className="text-sm text-main-foreground">&</span>
            <Button 
              variant="neutral" 
              size="sm" 
              asChild
            >
              <a 
                href="https://groq.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Groq AI
              </a>
            </Button>
            <span className="text-sm text-main-foreground italic">Not affiliated with IGDB or Twitch</span>
            <Button 
              size="sm"
              onClick={() => window.open('https://ko-fi.com/U7U11S2E9Q', '_blank')}
              className="gap-2 bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90 border-2 border-border shadow-shadow"
            >
              <Coffee className="w-4 h-4" />
              Support me on Ko-fi
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Button>
          </div>
        </footer>
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
              <Trash2 className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">{t('dashboard.clearHistory')}</span>
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
                        search.isBookmarked ? "visible" : "md:invisible md:group-hover:visible"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark?.(search.id);
                      }}
                      title={search.isBookmarked ? 'Remove bookmark' : 'Bookmark this search'}
                    >
                      <Bookmark className="w-4 h-4" fill={search.isBookmarked ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="neutral"
                      size="icon"
                      className="shrink-0 md:invisible md:group-hover:visible"
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
          <div className="fixed bottom-0 right-4 z-50">
            <Lottie
              lottieRef={lottieRef}
              animationData={easterEggCat}
              loop={false}
              autoplay
              onComplete={() => {
                if (!isReversing) {
                  setIsReversing(true);
                  lottieRef.current?.setDirection(-1);
                  lottieRef.current?.play();
                } else {
                  setEasterEggCat(null);
                  setIsReversing(false);
                }
              }}
              className="w-48 h-48"
            />
          </div>
        </Suspense>
      )}
      {/* About Dialog */}
      <AboutDialog open={isAboutOpen} onOpenChange={setAboutOpen} />



    </div>
  );
};
