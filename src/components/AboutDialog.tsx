/**
 * src/components/AboutDialog.tsx
 * About dialog with app info, credits, and support links.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Github, Coffee, ExternalLink } from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AboutDialog = ({ open, onOpenChange }: AboutDialogProps) => {
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
              Have you ever had a flashback of a game you played as a kid, maybe on the PS2 or GameBoy, but couldn't remember the name? That's why I built <strong>FindThaGame</strong>. This tool is designed to help you filter through history and rediscover those lost childhood gems.
            </p>
          </section>

          {/* How it works */}
          <section>
            <h3 className="font-heading text-base mb-1.5">How it Works</h3>
            <p className="text-muted-foreground leading-relaxed">
              Simply enter the keywords, genres, or platforms you remember. The site searches through thousands of records to find matches that fit your description.
            </p>
          </section>

          {/* Data & Credits */}
          <section>
            <h3 className="font-heading text-base mb-1.5">Data & Credits</h3>
            <p className="text-muted-foreground leading-relaxed">
              This application is powered by the{' '}
              <a
                href="https://www.igdb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main hover:underline font-medium"
              >
                IGDB API
              </a>
              . All game data and imagery are provided by the Internet Game Database. Translations are powered by{' '}
              <a
                href="https://groq.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-main hover:underline font-medium"
              >
                Groq AI
              </a>.
            </p>
          </section>

          {/* Support */}
          <section>
            <h3 className="font-heading text-base mb-1.5">Support the Project</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This is a free, open-source project maintained in my spare time. If this tool helped you find a lost memory, consider supporting me!
            </p>
            <Button
              size="sm"
              onClick={() => window.open('https://ko-fi.com/U7U11S2E9Q', '_blank')}
              className="gap-2 bg-[var(--chart-3)] text-white hover:bg-[var(--chart-3)]/90 border-2 border-border shadow-shadow"
            >
              <Coffee className="w-4 h-4" />
              Support me on Ko-fi
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
              Created by{' '}
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
            <p>Disclaimer: This app is not affiliated with IGDB or Twitch.</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
