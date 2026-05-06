-- =============================================================
-- TaskFlow - Seed Data
-- 2 tenants, 1 super admin, 2 admins, 4 users, 20 tasks
-- =============================================================

-- NOTE: Run this AFTER creating auth users in Supabase Auth dashboard.
-- The UUIDs below should match the auth.users IDs.

-- =====================
-- TENANTS
-- =====================
INSERT INTO tenants (id, name, slug) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Acme Corporation', 'acme-corp'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Globex Industries', 'globex');

-- =====================
-- PROFILES (must match auth.users IDs)
-- =====================
-- Super Admin (tenant: Acme)
-- Admin (tenant: Acme)  
-- User x2 (tenant: Acme)
-- Admin (tenant: Globex)
-- User x2 (tenant: Globex)

-- NOTE: Replace these UUIDs with actual auth.users IDs after creating users
-- INSERT INTO profiles (id, tenant_id, role, full_name, email) VALUES
--   ('uuid-for-alex', 'a1b2c3d4...', 'super_admin', 'Alex Morgan', 'alex@acme.com'),
--   ('uuid-for-jordan', 'a1b2c3d4...', 'admin', 'Jordan Lee', 'jordan@acme.com'),
--   ('uuid-for-casey', 'a1b2c3d4...', 'user', 'Casey Kim', 'casey@acme.com'),
--   ('uuid-for-riley', 'a1b2c3d4...', 'user', 'Riley Chen', 'riley@acme.com'),
--   ('uuid-for-sam', 'b2c3d4e5...', 'admin', 'Sam Rivera', 'sam@globex.com'),
--   ('uuid-for-taylor', 'b2c3d4e5...', 'user', 'Taylor Brooks', 'taylor@globex.com'),
--   ('uuid-for-morgan', 'b2c3d4e5...', 'user', 'Morgan Patel', 'morgan@globex.com');

-- =====================
-- SAMPLE TASKS (Acme Corporation)
-- =====================
-- Replace profile IDs with actual UUIDs

-- Use demo data from the application for now.
-- When connected to Supabase, uncomment and update the INSERT statements below.

-- INSERT INTO tasks (tenant_id, title, description, status, priority, created_by, assigned_to, due_date) VALUES
-- ('a1b2c3d4...', 'Design new landing page mockups', 'Create high-fidelity mockups...', 'in_progress', 'high', 'uuid-jordan', 'uuid-casey', NOW() + INTERVAL '3 days'),
-- ... (additional 19 tasks following the demo-data.js pattern)

SELECT 'Seed data template ready. Update UUIDs to match auth.users IDs.' AS status;
