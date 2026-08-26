import { useCallback, useState, useRef, useLayoutEffect, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router';
import { store, type RootState } from '@/store/store';
import { selectGame, setCurrentPage, setSortBy, setLoading, setResults, setError } from '@/store/slices/resultsSlice';
import { setAllFilters } from '@/store/slices/detectiveSlice';
import { ResultsGrid } from '@/features/dashboard/ResultsGrid';
import { searchGames } from '@/api/client';
import { searchParamsToFilter, hasAnyFilter } from '@/lib/searchParams';
import { getLastSearchedUrlKey, setLastSearchedUrlKey } from '@/lib/searchKey';
import { RecentSearchesContext } from '@/hooks/useRecentSearches';
import type { FilterState } from '@/models/AppTypes';

let savedScrollPosition = 0;

export const Route = createFileRoute('/')({
  component: SearchResultsPage,
});

function SearchResultsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const recentSearchesCtx = useContext(RecentSearchesContext);

  const rawSearch = (routerState.location.search as Record<string, unknown>) ?? {};
  const hasParams = hasAnyFilter(rawSearch);
  const filter = searchParamsToFilter(rawSearch);

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

  const searchKey = JSON.stringify(rawSearch);
  const latestRequestId = useRef(0);

  useEffect(() => {
    if (!hasParams) return;
    if (searchKey === getLastSearchedUrlKey()) return;

    const state = store.getState();
    if (state.results.status === 'loading') return;

    setLastSearchedUrlKey(searchKey);
    const requestId = ++latestRequestId.current;

    dispatch(setAllFilters(filter as FilterState));
    dispatch(setLoading());

    searchGames(filter as FilterState)
      .then((data) => {
        if (requestId !== latestRequestId.current) return;
        dispatch(setResults(data));
        recentSearchesCtx?.addSearch(filter as FilterState, data.length);
        if (data.length > 0) {
          setTimeout(() => {
            document.getElementById('results-area')?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      })
      .catch((err) => {
        if (requestId !== latestRequestId.current) return;
        console.error('Search failed:', err);
        dispatch(setError(err instanceof Error ? err.message : 'Search failed'));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey, hasParams]);

  const handleSortByChange = useCallback((val: string) => {
    dispatch(setSortBy(val));
  }, [dispatch]);

  const handleSelectGame = useCallback((index: number, origin: { x: number; y: number; width: number; height: number }) => {
    const game = results[index];
    if (game) {
      savedScrollPosition = containerRef.current?.scrollTop ?? 0;
      dispatch(selectGame({ index, origin }));
      navigate({ to: '/game/$gameId', params: { gameId: game.id.toString() } });
    }
  }, [dispatch, results, navigate]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  const isLoading = status === 'loading';

  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (status === 'loading') {
      savedScrollPosition = 0;
      return;
    }

    if (!containerRef.current || results.length === 0 || savedScrollPosition <= 0) return;

    const el = containerRef.current;
    const target = savedScrollPosition;

    requestAnimationFrame(() => {
      el.scrollTop = target;
    });
  }, [results, status]);

  return (
    <div 
      id="results-area" 
      ref={containerRef}
      data-scroll-restoration-id="results-area"
      className="w-full h-full overflow-y-auto px-4 md:px-6 py-6"
    >
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
