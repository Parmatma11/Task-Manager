import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { ROLES, TASK_PRIORITY, TASK_STATUS } from './constants';

/**
 * Merge class names with Tailwind CSS conflict resolution.
 * @param  {...any} inputs - Class name inputs
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Returns true if the given role is permitted. Super admins bypass all checks.
 * @param {string} userRole
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function hasPermission(userRole, allowedRoles) {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  return allowedRoles.includes(userRole);
}

/**
 * Format a due date into a human-readable relative string.
 * @param {string|Date} dateString
 * @returns {string}
 */
export function formatDueDate(dateString) {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);

  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isPast(date)) return `Overdue (${formatDistanceToNow(date, { addSuffix: true })})`;
  return format(date, 'MMM d, yyyy');
}

/**
 * Check if a date is overdue.
 * @param {string|Date} dateString
 * @returns {boolean}
 */
export function isOverdue(dateString) {
  if (!dateString) return false;
  return isPast(new Date(dateString)) && !isToday(new Date(dateString));
}

/**
 * Get the Tailwind color class for a priority level.
 * @param {string} priority
 * @returns {string}
 */
export function getPriorityColor(priority) {
  const colors = {
    [TASK_PRIORITY.URGENT]: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
    [TASK_PRIORITY.HIGH]: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
    [TASK_PRIORITY.MEDIUM]: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20',
    [TASK_PRIORITY.LOW]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  };
  return colors[priority] || '';
}

/**
 * Get the Tailwind color class for a task status.
 * @param {string} status
 * @returns {string}
 */
export function getStatusColor(status) {
  const colors = {
    [TASK_STATUS.TODO]: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20',
    [TASK_STATUS.IN_PROGRESS]: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
    [TASK_STATUS.COMPLETED]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  };
  return colors[status] || '';
}


/**
 * Generate initials from a full name.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text to a maximum length with ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '…';
}

/**
 * Calculate standard task statistics from an array of tasks.
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Stats object
 */
export function calculateTaskStats(tasks) {
  const now = new Date();
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length,
    inProgress: tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length,
    todo: tasks.filter((t) => t.status === TASK_STATUS.TODO).length,
    overdue: tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < now && t.status !== TASK_STATUS.COMPLETED
    ).length,
  };
}
