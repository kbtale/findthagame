import { useTranslation } from 'react-i18next';
import type { GameResult } from '@/models/AppTypes';
import type { MouseEvent } from 'react';

interface ClickOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResultsGridProps {
  results?: GameResult[];
  isLoading?: boolean;
  onSelectGame?: (index: number, origin: ClickOrigin) => void;
}

export const ResultsGrid = ({ 
  results = [], 
  isLoading = false,
  onSelectGame 
}: ResultsGridProps) => {
  const { t } = useTranslation();

  const handleCardClick = (e: MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const origin: ClickOrigin = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
    onSelectGame?.(index, origin);
  };
  
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

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-heading opacity-30">
            {t('results.welcomeTitle')}
          </h2>
          <p className="text-sm font-base opacity-20">
            {t('results.welcomeFilters')}
          </p>
          <p className="text-sm font-base opacity-20">
            {t('results.welcomeSearch')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
      {results.map((game, index) => (
        <div 
          key={game.id} 
          onClick={(e) => handleCardClick(e, index)}
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
              <span className="font-heading opacity-20">{t('results.noImage')}</span>
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
