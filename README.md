# TaskFlow — Multi-Tenant Task Management System

A **production-ready, full-stack task management system** built with Next.js 14+ (App Router), Supabase, shadcn/ui, and Tailwind CSS. Features multi-tenant architecture with role-based access control.

![TaskFlow Dashboard](https://via.placeholder.com/800x400?text=TaskFlow+Dashboard)

## ✨ Features

- **Multi-Tenant Architecture** — Isolated data per organization with tenant switching
- **Role-Based Access Control** — Super Admin, Admin, and User roles with granular permissions
- **Task Management** — List & Kanban views with drag-and-drop, filtering, and sorting
- **Real-Time Updates** — Supabase Realtime subscriptions for live task changes
- **Dashboard Analytics** — Stats cards, charts (Recharts), activity feed, leaderboard
- **User Management** — Invite users, manage roles, activate/deactivate accounts
- **Tenant Management** — Super Admin can create/manage organizations
- **Activity Logging** — Full audit trail with timeline view
- **Dark/Light Mode** — System-aware theme switching
- **Demo Mode** — Works without Supabase for immediate UI exploration
- **Responsive Design** — Mobile-friendly with collapsible sidebar

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, Server Components) |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data Fetching | TanStack Query (React Query) v5 |
| Forms | React Hook Form + Zod |
| State | Zustand (persisted) |
| Charts | Recharts |
| URL State | nuqs |
| Drag & Drop | @hello-pangea/dnd |
| Language | JavaScript/JSX |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Supabase project

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd task-management-system

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs in **demo mode** by default — no Supabase required!

### Environment Variables

Create a `.env.local` file:

```env
# Supabase (leave empty for demo mode)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Connecting Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Run `supabase/rls-policies.sql` for Row Level Security
4. Update `.env.local` with your project credentials
5. Create test users via Supabase Auth dashboard

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── page.jsx          # Dashboard with stats & charts
│   │   ├── tasks/page.jsx    # Task list & kanban
│   │   ├── users/page.jsx    # User management
│   │   ├── tenants/page.jsx  # Tenant management
│   │   ├── activity/page.jsx # Activity log
│   │   └── settings/page.jsx # Profile & org settings
│   ├── auth/                 # Login & signup
│   ├── api/                  # Route handlers
│   └── layout.jsx            # Root layout with providers
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── dashboard/            # Stats, charts, activity feed
│   ├── tasks/                # TaskCard, KanbanBoard, filters
│   ├── layout/               # Sidebar, Navbar, MobileNav
│   └── shared/               # RoleGuard, EmptyState, etc.
├── lib/
│   ├── supabase/             # Browser & server clients
│   ├── hooks/                # useRole, useTenant
│   ├── constants.js          # Enums & config
│   ├── validations.js        # Zod schemas
│   ├── utils.js              # Utilities
│   └── demo-data.js          # Mock data for demo mode
├── store/
│   ├── auth-store.js         # User, profile, tenant state
│   └── ui-store.js           # Sidebar, view, modal state
└── middleware.js              # Route protection
```

## 🔐 Authorization Model

| Role | Scope |
|---|---|
| **Super Admin** | Full access across all tenants |
| **Admin** | Full CRUD within their tenant |
| **User** | Read assigned/created tasks, update own task status |

RLS policies enforce this at the database level. Client-side `<RoleGuard>` component provides UI-level gating.

## 🎨 Demo Accounts

| Email | Role | Tenant |
|---|---|---|
| alex@acme.com | Super Admin | Acme Corporation |
| jordan@acme.com | Admin | Acme Corporation |
| casey@acme.com | User | Acme Corporation |
| sam@globex.com | Admin | Globex Industries |

Password: `demo123` (demo mode — no actual auth required)

## 📊 Database Schema

See `supabase/schema.sql` for the full schema including:
- `tenants` — Organizations
- `profiles` — Users linked to auth.users
- `tasks` — Tasks with status, priority, soft delete
- `activity_logs` — Audit trail with JSONB metadata
- Helper functions: `get_my_tenant_id()`, `get_my_role()`

## 🏗 Building for Production

```bash
npm run build
npm start
```

## 📄 License

MIT
