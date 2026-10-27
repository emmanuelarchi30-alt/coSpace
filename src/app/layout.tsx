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
        {/* Fondo interactivo con fluido magnético */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full">
          <Ferrofluid
            colors={['#ffffff', '#06b6d4', '#06b6d4']}
            spikeHeight={1.2}
            sharpness={2.5}
            tilt={48}
            mouseInteraction={true}
            clickPulse={true}
            transparent={false}
            color="#030712"
            brightness={1.2}
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
