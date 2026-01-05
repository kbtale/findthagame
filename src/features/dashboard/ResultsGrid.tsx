import type { GameResult } from '@/models/AppTypes';

interface ResultsGridProps {
  results?: GameResult[];
  isLoading?: boolean;
  onSelectGame?: (game: GameResult) => void;
}

export const ResultsGrid = ({ 
  results = [], 
  isLoading = false,
  onSelectGame 
}: ResultsGridProps) => {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 pb-20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-64 bg-secondary-background border-2 border-border rounded-base animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="font-heading text-2xl opacity-30 mb-2">NO RESULTS</span>
        <span className="font-base text-sm opacity-50">Try adjusting your filters</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-20">
      {results.map((game) => (
        <div 
          key={game.id} 
          onClick={() => onSelectGame?.(game)}
          className="group bg-white border-2 border-border rounded-base shadow-shadow overflow-hidden hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          <div className="flex gap-6 p-6">
            {/* Cover Image */}
            <div className="w-32 h-44 shrink-0 bg-secondary-background rounded-base border-2 border-border overflow-hidden">
              {game.coverUrl ? (
                <img 
                  src={game.coverUrl} 
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-heading text-xs opacity-30">NO IMG</span>
                </div>
              )}
            </div>

            {/* All Info */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title */}
              <h4 className="font-heading text-xl">{game.title}</h4>
              
              {/* Alternative Names */}
              {game.alternativeNames.length > 0 && (
                <div className="text-xs font-base opacity-60 italic">
                  Also known as: {game.alternativeNames.join(', ')}
                </div>
              )}

              {/* Year & Companies */}
              <div className="flex flex-wrap items-center gap-2 text-sm font-base">
                <span className="font-heading">{game.year ?? '—'}</span>
                {game.companies.length > 0 && (
                  <>
                    <span className="opacity-30">|</span>
                    <span>{game.companies.join(', ')}</span>
                  </>
                )}
              </div>

              {/* Summary */}
              {game.summary && (
                <p className="text-sm font-base opacity-80 line-clamp-3">{game.summary}</p>
              )}

              {/* Genres */}
              {game.genres.length > 0 && (
                <div>
                  <span className="text-xs font-heading uppercase opacity-50">Genres: </span>
                  <span className="text-sm font-base">{game.genres.join(', ')}</span>
                </div>
              )}

              {/* Themes */}
              {game.themes.length > 0 && (
                <div>
                  <span className="text-xs font-heading uppercase opacity-50">Themes: </span>
                  <span className="text-sm font-base">{game.themes.join(', ')}</span>
                </div>
              )}

              {/* Platforms */}
              {game.platforms.length > 0 && (
                <div>
                  <span className="text-xs font-heading uppercase opacity-50">Platforms: </span>
                  <span className="text-sm font-base">{game.platforms.join(', ')}</span>
                </div>
              )}

              {/* Game Modes & Perspectives */}
              <div className="flex flex-wrap gap-4">
                {game.gameModes.length > 0 && (
                  <div>
                    <span className="text-xs font-heading uppercase opacity-50">Modes: </span>
                    <span className="text-sm font-base">{game.gameModes.join(', ')}</span>
                  </div>
                )}
                {game.perspectives.length > 0 && (
                  <div>
                    <span className="text-xs font-heading uppercase opacity-50">Perspective: </span>
                    <span className="text-sm font-base">{game.perspectives.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Keywords */}
              {game.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {game.keywords.map((keyword) => (
                    <span 
                      key={keyword} 
                      className="px-2 py-0.5 bg-secondary-background rounded text-xs font-base"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between px-6 py-3 bg-secondary-background border-t-2 border-border">
            <div className="flex items-center gap-4 text-sm">
              {game.rating && (
                <span>
                  <span className="text-xs font-heading uppercase opacity-50">Rating: </span>
                  <span className="font-heading text-main">{game.rating}%</span>
                </span>
              )}
              {game.status !== undefined && (
                <span>
                  <span className="text-xs font-heading uppercase opacity-50">Status: </span>
                  <span className="font-base">{getStatusLabel(game.status)}</span>
                </span>
              )}
              {game.category !== undefined && (
                <span>
                  <span className="text-xs font-heading uppercase opacity-50">Category: </span>
                  <span className="font-base">{getCategoryLabel(game.category)}</span>
                </span>
              )}
            </div>
            <span className="font-heading text-main">
              {game.matchScore.toFixed(2)} MATCH
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const getStatusLabel = (status: number): string => {
  const labels: Record<number, string> = {
    0: 'Released',
    2: 'Alpha',
    3: 'Beta',
    4: 'Early Access',
    5: 'Offline',
    6: 'Cancelled',
    7: 'Rumored',
    8: 'Delisted',
  };
  return labels[status] ?? `Status ${status}`;
};

const getCategoryLabel = (category: number): string => {
  const labels: Record<number, string> = {
    0: 'Main Game',
    1: 'DLC',
    2: 'Expansion',
    3: 'Bundle',
    4: 'Standalone',
    5: 'Mod',
    6: 'Episode',
    7: 'Season',
    8: 'Remake',
    9: 'Remaster',
    10: 'Expanded',
    11: 'Port',
    12: 'Fork',
    13: 'Pack',
    14: 'Update',
  };
  return labels[category] ?? `Category ${category}`;
};
