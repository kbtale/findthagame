/**
 * src/components/AboutDialog.tsx
 * About dialog with app info, credits, and support links.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Github, Coffee, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AboutDialog = ({ open, onOpenChange }: AboutDialogProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto scrollbar-neo">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <img src="/img/Logo.png" alt="FindThaGame" className="h-8 w-auto" />
            FindThaGame
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Story */}
          <section>
            <p className="text-foreground leading-relaxed">
              {t('about.intro1')} <strong>FindThaGame</strong>. {t('about.intro2')}
            </p>
          </section>

          {/* How it works */}
          <section>
            <h3 className="font-heading text-base mb-1.5">{t('about.howItWorks')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.howItWorksBody')}
            </p>
          </section>

          {/* Data & Credits */}
          <section>
            <h3 className="font-heading text-base mb-1.5">{t('about.dataCredits')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.dataCredits1')}{' '}
              <a
                href="https://www.igdb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main hover:underline font-medium"
              >
                IGDB API
              </a>
              {t('about.dataCredits2')}{' '}
              <a
                href="https://groq.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main hover:underline font-medium"
              >
                Groq AI
              </a>
              {t('about.dataCredits3')}
            </p>
          </section>

          {/* Support */}
          <section>
            <h3 className="font-heading text-base mb-1.5">{t('about.supportTitle')}</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              {t('about.supportBody')}
            </p>
            <Button
              size="sm"
              onClick={() => window.open('https://ko-fi.com/U7U11S2E9Q', '_blank')}
              className="gap-2 bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90 border-2 border-border shadow-shadow"
            >
              <Coffee className="w-4 h-4" />
              {t('about.supportButton')}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Button>
          </section>

          {/* Links */}
          <section className="pt-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="neutral"
                size="sm"
                onClick={() => window.open('https://github.com/kbtale/findthagame', '_blank')}
                className="gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </div>
          </section>

          {/* Creator */}
          <section className="pt-2">
            <p className="text-muted-foreground text-xs">
              {t('about.createdBy')}{' '}
              <a
                href="https://github.com/kbtale"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main hover:underline font-medium"
              >
                Carlos Bolivar
              </a>
            </p>
          </section>

          {/* Disclaimer */}
          <section className="text-xs text-muted-foreground/70 italic">
            <p>{t('about.disclaimer')}</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
