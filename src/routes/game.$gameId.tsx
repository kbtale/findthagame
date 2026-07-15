import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { store, type RootState } from '@/store/store';
import { selectPrevious, selectNext, clearSelection } from '@/store/slices/resultsSlice';
import { GameDetail } from '@/features/dashboard/GameDetail';
import { fetchGameById } from '@/api/client';
import { useFavorites } from '@/hooks/useFavorites';
import type { GameResult } from '@/models/AppTypes';

export const Route = createFileRoute('/game/$gameId')({
  loader: async ({ params }) => {
    const gameId = parseInt(params.gameId, 10);
    try {
      const state = store.getState();
      const reduxGame = state.results.items.find((g: GameResult) => g.id === gameId) ||
                        (state.results.selectedGame?.id === gameId ? state.results.selectedGame : null);
      if (reduxGame) {
        return { game: reduxGame, error: null };
      }
      const fetched = await fetchGameById(gameId);
      return { game: fetched, error: null };
    } catch (err) {
      return { game: null, error: err instanceof Error ? err.message : 'Failed to load game' };
    }
  },
  component: GameDetailPage,
});

function GameDetailPage() {
  const { game, error } = Route.useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const results = useSelector((state: RootState) => state.results.items);
  const selectedIndex = useSelector((state: RootState) => state.results.selectedIndex);

  const [isExiting, setIsExiting] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  const handleBack = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      dispatch(clearSelection());
      setIsExiting(false);
      window.history.back();
    }, 300);
  }, [dispatch]);

  const handlePrev = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      const prevGame = results[selectedIndex - 1];
      if (prevGame) {
        dispatch(selectPrevious());
        navigate({ to: '/game/$gameId', params: { gameId: prevGame.id.toString() }, replace: true });
      }
    }
  }, [dispatch, selectedIndex, results, navigate]);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < results.length - 1) {
      const nextGame = results[selectedIndex + 1];
      if (nextGame) {
        dispatch(selectNext());
        navigate({ to: '/game/$gameId', params: { gameId: nextGame.id.toString() }, replace: true });
      }
    }
  }, [dispatch, selectedIndex, results, navigate]);

  const hasPrev = selectedIndex !== null && selectedIndex > 0;
  const hasNext = selectedIndex !== null && selectedIndex < results.length - 1;

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-4">
        <h2 className="text-2xl font-heading text-destructive">Game Not Found</h2>
        <p className="text-sm font-base opacity-70">
          {error || "The game you're looking for doesn't exist or couldn't be loaded."}
        </p>
        <button 
          onClick={() => navigate({ to: '/' })}
          className="px-4 py-2 bg-main text-main-foreground rounded-base border-2 border-border font-heading hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shadow-shadow"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className={`px-4 md:px-6 py-6 overflow-y-auto h-full w-full ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
      <GameDetail 
        game={game}
        onBack={handleBack}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        isFavorite={isFavorite(game.id)}
        onToggleFavorite={() => toggleFavorite(game)}
      />
    </div>
  );
}
