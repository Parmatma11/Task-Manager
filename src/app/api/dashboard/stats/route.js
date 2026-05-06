import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // With Supabase: aggregate stats with unstable_cache (5 min revalidation)
    // Demo data response
    const stats = {
      totalTasks: 20,
      completed: 5,
      inProgress: 4,
      overdue: 2,
      tasksByStatus: {
        todo: 11,
        in_progress: 4,
        completed: 5,
      },
      tasksByPriority: {
        low: 4,
        medium: 7,
        high: 5,
        urgent: 3,
      },
    };

    return NextResponse.json({ data: stats, message: 'Stats fetched successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
