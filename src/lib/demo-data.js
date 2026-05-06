/**
 * Comprehensive demo data for the Task Management System.
 * Used when Supabase is not configured, allowing full UI exploration.
 */

const DEMO_TENANTS = [
  {
    id: 'tenant-001',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    logo_url: null,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    user_count: 4,
    task_count: 12,
  },
  {
    id: 'tenant-002',
    name: 'Globex Industries',
    slug: 'globex',
    logo_url: null,
    created_at: '2025-02-01T14:30:00Z',
    updated_at: '2025-02-01T14:30:00Z',
    user_count: 3,
    task_count: 8,
  },
];

const DEMO_USERS = [
  {
    id: 'user-001',
    tenant_id: 'tenant-001',
    role: 'super_admin',
    full_name: 'Alex Morgan',
    avatar_url: null,
    email: 'alex@acme.com',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'user-002',
    tenant_id: 'tenant-001',
    role: 'admin',
    full_name: 'Jordan Lee',
    avatar_url: null,
    email: 'jordan@acme.com',
    is_active: true,
    created_at: '2025-01-16T09:00:00Z',
    updated_at: '2025-01-16T09:00:00Z',
  },
  {
    id: 'user-003',
    tenant_id: 'tenant-001',
    role: 'user',
    full_name: 'Casey Kim',
    avatar_url: null,
    email: 'casey@acme.com',
    is_active: true,
    created_at: '2025-01-17T11:00:00Z',
    updated_at: '2025-01-17T11:00:00Z',
  },
  {
    id: 'user-004',
    tenant_id: 'tenant-001',
    role: 'user',
    full_name: 'Riley Chen',
    avatar_url: null,
    email: 'riley@acme.com',
    is_active: true,
    created_at: '2025-01-18T08:00:00Z',
    updated_at: '2025-01-18T08:00:00Z',
  },
  {
    id: 'user-005',
    tenant_id: 'tenant-002',
    role: 'admin',
    full_name: 'Sam Rivera',
    avatar_url: null,
    email: 'sam@globex.com',
    is_active: true,
    created_at: '2025-02-01T14:30:00Z',
    updated_at: '2025-02-01T14:30:00Z',
  },
  {
    id: 'user-006',
    tenant_id: 'tenant-002',
    role: 'user',
    full_name: 'Taylor Brooks',
    avatar_url: null,
    email: 'taylor@globex.com',
    is_active: true,
    created_at: '2025-02-02T10:00:00Z',
    updated_at: '2025-02-02T10:00:00Z',
  },
  {
    id: 'user-007',
    tenant_id: 'tenant-002',
    role: 'user',
    full_name: 'Morgan Patel',
    avatar_url: null,
    email: 'morgan@globex.com',
    is_active: false,
    created_at: '2025-02-03T15:00:00Z',
    updated_at: '2025-02-03T15:00:00Z',
  },
];

const now = new Date();
const daysAgo = (n) => new Date(now.getTime() - n * 86400000).toISOString();
const daysFromNow = (n) => new Date(now.getTime() + n * 86400000).toISOString();

