import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import WebThreads from '@/components/ui/WebThreads';

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
        {/* Ambient WebThreads Interactive Background from React Bits */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50 w-full h-full">
          <WebThreads
            colors={['#06b6d4', '#8b5cf6', '#3b82f6', '#0ea5e9']}
            coreColor="#ffffff"
            threadCount={8}
            spread={0.22}
            speed={0.18}
            glow={0.03}
            thickness={1.3}
            mouseInteraction={true}
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
