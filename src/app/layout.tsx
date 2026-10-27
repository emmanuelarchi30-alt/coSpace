import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import Ferrofluid from '@/components/ui/Ferrofluid';

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
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
        {/* Ambient Ferrofluid Interactive Background from React Bits */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-45 w-full h-full">
          <Ferrofluid
            colors={['#ffffff', '#06b6d4', '#06b6d4']}
            spikeHeight={1}
            sharpness={2.5}
            tilt={48}
            magnets={2}
            mouseInteraction={true}
            clickPulse={true}
            transparent={true}
          />
        </div>

        <I18nProvider>
          <div className="relative z-10 flex flex-col min-h-screen w-full">
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
