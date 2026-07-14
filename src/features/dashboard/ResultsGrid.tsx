import { useState, useEffect, useMemo, lazy, Suspense, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameResult } from '@/models/AppTypes';
import type { MouseEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Star } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { SearchLoading } from '@/components/SearchLoading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSelectGame?: (index: number, origin: ClickOrigin) => void;
  viewMode?: 'card' | 'list';
  onViewModeChange?: (mode: 'card' | 'list') => void;
  sortBy?: string;
  onSortByChange?: (sortBy: string) => void;
}

export const ResultsGrid = ({ 
  results = [], 
  isLoading = false,
  hasSearched = false,
  currentPage = 1,
  onPageChange,
  onSelectGame,
  viewMode = 'card',
  onViewModeChange,
  sortBy = 'relevance',
  onSortByChange
}: ResultsGridProps) => {
  const { t } = useTranslation();
  
  const [randomCatPath] = useState(() => getRandomCat());
  const [animationData, setAnimationData] = useState<object | null>(null);
  const ITEMS_PER_PAGE = 20;

  const sortedResults = useMemo(() => {
    const items = [...results];
    switch (sortBy) {
      case 'nameAsc':
        return items.sort((a, b) => a.title.localeCompare(b.title));
      case 'nameDesc':
        return items.sort((a, b) => b.title.localeCompare(a.title));
      case 'newest':
        return items.sort((a, b) => {
          const yearA = a.year ?? 0;
          const yearB = b.year ?? 0;
          if (yearA !== yearB) {
            return yearB - yearA;
          }
          return a.title.localeCompare(b.title);
        });
      case 'oldest':
        return items.sort((a, b) => {
          const yearA = a.year ?? 9999;
          const yearB = b.year ?? 9999;
          if (yearA !== yearB) {
            return yearA - yearB;
          }
          return a.title.localeCompare(b.title);
        });
      case 'ratingDesc':
        return items.sort((a, b) => {
          const ratingA = a.rating ?? -1;
          const ratingB = b.rating ?? -1;
          if (ratingA !== ratingB) {
            return ratingB - ratingA;
          }
          return a.title.localeCompare(b.title);
        });
      case 'ratingAsc':
        return items.sort((a, b) => {
          const ratingA = a.rating ?? 999;
          const ratingB = b.rating ?? 999;
          if (ratingA !== ratingB) {
            return ratingA - ratingB;
          }
          return a.title.localeCompare(b.title);
        });
      case 'relevance':
      default:
        return items.sort((a, b) => b.matchScore - a.matchScore);
    }
  }, [results, sortBy]);

  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  useEffect(() => {
    if (!hasSearched && sortedResults.length === 0) {
      fetch(randomCatPath)
        .then(res => res.json())
        .then(data => setAnimationData(data))
        .catch(console.error);
    }
  }, [hasSearched, sortedResults.length, randomCatPath]);

  const handleCardClick = (e: MouseEvent<HTMLElement>, index: number) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const origin: ClickOrigin = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
    onSelectGame?.(index, origin);
  };

  const paginatedResults = sortedResults.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
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
          <p className="text-sm font-base md:hidden text-muted-foreground">
            {t('dashboard.optionalFieldsHint')}
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
      <div className="flex justify-end gap-2 items-center">
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="h-9 w-[180px] md:w-[220px] bg-secondary-background text-foreground shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all cursor-pointer">
            <SelectValue placeholder={t('sorting.title')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">{t('sorting.relevance')}</SelectItem>
            <SelectItem value="nameAsc">{t('sorting.nameAsc')}</SelectItem>
            <SelectItem value="nameDesc">{t('sorting.nameDesc')}</SelectItem>
            <SelectItem value="newest">{t('sorting.newest')}</SelectItem>
            <SelectItem value="oldest">{t('sorting.oldest')}</SelectItem>
            <SelectItem value="ratingDesc">{t('sorting.ratingDesc')}</SelectItem>
            <SelectItem value="ratingAsc">{t('sorting.ratingAsc')}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={viewMode === 'card' ? 'default' : 'neutral'}
          size="sm"
          className="hover:translate-x-0 hover:translate-y-0"
          onClick={() => onViewModeChange?.('card')}
        >
          <LayoutGrid className="h-4 w-4" />
          {t('results.cardView')}
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'neutral'}
          size="sm"
          className="hover:translate-x-0 hover:translate-y-0"
          onClick={() => onViewModeChange?.('list')}
        >
          <List className="h-4 w-4" />
          {t('results.listView')}
        </Button>
      </div>

      <div className={viewMode === 'card' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' : 'flex flex-col gap-3'}>
        {paginatedResults.map((game, index) => {
          const gameIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
          return viewMode === 'card' ? (
            <div 
              key={game.id} 
              onClick={(e) => handleCardClick(e, gameIndex)}
              className="group relative aspect-[264/374] bg-white border-2 border-border rounded-base shadow-shadow flex flex-col justify-between overflow-visible hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
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
              
              <div className="absolute bottom-0 w-full p-3 bg-background/90 border-t-2 border-border backdrop-blur-sm">
                <h4 className="font-heading text-sm truncate">{game.title}</h4>
                <span className="text-xs font-base opacity-70">
                  {game.year ?? '—'}
                </span>
              </div>
            </div>
          ) : (
            <div
              key={game.id}
              onClick={(e) => handleCardClick(e, gameIndex)}
              className="group border-2 border-border rounded-base bg-white shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer p-3 flex items-center gap-4"
            >
              <div className="h-16 w-12 shrink-0 rounded-base bg-secondary-background overflow-hidden flex items-center justify-center">
                {game.coverUrl ? (
                  <img src={game.coverUrl} alt={game.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-heading opacity-20">{t('results.noImage')}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-heading text-sm truncate">{game.title}</h4>
                <span className="text-xs font-base opacity-70">{game.year ?? '—'}</span>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
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
            </div>
          );
        })}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (() => {
        // On mobile, show fewer page numbers
        const getVisiblePages = () => {
          if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
          
          const pages: (number | 'ellipsis')[] = [];
          if (currentPage <= 3) {
            pages.push(1, 2, 3, 'ellipsis', totalPages);
          } else if (currentPage >= totalPages - 2) {
            pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
          } else {
            pages.push(1, 'ellipsis', currentPage, 'ellipsis', totalPages);
          }
          return pages;
        };
        
        const visiblePages = getVisiblePages();
        
        return (
          <Pagination className="overflow-x-auto">
            <PaginationContent className="flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}
                />
              </PaginationItem>
              
              {visiblePages.map((page, idx) => 
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <span className="px-2">…</span>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        );
      })()}
    </div>
  );
};
