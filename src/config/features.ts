/**
 * Feature Flags Configuration
 *
 * Centralized feature flag system for controlling application behavior.
 * Flags can be toggled via environment variables.
 */

export const FEATURES = {
  /**
   * Use mock data instead of real Supabase data.
   * Set VITE_USE_MOCK=true in .env to enable mock mode.
   * Defaults to false (use real data).
   */
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK === 'true',

  /**
   * Enable real-time subscriptions for live updates.
   * Defaults to true when not using mock data.
   */
  ENABLE_REALTIME: import.meta.env.VITE_ENABLE_REALTIME !== 'false',

  /**
   * Enable debug logging for development.
   * Set VITE_DEBUG=true to enable verbose logging.
   */
  DEBUG: import.meta.env.VITE_DEBUG === 'true',

  /**
   * Enable analytics tracking.
   * Set VITE_ENABLE_ANALYTICS=true to enable.
   */
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
} as const;

/**
 * Check if we're running in mock mode
 */
export function isMockMode(): boolean {
  return FEATURES.USE_MOCK_DATA;
}

/**
 * Check if real-time is enabled
 */
export function isRealtimeEnabled(): boolean {
  return !FEATURES.USE_MOCK_DATA && FEATURES.ENABLE_REALTIME;
}

/**
 * Log debug messages when debug mode is enabled
 */
export function debugLog(...args: unknown[]): void {
  if (FEATURES.DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}