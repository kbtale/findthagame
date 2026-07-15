import { useState, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, Languages, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { GameResult } from '@/models/AppTypes';
import { updateGameTranslation } from '@/store/slices/resultsSlice';

interface NavigationHeaderProps {
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isNotEnglish: boolean;
  isTranslating: boolean;
  hasTranslation: boolean;
  showOriginal: boolean;
  onToggleTranslation: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const NavigationHeader = memo(({ 
  onBack, 
  onPrev, 
  onNext, 
  hasPrev, 
  hasNext,
  isNotEnglish,
  isTranslating,
  hasTranslation,
  showOriginal,
  onToggleTranslation,
  isFavorite,
  onToggleFavorite
}: NavigationHeaderProps) => {
  const { t } = useTranslation();
  
  const getButtonText = () => {
    if (isTranslating) return t('gameDetail.translating');
    if (hasTranslation && !showOriginal) return t('gameDetail.seeOriginal');
    return t('gameDetail.translate');
  };
  
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-[var(--main)] border-2 border-border rounded-base">
      <Button 
        onClick={onBack}
        className="flex items-center gap-2 bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:inline">{t('gameDetail.backToResults')}</span>
        <span className="md:hidden">{t('gameDetail.back')}</span>
      </Button>
      <div className="flex items-center gap-2">
        {isNotEnglish && (
          <Button
            onClick={onToggleTranslation}
            disabled={isTranslating}
            size="icon"
            className="bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90 md:w-auto md:px-4"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden md:inline md:ml-2">{getButtonText()}</span>
          </Button>
        )}
        <Button
          onClick={onToggleFavorite}
          size="icon"
          className={isFavorite 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90"
          }
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
        </Button>
        <Button 
          onClick={onPrev}
          disabled={!hasPrev}
          size="icon"
          className="bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button 
          onClick={onNext}
          disabled={!hasNext}
          size="icon"
          className="bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

interface GameDetailProps {
  game: GameResult | null;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const GameDetail = ({ 
  game, 
  onBack, 
  onPrev, 
  onNext, 
  hasPrev = false, 
  hasNext = false,
  isFavorite = false,
  onToggleFavorite
}: GameDetailProps) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const isNotEnglish = i18n.language !== 'en';
  
  // Get cached translation from game object
  const cachedTranslation = game?.translations?.[i18n.language];
  const translatedSummary = cachedTranslation?.summary;
  const translatedStoryline = cachedTranslation?.storyline;
  const hasTranslation = Boolean(translatedSummary || translatedStoryline);

  const handleTranslate = useCallback(async () => {
    if (!game) return;
    
    setIsTranslating(true);
    try {
      const textToTranslate = [game.summary, game.storyline].filter(Boolean).join('\n\n---\n\n');
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToTranslate, targetLang: i18n.language }),
      });
      
      const data = await response.json();
      if (data.translatedText) {
        const parts = data.translatedText.split('---');
        const summary = parts[0]?.trim();
        const storyline = parts[1]?.trim();
        // Store in Redux state on the game object
        dispatch(updateGameTranslation({ 
          gameId: game.id, 
          lang: i18n.language, 
          summary, 
          storyline 
        }));
        setShowOriginal(false);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [game, i18n.language, dispatch]);

  const handleToggleTranslation = useCallback(() => {
    if (hasTranslation) {
      setShowOriginal(!showOriginal);
    } else {
      handleTranslate();
    }
  }, [hasTranslation, showOriginal, handleTranslate]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: game?.title,
          url,
        });
      } catch {
        // user cancelled or not supported
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast(t('gameDetail.linkCopied'), { duration: 2000 });
      } catch {
        toast(t('gameDetail.linkCopied'), { duration: 2000 });
      }
    }
  }, [game, t]);

  // Decide which text to display
  const displaySummary = (hasTranslation && !showOriginal) ? translatedSummary : game?.summary;
  const displayStoryline = (hasTranslation && !showOriginal) ? translatedStoryline : game?.storyline;

  if (!game) return null;

  return (
    <div className="pb-20">
      <NavigationHeader
        onBack={onBack}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        isNotEnglish={isNotEnglish}
        isTranslating={isTranslating}
        hasTranslation={hasTranslation}
        showOriginal={showOriginal}
        onToggleTranslation={handleToggleTranslation}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite ?? (() => {})}
      />

      {/* Game Content */}
      <div className="bg-background border-2 border-border rounded-base shadow-shadow">
        {/* Header */}
        <div className="p-4 border-b-2 border-border bg-main text-main-foreground flex items-center justify-between gap-2">
          <h2 className="font-heading text-xl truncate">{game.title}</h2>
          <Button
            size="icon"
            onClick={handleShare}
            className="bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90 shrink-0"
            title={t('gameDetail.shareGame')}
          >
            <Share2 className="w-4 h-4" />
          </Button>
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

              {/* Stats Row - Desktop only */}
              <div className="hidden md:grid grid-cols-3 gap-4 text-sm">
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

          {/* Stats Row - Mobile only (below card, above summary) */}
          <div className="md:hidden grid grid-cols-3 gap-4 text-sm">
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

          {/* Summary */}
          {game.summary && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-2">{t('gameDetail.summary')}</h3>
              <p className="text-sm font-base opacity-80">{displaySummary}</p>
            </div>
          )}

          {/* Storyline */}
          {game.storyline && (
            <div>
              <h3 className="font-heading text-sm uppercase mb-2">{t('gameDetail.storyline')}</h3>
              <p className="text-sm font-base opacity-80">{displayStoryline}</p>
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
                    <Badge key={genre} variant="neutral">
                      {genre}
                    </Badge>
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
                    <Badge key={theme} variant="neutral">
                      {theme}
                    </Badge>
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
                    <Badge key={platform} variant="neutral">
                      {platform}
                    </Badge>
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
                    <Badge key={mode} variant="neutral">
                      {mode}
                    </Badge>
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
                    <Badge key={perspective} variant="neutral">
                      {perspective}
                    </Badge>
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
                    <Badge key={keyword} variant="neutral">
                      {keyword}
                    </Badge>
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
