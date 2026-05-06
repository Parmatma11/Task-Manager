'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/components/tasks/task-filters';
import { TaskForm } from '@/components/tasks/task-form';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { TaskStatusBadge } from '@/components/tasks/task-status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuthStore } from '@/store/auth-store';
import { useRole } from '@/lib/hooks/use-role';
import { useUiStore } from '@/store/ui-store';
import { createClient } from '@/lib/supabase/client';
import { cn, formatDueDate, getPriorityColor, isOverdue, getInitials } from '@/lib/utils';
import { TASK_PRIORITY_LABELS } from '@/lib/constants';
import {
  Plus, LayoutList, LayoutGrid, CheckSquare, MoreHorizontal, Pencil, Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { QUERY_KEYS } from '@/lib/query-keys';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const tenant = useAuthStore((state) => state.tenant);
  const profile = useAuthStore((state) => state.profile);
  const { isUser, canCreateTasks, canDeleteTasks, canEditAllTasks } = useRole();
  const { activeView, setActiveView, openCreateTask, openEditTask } = useUiStore();
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    search: '',
  });

  // Use TanStack Query for fetching tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: [...QUERY_KEYS.tasks(tenant?.id), filters, isUser, profile?.id],
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase || !tenant?.id) return [];

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('tenant_id', tenant.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Users only see tasks assigned to them
      if (isUser) {
        query = query.eq('assigned_to', profile?.id);
      }

      if (filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.priority !== 'all') query = query.eq('priority', filters.priority);
      if (filters.assignedTo !== 'all') query = query.eq('assigned_to', filters.assignedTo);
      if (filters.search) query = query.ilike('title', `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  // Fetch users for mapping
  const { data: usersMap = {} } = useQuery({
    queryKey: QUERY_KEYS.usersByTenant(tenant?.id),
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase || !tenant?.id) return {};
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('tenant_id', tenant.id);
      
      const map = {};
      (data || []).forEach((u) => { map[u.id] = u; });
      return map;
    },
    enabled: !!tenant?.id,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (taskId) => {
      const supabase = createClient();
      if (!supabase) return;
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks(tenant?.id) });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const handleDeleteTask = (taskId) => {
    if (!canDeleteTasks) {
      toast.error('You do not have permission to delete tasks');
      return;
    }
    deleteMutation.mutate(taskId);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks(tenant?.id) });
  };

  if (tasksLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isUser ? 'My Tasks' : 'Tasks'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isUser
              ? 'View and update your assigned tasks.'
              : 'Manage and track your team\u0027s tasks.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <Button variant={activeView === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2.5"
              onClick={() => setActiveView('list')}
              aria-label="List View"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant={activeView === 'kanban' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2.5"
              onClick={() => setActiveView('kanban')}
              aria-label="Kanban Board View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Only admin/super_admin can create tasks */}
          {canCreateTasks && (
            <Button onClick={openCreateTask} className="gap-1.5">
              <Plus className="h-4 w-4" />New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters — hide assignee filter for regular users */}
      {!isUser && <TaskFilters filters={filters} onFilterChange={setFilters} />}
      {isUser && (
        <TaskFilters
          filters={{ ...filters, assignedTo: profile?.id || 'all' }}
          onFilterChange={(f) => setFilters({ ...f, assignedTo: 'all' })}
        />
      )}

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={CheckSquare}
          title={isUser ? 'No tasks assigned to you' : 'No tasks found'}
          description={isUser ? 'Tasks will appear here when assigned to you.' : 'Try adjusting your filters or create a new task.'}
          action={canCreateTasks ? (
            <Button onClick={openCreateTask} className="gap-1.5"><Plus className="h-4 w-4" />Create Task</Button>
          ) : undefined}
        />
      ) : activeView === 'kanban' ? (
        <KanbanBoard tasks={tasks} onUpdate={handleRefresh} />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%]">Task</TableHead>
                {!isUser && <TableHead>Assignee</TableHead>}
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                {canEditAllTasks && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => {
                const assignee = task.assigned_to ? usersMap[task.assigned_to] : null;
                const isTaskOverdue = isOverdue(task.due_date) && task.status !== 'completed';
                return (
                  <TableRow key={task.id} className="group animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                    <TableCell>
                      <a href={`/tasks/${task.id}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
                        {task.title}
                      </a>
                    </TableCell>
                    {!isUser && (
                      <TableCell>
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {getInitials(assignee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground truncate max-w-[120px]">{assignee.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px] font-medium border', getPriorityColor(task.priority))}>
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-sm', isTaskOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                        {formatDueDate(task.due_date)}
                      </span>
                    </TableCell>
                    {canEditAllTasks && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer outline-none">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditTask(task.id)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                            </DropdownMenuItem>
                            {canDeleteTasks && (
                              <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {canCreateTasks && <TaskForm onSuccess={handleRefresh} />}
    </div>
  );
}
