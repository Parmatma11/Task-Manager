-- =============================================================
-- TaskFlow - Migration V2: Role-Based Auth Overhaul
-- Run this in Supabase SQL Editor AFTER the initial schema
-- =============================================================

-- 1. Make tenant_id nullable on profiles
ALTER TABLE profiles ALTER COLUMN tenant_id DROP NOT NULL;

-- 2. Update handle_new_user trigger to simplified version
-- (Run handle-new-user.sql separately after this)

-- 3. Bootstrap a super admin (replace with your actual user email)
-- This promotes an existing user to super_admin.
-- Run AFTER the user has signed up.
--
-- UPDATE profiles
-- SET role = 'super_admin'
-- WHERE email = 'your-email@example.com';
