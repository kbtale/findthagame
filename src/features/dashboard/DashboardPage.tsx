import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { setLoading, setResults, setError, selectGame, clearSelection, selectNext, selectPrevious } from '@/store/slices/resultsSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FilterPanel } from '@/features/dashboard/filterPanel';
import { ResultsGrid } from '@/features/dashboard/ResultsGrid';
import { GameDetail } from '@/features/dashboard/GameDetail';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { searchGames } from '@/api/client';
import { useRecentSearches, type RecentSearch } from '@/hooks/useRecentSearches';
import type { FilterState } from '@/models/AppTypes';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // =========================================================================
  // REDUX STATE
  // =========================================================================
  const results = useSelector((state: RootState) => state.results.items);
  const status = useSelector((state: RootState) => state.results.status);
  const selectedIndex = useSelector((state: RootState) => state.results.selectedIndex);
  const clickOrigin = useSelector((state: RootState) => state.results.clickOrigin);

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Recent searches
  const { searches: recentSearches, addSearch, removeSearch, clearAll: clearSearchHistory } = useRecentSearches();

  // Derived values
  const isLoading = status === 'loading';
  const selectedGame = selectedIndex !== null ? results[selectedIndex] : null;
  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext = selectedIndex !== null && selectedIndex < results.length - 1;

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const handleSearch = async (filters: FilterState) => {
    setMobileOpen(false);
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
  }, [dispatch]);

  const handleBack = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const handlePrev = useCallback(() => {
    dispatch(selectPrevious());
  }, [dispatch]);

  const handleNext = useCallback(() => {
    dispatch(selectNext());
  }, [dispatch]);

  const handleSelectRecentSearch = async (search: RecentSearch) => {
    setSearchTerm(search.filters.search);
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

  const brandHeader = (
    <img src="/img/Logo.png" alt="FindThaGame" className="h-full w-auto object-contain" />
  );

  const searchBar = (
    <div className="space-y-2">
      <label className="text-xs font-heading uppercase tracking-widest">{t('dashboard.gameName')}</label>
      <div className="relative">
        <Input 
          placeholder={t('dashboard.searchPlaceholder')} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        className="pl-10 bg-secondary-background font-bold border-border shadow-none focus:shadow-shadow transition-all"
        onFocus={() => setMobileOpen(true)} 
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 opacity-50" />
    </div>
  );

  const sidebar = (
    <FilterPanel onSearch={handleSearch} onClearAll={() => setSearchTerm('')} />
  );

  // Calculate FLIP animation style from click origin
  const getFlipStyle = (): React.CSSProperties | undefined => {
    if (!clickOrigin) return undefined;
    return {
      '--flip-origin-x': `${clickOrigin.x}px`,
      '--flip-origin-y': `${clickOrigin.y}px`,
      '--flip-origin-w': `${clickOrigin.width}px`,
      '--flip-origin-h': `${clickOrigin.height}px`,
    } as React.CSSProperties;
  };

  // Conditionally render grid or detail view
  const mainContent = selectedGame ? (
    <div 
      key={`detail-${selectedIndex}`}
      className="animate-flip-expand"
      style={getFlipStyle()}
    >
      <GameDetail 
        game={selectedGame}
        onBack={handleBack}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  ) : (
    <ResultsGrid 
      results={results}
      isLoading={isLoading}
      hasSearched={status === 'success'}
      onSelectGame={handleSelectGame}
    />
  );

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
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
    />
  );
};
