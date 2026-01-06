import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GameResult } from '@/models/AppTypes';

interface GameDetailProps {
  game: GameResult | null;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const GameDetail = ({ 
  game, 
  onBack, 
  onPrev, 
  onNext, 
  hasPrev = false, 
  hasNext = false 
}: GameDetailProps) => {
  const { t } = useTranslation();

  if (!game) return null;

  return (
    <div className="pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-secondary-background border-2 border-border rounded-base">
        <Button 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('gameDetail.backToResults')}
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onPrev}
            disabled={!hasPrev}
            size="icon"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            onClick={onNext}
            disabled={!hasNext}
            size="icon"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="bg-background border-2 border-border rounded-base shadow-shadow">
        {/* Header */}
        <div className="p-4 border-b-2 border-border bg-main text-main-foreground">
          <h2 className="font-heading text-xl truncate">{game.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Section: Cover + Basic Info */}
          <div className="flex gap-6">
            {/* Cover */}
            {game.coverUrl && (
              <img 
                src={game.coverUrl} 
                alt={game.title}
                className="w-40 h-auto shrink-0 rounded-base border-2 border-border shadow-shadow"
              />
            )}

            {/* Basic Info */}
            <div className="flex-1 space-y-3">
              {/* Alternative Names */}
              {game.alternativeNames.length > 0 && (
                <div className="text-sm font-base opacity-60 italic">
                  {t('results.alsoKnownAs')}: {game.alternativeNames.join(', ')}
                </div>
              )}

              {/* Release Date & Companies */}
              <div className="flex flex-wrap items-center gap-2 text-sm font-base">
                <span className="font-heading text-lg">{game.firstReleaseDate ?? game.year ?? '-'}</span>
                {game.companies.length > 0 && (
                  <>
                    <span className="opacity-30">|</span>
                    <span>{game.companies.join(', ')}</span>
                  </>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-heading uppercase text-xs opacity-60">{t('gameDetail.rating')}</span>
                  <p className="font-heading text-main text-lg">{game.rating ? `${game.rating}%` : '—'}</p>
                </div>
                <div>
                  <span className="font-heading uppercase text-xs opacity-60">{t('results.status')}</span>
                  <p className="font-base">
                    {game.status !== undefined ? t(`gameStatus.${game.status}`, { defaultValue: `Status ${game.status}` }) : '—'}
                  </p>
                </div>
                <div>
                  <span className="font-heading uppercase text-xs opacity-60">{t('results.category')}</span>
                  <p className="font-base">
                    {game.category !== undefined ? t(`gameCategory.${game.category}`, { defaultValue: `Category ${game.category}` }) : '—'}
                  </p>
                </div>
              </div>

              {/* Match Score */}
              <div className="inline-block px-3 py-1 bg-main text-main-foreground rounded-base border-2 border-border">
                <span className="font-heading text-sm">{game.matchScore.toFixed(2)} {t('results.match')}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          {game.summary && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-2">{t('gameDetail.summary')}</h3>
              <p className="text-sm font-base opacity-80">{game.summary}</p>
            </div>
          )}

          {/* Storyline */}
          {game.storyline && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-2">{t('gameDetail.storyline')}</h3>
              <p className="text-sm font-base opacity-80">{game.storyline}</p>
            </div>
          )}

          {/* Classification Grid - Two columns on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Genres */}
            {game.genres.length > 0 && (
              <div>
                <span className="font-heading uppercase text-xs opacity-60">{t('results.genres')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.genres.map((genre) => (
                    <span key={genre} className="px-2 py-0.5 bg-secondary-background rounded-base text-xs font-base border border-border">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Themes */}
            {game.themes.length > 0 && (
              <div>
                <span className="font-heading uppercase text-xs opacity-60">{t('results.themes')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.themes.map((theme) => (
                    <span key={theme} className="px-2 py-0.5 bg-secondary-background rounded-base text-xs font-base border border-border">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Platforms */}
            {game.platforms.length > 0 && (
              <div>
                <span className="font-heading uppercase text-xs opacity-60">{t('results.platforms')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.platforms.map((platform) => (
                    <span key={platform} className="px-2 py-0.5 bg-secondary-background rounded-base text-xs font-base border border-border">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Game Modes */}
            {game.gameModes.length > 0 && (
              <div>
                <span className="font-heading uppercase text-xs opacity-60">{t('results.modes')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.gameModes.map((mode) => (
                    <span key={mode} className="px-2 py-0.5 bg-secondary-background rounded-base text-xs font-base border border-border">
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perspectives */}
            {game.perspectives.length > 0 && (
              <div>
                <span className="font-heading uppercase text-xs opacity-60">{t('results.perspective')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.perspectives.map((perspective) => (
                    <span key={perspective} className="px-2 py-0.5 bg-secondary-background rounded-base text-xs font-base border border-border">
                      {perspective}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {game.keywords.length > 0 && (
              <div>
                <span className="font-heading uppercase text-xs opacity-60">{t('gameDetail.keywords')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.keywords.map((keyword) => (
                    <span key={keyword} className="px-2 py-0.5 bg-secondary-background rounded text-xs font-base opacity-70">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Screenshots */}
          {game.screenshots.length > 0 && (
            <div>
              <span className="font-heading uppercase text-xs opacity-60">{t('gameDetail.screenshots')}</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {game.screenshots.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    alt={`${game.title} screenshot ${i + 1}`}
                    className="w-full h-auto rounded-base border border-border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
