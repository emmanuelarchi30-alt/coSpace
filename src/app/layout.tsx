import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/I18nContext';

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
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
