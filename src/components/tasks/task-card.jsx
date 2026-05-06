'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TaskStatusBadge } from './task-status-badge';
import { cn, formatDueDate, getPriorityColor, getInitials, isOverdue } from '@/lib/utils';
import { TASK_PRIORITY_LABELS, ROUTES } from '@/lib/constants';
import { Calendar, GripVertical } from 'lucide-react';

export function TaskCard({ task, assignee = null, isDragging = false, dragHandleProps = {} }) {
  const isTaskOverdue = isOverdue(task.due_date) && task.status !== 'completed';

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        isDragging && 'rotate-2 shadow-xl border-primary/40',
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <div
            {...dragHandleProps}
            className="mt-0.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            {/* Title + Priority */}
            <div className="flex items-start justify-between gap-2">
              <Link
                href={ROUTES.TASK_DETAIL(task.id)}
                className="text-sm font-medium leading-snug hover:text-primary transition-colors line-clamp-2"
              >
                {task.title}
              </Link>
              <Badge
                variant="outline"
                className={cn('text-[10px] font-medium border flex-shrink-0', getPriorityColor(task.priority))}
              >
                {TASK_PRIORITY_LABELS[task.priority]}
              </Badge>
            </div>

            {/* Status */}
            <TaskStatusBadge status={task.status} />

            {/* Footer: assignee + due date */}
            <div className="flex items-center justify-between pt-1">
              {assignee ? (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                      {getInitials(assignee.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[100px]">
                    {assignee.full_name}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Unassigned</span>
              )}

              {task.due_date && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px]',
                    isTaskOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDueDate(task.due_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
