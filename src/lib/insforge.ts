import { createClient } from '@insforge/sdk';

const baseUrl = 'https://nat9zrje.us-west.insforge.app';
const anonKey = 'ik_ed2f48337b980f602de8b28c1444c7f4';

export const insforge = createClient({
    baseUrl,
    anonKey,
});

/**
 * AUTH NOTIFICATION BRIDGE
 * 
 * The @insforge/sdk Realtime module has an internal onTokenChange listener,
 * but doesn't expose a clean way to listen for session changes in React.
 * This bridge ensures that the 'auth' event App.tsx listens to is actually fired.
 */
const tokenManager = (insforge as any).tokenManager;
const realtime = insforge.realtime as any;

if (tokenManager) {
    const originalOnTokenChange = tokenManager.onTokenChange;
    tokenManager.onTokenChange = () => {
        // 1. Maintain internal SDK behavior (socket reconnection)
        if (typeof originalOnTokenChange === 'function') {
            originalOnTokenChange();
        }
        // 2. Notify our application listeners
        if (typeof realtime.notifyListeners === 'function') {
            realtime.notifyListeners('auth');
        }
    };
}

// Taxonomy-aligned model from research paper
export const AI_MODEL = "Guardian-Neural-v4 (LSTM/SVM/PSO Hybrid)";

// Shared state to track AI availability across components
// PERSISTENT: Uses localStorage to remember across refreshes
const STORE_KEY = 'guardian_ai_offline_state';

export const AI_STATUS = {
    get isOnline() {
        // If we've recorded a failure in the last 24 hours, stay offline to prevent console noise
        const lastFailure = localStorage.getItem(STORE_KEY);
        if (lastFailure) {
            const timestamp = parseInt(lastFailure, 10);
            if (Date.now() - timestamp < 86400000) { // 24 hours
                return false;
            }
        }
        return true;
    },
    markOffline: (error: any) => {
        // Only mark offline for server errors (500) or configuration errors
        if (error?.status === 500 || error?.message?.includes('not enabled') || error?.message?.includes('Internal Server Error')) {
            localStorage.setItem(STORE_KEY, Date.now().toString());
            console.warn("Guardian AI Uplink confirmed Offline. Core Processor switched to Heuristic Simulation Mode (24h Persistence).");
        }
    },
    reset: () => {
        localStorage.removeItem(STORE_KEY);
    }
};
