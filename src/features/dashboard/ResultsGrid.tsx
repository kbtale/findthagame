import type { GameResult } from '@/models/AppTypes';

interface ResultsGridProps {
  /** Array of game results to display */
  results?: GameResult[];
  /** Loading state */
  isLoading?: boolean;
  /** Handler when a game card is selected */
  onSelectGame?: (game: GameResult) => void;
}

export const ResultsGrid = ({ 
  results = [], 
  isLoading = false,
  onSelectGame 
}: ResultsGridProps) => {
  
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="aspect-[264/374] bg-secondary-background border-2 border-border rounded-base animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
        {/* Placeholder cards */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="group relative aspect-[264/374] bg-white border-2 border-border rounded-base shadow-shadow flex flex-col justify-between overflow-hidden hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            {/* Image Area */}
            <div className="w-full h-full bg-secondary-background flex items-center justify-center">
              <span className="font-heading opacity-20">IMG_0{i}</span>
            </div>
            
            {/* Meta Overlay */}
            <div className="absolute bottom-0 w-full p-3 bg-background/90 border-t-2 border-border backdrop-blur-sm">
              <h4 className="font-heading text-sm truncate">GAME #{i + 1}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-base opacity-70">—</span>
                <span className="text-xs font-heading text-main">—</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Results grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
      {results.map((game) => (
        <div 
          key={game.id} 
          onClick={() => onSelectGame?.(game)}
          className="group relative aspect-[264/374] bg-white border-2 border-border rounded-base shadow-shadow flex flex-col justify-between overflow-hidden hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          {/* Image Area */}
          <div className="w-full h-full bg-secondary-background flex items-center justify-center overflow-hidden">
            {game.coverUrl ? (
              <img 
                src={game.coverUrl} 
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-heading opacity-20">NO IMG</span>
            )}
          </div>
          
          {/* Meta Overlay */}
          <div className="absolute bottom-0 w-full p-3 bg-background/90 border-t-2 border-border backdrop-blur-sm">
            <h4 className="font-heading text-sm truncate">{game.title}</h4>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs font-base opacity-70">
                {game.year ?? '—'}
              </span>
              <span className="text-xs font-heading text-main">
                {game.rating ? `${game.rating}%` : '—'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
