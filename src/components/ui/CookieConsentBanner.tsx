'use client';

import React, { useEffect, useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import ElectricButton from './ElectricButton';
import {
  getCookieConsentStatus,
  setCookieConsentStatus,
  COOKIE_CONSENT_EVENT,
} from '@/lib/cookieConsent';

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const status = getCookieConsentStatus();
    if (status === 'unset') {
      setVisible(true);
    }

    const handleConsentChange = (): void => {
      const currentStatus = getCookieConsentStatus();
      if (currentStatus !== 'unset') {
        setVisible(false);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  if (!mounted || !visible) return null;

  const handleAccept = (): void => {
    setCookieConsentStatus(true);
    setVisible(false);
  };

  const handleDecline = (): void => {
    setCookieConsentStatus(false);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Aviso de Cookies"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="relative liquid-glass p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-slate-950/85 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl">
        {/* Botón de cierre rápido */}
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Cerrar aviso de cookies"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icono de Cookie */}
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
            <Cookie className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>

          {/* Texto explicativo */}
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Gestión de Cookies y Datos de Acceso</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              CoSpace utiliza cookies para guardar tus credenciales de forma segura. Al cerrar la pestaña tu sesión se cerrará automáticamente, pero tus datos quedarán guardados para tu próximo ingreso.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
            <ElectricButton
              type="button"
              color="#06b6d4"
              borderRadius={12}
              thickness={1.3}
              speed={1}
              glow={0.7}
              arcs={1}
              onClick={handleAccept}
              wrapperClassName="w-full sm:w-auto"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Cookie className="w-3.5 h-3.5" />
              <span>Aceptar Cookies</span>
            </ElectricButton>

            <button
              type="button"
              onClick={handleDecline}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            >
              Solo esenciales
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsentBanner;
