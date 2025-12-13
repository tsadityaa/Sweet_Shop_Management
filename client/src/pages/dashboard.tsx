import { useState, useMemo } from 'react';
import { SweetCard } from '@/components/sweet-card';
import { SearchFilters } from '@/components/search-filters';
import { EmptyState } from '@/components/empty-state';
import { SweetsGridSkeleton } from '@/components/loading-skeleton';
import { useSweets } from '@/context/sweets-context';
import type { SearchFilters as SearchFiltersType } from '@/lib/types';

export default function Dashboard() {
  const { sweets, isLoading, error } = useSweets();

  const maxPrice = useMemo(() => {
    if (sweets.length === 0) return 100;
    return Math.ceil(Math.max(...sweets.map(s => typeof s.price === 'string' ? parseFloat(s.price) : s.price)));
  }, [sweets]);

  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    category: '',
    minPrice: 0,
    maxPrice: 100,
  });

  const filteredSweets = useMemo(() => {
    return sweets.filter(sweet => {
      const price = typeof sweet.price === 'string' ? parseFloat(sweet.price) : sweet.price;
      
      const matchesQuery = !filters.query || 
        sweet.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        sweet.description.toLowerCase().includes(filters.query.toLowerCase());

      const matchesCategory = !filters.category || sweet.category === filters.category;

      const matchesPrice = price >= filters.minPrice && price <= filters.maxPrice;

      return matchesQuery && matchesCategory && matchesPrice;
    });
  }, [sweets, filters]);

  const handleClearFilters = () => {
    setFilters({
      query: '',
      category: '',
      minPrice: 0,
      maxPrice: maxPrice,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 sm:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4" data-testid="text-hero-title">
            Discover Delicious Sweets
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8" data-testid="text-hero-subtitle">
            From artisan chocolates to traditional candies, find your perfect treat from our handcrafted collection.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              maxPossiblePrice={maxPrice}
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-semibold" data-testid="text-products-title">
                Our Sweets
              </h2>
              {!isLoading && (
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-products-count">
                  {filteredSweets.length} {filteredSweets.length === 1 ? 'product' : 'products'} available
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 mb-6" data-testid="error-message">
              <p>Error loading sweets: {error}</p>
            </div>
          )}

          {isLoading ? (
            <SweetsGridSkeleton count={8} />
          ) : filteredSweets.length === 0 ? (
            <EmptyState 
              type={sweets.length === 0 ? 'no-products' : 'no-results'}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSweets.map(sweet => (
                <SweetCard key={sweet.id} sweet={sweet} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
