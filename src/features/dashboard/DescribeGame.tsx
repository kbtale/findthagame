import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { findFilters } from '@/api/client';
import type { FiltersResponse } from '@/models/SearchFilters';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DescribeGameProps {
  onDescribed: (result: FiltersResponse) => void;
}

export const DescribeGame = ({ onDescribed }: DescribeGameProps) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDescribe = async () => {
    const text = description.trim();
    if (!text || isParsing) return;

    setIsParsing(true);
    setError(null);

    try {
      const result = await findFilters(text);
      onDescribed(result);
    } catch {
      setError(t('describe.error'));
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="w-full max-w-xl text-left">
      <label className="text-xs font-heading uppercase tracking-widest mb-2 block">
        {t('describe.title')}
      </label>

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('describe.placeholder')}
        disabled={isParsing}
        rows={4}
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
    </div>
  );
};
