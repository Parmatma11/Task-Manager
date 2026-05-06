'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatsCard({ title, value, icon: Icon, trend, trendLabel, className }) {
  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-3 w-3" />;
    return trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    return trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className={cn('overflow-hidden transition-all duration-200 hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(trend !== undefined || trendLabel) && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span>{trendLabel || `${Math.abs(trend)}%`}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-xl bg-primary/10 p-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
