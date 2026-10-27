import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import { AuthModalProvider } from '@/lib/AuthModalContext';
import GradualBlur from '@/components/ui/GradualBlur';
import CookieConsentBanner from '@/components/ui/CookieConsentBanner';

export const metadata: Metadata = {
  title: 'CoSpace - Plataforma Inteligente de Reservas de Coworking',
  description: 'Reserva escritorios, salas de juntas y cabinas acústicas por horas en tiempo real con diseño Liquid Glass.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen text-slate-100 antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
        <I18nProvider>
          <AuthModalProvider>
            <div className="relative z-10 flex flex-col min-h-screen w-full">
              {children}
            </div>
            {/* Banner flotante de consentimiento de cookies y sesión segura */}
            <CookieConsentBanner />

            {/* Efecto de desenfoque gradual inferior progresivo con estética Liquid Glass */}
            <GradualBlur
              position="bottom"
              target="page"
              height="5rem"
              strength={2}
              layers={8}
              curve="bezier"
              tint="rgba(8, 12, 24, 0.45)"
              zIndex={40}
            />
          </AuthModalProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
