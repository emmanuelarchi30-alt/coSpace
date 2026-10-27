import React from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1120] to-slate-950">
      {/* Barra superior con logotipo, botón de regreso y selector de idioma */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 gap-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/20">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              CoSpace
            </span>
          </Link>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
        <LanguageSelector />
      </div>

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        {children}
      </div>

      {/* Subtle bottom note */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-slate-500 z-10 pb-4">
        © {new Date().getFullYear()} CoSpace. Acceso seguro con tokens HTTP-only.
      </div>
    </div>
  );
}
