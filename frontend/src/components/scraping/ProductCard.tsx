import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, Calendar } from 'lucide-react';

import { Product, SUPPORTED_SITES } from '@/types/scraping';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const site = SUPPORTED_SITES.find(
    (s) => s.id === product.marketplace
  );

  function formatPrice() {
    if (product.price_text) {
      return product.price_text;
    }

    if (product.price_value !== null) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(product.price_value);
    }

    return '—';
  }

  return (
    <div className="group glass-card rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 fade-in">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={
            product.image_url ||
            'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop'
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Marketplace Badge */}
        <Badge variant="secondary" className="gap-1">
          <span>{site?.icon}</span>
          <span>{site?.name ?? product.marketplace}</span>
        </Badge>

        {/* Product Name */}
        <h3 className="font-medium text-sm leading-tight line-clamp-2 text-foreground">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-xl font-semibold text-primary">
          {formatPrice()}
        </p>

        {/* Scraped Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Coletado em{' '}
            {format(
              new Date(product.scraped_at),
              'dd/MM/yyyy',
              { locale: ptBR }
            )}
          </span>
        </div>

        {/* Action */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => window.open(product.product_url, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Ver no site
        </Button>
      </div>
    </div>
  );
}
