# TaskFlow — Multi-Tenant Task Management System

A **production-ready, full-stack task management system** built with Next.js 16.2 (App Router), React 19, Supabase, shadcn/ui, and Tailwind CSS v4. Features a hardened multi-tenant architecture with robust security controls.

## ✨ Features

- **Multi-Tenant Architecture** — Complete data isolation per organization.
- **Role-Based Access Control (RBAC)** — Super Admin, Admin, and User roles with strictly enforced permissions via Supabase RLS.
- **Security Hardened** — 
  - IP-based **Rate Limiting** on Auth (Login/Signup) and Administrative APIs.
  - Restricted role updates (preventing unauthorized Super Admin escalation).
  - Read-only user settings to maintain identity integrity.
- **Task Management** — List & Kanban views with drag-and-drop, real-time status updates, and advanced filtering.
- **Dashboard Analytics** — Centralized platform overview for Super Admins and organization-specific dashboards for Admins/Users.
- **User Management** — Multi-step tenant assignment and role management.
- **Modern UI/UX** — Built with Tailwind CSS v4, smooth animations, and system-aware dark/light modes.
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile with a collapsible navigation system.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.4 (App Router, Server Components) |
| **Frontend** | React 19.2.4 |
| **Backend/DB** | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Data Fetching** | TanStack Query v5 |
| **Forms** | React Hook Form + Zod |
| **State** | Zustand (persisted) |
| **URL State** | nuqs |
| **Drag & Drop** | @hello-pangea/dnd |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd task-management-system

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project.
2. Apply the database schema using the SQL Editor in the Supabase dashboard.
3. Configure your Auth settings to allow the registration flows used in the app.

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected routes (Home, Tasks, Users, Tenants)
│   │   ├── page.jsx          # Main dashboard entry point
│   │   ├── tasks/            # Task management & Kanban board
│   │   ├── users/            # User role & tenant management
│   │   ├── tenants/          # Organization management (Super Admin)
│   │   └── settings/         # Read-only profile view
│   ├── auth/                 # Hardened Login & Signup flows
│   ├── api/                  # Rate-limited API route handlers
│   └── layout.jsx            # Root layout with Providers
├── components/
│   ├── ui/                   # Modular shadcn/ui library
│   ├── dashboard/            # Specialized stats & dashboard cards
│   ├── tasks/                # KanbanBoard, TaskCard, TaskForm
│   ├── layout/               # Sidebar, Navbar, MobileNav
│   └── shared/               # RoleGuard, EmptyState, RoleBadge
├── lib/
│   ├── supabase/             # Client & Server-side Supabase utilities
│   ├── hooks/                # useRole, useTenant custom hooks
│   ├── rate-limit.js         # Custom in-memory rate limiting logic
│   └── constants.js          # Global enums and config
├── store/
│   ├── auth-store.js         # Persistent Auth & Session state
│   └── ui-store.js           # Navigation & Modal state
└── proxy.js                  # Route protection & Session refresh middleware
```

## 🔐 Security & Permissions

| Role | Permissions |
|---|---|
| **Super Admin** | Manage all organizations, all users, and global platform stats. |
| **Admin** | Manage users and tasks within their specific organization. |
| **User** | View and update status for tasks assigned to them. |

- **Rate Limiting**: Critical endpoints (Auth, Role Updates, Tenant Creation) are protected against brute-force and spam.
- **Identity Protection**: Users cannot change their own names or roles via the settings page; all identity changes must be handled by authorized admins.

## 🏗 Production Build

```bash
npm run build
npm run start
```

## 📄 License

MIT
