/**
 * src/components/SavedSearchesDialog.tsx
 * Dialog showing bookmarked searches.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookmarkX } from 'lucide-react';
import type { RecentSearch } from '@/hooks/useRecentSearches';

interface SavedSearchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarkedSearches: RecentSearch[];
  onSelectSearch: (search: RecentSearch) => void;
  onUnbookmark: (id: string) => void;
}

export const SavedSearchesDialog = ({
  open,
  onOpenChange,
  bookmarkedSearches,
  onSelectSearch,
  onUnbookmark,
}: SavedSearchesDialogProps) => {
  const handleSelect = (search: RecentSearch) => {
    onSelectSearch(search);
    onOpenChange(false);
  };

  const getSearchLabel = (search: RecentSearch) => {
    const parts: string[] = [];
    
    if (search.filters.search) {
      parts.push(`"${search.filters.search}"`);
    }
    if (search.filters.genreIds?.length) {
      parts.push(`${search.filters.genreIds.length} genres`);
    }
    if (search.filters.themeIds?.length) {
      parts.push(`${search.filters.themeIds.length} themes`);
    }
    if (search.filters.platformId) {
      parts.push('platform filter');
    }
    if (search.filters.yearRange && 
        (search.filters.yearRange[0] !== 1970 || search.filters.yearRange[1] !== 2026)) {
      parts.push(`${search.filters.yearRange[0]}-${search.filters.yearRange[1]}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'No filters';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Saved Searches</DialogTitle>
        </DialogHeader>
        
        {bookmarkedSearches.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12 text-muted-foreground text-center">
            <p>No saved searches yet.<br />Bookmark searches from your history!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-neo">
            {bookmarkedSearches.map((search) => (
              <div
                key={search.id}
                className="group flex items-center gap-3 p-3 border-2 border-border rounded-base bg-background hover:bg-secondary-background transition-colors cursor-pointer"
                onClick={() => handleSelect(search)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm truncate">
                    {getSearchLabel(search)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {search.resultCount} results • {new Date(search.timestamp).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="neutral"
                  size="icon"
                  className="md:opacity-0 md:group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnbookmark(search.id);
                  }}
                  title="Remove bookmark"
                >
                  <BookmarkX className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
