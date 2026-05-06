'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data) => {
    const supabase = createClient();
    if (!supabase) {
      toast.error('Supabase not configured.');
      return;
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const user = authData.user;

    // Fetch profile + tenant from Supabase
    let result = await fetchProfile(user.id);

    if (!result) {
      // Profile missing — trigger may have failed (migration not applied).
      // Attempt to create profile via API fallback.
      console.log('Profile missing for user:', user.id, 'Attempting fallback...');
      try {
        const res = await fetch('/api/users/ensure-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, email: user.email, fullName: user.user_metadata?.full_name || 'User' }),
        });
        
        const ensureData = await res.json();
        if (res.ok) {
          console.log('Profile creation fallback success:', ensureData);
          result = await fetchProfile(user.id);
        } else {
          console.error('Profile creation fallback API error:', ensureData);
        }
      } catch (e) {
        console.error('Profile creation fallback network error:', e);
      }

      if (!result) {
        toast.error('Profile setup failed. Please check if you have run the fix-auth-migration.sql in Supabase.');
        await supabase.auth.signOut();
        return;
      }
    }

    // Login even if tenant is null (user is unassigned but valid)
    login(user, result.profile, result.tenant);

    const role = result.profile.role;
    const hasTenant = !!result.tenant;

    if (!hasTenant && role === 'user') {
      toast.info('Welcome! Your account is pending assignment to an organization.');
    } else {
      toast.success(`Welcome back, ${result.profile.full_name}!`);
    }

    // All roles go to / — the dashboard page renders based on role
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-xl border-border/50 animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="mt-1">Sign in to your TaskFlow account</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
