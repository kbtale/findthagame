import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { setLoading, setResults, setError, selectGame, selectExternalGame, clearSelection, selectNext, selectPrevious } from '@/store/slices/resultsSlice';
import { setAllFilters, resetFilters } from '@/store/slices/detectiveSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FilterPanel } from '@/features/dashboard/filterPanel';
import { ResultsGrid } from '@/features/dashboard/ResultsGrid';
import { GameDetail } from '@/features/dashboard/GameDetail';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search } from 'lucide-react';
import { searchGames } from '@/api/client';
import { useRecentSearches, type RecentSearch } from '@/hooks/useRecentSearches';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoritesDialog } from '@/components/FavoritesDialog';
import { SavedSearchesDialog } from '@/components/SavedSearchesDialog';
import type { FilterState, GameResult } from '@/models/AppTypes';
import { generateRandomFilters } from '@/utils/randomFilters';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // =========================================================================
  // REDUX STATE
  // =========================================================================
  const results = useSelector((state: RootState) => state.results.items);
  const status = useSelector((state: RootState) => state.results.status);
  const selectedGame = useSelector((state: RootState) => state.results.selectedGame);
  const selectedIndex = useSelector((state: RootState) => state.results.selectedIndex);
  const filters = useSelector((state: RootState) => state.detective);

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isFirstSelection, setIsFirstSelection] = useState(true);
  const [resultsViewMode, setResultsViewMode] = useState<'card' | 'list'>('card');

  // Recent searches
  const { 
    searches: recentSearches, 
    bookmarkedSearches,
    addSearch, 
    removeSearch, 
    clearAll: clearSearchHistory,
    toggleBookmark 
  } = useRecentSearches();

  // Favorites
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const [isFavoritesOpen, setFavoritesOpen] = useState(false);
  const [isSavedSearchesOpen, setSavedSearchesOpen] = useState(false);

  // Derived values
  const isLoading = status === 'loading';
  // Navigation only works when viewing a game from results (has valid index)
  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext = selectedIndex !== null && selectedIndex < results.length - 1;

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const handleSearch = async (filters: FilterState) => {
    setMobileOpen(false);
    setPage(1);
    dispatch(setLoading());

    const fullFilters = { ...filters, search: searchTerm };

    try {
      const data = await searchGames(fullFilters);
      dispatch(setResults(data));
      addSearch(fullFilters, data.length);
      document.getElementById('results-area')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Search failed:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Search failed'));
    }
  };

  const handleSelectGame = useCallback((index: number, origin: { x: number; y: number; width: number; height: number }) => {
    dispatch(selectGame({ index, origin }));
    // Auto-scroll to top
    document.getElementById('results-area')?.scrollTo({ top: 0, behavior: 'smooth' });
    if (isFirstSelection) {
      setTimeout(() => setIsFirstSelection(false), 350);
    }
  }, [dispatch, isFirstSelection]);

  const handleBack = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      dispatch(clearSelection());
      setIsExiting(false);
      setIsFirstSelection(true); // Reset for next selection
    }, 300); // Match animation duration
  }, [dispatch]);

  const handlePrev = useCallback(() => {
    dispatch(selectPrevious());
  }, [dispatch]);

  const handleNext = useCallback(() => {
    dispatch(selectNext());
  }, [dispatch]);

  const handleSelectRecentSearch = async (search: RecentSearch) => {
    setSearchTerm(search.filters.search);
    dispatch(setAllFilters(search.filters)); // Update Redux filter state
    setMobileOpen(false);
    dispatch(setLoading());

    try {
      const data = await searchGames(search.filters);
      dispatch(setResults(data));
      document.getElementById('results-area')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Search failed:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Search failed'));
    }
  };

  // Randomize filters and trigger search
  const handleRandomize = async () => {
    const randomFilters = generateRandomFilters();
    dispatch(setAllFilters(randomFilters)); // Update Redux filter state
    setMobileOpen(false);
    setPage(1);
    dispatch(setLoading());

    try {
      const data = await searchGames(randomFilters);
      dispatch(setResults(data));
      addSearch(randomFilters, data.length);
      document.getElementById('results-area')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Random search failed:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Search failed'));
    }
  };

  // Handlers for favorites dialog
  const handleOpenFavorites = () => {
    setFavoritesOpen(true);
  };

  const handleSelectFavorite = (game: GameResult) => {
    // Select external game directly
    dispatch(selectExternalGame({ game, origin: { x: 0, y: 0, width: 0, height: 0 } }));
    setFavoritesOpen(false);
  };

  const handleOpenSavedSearches = () => {
    setSavedSearchesOpen(true);
  };

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
            <label className="text-xs font-heading uppercase tracking-widest">
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

  // Get animation class based on state
  const getDetailAnimationClass = () => {
    if (isExiting) return 'animate-slide-out-right';
    if (isFirstSelection) return 'animate-slide-in-right';
    return ''; // No animation when switching between games
  };

  // Conditionally render grid or detail view
  const mainContent = selectedGame ? (
    <div 
      key="game-detail"
      className={getDetailAnimationClass()}
    >
      <GameDetail 
        game={selectedGame}
        onBack={handleBack}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        isFavorite={selectedGame ? isFavorite(selectedGame.id) : false}
        onToggleFavorite={() => selectedGame && toggleFavorite(selectedGame)}
      />
    </div>
  ) : (
    <ResultsGrid 
      results={results}
      isLoading={isLoading}
      hasSearched={status === 'success'}
      currentPage={page}
      onPageChange={setPage}
      onSelectGame={handleSelectGame}
      viewMode={resultsViewMode}
      onViewModeChange={setResultsViewMode}
    />
  );

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <>
      <DashboardLayout
        brandHeader={brandHeader}
        searchBar={searchBar}
        mobileSearch={mobileSearch}
        sidebar={sidebar}
        main={mainContent}
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
    </>
  );
};
