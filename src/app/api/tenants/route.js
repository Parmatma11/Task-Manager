import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tenantSchema } from '@/lib/validations';

export async function POST(request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Check if user is super_admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const validated = tenantSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors, message: 'Validation failed' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tenants')
      .insert({
        name: validated.data.name,
        slug: validated.data.slug,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        data,
        message: 'Organization created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
