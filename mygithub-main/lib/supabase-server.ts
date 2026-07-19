import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component; middleware refreshes the session instead.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Called from a Server Component; middleware refreshes the session instead.
          }
        },
      },
    }
  );
}

/**
 * The only GitHub account allowed to use this dashboard.
 * Anyone else who authorizes the OAuth app is rejected.
 */
export const ALLOWED_GITHUB_LOGIN = process.env.ALLOWED_GITHUB_LOGIN || "";

export function isAllowedUser(userMetadata: Record<string, any> | undefined): boolean {
  if (!userMetadata) return false;
  const login: string | undefined =
    userMetadata.user_name || userMetadata.preferred_username || userMetadata.login;
  if (!login || !ALLOWED_GITHUB_LOGIN) return false;
  return login.toLowerCase() === ALLOWED_GITHUB_LOGIN.toLowerCase();
}