const DEMO_TASKS = [
  {
    id: 'task-001', tenant_id: 'tenant-001', title: 'Design new landing page mockups',
    description: 'Create high-fidelity mockups for the new marketing site, including mobile responsive layouts and dark mode variants.',
    status: 'in_progress', priority: 'high', created_by: 'user-002', assigned_to: 'user-003',
    due_date: daysFromNow(3), deleted_at: null, created_at: daysAgo(5), updated_at: daysAgo(1),
  },
  {
    id: 'task-002', tenant_id: 'tenant-001', title: 'Fix authentication token refresh',
    description: 'Users are being logged out unexpectedly. Investigate and fix the token refresh logic.',
    status: 'todo', priority: 'urgent', created_by: 'user-001', assigned_to: 'user-002',
    due_date: daysFromNow(1), deleted_at: null, created_at: daysAgo(2), updated_at: daysAgo(2),
  },
  {
    id: 'task-003', tenant_id: 'tenant-001', title: 'Write API documentation for v2 endpoints',
    description: 'Document all new API endpoints including request/response schemas and error codes.',
    status: 'completed', priority: 'medium', created_by: 'user-002', assigned_to: 'user-004',
    due_date: daysAgo(1), deleted_at: null, created_at: daysAgo(10), updated_at: daysAgo(1),
  },
  {
    id: 'task-004', tenant_id: 'tenant-001', title: 'Set up CI/CD pipeline for staging',
    description: 'Configure GitHub Actions for automated testing and deployment to the staging environment.',
    status: 'in_progress', priority: 'high', created_by: 'user-001', assigned_to: 'user-002',
    due_date: daysFromNow(5), deleted_at: null, created_at: daysAgo(7), updated_at: daysAgo(3),
  },
  {
    id: 'task-005', tenant_id: 'tenant-001', title: 'Update user onboarding flow',
    description: 'Simplify the onboarding steps and add progress indicators.',
    status: 'todo', priority: 'medium', created_by: 'user-002', assigned_to: 'user-003',
    due_date: daysFromNow(7), deleted_at: null, created_at: daysAgo(3), updated_at: daysAgo(3),
  },
  {
    id: 'task-006', tenant_id: 'tenant-001', title: 'Performance audit for dashboard',
    description: 'Run Lighthouse and identify performance bottlenecks on the main dashboard.',
    status: 'todo', priority: 'low', created_by: 'user-001', assigned_to: 'user-004',
    due_date: daysFromNow(14), deleted_at: null, created_at: daysAgo(1), updated_at: daysAgo(1),
  },
  {
    id: 'task-007', tenant_id: 'tenant-001', title: 'Implement dark mode toggle',
    description: 'Add theme switching with system preference detection and localStorage persistence.',
    status: 'completed', priority: 'medium', created_by: 'user-003', assigned_to: 'user-003',
    due_date: daysAgo(3), deleted_at: null, created_at: daysAgo(12), updated_at: daysAgo(3),
  },
  {
    id: 'task-008', tenant_id: 'tenant-001', title: 'Database migration for activity logs',
    description: 'Create and run migration to add the activity_logs table with proper indexes.',
    status: 'completed', priority: 'high', created_by: 'user-001', assigned_to: 'user-002',
    due_date: daysAgo(5), deleted_at: null, created_at: daysAgo(15), updated_at: daysAgo(5),
  },
  {
    id: 'task-009', tenant_id: 'tenant-001', title: 'Add email notification system',
    description: 'Implement email notifications for task assignments and status changes.',
    status: 'todo', priority: 'medium', created_by: 'user-001', assigned_to: null,
    due_date: daysFromNow(10), deleted_at: null, created_at: daysAgo(4), updated_at: daysAgo(4),
  },
  {
    id: 'task-010', tenant_id: 'tenant-001', title: 'Fix mobile navigation overlap',
    description: 'The hamburger menu overlaps with the page title on smaller screens.',
    status: 'in_progress', priority: 'low', created_by: 'user-003', assigned_to: 'user-003',
    due_date: daysFromNow(2), deleted_at: null, created_at: daysAgo(2), updated_at: daysAgo(1),
  },
  {
    id: 'task-011', tenant_id: 'tenant-001', title: 'Security review for file uploads',
    description: 'Audit the file upload functionality for security vulnerabilities.',
    status: 'todo', priority: 'urgent', created_by: 'user-001', assigned_to: 'user-002',
    due_date: daysFromNow(2), deleted_at: null, created_at: daysAgo(1), updated_at: daysAgo(1),
  },
  {
    id: 'task-012', tenant_id: 'tenant-001', title: 'Refactor task filtering logic',
    description: 'Move filter logic from components into a custom hook for better reusability.',
    status: 'completed', priority: 'low', created_by: 'user-002', assigned_to: 'user-004',
    due_date: daysAgo(2), deleted_at: null, created_at: daysAgo(8), updated_at: daysAgo(2),
  },
  {
    id: 'task-013', tenant_id: 'tenant-002', title: 'Build inventory tracking module',
    description: 'Create a new module for real-time inventory tracking with barcode scanning.',
    status: 'in_progress', priority: 'high', created_by: 'user-005', assigned_to: 'user-006',
    due_date: daysFromNow(6), deleted_at: null, created_at: daysAgo(4), updated_at: daysAgo(1),
  },
  {
    id: 'task-014', tenant_id: 'tenant-002', title: 'Customer portal redesign',
    description: 'Redesign the customer-facing portal with improved UX and accessibility.',
    status: 'todo', priority: 'medium', created_by: 'user-005', assigned_to: 'user-006',
    due_date: daysFromNow(12), deleted_at: null, created_at: daysAgo(3), updated_at: daysAgo(3),
  },
  {
    id: 'task-015', tenant_id: 'tenant-002', title: 'Integrate payment gateway',
    description: 'Add Stripe integration for subscription billing.',
    status: 'todo', priority: 'urgent', created_by: 'user-005', assigned_to: 'user-005',
    due_date: daysFromNow(4), deleted_at: null, created_at: daysAgo(6), updated_at: daysAgo(2),
  },
  {
    id: 'task-016', tenant_id: 'tenant-002', title: 'Set up monitoring and alerts',
    description: 'Configure Datadog monitoring with custom alerts for production issues.',
    status: 'completed', priority: 'high', created_by: 'user-005', assigned_to: 'user-006',
    due_date: daysAgo(1), deleted_at: null, created_at: daysAgo(9), updated_at: daysAgo(1),
  },
  {
    id: 'task-017', tenant_id: 'tenant-002', title: 'Write unit tests for auth module',
    description: 'Achieve 90% code coverage on the authentication module.',
    status: 'in_progress', priority: 'medium', created_by: 'user-005', assigned_to: 'user-006',
    due_date: daysFromNow(3), deleted_at: null, created_at: daysAgo(5), updated_at: daysAgo(2),
  },
  {
    id: 'task-018', tenant_id: 'tenant-002', title: 'Update dependency versions',
    description: 'Audit and update all npm dependencies to latest stable versions.',
    status: 'completed', priority: 'low', created_by: 'user-006', assigned_to: 'user-006',
    due_date: daysAgo(3), deleted_at: null, created_at: daysAgo(7), updated_at: daysAgo(3),
  },
  {
    id: 'task-019', tenant_id: 'tenant-002', title: 'API rate limiting implementation',
    description: 'Implement rate limiting middleware for all public API endpoints.',
    status: 'todo', priority: 'high', created_by: 'user-005', assigned_to: null,
    due_date: daysFromNow(8), deleted_at: null, created_at: daysAgo(2), updated_at: daysAgo(2),
  },
  {
    id: 'task-020', tenant_id: 'tenant-002', title: 'Create admin analytics dashboard',
    description: 'Build an analytics dashboard with usage metrics and trend visualizations.',
    status: 'todo', priority: 'medium', created_by: 'user-005', assigned_to: 'user-006',
    due_date: daysFromNow(15), deleted_at: null, created_at: daysAgo(1), updated_at: daysAgo(1),
  },
];

