import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { SearchFilters as SearchFiltersType } from '@/lib/types';
import { SWEET_CATEGORIES } from '@/lib/types';
import { useState } from 'react';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  maxPossiblePrice: number;
}

export function SearchFilters({ filters, onFiltersChange, maxPossiblePrice }: SearchFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleQueryChange = (query: string) => {
    onFiltersChange({ ...filters, query });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ 
      ...filters, 
      category: filters.category === category ? '' : category 
    });
  };

  const handlePriceChange = (values: number[]) => {
    onFiltersChange({ 
      ...filters, 
      minPrice: values[0], 
      maxPrice: values[1] 
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      query: '',
      category: '',
      minPrice: 0,
      maxPrice: maxPossiblePrice,
    });
  };

  const hasActiveFilters = filters.query || filters.category || 
    filters.minPrice > 0 || filters.maxPrice < maxPossiblePrice;

  const activeFilterCount = [
    filters.query,
    filters.category,
    filters.minPrice > 0 || filters.maxPrice < maxPossiblePrice,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sweets..."
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => handleQueryChange('')}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2" data-testid="button-open-filters">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="font-display">Filter Sweets</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SWEET_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.category === category}
                        onCheckedChange={() => handleCategoryChange(category)}
                        data-testid={`checkbox-category-${category}`}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Price Range</Label>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={handlePriceChange}
                  max={maxPossiblePrice}
                  min={0}
                  step={1}
                  className="mt-2"
                  data-testid="slider-price"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filters.minPrice.toFixed(0)}</span>
                  <span>${filters.maxPrice.toFixed(0)}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClearFilters}
                  data-testid="button-clear-all-filters"
                >
                  Clear All
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setSheetOpen(false)}
                  data-testid="button-apply-filters"
                >
                  Apply
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.query && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-query">
              Search: {filters.query}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleQueryChange('')}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-category">
              {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCategoryChange('')}
              />
            </Badge>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < maxPossiblePrice) && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-filter-price">
              ${filters.minPrice} - ${filters.maxPrice}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handlePriceChange([0, maxPossiblePrice])}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs h-6"
            data-testid="button-clear-filters-inline"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
