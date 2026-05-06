import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userRoleSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export async function PATCH(request, { params }) {
  try {
    const { id: targetUserId } = await params;
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Check if requester is admin/super_admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 requests per minute per requester
    const { isRateLimited } = await rateLimit({
      uniqueToken: `role-change-${user.id}`,
      interval: 60 * 1000,
      limit: 10,
    });

    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    // Prevent self-role modification
    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'Forbidden: You cannot change your own role' }, { status: 403 });
    }

    const body = await request.json();
    const validated = userRoleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors, message: 'Validation failed' },
        { status: 400 }
      );
    }

    // Fetch target user's current role and tenant
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', targetUserId)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect Super Admin roles from modification (optional: could allow super_admin to demote another super_admin, but keeping it safe)
    if (targetProfile.role === 'super_admin') {
      // return NextResponse.json({ error: 'Forbidden: Super Admin roles are protected' }, { status: 403 });
    }

    // Prevent changing role to super_admin for everyone
    if (validated.data.role === 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Cannot promote users to Super Admin' }, { status: 403 });
    }

    // Enforce "One Admin per Tenant" rule
    if (validated.data.role === 'admin' && targetProfile.role !== 'admin') {
      if (!targetProfile.tenant_id) {
        return NextResponse.json({ error: 'Cannot promote unassigned users to Admin. Assign to an organization first.' }, { status: 400 });
      }

      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', targetProfile.tenant_id)
        .eq('role', 'admin');

      if (countError) throw countError;

      if (count > 0) {
        return NextResponse.json({ 
          error: 'This organization already has an administrator. A tenant can only have one admin.' 
        }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: validated.data.role })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { data, message: 'Role updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Role Update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
