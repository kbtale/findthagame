import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FilterPanel } from '@/features/dashboard/filterPanel';
import { ResultsGrid } from '@/features/dashboard/ResultsGrid';
import { GameDetail } from '@/features/dashboard/GameDetail';
import { Input } from '@/components/ui/input';
import { Search, History } from 'lucide-react';
import { searchGames } from '@/api/client';
import type { FilterState, GameResult } from '@/models/AppTypes';

export const DashboardPage = () => {
  const { t } = useTranslation();

  // =========================================================================
  // STATE
  // =========================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const handleSearch = async (filters: FilterState) => {
    setMobileOpen(false);
    setError(null);
    setIsLoading(true);

    try {
      const data = await searchGames({ ...filters, search: searchTerm });
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGame = (game: GameResult) => {
    setSelectedGame(game);
  };

  const handleCloseDetail = () => {
    setSelectedGame(null);
  };

  // =========================================================================
  // SLOT CONTENT
  // =========================================================================
  const brandHeader = (
    <h1 className="text-2xl font-heading italic tracking-tighter">FindThaGame</h1>
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
    <FilterPanel onSearch={handleSearch} />
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

  const getStatusText = () => {
    if (isLoading) return t('dashboard.searching');
    if (error) return t('dashboard.error');
    return t('dashboard.ready');
  };

  const mainHeader = (
    <>
      <h2 className="text-4xl font-heading uppercase tracking-tight">{t('dashboard.dataGrid')}</h2>
      <div className="bg-main text-main-foreground px-4 py-1 text-sm font-heading rounded-base border-2 border-border shadow-shadow">
        {t('dashboard.status')}: {getStatusText()}
      </div>
    </>
  );

  const mainContent = (
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
    <>
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
      />
      <GameDetail game={selectedGame} onClose={handleCloseDetail} />
    </>
  );
};
