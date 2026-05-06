import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware: session refresh + route protection.
 * Protects dashboard routes — redirects to /auth/login if no session.
 * Redirects authenticated users away from auth pages.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session (important for token renewal)
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = pathname.startsWith('/auth');

  // No session + accessing protected route → redirect to login
  if (!session && !isAuthPage) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Has session + on auth page → redirect to dashboard
  if (session && isAuthPage) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
