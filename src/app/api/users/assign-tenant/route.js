import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    if (!supabase || !adminClient) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Check if requester is super_admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 20 requests per minute per requester
    const { isRateLimited } = await rateLimit({
      uniqueToken: `assign-tenant-${user.id}`,
      interval: 60 * 1000,
      limit: 20,
    });

    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, tenantId } = body;

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'userId and tenantId are required' }, { status: 400 });
    }

    // Verify tenant exists
    const { data: tenant, error: tenantError } = await adminClient
      .from('tenants')
      .select('id, name')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Assign user to tenant
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ tenant_id: tenantId })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: `User assigned to ${tenant.name}` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
