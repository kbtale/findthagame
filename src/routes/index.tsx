import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { RootState } from '@/store/store';
import { selectGame, setCurrentPage, setSortBy } from '@/store/slices/resultsSlice';
import { ResultsGrid } from '@/features/dashboard/ResultsGrid';

export const Route = createFileRoute('/')({
  component: SearchResultsPage,
});

function SearchResultsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const results = useSelector((state: RootState) => state.results.items);
  const status = useSelector((state: RootState) => state.results.status);
  const currentPage = useSelector((state: RootState) => state.results.currentPage);
  const sortBy = useSelector((state: RootState) => state.results.sortBy);

  const [resultsViewMode, setResultsViewModeState] = useState<'card' | 'list'>(() => {
    return (localStorage.getItem('resultsViewMode') as 'card' | 'list') || 'card';
  });

  const setResultsViewMode = (mode: 'card' | 'list') => {
    setResultsViewModeState(mode);
    localStorage.setItem('resultsViewMode', mode);
  };

  const handleSortByChange = useCallback((val: string) => {
    dispatch(setSortBy(val));
  }, [dispatch]);

  const handleSelectGame = useCallback((index: number, origin: { x: number; y: number; width: number; height: number }) => {
    const game = results[index];
    if (game) {
      dispatch(selectGame({ index, origin }));
      navigate({ to: '/game/$gameId', params: { gameId: game.id.toString() } });
    }
  }, [dispatch, results, navigate]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  const isLoading = status === 'loading';

  return (
    <div id="results-area" className="w-full h-full overflow-y-auto px-4 md:px-6 py-6">
      <ResultsGrid 
        results={results}
        isLoading={isLoading}
        hasSearched={status === 'success'}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSelectGame={handleSelectGame}
        viewMode={resultsViewMode}
        onViewModeChange={setResultsViewMode}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
      />
    </div>
  );
}
