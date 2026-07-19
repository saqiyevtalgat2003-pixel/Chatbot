import { createClient } from '@/lib/supabase/server';

const DEFAULT_PREMIUM_PRICE_KZT = 990;

/**
 * Reads the current premium price from the `settings` table so the site and
 * the admin dashboard never drift apart. Falls back to a hardcoded default
 * only if the row is missing or the read fails, so pricing/payment flows
 * never break outright.
 */
export async function getPremiumPriceKzt(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'premium_price_kzt')
    .maybeSingle();

  if (error || !data || typeof data.value !== 'number') {
    return DEFAULT_PREMIUM_PRICE_KZT;
  }

  return data.value;
}

export type MaintenanceFlags = {
  /** Login/signup pages show a "come back later" notice instead of the forms. */
  auth: boolean;
  /** The "create new resume" entry points are disabled. */
  newResume: boolean;
  /** The whole site shows a full-screen maintenance takeover. */
  full: boolean;
};

const MAINTENANCE_KEYS = [
  'maintenance_auth_enabled',
  'maintenance_new_resume_enabled',
  'maintenance_full_enabled',
] as const;

/**
 * Reads the three maintenance-mode toggles the admin dashboard controls.
 * Any read failure (missing rows, network error) fails *open*, i.e.
 * maintenance mode is treated as off, so a DB hiccup never locks out real
 * users.
 */
export async function getMaintenanceFlags(): Promise<MaintenanceFlags> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', MAINTENANCE_KEYS);

  if (error || !data) {
    return { auth: false, newResume: false, full: false };
  }

  const byKey = new Map(data.map((row) => [row.key, row.value]));

  return {
    auth: byKey.get('maintenance_auth_enabled') === true,
    newResume: byKey.get('maintenance_new_resume_enabled') === true,
    full: byKey.get('maintenance_full_enabled') === true,
  };
}
