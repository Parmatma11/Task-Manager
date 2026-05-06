'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';
import {
  PlusCircle,
  CheckCircle2,
  ArrowRightLeft,
  UserPlus,
  Edit3,
  Trash2,
} from 'lucide-react';

const ACTION_CONFIG = {
  created: { icon: PlusCircle, label: 'created', color: 'text-blue-500' },
  completed: { icon: CheckCircle2, label: 'completed', color: 'text-emerald-500' },
  updated_status: { icon: ArrowRightLeft, label: 'changed status of', color: 'text-amber-500' },
  assigned: { icon: UserPlus, label: 'assigned', color: 'text-violet-500' },
  updated: { icon: Edit3, label: 'updated', color: 'text-orange-500' },
  deleted: { icon: Trash2, label: 'deleted', color: 'text-red-500' },
};

export function ActivityFeed({ limit = 8 }) {
  const tenant = useAuthStore((state) => state.tenant);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState({});

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
          .limit(limit),
        supabase
          .from('profiles')
          .select('id, full_name')
          .eq('tenant_id', tenant.id),
      ]);

      setLogs(logsResult.data || []);
      const map = {};
      (usersResult.data || []).forEach((u) => { map[u.id] = u; });
      setUsers(map);
    }
    fetchData();
  }, [tenant?.id, limit]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <Badge variant="secondary" className="text-xs">{logs.length} events</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="space-y-0 px-6 pb-4">
            {logs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
            )}
            {logs.map((log, index) => {
              const user = users[log.user_id];
              const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
              const ActionIcon = config.icon;

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 border-b border-border/50 py-3 last:border-0 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {getInitials(user?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{user?.full_name || 'Unknown'}</span>{' '}
                      <span className="text-muted-foreground">{config.label}</span>{' '}
                      <span className="font-medium text-foreground">
                        {log.metadata?.title || log.entity_type}
                      </span>
                    </p>
                    {log.metadata?.from && log.metadata?.to && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {log.metadata.from} → {log.metadata.to}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {log.created_at ? format(new Date(log.created_at), 'MMM d, h:mm a') : ''}
                    </p>
                  </div>
                  <ActionIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${config.color}`} />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
