'use client';

import { use, useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  cn,
  formatDueDate,
  getPriorityColor,
  getInitials,
  isOverdue,
} from '@/lib/utils';
import { format } from 'date-fns';
import {
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '@/lib/constants';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TaskDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const tenant = useAuthStore((state) => state.tenant);
  const [task, setTask] = useState(null);
  const [creator, setCreator] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      if (!supabase) return;

      // Fetch task
      const { data: taskData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error || !taskData) {
        setLoading(false);
        return;
      }

      setTask(taskData);

      // Fetch users
      const profileIds = [taskData.created_by, taskData.assigned_to].filter(Boolean);
      const [profilesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', profileIds.length > 0 ? profileIds : ['none']),
      ]);

      const profileMap = {};
      (profilesResult.data || []).forEach((p) => { profileMap[p.id] = p; });
      setUsers(profileMap);
      setCreator(profileMap[taskData.created_by] || null);
      setAssignee(taskData.assigned_to ? profileMap[taskData.assigned_to] : null);
      setLoading(false);
    }
    fetchData();
  }, [resolvedParams.id]);

  const handleStatusChange = async (newStatus) => {
    const supabase = createClient();
    if (!supabase || !task) return;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    setTask({ ...task, status: newStatus });
    toast.success(`Status changed to ${TASK_STATUS_LABELS[newStatus]}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-96" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!task) {
    notFound();
  }

  const isTaskOverdue = isOverdue(task.due_date) && task.status !== 'completed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link href="/tasks">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-2xl font-bold tracking-tight flex-1">{task.title}</h1>
          <Badge
            variant="outline"
            className={cn('text-xs font-medium border', getPriorityColor(task.priority))}
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
        </div>

        {isTaskOverdue && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>This task is overdue</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar details */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Status */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {TASK_STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Assignee */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <User className="h-3 w-3 inline mr-1" />
                  Assignee
                </p>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(assignee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{assignee.full_name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Unassigned</p>
                )}
              </div>

              <Separator />

              {/* Due Date */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Due Date
                </p>
                <p className={cn('text-sm font-medium', isTaskOverdue && 'text-destructive')}>
                  {formatDueDate(task.due_date)}
                </p>
              </div>

              <Separator />

              {/* Created by */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created by</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px] bg-muted">
                      {getInitials(creator?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{creator?.full_name || 'Unknown'}</span>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Created
                </p>
                <p className="text-sm text-muted-foreground">
                  {task.created_at ? format(new Date(task.created_at), 'MMM d, yyyy h:mm a') : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
