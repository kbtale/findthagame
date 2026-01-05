import type { GameResult } from '@/models/AppTypes';

interface GameDetailProps {
  /** The selected game to display, or null if none selected */
  game: GameResult | null;
  /** Handler to close/deselect the game */
  onClose?: () => void;
}

export const GameDetail = ({ game, onClose }: GameDetailProps) => {
  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border-2 border-border rounded-base shadow-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border bg-main text-main-foreground">
          <h2 className="font-heading text-xl truncate">{game.title}</h2>
          <button 
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Cover */}
          {game.coverUrl && (
            <img 
              src={game.coverUrl} 
              alt={game.title}
              className="w-48 h-auto mx-auto rounded-base border-2 border-border shadow-shadow"
            />
          )}

          {/* Summary */}
          {game.summary && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-2">Summary</h3>
              <p className="text-sm font-base opacity-80">{game.summary}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-heading uppercase text-xs opacity-60">Release</span>
              <p className="font-base">{game.year ?? '—'}</p>
            </div>
            <div>
              <span className="font-heading uppercase text-xs opacity-60">Rating</span>
              <p className="font-base">{game.rating ? `${game.rating}%` : '—'}</p>
            </div>
            <div>
              <span className="font-heading uppercase text-xs opacity-60">Match Score</span>
              <p className="font-base font-bold text-main">{game.matchScore.toFixed(2)}</p>
            </div>
          </div>

          {/* Genres */}
          {game.genres.length > 0 && (
            <div>
              <span className="font-heading uppercase text-xs opacity-60">Genres</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {game.genres.map((genre) => (
                  <span key={genre} className="px-2 py-0.5 bg-secondary-background rounded-base text-xs font-base">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          {game.platforms.length > 0 && (
            <div>
              <span className="font-heading uppercase text-xs opacity-60">Platforms</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {game.platforms.map((platform) => (
                  <span key={platform} className="px-2 py-0.5 bg-secondary-background rounded-base text-xs font-base">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
