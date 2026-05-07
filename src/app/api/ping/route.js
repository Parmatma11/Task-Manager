import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

export async function GET() {
  const supabase = createAdminClient();
  if (supabase) {
    // Keep DB connection pool warm
    await supabase.from('profiles').select('id').limit(1);
  }
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}
