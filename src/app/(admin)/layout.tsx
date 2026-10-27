import React from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Top Admin Warning / Mode Banner */}
      <div className="w-full bg-cyan-950/50 border-b border-cyan-500/20 px-4 py-2 text-xs text-cyan-300 flex items-center justify-center gap-2 backdrop-blur-md">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span className="font-mono">MODO ADMINISTRADOR COSPACE: GESTIÓN DE CATÁLOGO Y POLÍTICAS</span>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
