-- =============================================================
-- TaskFlow - Auto Profile Creation Trigger (V2)
-- Creates profile with role='user' and NO tenant on signup.
-- Tenants are assigned by super_admin later.
-- =============================================================

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
END;
$$;

-- Trigger: fire after new user is inserted in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
