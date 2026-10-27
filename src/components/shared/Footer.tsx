'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-md">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                CoSpace
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Plataforma inteligente de reserva de espacios de coworking (escritorios, salas ejecutivas y cabinas acústicas) con estética Liquid Glass e infraestructura de alta disponibilidad.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              Navegación
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/spaces" className="hover:text-white transition-colors">
                  {t('nav.spaces')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & System Status */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
              Arquitectura
            </h4>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Supabase PostgreSQL Conectado
              </div>
              <p className="text-slate-400 text-[11px]">
                Tokens HTTP-only & Next.js 16 App Router
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CoSpace. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Hecho con diseño Liquid Glass puro y Next.js 16</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
