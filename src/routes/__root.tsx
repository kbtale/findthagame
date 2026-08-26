import React, { useState, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { createRootRoute, Outlet, ScrollRestoration, useNavigate, useRouterState } from '@tanstack/react-router';
import type { RootState } from '@/store/store';
import { selectExternalGame, clearSelection, setLoading } from '@/store/slices/resultsSlice';
import { setAllFilters, resetFilters } from '@/store/slices/detectiveSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { resetLastSearchedUrlKey } from '@/lib/searchKey';
import { FilterPanel } from '@/features/dashboard/filterPanel';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search } from 'lucide-react';
import { useRecentSearches, RecentSearchesContext, type RecentSearch } from '@/hooks/useRecentSearches';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoritesDialog } from '@/components/FavoritesDialog';
import { SavedSearchesDialog } from '@/components/SavedSearchesDialog';
import { Toaster } from '@/components/ui/sonner';
import { filterToSearchParams } from '@/lib/searchParams';
import type { FilterState, GameResult } from '@/models/AppTypes';
import { generateRandomFilters } from '@/utils/randomFilters';

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const results = useSelector((state: RootState) => state.results.items);
  const status = useSelector((state: RootState) => state.results.status);
  const filters = useSelector((state: RootState) => state.detective);

  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { 
    searches: recentSearches, 
    bookmarkedSearches,
    addSearch, 
    removeSearch, 
    clearAll: clearSearchHistory,
    toggleBookmark 
  } = useRecentSearches();

  const { favorites, removeFavorite } = useFavorites();
  const [isFavoritesOpen, setFavoritesOpen] = useState(false);
  const [isSavedSearchesOpen, setSavedSearchesOpen] = useState(false);

  const isLoading = status === 'loading';
  const isGameDetail = routerState.location.pathname.startsWith('/game/');

  // Restore searchTerm from URL when navigating back to a search
  useEffect(() => {
    const locationSearch = routerState.location.search as Record<string, unknown>;
    const urlQ = typeof locationSearch.q === 'string' ? locationSearch.q : '';
    if (urlQ && urlQ !== searchTerm) {
      setSearchTerm(urlQ);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(routerState.location.search as Record<string, unknown>).q]);

  const handleSearch = (filtersState: FilterState) => {
    setMobileOpen(false);
    const fullFilters = { ...filtersState, search: searchTerm };
    dispatch(clearSelection());
    dispatch(setLoading());
    resetLastSearchedUrlKey();
    navigate({ to: '/', search: filterToSearchParams(fullFilters) });
  };

  const handleSelectRecentSearch = (search: RecentSearch) => {
    setSearchTerm(search.filters.search);
    dispatch(setAllFilters(search.filters));
    dispatch(clearSelection());
    dispatch(setLoading());
    resetLastSearchedUrlKey();
    setMobileOpen(false);
    navigate({ to: '/', search: filterToSearchParams(search.filters) });
  };

  const handleRandomize = () => {
    const randomFilters = generateRandomFilters();
    dispatch(setAllFilters(randomFilters));
    dispatch(clearSelection());
    dispatch(setLoading());
    resetLastSearchedUrlKey();
    setMobileOpen(false);
    setSearchTerm('');
    navigate({ to: '/', search: filterToSearchParams(randomFilters) });
  };

  const handleSelectFavorite = (game: GameResult) => {
    dispatch(selectExternalGame({ game, origin: { x: 0, y: 0, width: 0, height: 0 } }));
    setFavoritesOpen(false);
    navigate({ to: '/game/$gameId', params: { gameId: game.id.toString() } });
  };

  const handleOpenFavorites = () => setFavoritesOpen(true);
  const handleOpenSavedSearches = () => setSavedSearchesOpen(true);

  const brandHeader = (
    <img src="/img/Logo.png" alt="FindThaGame" className="h-full w-auto object-contain" />
  );

  const searchBar = (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground italic">
        {t('dashboard.optionalFieldsHint')}
      </p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="text-xs font-heading uppercase tracking-widest cursor-pointer">
              {t('dashboard.keywords')}
            </label>
          </TooltipTrigger>
          <TooltipContent>
            {t('dashboard.keywordsTooltip')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="relative">
        <Input 
          placeholder={t('dashboard.searchPlaceholder')} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(filters)}
          className="pl-10 bg-secondary-background border-border shadow-shadow font-base" 
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 opacity-50" />
      </div>
    </div>
  );

  const mobileSearch = (
    <div className="relative flex-1">
      <Input 
        placeholder={t('dashboard.mobileSearchPlaceholder')} 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch(filters)}
        className="pl-10 bg-secondary-background font-bold border-border shadow-none focus:shadow-shadow transition-all"
        onFocus={() => setMobileOpen(true)} 
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 opacity-50" />
    </div>
  );

  const sidebar = (
    <FilterPanel 
      onSearch={handleSearch}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onClearAll={() => {
        setSearchTerm('');
        dispatch(resetFilters());
      }}
    />
  );

  return (
    <>
      <RecentSearchesContext.Provider value={{ addSearch }}>
        <DashboardLayout
          brandHeader={brandHeader}
          searchBar={searchBar}
          mobileSearch={mobileSearch}
          sidebar={sidebar}
          main={<Outlet />}
          isGameDetail={isGameDetail}
          isMobileOpen={isMobileOpen}
          onMobileToggle={() => setMobileOpen(!isMobileOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
          isLoading={isLoading}
          resultsCount={results.length}
          recentSearches={recentSearches}
          onSelectSearch={handleSelectRecentSearch}
          onDeleteSearch={removeSearch}
          onClearHistory={clearSearchHistory}
          onToggleBookmark={toggleBookmark}
          onRandomize={handleRandomize}
          onOpenFavorites={handleOpenFavorites}
          onOpenSavedSearches={handleOpenSavedSearches}
        />
      </RecentSearchesContext.Provider>
      
      <FavoritesDialog
        open={isFavoritesOpen}
        onOpenChange={setFavoritesOpen}
        favorites={favorites}
        onSelectGame={handleSelectFavorite}
        onRemoveFavorite={removeFavorite}
      />

      <SavedSearchesDialog
        open={isSavedSearchesOpen}
        onOpenChange={setSavedSearchesOpen}
        bookmarkedSearches={bookmarkedSearches}
        onSelectSearch={handleSelectRecentSearch}
        onUnbookmark={toggleBookmark}
      />

      <Toaster />
      <ScrollRestoration />

      <Suspense fallback={null}>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    </>
  );
}
