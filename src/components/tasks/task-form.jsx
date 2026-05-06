'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '@/lib/validations';
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

export function TaskForm({ onSuccess }) {
  const tenant = useAuthStore((state) => state.tenant);
  const profile = useAuthStore((state) => state.profile);
  const { isCreateTaskOpen, isEditTaskOpen, editingTaskId, closeCreateTask, closeEditTask } = useUiStore();

  const isOpen = isCreateTaskOpen || isEditTaskOpen;
  const isEditing = isEditTaskOpen && editingTaskId;

  const [users, setUsers] = useState([]);
  const [existingTask, setExistingTask] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.MEDIUM,
      assignedTo: null,
      dueDate: null,
    },
  });

  // Fetch users for assignee dropdown
  useEffect(() => {
    async function fetchUsers() {
      const supabase = createClient();
      if (!supabase || !tenant?.id) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('tenant_id', tenant.id)
        .eq('role', 'user') // Only allow assignment to users
        .eq('is_active', true);

      setUsers(data || []);
    }
    fetchUsers();
  }, [tenant?.id]);

  // Fetch existing task for editing
  useEffect(() => {
    async function fetchTask() {
      if (!isEditing) {
        setExistingTask(null);
        return;
      }
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', editingTaskId)
        .single();

      if (data) {
        setExistingTask(data);
        reset({
          title: data.title,
          description: data.description || '',
          status: data.status,
          priority: data.priority,
          assignedTo: data.assigned_to,
          dueDate: data.due_date ? data.due_date.split('T')[0] : null,
        });
      }
    }
    fetchTask();
  }, [isEditing, editingTaskId, reset]);

  // Reset form for create mode
  useEffect(() => {
    if (isCreateTaskOpen && !isEditTaskOpen) {
      reset({
        title: '',
        description: '',
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.MEDIUM,
        assignedTo: null,
        dueDate: null,
      });
    }
  }, [isCreateTaskOpen, isEditTaskOpen, reset]);

  const handleClose = () => {
    if (isEditing) {
      closeEditTask();
    } else {
      closeCreateTask();
    }
    reset();
  };

  const handleFormSubmit = async (data) => {
    const supabase = createClient();
    if (!supabase) {
      toast.error('Supabase not configured');
      return;
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assigned_to: data.assignedTo,
            due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          })
          .eq('id', editingTaskId);

        if (error) throw error;
        toast.success('Task updated successfully');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({
            tenant_id: tenant?.id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            created_by: profile?.id,
            assigned_to: data.assignedTo,
            due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          });

        if (error) throw error;
        toast.success('Task created successfully');
      }
      handleClose();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update task details below.' : 'Fill in the details to create a new task.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 py-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...register('title')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              rows={4}
              {...register('description')}
            />
          </div>

          {/* Status + Priority grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {TASK_STATUS_LABELS[watch('status')]}
                  </SelectValue>
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

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {TASK_PRIORITY_LABELS[watch('priority')]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {TASK_PRIORITY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={watch('assignedTo') || 'unassigned'}
              onValueChange={(value) => setValue('assignedTo', value === 'unassigned' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee">
                  {watch('assignedTo') 
                    ? users.find(u => u.id === watch('assignedTo'))?.full_name 
                    : 'Unassigned'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
          </div>

          <SheetFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
