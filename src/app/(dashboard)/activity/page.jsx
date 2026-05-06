'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { getInitials } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PlusCircle,
  CheckCircle2,
  ArrowRightLeft,
  UserPlus,
  Edit3,
  Trash2,
  Activity,
} from 'lucide-react';

const ACTION_CONFIG = {
  created: { icon: PlusCircle, label: 'created', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  completed: { icon: CheckCircle2, label: 'completed', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  updated_status: { icon: ArrowRightLeft, label: 'changed status of', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  assigned: { icon: UserPlus, label: 'assigned', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  updated: { icon: Edit3, label: 'updated', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  deleted: { icon: Trash2, label: 'deleted', color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function ActivityPage() {
  const tenant = useAuthStore((state) => state.tenant);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      if (!supabase || !tenant?.id) return;

      const [logsResult, usersResult] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('profiles')
          .select('id, full_name')
          .eq('tenant_id', tenant.id),
      ]);

      setLogs(logsResult.data || []);
      const map = {};
      (usersResult.data || []).forEach((u) => { map[u.id] = u; });
      setUsers(map);
      setLoading(false);
    }
    fetchData();
  }, [tenant?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all changes and actions across your workspace.
        </p>
      </div>

      <Badge variant="outline" className="text-xs">
        {logs.length} event{logs.length !== 1 ? 's' : ''}
      </Badge>

      {logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here as your team creates and updates tasks."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {logs.map((log, index) => {
                const user = users[log.user_id];
                const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
                const ActionIcon = config.icon;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                      <ActionIcon className={`h-4 w-4 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">
                        <span className="font-semibold">{user?.full_name || 'Unknown'}</span>{' '}
                        <span className="text-muted-foreground">{config.label}</span>{' '}
                        <span className="font-medium">{log.metadata?.title || log.entity_type}</span>
                      </p>
                      {log.metadata?.from && log.metadata?.to && (
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-[10px]">{log.metadata.from}</Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="outline" className="text-[10px]">{log.metadata.to}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                      {log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy h:mm a') : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
