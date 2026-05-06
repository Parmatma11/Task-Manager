import { Badge } from '@/components/ui/badge';
import { cn, getStatusColor } from '@/lib/utils';
import { TASK_STATUS_LABELS } from '@/lib/constants';

export function TaskStatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={cn('text-[11px] font-medium border', getStatusColor(status))}
    >
      {TASK_STATUS_LABELS[status] || status}
    </Badge>
  );
}
