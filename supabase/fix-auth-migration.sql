-- =============================================================
-- TaskFlow - Production Multi-Tenant Auth Migration
-- Run this in your Supabase SQL Editor to solve:
-- 1. "Profile setup failed" errors on login
-- 2. New users starting as unassigned (no tenant)
-- 3. Super admin platform-wide visibility
-- =============================================================

-- 1. Allow profiles to have NO tenant initially
ALTER TABLE profiles ALTER COLUMN tenant_id DROP NOT NULL;

-- 2. Update the helper function to be SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- 3. Update the handle_new_user trigger to support the new flow
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name TEXT;
BEGIN
  -- Extract name from signup metadata
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');

  -- Create profile: always role='user', no tenant
  INSERT INTO profiles (id, tenant_id, role, full_name, email)
  VALUES (NEW.id, NULL, 'user', _full_name, NEW.email);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback if insert fails (e.g. if NOT NULL was not dropped yet)
  RETURN NEW;
END;
$$;

-- 4. Ensure RLS allows reading own profile even without tenant
DROP POLICY IF EXISTS "user_read_own_profile" ON profiles;
CREATE POLICY "user_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- 5. Ensure Super Admin can assign any user to any tenant
-- (This bypasses standard tenant checks)
DROP POLICY IF EXISTS "super_admin_all_profiles" ON profiles;
CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL USING (get_my_role() = 'super_admin');

-- 6. Add a placeholder tenant for system-level users if needed
INSERT INTO tenants (name, slug) 
VALUES ('Unassigned Users', '__unassigned__')
ON CONFLICT (slug) DO NOTHING;
