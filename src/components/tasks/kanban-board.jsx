'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './task-card';
import { TASK_STATUS, TASK_STATUS_LABELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const COLUMNS = [
  { id: TASK_STATUS.TODO, label: TASK_STATUS_LABELS[TASK_STATUS.TODO], color: 'bg-slate-500' },
  { id: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS], color: 'bg-blue-500' },
  { id: TASK_STATUS.COMPLETED, label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED], color: 'bg-emerald-500' },
];

export function KanbanBoard({ tasks, onUpdate }) {
  const tasksByStatus = {
    [TASK_STATUS.TODO]: tasks.filter((t) => t.status === TASK_STATUS.TODO),
    [TASK_STATUS.IN_PROGRESS]: tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS),
    [TASK_STATUS.COMPLETED]: tasks.filter((t) => t.status === TASK_STATUS.COMPLETED),
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId);

    if (error) {
      toast.error('Failed to move task');
      return;
    }

    toast.success(`Task moved to ${TASK_STATUS_LABELS[newStatus]}`);
    onUpdate?.();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex flex-col rounded-xl border border-border bg-muted/30 p-3"
          >
            {/* Column header */}
            <div className="mb-3 flex items-center gap-2 px-1">
              <div className={cn('h-2.5 w-2.5 rounded-full', column.color)} />
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                {tasksByStatus[column.id].length}
              </Badge>
            </div>

            {/* Droppable area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'flex-1 space-y-2 rounded-lg p-1 transition-colors min-h-[200px]',
                    snapshot.isDraggingOver && 'bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  {tasksByStatus[column.id].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <TaskCard
                            task={task}
                            isDragging={snapshot.isDragging}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
