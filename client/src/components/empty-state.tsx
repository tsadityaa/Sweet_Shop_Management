import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-results' | 'no-products';
  onClearFilters?: () => void;
}

export function EmptyState({ type, onClearFilters }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="empty-state-no-results">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold mb-2">No sweets found</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          We couldn't find any sweets matching your search criteria. Try adjusting your filters.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} data-testid="button-clear-filters-empty">
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="empty-state-no-products">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">No products available</h3>
      <p className="text-muted-foreground max-w-sm">
        There are currently no products in the shop. Check back later!
      </p>
    </div>
  );
}
