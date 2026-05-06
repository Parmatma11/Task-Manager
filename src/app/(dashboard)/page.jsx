'use client';

import { StatsCard } from '@/components/dashboard/stats-card';
import { TaskBarChart, TaskPieChart } from '@/components/dashboard/task-chart';
import { useAuthStore } from '@/store/auth-store';
import { useRole } from '@/lib/hooks/use-role';
import { createClient } from '@/lib/supabase/client';
import {
  CheckSquare,
  ListChecks,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';
import { format } from 'date-fns';

// ─── SUPER ADMIN DASHBOARD ───────────────────────────
function SuperAdminDashboard() {
  const { data: dashboardData, isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.dashboardStats('platform'),
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase) return null;

      const [usersResult, tenantsResult, tasksResult] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, role, tenant_id, created_at').order('created_at', { ascending: false }),
        supabase.from('tenants').select('id'),
        supabase.from('tasks').select('id, status').is('deleted_at', null),
      ]);

      const allUsers = usersResult.data || [];
      const allTenants = tenantsResult.data || [];
      const allTasks = tasksResult.data || [];

      return {
        stats: {
          totalUsers: allUsers.length,
          totalTenants: allTenants.length,
          totalTasks: allTasks.length,
          unassignedUsers: allUsers.filter(u => !u.tenant_id).length,
        },
        recentUsers: allUsers.slice(0, 8),
      };
    },
  });

  const stats = dashboardData?.stats || { totalUsers: 0, totalTenants: 0, totalTasks: 0, unassignedUsers: 0 };
  const recentUsers = dashboardData?.recentUsers || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all organizations, users, and tasks across the platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatsCard title="Organizations" value={stats.totalTenants} icon={Building2} />
        <StatsCard title="Total Tasks" value={stats.totalTasks} icon={CheckSquare} />
        <StatsCard title="Unassigned Users" value={stats.unassignedUsers} icon={AlertTriangle} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Manage Users</h3>
                  <p className="text-xs text-muted-foreground">Assign roles & tenants</p>
                </div>
              </div>
              <Link href="/users">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Manage Organizations</h3>
                  <p className="text-xs text-muted-foreground">Create & configure tenants</p>
                </div>
              </div>
              <Link href="/tenants">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {stats.unassignedUsers > 0 && (
          <Card className="group hover:shadow-md transition-shadow border-amber-500/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{stats.unassignedUsers} Pending</h3>
                    <p className="text-xs text-muted-foreground">Users need assignment</p>
                  </div>
                </div>
                <Link href="/users">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Users</CardTitle>
          <Link href="/users">
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {user.role}
                </Badge>
                {!user.tenant_id && (
                  <Badge variant="secondary" className="text-[10px] text-amber-600">
                    Unassigned
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────
function AdminDashboard({ tenant }) {
  const { data: adminData, isLoading: loading } = useQuery({
    queryKey: QUERY_KEYS.dashboardStats(tenant?.id),
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase || !tenant?.id) return null;

      const [tasksResult, usersResult] = await Promise.all([
        supabase.from('tasks').select('status, due_date, assigned_to').eq('tenant_id', tenant.id).is('deleted_at', null),
        supabase.from('profiles').select('id, full_name').eq('tenant_id', tenant.id).eq('is_active', true),
      ]);

      const tasks = tasksResult.data || [];
      const users = usersResult.data || [];
      const now = new Date();

      const stats = {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        overdue: tasks.filter(
          (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
        ).length,
      };

      // Build leaderboard
      const counts = {};
      tasks.forEach((t) => {
        if (t.assigned_to) counts[t.assigned_to] = (counts[t.assigned_to] || 0) + 1;
      });
      const ranked = users
        .map((u) => ({ ...u, taskCount: counts[u.id] || 0 }))
        .sort((a, b) => b.taskCount - a.taskCount);

      return { stats, leaderboard: ranked };
    },
    enabled: !!tenant?.id,
  });

  const stats = adminData?.stats || { total: 0, completed: 0, inProgress: 0, overdue: 0 };
  const leaderboard = adminData?.leaderboard || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of {tenant?.name}&apos;s progress and tasks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Tasks" value={stats.total} icon={CheckSquare} />
        <StatsCard title="Completed" value={stats.completed} icon={ListChecks} />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} />
        <StatsCard title="Overdue" value={stats.overdue} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TaskBarChart />
        <TaskPieChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Assignees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
              )}
              {leaderboard.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.full_name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {user.taskCount} tasks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── USER DASHBOARD ────────────────────────────────────
function UserDashboard({ profile, tenant }) {
  const { data: myTasks = [], isLoading: loading } = useQuery({
    queryKey: ['my-tasks', tenant?.id, profile?.id],
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase || !tenant?.id || !profile?.id) return [];

      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('assigned_to', profile.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!tenant?.id && !!profile?.id,
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const now = new Date();
  const stats = {
    total: myTasks.length,
    completed: myTasks.filter(t => t.status === 'completed').length,
    inProgress: myTasks.filter(t => t.status === 'in_progress').length,
    overdue: myTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your tasks and progress at {tenant?.name}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="My Tasks" value={stats.total} icon={CheckSquare} />
        <StatsCard title="Completed" value={stats.completed} icon={ListChecks} />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} />
        <StatsCard title="Overdue" value={stats.overdue} icon={AlertTriangle} />
      </div>

      {/* Quick task list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Assigned Tasks</CardTitle>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tasks assigned to you yet.
            </p>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 8).map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.due_date
                        ? `Due ${new Date(task.due_date).toLocaleDateString()}`
                        : 'No due date'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ml-2 ${
                      task.status === 'completed'
                        ? 'text-emerald-600 border-emerald-500/30'
                        : task.status === 'in_progress'
                        ? 'text-blue-600 border-blue-500/30'
                        : 'text-slate-600 border-slate-500/30'
                    }`}
                  >
                    {task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Done' : 'To Do'}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── UNASSIGNED USER SCREEN ────────────────────────────
function UnassignedScreen({ profile }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8 space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Pending Assignment</h2>
          <p className="text-sm text-muted-foreground">
            Welcome, {profile?.full_name}! Your account has been created but you haven&apos;t been
            assigned to an organization yet. Please contact your administrator to get started.
          </p>
          <Badge variant="secondary" className="text-xs">
            Role: User • No Organization
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MAIN DASHBOARD PAGE ──────────────────────────────
export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const tenant = useAuthStore((state) => state.tenant);
  const { isSuperAdmin, isAdmin, isUnassigned } = useRole();

  // Super admin: platform-wide view
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  // Unassigned user: show pending screen
  if (isUnassigned || !tenant) {
    return <UnassignedScreen profile={profile} />;
  }

  // Admin: tenant-scoped management dashboard
  if (isAdmin) {
    return <AdminDashboard tenant={tenant} />;
  }

  // User: simple personal task dashboard
  return <UserDashboard profile={profile} tenant={tenant} />;
}
