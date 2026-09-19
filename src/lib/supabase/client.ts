import { createBrowserClient } from "@supabase/ssr";

const memoryCookies: Record<string, string> = {};

export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Sanitize: trim whitespace, strip potential surrounding quotes, remove trailing slashes
  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, "");

  const isConfigured =
    supabaseUrl.length > 0 &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("placeholder-project.supabase.co") &&
    supabaseAnonKey.length > 0 &&
    supabaseAnonKey !== "placeholder-anon-key";

  return {
    supabaseUrl: isConfigured ? supabaseUrl : (supabaseUrl || "https://placeholder-project.supabase.co"),
    supabaseAnonKey: isConfigured ? supabaseAnonKey : (supabaseAnonKey || "placeholder-anon-key"),
    isConfigured,
  };
}

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

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
