import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { userRoleSchema } from '@/lib/validations';

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const validated = userRoleSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors, message: 'Validation failed' },
        { status: 400 }
      );
    }

    // Check if target user is in the same tenant (unless requester is super_admin)
    if (profile.role !== 'super_admin') {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', targetUserId)
        .single();
        
      if (!targetProfile || targetProfile.tenant_id !== profile.tenant_id) {
        return NextResponse.json({ error: 'Forbidden: Cannot manage users outside your organization' }, { status: 403 });
      }
    }

    // Prevent changing role to super_admin unless requester is super_admin
    if (validated.data.role === 'super_admin' && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Only Super Admins can promote to Super Admin' }, { status: 403 });
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
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
