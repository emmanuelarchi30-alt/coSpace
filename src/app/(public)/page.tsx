'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import ParticleText from '@/components/ui/ParticleText';
import FolderFloat from '@/components/ui/FolderFloat';
import {
  ArrowRight,
  Sparkles,
  Monitor,
  ShieldCheck,
  Clock,
  Users,
  Coffee,
  Wifi,
  PhoneCall,
  CheckCircle2,
  CalendarCheck,
  Zap,
} from 'lucide-react';

const FOLDER_ITEMS = [
  { label: '👥 Salas de Reunión 4K', value: '/spaces?type=MEETING_ROOM' },
  { label: '🎧 Cabinas Insonorizadas', value: '/spaces?type=CABIN' },
  { label: '🖥️ Escritorios Ergonómicos', value: '/spaces?type=DESK' },
  { label: '⚡ Reservas de 1 a 4 Horas', value: '/spaces' },
  { label: '🕒 Horario 7:00 a 21:00', value: '/spaces' },
  { label: '📋 Mis Reservas Activas', value: '/dashboard' },
];

export default function HomePage(): React.JSX.Element {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[300px] bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Floating Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-4 shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-xs font-semibold tracking-wide text-cyan-200">
            {t('home.badge', 'Plataforma Inteligente de Coworking por Horas')}
          </span>
        </div>

        {/* ParticleText React Bits Component Integration */}
        <div className="w-full max-w-4xl h-48 sm:h-64 my-1 relative flex items-center justify-center">
          <ParticleText
            text="CoSpace"
            particleSize={2.0}
            density={3.0}
            color="#f8fafc"
            highlightColor="#06b6d4"
            highlightMode="motion"
            shape="circle"
            intro="gather"
            scatter={100}
            gatherDuration={1200}
            stagger={200}
            clickBurst={true}
            burstStrength={0.8}
            pointerRepel={30}
            repelRadius={100}
            idleDrift={0.5}
            trigger="mount"
            fontSize="clamp(3.5rem, 10vw, 7rem)"
            fontWeight={900}
            glow={true}
          />
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-200 font-normal leading-relaxed mb-8 px-4">
          {t('home.hero.subtitle', 'Reserva escritorios de enfoque, salas directivas de juntas y cabinas insonorizadas por horas completas con diseño Liquid Glass.')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 z-10 mb-12">
          <Link
            href="/spaces"
            className="liquid-glass-btn px-7 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 group"
          >
            <span>{t('home.hero.explore', 'Explorar Catálogo de Espacios')}</span>
            <ArrowRight className="w-4 h-4 text-cyan-100 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/register"
            className="liquid-glass-btn-secondary px-7 py-3.5 rounded-2xl text-sm font-semibold text-white hover:text-white"
          >
            {t('nav.register', 'Crear Cuenta Gratis')}
          </Link>
        </div>

        {/* Live Metrics Highlights */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          <div className="liquid-glass p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">1 a 4 Horas</span>
              <span className="text-[11px] text-slate-400">En horas completas</span>
            </div>
          </div>

          <div className="liquid-glass p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">7:00 a 21:00</span>
              <span className="text-[11px] text-slate-400">Horario continuo</span>
            </div>
          </div>

          <div className="liquid-glass p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Inmediata</span>
              <span className="text-[11px] text-slate-400">Confirmación al instante</span>
            </div>
          </div>

          <div className="liquid-glass p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Cancela 2h</span>
              <span className="text-[11px] text-slate-400">Hasta 2h antes</span>
            </div>
          </div>
        </div>

        {/* FolderFloat React Bits Component Integration with Actionable Navigation */}
        <div className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl liquid-glass border border-white/20 flex flex-col items-center shadow-2xl relative">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
              {t('home.rules.title', 'Navegación Interactiva CoSpace')}
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Atajos y Espacios Disponibles
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
              Pasa el cursor o haz clic en cualquier ficha flotante para navegar directamente al espacio o sección deseada.
            </p>
          </div>

          <div className="py-6 flex items-center justify-center w-full min-h-[220px]">
            <FolderFloat
              items={FOLDER_ITEMS}
              label="Atajos CoSpace"
              sublabel="6 accesos rápidos"
              trigger="hover"
              physics={true}
              drift={0.6}
              folderColor="#0f172a"
              frontColor="#1e293b"
              paperColor="#f8fafc"
              itemColor="#06b6d4"
              itemTextColor="#020617"
              labelColor="#38bdf8"
              width={240}
              height={150}
              spread={200}
              lift={30}
              closeOnSelect={false}
              onSelect={(value: string) => {
                router.push(value);
              }}
            />
          </div>
        </div>
      </section>

      {/* Categories Showcase with Liquid Glass Cards */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Espacios Diseñados para Cada Necesidad
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Desde puestos individuales de máxima concentración hasta salas directivas de alto impacto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Desk Card */}
          <div className="liquid-glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-md">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Escritorios Flexibles & Dedicados</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Puestos individuales con sillas Herman Miller, monitores 4K y conexión de fibra óptica simétrica.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-cyan-300 border border-white/10">WiFi 6</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-cyan-300 border border-white/10">Monitor 4K</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-cyan-300 border border-white/10">Café Libre</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-200">
              <span className="font-bold text-cyan-300">Desde $15.00/h</span>
              <Link href="/spaces?type=DESK" className="liquid-glass-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                Ver escritorios <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Meeting Room Card */}
          <div className="liquid-glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Salas de Reuniones</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Capacidad de 6 a 12 personas con pantallas táctiles interactivas, cámaras 4K para videoconferencia y catering.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-purple-300 border border-white/10">Pantalla 75&quot;</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-purple-300 border border-white/10">Cámaras 4K</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-purple-300 border border-white/10">Pizarra Digital</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-200">
              <span className="font-bold text-purple-300">Desde $40.00/h</span>
              <Link href="/spaces?type=MEETING_ROOM" className="liquid-glass-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                Ver salas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Cabin Card */}
          <div className="liquid-glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-md">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cabinas Acústicas</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Aislamiento sonoro de 38dB, iluminación regulable y micrófonos de estudio para videollamadas privadas.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-amber-300 border border-white/10">Aislamiento 38dB</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-amber-300 border border-white/10">Micrófonos Shure</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-amber-300 border border-white/10">Ventilación Silenciosa</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-200">
              <span className="font-bold text-amber-300">Desde $22.00/h</span>
              <Link href="/spaces?type=CABIN" className="liquid-glass-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                Ver cabinas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Included Amenities Banner */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-8">
        <div className="liquid-glass p-8 rounded-3xl border border-white/15 flex flex-wrap items-center justify-around gap-6 text-center shadow-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <Wifi className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">WiFi 6 Simétrico</span>
            <span className="text-[11px] text-slate-300">1 Gbps de bajada y subida</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Café de Especialidad</span>
            <span className="text-[11px] text-slate-300">Granos tostados artesanales</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Reserva Inmediata</span>
            <span className="text-[11px] text-slate-300">Confirmación al instante</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Seguridad Total</span>
            <span className="text-[11px] text-slate-300">Acceso digital y lockers</span>
          </div>
        </div>
      </section>
    </div>
  );
}
