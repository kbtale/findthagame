import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameResult } from '@/models/AppTypes';
import type { MouseEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { SearchLoading } from '@/components/SearchLoading';

const Lottie = lazy(() => 
  import('lottie-react').then(mod => ({
    default: (mod as unknown as { default: { default: ComponentType<{ animationData: object; loop?: boolean; autoplay?: boolean; className?: string }> } }).default.default
  }))
);

const WELCOME_CATS = [
  '/cats/WelcomeCat1.json',
  '/cats/WelcomeCat2.json',
  '/cats/WelcomeCat3.json',
  '/cats/WelcomeCat4.json',
  '/cats/WelcomeCat5.json',
];

const getRandomCat = () => WELCOME_CATS[Math.floor(Math.random() * WELCOME_CATS.length)];

interface ClickOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResultsGridProps {
  results?: GameResult[];
  isLoading?: boolean;
  hasSearched?: boolean;
  onSelectGame?: (index: number, origin: ClickOrigin) => void;
}

export const ResultsGrid = ({ 
  results = [], 
  isLoading = false,
  hasSearched = false,
  onSelectGame 
}: ResultsGridProps) => {
  const { t } = useTranslation();
  
  const [randomCatPath] = useState(() => getRandomCat());
  const [animationData, setAnimationData] = useState<object | null>(null);
  
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  // Fetch animation JSON when welcome screen is shown
  useEffect(() => {
    if (!hasSearched && results.length === 0) {
      fetch(randomCatPath)
        .then(res => res.json())
        .then(data => setAnimationData(data))
        .catch(console.error);
    }
  }, [hasSearched, results.length, randomCatPath]);

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
  
  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (isLoading) {
    return <SearchLoading />;
  }

  // No search yet - show welcome message with cat
  if (!hasSearched && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <Suspense fallback={<div className="w-48 h-48" />}>
          {animationData && (
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="w-48 h-48 mb-[-1rem]"
            />
          )}
        </Suspense>
        <div className="max-w-lg space-y-4">
          <h2 className="text-2xl font-heading">
            {t('results.welcomeTitle')}
          </h2>
          <p className="text-sm font-base">
            {t('results.welcomeFilters')}
          </p>
          <p className="text-sm font-base">
            {t('results.welcomeSearch')}
          </p>
        </div>
      </div>
    );
  }

  // Search done but no results found
  if (hasSearched && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="max-w-lg space-y-4">
          <h2 className="text-2xl font-heading">
            {t('results.noResultsTitle')}
          </h2>
          <p className="text-sm font-base opacity-60">
            {t('results.noResultsDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {paginatedResults.map((game, index) => (
          <div 
            key={game.id} 
            onClick={(e) => handleCardClick(e, (currentPage - 1) * ITEMS_PER_PAGE + index)}
            className="group relative aspect-[264/374] bg-white border-2 border-border rounded-base shadow-shadow flex flex-col justify-between overflow-visible hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            {/* Badges - Top Left (outside box) */}
            <div className="absolute -top-2 -left-2 z-10 flex gap-1">
              {game.rating && (
                <Badge>
                  <Star className="w-3 h-3 fill-current" />
                  {(game.rating / 10).toFixed(1)}
                </Badge>
              )}
              {game.matchScore !== undefined && (
                <Badge variant="neutral">
                  {t('results.match')}: {game.matchScore.toFixed(3)}
                </Badge>
              )}
            </div>

            {/* Image Area */}
            <div className="w-full h-full bg-secondary-background flex items-center justify-center overflow-hidden rounded-base">
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
              <span className="text-xs font-base opacity-70">
                {game.year ?? '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
