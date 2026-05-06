import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function TasksLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 max-w-[200px] rounded-lg" />
        <Skeleton className="h-9 w-[140px] rounded-lg" />
        <Skeleton className="h-9 w-[140px] rounded-lg" />
        <Skeleton className="h-9 w-[160px] rounded-lg" />
      </div>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
                <Skeleton className="h-4 flex-1 max-w-[280px]" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
