-- =============================================================
-- TaskFlow - Unified Database Setup
-- Multi-tenant Task Management System
-- =============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 3. TABLES

-- TENANTS
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROFILES
-- tenant_id is NULLABLE: new users start unassigned
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

-- TASKS
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

-- 4. INDEXES
CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);

-- 5. HELPER FUNCTIONS

-- Returns the tenant_id of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$;

-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- 6. AUTO-UPDATE TIMESTAMPS
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

-- 7. AUTH TRIGGER (PROFILE CREATION)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name TEXT;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');

  INSERT INTO profiles (id, tenant_id, role, full_name, email)
  VALUES (NEW.id, NULL, 'user', _full_name, NEW.email);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES

-- TENANTS
CREATE POLICY "super_admin_all_tenants" ON tenants
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "users_read_own_tenant" ON tenants
  FOR SELECT USING (
    get_my_tenant_id() IS NOT NULL
    AND id = get_my_tenant_id()
  );

-- PROFILES
CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "admin_manage_tenant_profiles" ON profiles
  FOR ALL USING (
    get_my_role() = 'admin'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

CREATE POLICY "user_read_tenant_profiles" ON profiles
  FOR SELECT USING (
    get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

CREATE POLICY "user_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- TASKS
CREATE POLICY "super_admin_all_tasks" ON tasks
  FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "admin_manage_tenant_tasks" ON tasks
  FOR ALL USING (
    get_my_role() = 'admin'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

CREATE POLICY "user_read_own_tasks" ON tasks
  FOR SELECT USING (
    get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  );

CREATE POLICY "user_update_assigned_task_status" ON tasks
  FOR UPDATE USING (
    get_my_role() = 'user'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
    AND assigned_to = auth.uid()
  );

-- 10. SEED DATA
INSERT INTO tenants (name, slug) 
VALUES ('Unassigned Users', '__unassigned__')
ON CONFLICT (slug) DO NOTHING;
