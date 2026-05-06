-- =============================================================
-- TaskFlow - Database Schema
-- Multi-tenant Task Management System
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- TENANTS TABLE
-- =====================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================
-- PROFILES TABLE
-- Links to auth.users via FK
-- tenant_id is NULLABLE: new users start unassigned
-- =====================
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  full_name VARCHAR(200) NOT NULL,
  avatar_url TEXT,
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- =====================
-- TASKS TABLE
-- =====================
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ, -- soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);

-- =====================
-- ACTIVITY LOGS TABLE
-- =====================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- Returns the tenant_id of the currently authenticated user (can be NULL)
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$;

-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- =====================
-- AUTO-UPDATE TIMESTAMPS
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
