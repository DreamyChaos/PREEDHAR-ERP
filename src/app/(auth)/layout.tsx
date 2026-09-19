import * as React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B1F33] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white">
      {/* Subtle brand ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-gradient-to-b from-blue-900/20 via-blue-950/10 to-transparent pointer-events-none blur-3xl" />

      {/* Main Authentication Container */}
      <div className="w-full max-w-[440px] relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 bg-white rounded-xl p-2.5 shadow-md shadow-black/25 items-center justify-center border border-slate-200/20">
            <Image
              src="/brand/preedhar-logo.jpeg"
              alt="PREEDHAR Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase font-sans">
              PREEDHAR TECHNICAL SERVICES
            </h1>
            <p className="text-[11px] text-slate-300 font-medium uppercase tracking-widest mt-0.5">
              CO. L.L.C. • DUBAI • UAE
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-black/20 rounded-xl border border-[#E2E8F0]">
          {children}
        </div>

        {/* Security Reassurance & Copyright Footer */}
        <div className="text-center space-y-2 pt-1">
          <p className="text-[11px] text-slate-400/80">
            © 2026 Preedhar Technical Services Co. L.L.C. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
