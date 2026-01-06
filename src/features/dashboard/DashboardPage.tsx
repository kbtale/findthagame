import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { setLoading, setResults, setError, selectGame, clearSelection, selectNext, selectPrevious } from '@/store/slices/resultsSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FilterPanel } from '@/features/dashboard/filterPanel';
import { ResultsGrid } from '@/features/dashboard/ResultsGrid';
import { GameDetail } from '@/features/dashboard/GameDetail';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, History } from 'lucide-react';
import { searchGames } from '@/api/client';
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

    try {
      const data = await searchGames({ ...filters, search: searchTerm });
      dispatch(setResults(data));
    } catch (err) {
      console.error('Search failed:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Search failed'));
    }
  };

  const handleSelectGame = (index: number, origin: { x: number; y: number; width: number; height: number }) => {
    dispatch(selectGame({ index, origin }));
  };

  const handleBack = () => {
    dispatch(clearSelection());
  };

  const handlePrev = () => {
    dispatch(selectPrevious());
  };

  const handleNext = () => {
    dispatch(selectNext());
  };

  // =========================================================================
  // SLOT CONTENT
  // =========================================================================
  const brandHeader = (
    <img src="/img/Logo.png" alt="FindThaGame" className="w-full h-auto object-contain" />
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

  const sidebarFooter = (
    <>
      <div className="flex items-center gap-2 mb-3 text-xs font-heading uppercase opacity-70">
        <History className="w-3 h-3" /> {t('dashboard.recentInquiries')}
      </div>
      <div className="flex flex-col gap-2">
        {['Metal Gear', 'Silent Hill', 'Castlevania'].map((s) => (
          <button key={s} className="text-sm font-bold text-left hover:text-main transition-colors truncate">
            &gt; {s}
          </button>
        ))}
      </div>
    </>
  );

  const getResultText = () => {
    if (isLoading) return t('dashboard.waitingForResults');
    if (results.length === 0) return '';
    if (results.length >= 50) return t('dashboard.gamesFoundPlus', { count: 50 });
    return t('dashboard.gamesFound', { count: results.length });
  };

  const mainHeader = getResultText() ? (
    <Button variant="neutral" onClick={() => {}}>
      {getResultText()}
    </Button>
  ) : null;

  // Calculate FLIP animation style from click origin
  const getFlipStyle = (): React.CSSProperties | undefined => {
    if (!clickOrigin) return undefined;
    console.log('FLIP animation with origin:', clickOrigin);
    return {
      '--flip-origin-x': `${clickOrigin.x}px`,
      '--flip-origin-y': `${clickOrigin.y}px`,
      '--flip-origin-w': `${clickOrigin.width}px`,
      '--flip-origin-h': `${clickOrigin.height}px`,
    } as React.CSSProperties;
  };

  // Log for debugging
  console.log('Selected game:', selectedGame?.title, 'clickOrigin:', clickOrigin);

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
      sidebarFooter={sidebarFooter}
      mainHeader={mainHeader}
      main={mainContent}
      isMobileOpen={isMobileOpen}
      onMobileToggle={() => setMobileOpen(!isMobileOpen)}
      isSidebarCollapsed={isSidebarCollapsed}
      onSidebarToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
    />
  );
};