const DEMO_ACTIVITY_LOGS = [
  { id: 'log-001', tenant_id: 'tenant-001', user_id: 'user-001', action: 'created', entity_type: 'task', entity_id: 'task-002', metadata: { title: 'Fix authentication token refresh' }, created_at: daysAgo(2) },
  { id: 'log-002', tenant_id: 'tenant-001', user_id: 'user-003', action: 'updated_status', entity_type: 'task', entity_id: 'task-001', metadata: { from: 'todo', to: 'in_progress', title: 'Design new landing page mockups' }, created_at: daysAgo(1) },
  { id: 'log-003', tenant_id: 'tenant-001', user_id: 'user-004', action: 'completed', entity_type: 'task', entity_id: 'task-003', metadata: { title: 'Write API documentation for v2 endpoints' }, created_at: daysAgo(1) },
  { id: 'log-004', tenant_id: 'tenant-001', user_id: 'user-002', action: 'assigned', entity_type: 'task', entity_id: 'task-005', metadata: { assignee: 'Casey Kim', title: 'Update user onboarding flow' }, created_at: daysAgo(3) },
  { id: 'log-005', tenant_id: 'tenant-001', user_id: 'user-001', action: 'created', entity_type: 'task', entity_id: 'task-011', metadata: { title: 'Security review for file uploads' }, created_at: daysAgo(1) },
  { id: 'log-006', tenant_id: 'tenant-001', user_id: 'user-003', action: 'completed', entity_type: 'task', entity_id: 'task-007', metadata: { title: 'Implement dark mode toggle' }, created_at: daysAgo(3) },
  { id: 'log-007', tenant_id: 'tenant-001', user_id: 'user-002', action: 'completed', entity_type: 'task', entity_id: 'task-008', metadata: { title: 'Database migration for activity logs' }, created_at: daysAgo(5) },
  { id: 'log-008', tenant_id: 'tenant-001', user_id: 'user-004', action: 'completed', entity_type: 'task', entity_id: 'task-012', metadata: { title: 'Refactor task filtering logic' }, created_at: daysAgo(2) },
  { id: 'log-009', tenant_id: 'tenant-002', user_id: 'user-005', action: 'created', entity_type: 'task', entity_id: 'task-015', metadata: { title: 'Integrate payment gateway' }, created_at: daysAgo(6) },
  { id: 'log-010', tenant_id: 'tenant-002', user_id: 'user-006', action: 'completed', entity_type: 'task', entity_id: 'task-016', metadata: { title: 'Set up monitoring and alerts' }, created_at: daysAgo(1) },
];

