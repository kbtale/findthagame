/**
 * src/components/FavoritesDialog.tsx
 * Dialog showing list of favorite games as compact cards.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { GameResult } from '@/models/AppTypes';

interface FavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favorites: GameResult[];
  onSelectGame: (game: GameResult) => void;
  onRemoveFavorite: (gameId: number) => void;
}

export const FavoritesDialog = ({
  open,
  onOpenChange,
  favorites,
  onSelectGame,
  onRemoveFavorite,
}: FavoritesDialogProps) => {
  const handleSelectGame = (game: GameResult) => {
    onSelectGame(game);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Favorite Games</DialogTitle>
        </DialogHeader>
        
        {favorites.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12 text-muted-foreground">
            <p>No favorites yet. Click the heart icon on a game to add it!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-neo">
            {favorites.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-3 p-3 border-2 border-border rounded-base bg-background hover:bg-secondary-background transition-colors group cursor-pointer"
                onClick={() => handleSelectGame(game)}
              >
                {/* Cover thumbnail */}
                {game.coverUrl ? (
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="w-12 h-16 object-cover rounded-base border border-border"
                  />
                ) : (
                  <div className="w-12 h-16 bg-muted rounded-base border border-border flex items-center justify-center text-xs text-muted-foreground">
                    ?
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm truncate">{game.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {game.year ?? 'Unknown year'} • {game.platforms?.slice(0, 2).join(', ')}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  variant="neutral"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(game.id);
                  }}
                  title="Remove from favorites"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
