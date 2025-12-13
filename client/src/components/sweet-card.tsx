import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Sweet } from '@/lib/types';
import { useSweets } from '@/context/sweets-context';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface SweetCardProps {
  sweet: Sweet;
}

export function SweetCard({ sweet }: SweetCardProps) {
  const { purchaseSweet } = useSweets();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Debug: Log the sweet data when component mounts or sweet changes
  useEffect(() => {
    console.log(`🎴 SweetCard rendered for: ${sweet.name}`);
    console.log(`   - id: ${sweet.id}`);
    console.log(`   - price: ${sweet.price}`);
    console.log(`   - stock: ${sweet.stock}`);
    console.log(`   - image: ${sweet.image}`);
    console.log(`   - description: ${sweet.description}`);
  }, [sweet]);

  const isOutOfStock = sweet.stock === 0;
  const isLowStock = sweet.stock > 0 && sweet.stock <= 5;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to make a purchase.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsPurchasing(true);
    const result = await purchaseSweet(sweet.id, 1);
    setIsPurchasing(false);

    if (result.success) {
      toast({
        title: 'Purchase successful!',
        description: `You bought 1 ${sweet.name}.`,
      });
    } else {
      toast({
        title: 'Purchase failed',
        description: result.error || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="group overflow-visible hover-elevate" data-testid={`card-sweet-${sweet.id}`}>
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-200">
        <img
          src={sweet.image}
          alt={sweet.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            console.error(`❌ Image failed to load for ${sweet.name}: ${sweet.image}`);
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999"%3EImage Not Available%3C/text%3E%3C/svg%3E';
          }}
          onLoad={() => {
            console.log(`✅ Image loaded for ${sweet.name}: ${sweet.image}`);
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${sweet.id}`}>
            {sweet.category}
          </Badge>
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs" data-testid={`badge-out-of-stock-${sweet.id}`}>
              Out of Stock
            </Badge>
          )}
          {isLowStock && (
            <Badge className="bg-amber-500/90 text-white text-xs" data-testid={`badge-low-stock-${sweet.id}`}>
                {sweet.stock} left
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-display font-semibold text-lg leading-tight line-clamp-1" data-testid={`text-name-${sweet.id}`}>
            {sweet.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1" data-testid={`text-description-${sweet.id}`}>
            {sweet.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground" data-testid={`text-price-${sweet.id}`}>
              ${(typeof sweet.price === 'string' ? parseFloat(sweet.price) : sweet.price).toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" />
                {sweet.stock} in stock
            </span>
          </div>

          <Button
            size="sm"
            disabled={isOutOfStock || isPurchasing}
            onClick={handlePurchase}
            data-testid={`button-purchase-${sweet.id}`}
          >
            {isPurchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Buy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
