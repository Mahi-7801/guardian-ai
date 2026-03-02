import { createClient } from '@supabase/supabase-js';

// ── Supabase Project Credentials ──────────────────────────────────────────────
const supabaseUrl = 'https://xugjggqouvkumtynklxe.supabase.co';
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Z2pnZ3FvdXZrdW10eW5rbHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjcyOTIsImV4cCI6MjA4ODA0MzI5Mn0.u-3O2lQ7hsMjfoHPdpww9DSPcFkEYDudeicBNZzOKDY';

// Native Supabase client — use this for direct Supabase access
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Compatibility shim (drop-in replacement for old InsForge API) ─────────────
// All existing files that import `insforge` continue to work unchanged.
export const insforge = {
    auth: {
        /** Maps to supabase.auth.getSession() */
        getCurrentSession: () => supabase.auth.getSession(),
        signInWithPassword: (creds: { email: string; password: string }) =>
            supabase.auth.signInWithPassword(creds),
        signUp: (creds: { email: string; password: string }) =>
            supabase.auth.signUp(creds),
        signOut: () => supabase.auth.signOut(),
    },

    // database.from('table') maps directly to supabase.from('table')
    database: {
        from: (table: string) => supabase.from(table),
    },

    // Realtime auth-change bridge (used in App.tsx)
    realtime: {
        _subs: new Map<string, any>(),
        on(event: string, callback: () => void) {
            if (event === 'auth') {
                const { data } = supabase.auth.onAuthStateChange(() => callback());
                this._subs.set(callback.toString(), data.subscription);
            }
        },
        off(event: string, callback: () => void) {
            const sub = this._subs.get(callback.toString());
            if (sub) {
                sub.unsubscribe();
                this._subs.delete(callback.toString());
            }
        },
    },

    // AI chat — Supabase has no built-in LLM; falls back to simulation
    ai: {
        chat: {
            completions: {
                create: async (_params: any): Promise<never> => {
                    throw new Error('AI_OFFLINE');
                },
            },
        },
    },
};

// ── Taxonomy-aligned model label ──────────────────────────────────────────────
export const AI_MODEL = 'Guardian-Neural-v4 (LSTM/SVM/PSO Hybrid)';

// ── Persistent AI-availability tracker ───────────────────────────────────────
const STORE_KEY = 'guardian_ai_offline_state';

export const AI_STATUS = {
    get isOnline() {
        const lastFailure = localStorage.getItem(STORE_KEY);
        if (lastFailure) {
            const timestamp = parseInt(lastFailure, 10);
            if (Date.now() - timestamp < 86400000) return false;
        }
        return true;
    },
    markOffline: (error: any) => {
        if (
            error?.status === 500 ||
            error?.message?.includes('not enabled') ||
            error?.message?.includes('Internal Server Error')
        ) {
            localStorage.setItem(STORE_KEY, Date.now().toString());
            console.warn(
                'Guardian AI Uplink confirmed Offline. Switched to Heuristic Simulation Mode (24h).'
            );
        }
    },
    reset: () => localStorage.removeItem(STORE_KEY),
};
