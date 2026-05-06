import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

const INITIAL_STATE = {
  user: null,
  profile: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setTenant: (tenant) => set({ tenant }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),

      login: (user, profile, tenant) =>
        set({ user, profile, tenant, isAuthenticated: true, isLoading: false }),

      logout: async () => {
        const supabase = createClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
        set({
          user: null,
          profile: null,
          tenant: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      switchTenant: (tenant) => set({ tenant }),

      getRole: () => get().profile?.role || null,
      getTenantId: () => get().tenant?.id || null,

      /**
       * Fetch profile + tenant for a given user ID from Supabase.
       * Called after login or session restore.
       * @param {string} userId
       * @param {object} [fallbackData] - Optional data to use if profile needs to be ensured via API
       */
      fetchProfile: async (userId, fallbackData = null) => {
        const supabase = createClient();
        if (!supabase || !userId) return null;

        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*, tenants(*)')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Failed to fetch profile:', error);
          return null;
        }

        // Fallback: If profile is missing and we have fallback data (or even if we don't, we can try to ensure)
        if (!profile && fallbackData) {
          console.log('Profile missing, attempting to ensure via API...');
          try {
            const res = await fetch('/api/users/ensure-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userId, 
                email: fallbackData.email, 
                fullName: fallbackData.fullName || 'User' 
              }),
            });
            
            if (res.ok) {
              const retry = await supabase
                .from('profiles')
                .select('*, tenants(*)')
                .eq('id', userId)
                .maybeSingle();
              profile = retry.data;
            }
          } catch (e) {
            console.error('Profile ensure fallback failed:', e);
          }
        }

        if (!profile) return null;

        const tenant = profile.tenants || null;
        delete profile.tenants;

        set({
          profile,
          tenant,
          isAuthenticated: true,
          isLoading: false,
        });

        return { profile, tenant };
      },

      /**
       * Check existing session and hydrate store.
       * Called on app mount.
       */
      initSession: async () => {
        const supabase = createClient();
        if (!supabase) {
          set({ isLoading: false });
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            set({ user: session.user });
            const result = await get().fetchProfile(session.user.id);
            // If no profile at all (stale session), sign out
            if (!result) {
              await supabase.auth.signOut();
              set({
                user: null,
                profile: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
            // If profile exists but tenant is null — user is valid but unassigned.
            // Keep them authenticated so they can see the "pending" screen.
          } else {
            set({
              user: null,
              profile: null,
              tenant: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (err) {
          console.error('Session init error:', err);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'tms-auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
