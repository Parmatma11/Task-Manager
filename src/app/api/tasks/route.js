import { NextResponse } from 'next/server';
import { taskSchema } from '@/lib/validations';

export async function POST(request) {
  try {
    const body = await request.json();
    const validated = taskSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors, message: 'Validation failed' },
        { status: 400 }
      );
    }

    // Return mock data for demo purposes when Supabase is not configured.
    // In production, this would be handled by the Supabase client.
    return NextResponse.json(
      {
        data: { id: `task-${Date.now()}`, ...validated.data },
        message: 'Task created successfully',
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