// Mutable store for demo mode operations
let demoTasks = [...DEMO_TASKS];
let demoLogs = [...DEMO_ACTIVITY_LOGS];

export function getDemoTenants() {
  return [...DEMO_TENANTS];
}

export function getDemoTenant(tenantId) {
  return DEMO_TENANTS.find((t) => t.id === tenantId) || null;
}

export function getDemoUsers(tenantId) {
  if (!tenantId) return [...DEMO_USERS];
  return DEMO_USERS.filter((u) => u.tenant_id === tenantId);
}

export function getDemoUser(userId) {
  return DEMO_USERS.find((u) => u.id === userId) || null;
}

export function getDemoTasks(tenantId, filters = {}) {
  let tasks = demoTasks.filter((t) => t.tenant_id === tenantId && !t.deleted_at);

  if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
  if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
  if (filters.assignedTo) tasks = tasks.filter((t) => t.assigned_to === filters.assignedTo);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  }

  return tasks;
}

export function getDemoTask(taskId) {
  return demoTasks.find((t) => t.id === taskId) || null;
}

export function createDemoTask(task) {
  const newTask = {
    ...task,
    id: `task-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  demoTasks = [newTask, ...demoTasks];
  return newTask;
}

export function updateDemoTask(taskId, updates) {
  demoTasks = demoTasks.map((t) =>
    t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
  );
  return getDemoTask(taskId);
}

export function deleteDemoTask(taskId) {
  demoTasks = demoTasks.map((t) =>
    t.id === taskId ? { ...t, deleted_at: new Date().toISOString() } : t
  );
}

export function getDemoActivityLogs(tenantId) {
  return demoLogs
    .filter((l) => l.tenant_id === tenantId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getDemoStats(tenantId) {
  const tasks = getDemoTasks(tenantId);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  return { total, completed, inProgress, overdue, todo: total - completed - inProgress };
}

// Default demo profile (acts as logged-in user)
export const DEMO_CURRENT_USER = DEMO_USERS[0];
export const DEMO_CURRENT_TENANT = DEMO_TENANTS[0];
