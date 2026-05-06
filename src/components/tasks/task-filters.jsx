'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TaskFilters({ filters, onFilterChange }) {
  const tenant = useAuthStore((state) => state.tenant);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const supabase = createClient();
      if (!supabase || !tenant?.id) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true);

      setUsers(data || []);
    }
    fetchUsers();
  }, [tenant?.id]);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange({ ...filters, search: searchTerm });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(handler);
  }, [searchTerm, onFilterChange, filters]);

  // Sync local state with parent filters (for clear all)
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== 'all').length;

  const handleClearAll = () => {
    setSearchTerm('');
    onFilterChange({ status: 'all', priority: 'all', assignedTo: 'all', search: '' });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFilterChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(TASK_STATUS).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {TASK_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) => onFilterChange({ ...filters, priority: value })}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(TASK_PRIORITY).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {TASK_PRIORITY_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee */}
        <Select
          value={filters.assignedTo || 'all'}
          onValueChange={(value) => onFilterChange({ ...filters, assignedTo: value })}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-9 gap-1.5">
            <X className="h-3 w-3" />
            Clear
            <Badge variant="secondary" className="h-5 w-5 p-0 justify-center text-[10px]">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
