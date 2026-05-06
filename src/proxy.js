import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware: session refresh + route protection.
 * Protects dashboard routes — redirects to /auth/login if no session.
 * Redirects authenticated users away from auth pages.
 */
export async function proxy(request) {
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

  // Check user (also refreshes session if needed in SSR)
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = pathname.startsWith('/auth');

  // No user + accessing protected route → redirect to login
  if (!user && !isAuthPage) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Has user + on auth page → redirect to dashboard
  if (user && isAuthPage) {
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
