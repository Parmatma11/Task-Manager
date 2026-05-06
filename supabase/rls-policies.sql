-- =============================================================
-- TaskFlow - Row Level Security Policies (V2)
-- Supports nullable tenant_id for unassigned users
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================
-- TENANTS POLICIES
-- =====================

-- Super admin: full access to all tenants
CREATE POLICY "super_admin_all_tenants" ON tenants
  FOR ALL USING (get_my_role() = 'super_admin');

-- Admin/User: can read their own tenant (only if they have one)
CREATE POLICY "users_read_own_tenant" ON tenants
  FOR SELECT USING (
    get_my_tenant_id() IS NOT NULL
    AND id = get_my_tenant_id()
  );

-- =====================
-- PROFILES POLICIES
-- =====================

-- Super admin: full access to all profiles
CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL USING (get_my_role() = 'super_admin');

-- Admin: full CRUD within their tenant
CREATE POLICY "admin_manage_tenant_profiles" ON profiles
  FOR ALL USING (
    get_my_role() = 'admin'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

-- User: can read profiles in their tenant
CREATE POLICY "user_read_tenant_profiles" ON profiles
  FOR SELECT USING (
    get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

-- Any user: can read and update their own profile (even if unassigned)
CREATE POLICY "user_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "user_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- =====================
-- TASKS POLICIES
-- =====================

-- Super admin: full access to all tasks
CREATE POLICY "super_admin_all_tasks" ON tasks
  FOR ALL USING (get_my_role() = 'super_admin');

-- Admin: full CRUD within their tenant
CREATE POLICY "admin_manage_tenant_tasks" ON tasks
  FOR ALL USING (
    get_my_role() = 'admin'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

-- User: can read tasks assigned to or created by them
CREATE POLICY "user_read_own_tasks" ON tasks
  FOR SELECT USING (
    get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  );

-- User: can update only status on tasks assigned to them
CREATE POLICY "user_update_assigned_task_status" ON tasks
  FOR UPDATE USING (
    get_my_role() = 'user'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
    AND assigned_to = auth.uid()
  );

-- =====================
-- ACTIVITY LOGS POLICIES
-- =====================

-- Super admin: full access
CREATE POLICY "super_admin_all_activity_logs" ON activity_logs
  FOR ALL USING (get_my_role() = 'super_admin');

-- Admin: read all logs in their tenant, insert
CREATE POLICY "admin_read_tenant_logs" ON activity_logs
  FOR SELECT USING (
    get_my_role() = 'admin'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

CREATE POLICY "admin_insert_logs" ON activity_logs
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
    AND get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
  );

-- User: read own logs
CREATE POLICY "user_read_own_logs" ON activity_logs
  FOR SELECT USING (
    get_my_tenant_id() IS NOT NULL
    AND tenant_id = get_my_tenant_id()
    AND user_id = auth.uid()
  );
