/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} full_name
 * @property {string} email
 * @property {string} role
 * @property {string} [tenant_id]
 * @property {string} created_at
 */

/**
 * @typedef {Object} Tenant
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} created_at
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} status
 * @property {string} priority
 * @property {string} [assigned_to]
 * @property {string} created_by
 * @property {string} tenant_id
 * @property {string} [due_date]
 * @property {string} created_at
 * @property {string} [updated_at]
 * @property {string} [deleted_at]
 */

// Role hierarchy for the multi-tenant system
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
};

// System tenant slug for users not yet assigned to a real org
export const UNASSIGNED_TENANT_SLUG = '__unassigned__';

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.USER]: 'User',
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.COMPLETED]: 'Completed',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
  [TASK_PRIORITY.URGENT]: 'Urgent',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/',
  TASKS: '/tasks',
  TASK_DETAIL: (id) => `/tasks/${id}`,
  USERS: '/users',
  TENANTS: '/tenants',
  SETTINGS: '/settings',
};

export const REFETCH_DELAY_MS = 300;
export const DEBOUNCE_DELAY_MS = 300;
export const STALE_TIME_MS = 1000 * 30;
export const GC_TIME_MS = 1000 * 60;
export const CACHE_REVALIDATE_SECONDS = 300;
