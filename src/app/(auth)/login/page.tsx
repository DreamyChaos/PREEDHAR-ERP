"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient, getSupabaseEnv } from "@/lib/supabase/client";
import { Mail, Lock, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) {
      setErrorMessage(
        "Supabase configuration is missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured in your Vercel project settings and redeploy."
      );
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
          setErrorMessage("Invalid email address or password. Please verify and try again.");
        } else if (msg.includes("email not confirmed")) {
          setErrorMessage("Email address has not been confirmed yet. Please check your inbox.");
        } else if (msg.includes("failed to fetch") || msg.includes("network")) {
          setErrorMessage(
            "Unable to connect to the Supabase authentication server. Please check your network connection and ensure NEXT_PUBLIC_SUPABASE_URL is properly configured in Vercel."
          );
        } else {
          setErrorMessage(error.message);
        }
      } else if (data?.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (errStr.includes("failed to fetch") || errStr.includes("network")) {
        setErrorMessage(
          "Unable to connect to the Supabase authentication server. Please verify your network connection and NEXT_PUBLIC_SUPABASE_URL in Vercel settings."
        );
      } else {
        setErrorMessage("An unexpected authentication error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
          Portal Sign In
        </h2>
        <p className="text-xs text-[#475569] leading-relaxed max-w-xs mx-auto">
          Enter your authorized enterprise credentials to access the PREEDHAR operations platform.
        </p>
      </div>

      {/* Inline Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleSignIn} className="space-y-4">
        {/* Email Address Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-[#334155] tracking-wide uppercase"
          >
            Email Address
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#64748B]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              placeholder="name@preedhar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold text-[#334155] tracking-wide uppercase"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#64748B]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isLoading}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 inline-flex items-center justify-center font-semibold text-sm rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </form>

      {/* Security Reassurance Indicator */}
      <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
        <span>Authorized Personnel Only • Secure Portal</span>
      </div>
    </div>
  );
}
