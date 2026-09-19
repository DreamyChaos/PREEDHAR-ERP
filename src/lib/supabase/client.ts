import { createBrowserClient } from "@supabase/ssr";

const memoryCookies: Record<string, string> = {};

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return Object.entries(memoryCookies).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            memoryCookies[name] = value;
          });
        },
      },
    });
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
