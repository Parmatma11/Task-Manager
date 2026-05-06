import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { userInviteSchema } from '@/lib/validations';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    if (!supabase || !adminClient) {
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
    const validated = userInviteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors, message: 'Validation failed' },
        { status: 400 }
      );
    }

    // Invite user via Supabase Admin API
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
      validated.data.email,
      {
        data: {
          full_name: validated.data.fullName,
          role: validated.data.role,
          tenant_id: profile.tenant_id, // Invited users join the requester's tenant
        },
        // In local dev, we might want to skip email and just return the user
        // But inviteUserByEmail always sends an email if configured.
      }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { data, message: 'Invitation sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
