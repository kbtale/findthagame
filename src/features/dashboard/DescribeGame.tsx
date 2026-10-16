import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { findFilters } from '@/api/client';
import type { FiltersResponse } from '@/models/SearchFilters';
import type { FilterState } from '@/models/AppTypes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PencilLine } from 'lucide-react';

interface DescribeGameProps {
  onDescribed: (result: FiltersResponse) => void;
  compact?: boolean;
  onSearch?: (filters: Partial<FilterState>, search: string) => void;
}

export const DescribeGame = ({ onDescribed, compact = false, onSearch }: DescribeGameProps) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleDescribe = async () => {
    const text = description.trim();
    if (!text || isParsing) return;

    setIsParsing(true);
    setError(null);

    try {
      const result = await findFilters(text);
      onDescribed(result);
      setDescription('');
      setModalOpen(false);

      // Parsing finished, so run the search right away. The user pressed
      // Search, so they get a search, wherever the box is rendered.
      onSearch?.(result.filters, result.search || result.filters.search || '');
    } catch {
      setError(t('describe.error'));
    } finally {
      setIsParsing(false);
    }
  };

  const form = (
    <>
      {!compact && (
        <label className="text-xs font-heading uppercase tracking-widest mb-2 block">
          {t('describe.title')}
        </label>
      )}

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('describe.placeholder')}
        disabled={isParsing}
        rows={4}
        autoFocus={compact}
        className="resize-y shadow-shadow"
      />

      <div className="mt-2">
        <Button
          onClick={handleDescribe}
          disabled={isParsing || description.trim().length === 0}
          className="w-full"
        >
          {t('describe.button')}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm font-heading">{error}</p>}
    </>
  );

  if (compact) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button variant="neutral" size="sm" className="px-2 md:px-3" title={t('describe.trigger')}>
            <PencilLine className="h-4 w-4" />
            <span className="hidden md:inline">{t('describe.trigger')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{t('describe.titleCompact')}</DialogTitle>
            <DialogDescription>{t('describe.description')}</DialogDescription>
          </DialogHeader>
          <div className="text-left">{form}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return <div className="w-full max-w-4xl text-left">{form}</div>;
};
