import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

const UNASSIGNED_TENANT_SLUG = '__unassigned__';

/**
 * Ensures a profile row exists for an authenticated user.
 */
export async function POST(request) {
  try {
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const { userId, email, fullName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    // Rate limiting: 3 requests per minute per userId
    const { isRateLimited } = await rateLimit({
      uniqueToken: `ensure-profile-${userId}`,
      interval: 60 * 1000,
      limit: 3,
    });

    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Check if profile already exists
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Profile already exists' }, { status: 200 });
    }

    // Try inserting with tenant_id = null first
    const { error: nullInsertError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        tenant_id: null,
        role: 'user',
        full_name: fullName || 'User',
        email: email,
      });

    if (!nullInsertError) {
      return NextResponse.json({ message: 'Profile created' }, { status: 201 });
    }

    // If NOT NULL constraint prevents null tenant_id, use system tenant
    console.log('Null tenant insert failed, using system tenant:', nullInsertError.message);

    // Find or create the system "Unassigned" tenant
    let { data: systemTenant } = await adminClient
      .from('tenants')
      .select('id')
      .eq('slug', UNASSIGNED_TENANT_SLUG)
      .maybeSingle();

    if (!systemTenant) {
      const { data: newTenant, error: tenantError } = await adminClient
        .from('tenants')
        .insert({ name: 'Unassigned', slug: UNASSIGNED_TENANT_SLUG })
        .select('id')
        .single();

      if (tenantError) {
        return NextResponse.json({ error: 'Failed to create system tenant' }, { status: 500 });
      }
      systemTenant = newTenant;
    }

    // Insert profile with system tenant
    const { error: insertError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        tenant_id: systemTenant.id,
        role: 'user',
        full_name: fullName || 'User',
        email: email,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Profile created' }, { status: 201 });
  } catch (error) {
    console.error('Ensure Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
