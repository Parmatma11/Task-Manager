import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY, ROLES } from './constants';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED]),
  priority: z.enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH, TASK_PRIORITY.URGENT]),
  assignedTo: z.string().uuid('Invalid assignee').nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export const userInviteSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  role: z.enum([ROLES.ADMIN, ROLES.USER]),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export const userRoleSchema = z.object({
  role: z.enum([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER]),
});

export const tenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
