'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useAuthModal } from '@/lib/AuthModalContext';
import ParticleText from '@/components/ui/ParticleText';
import FolderFloat from '@/components/ui/FolderFloat';
import ElectricBorder from '@/components/ui/ElectricBorder';
import ElectricButton from '@/components/ui/ElectricButton';
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
  { label: 'Salas de Reunión 4K', value: '/spaces?type=MEETING_ROOM' },
  { label: 'Cabinas Insonorizadas', value: '/spaces?type=CABIN' },
  { label: 'Escritorios Ergonómicos', value: '/spaces?type=DESK' },
  { label: 'Reservas de 1 a 4 Horas', value: '/spaces' },
  { label: 'Horario 7:00 a 21:00', value: '/spaces' },
  { label: 'Mis Reservas Activas', value: '/dashboard' },
];

export default function HomePage(): React.JSX.Element {
  const { t } = useI18n();
  const { openRegisterModal } = useAuthModal();
  const router = useRouter();

  return (
    <div className="home-page" style={{ position: 'relative', isolation: 'isolate' }}>
      <div
        className="home-video-background"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          background: '#080c18',
        }}
      >
        <video
          className="home-video-background__video"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.48,
            filter: 'saturate(0.78)',
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div
          className="home-video-background__overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(8, 12, 24, 0.48), rgba(8, 12, 24, 0.72)), radial-gradient(circle at 50% 35%, transparent 0%, rgba(8, 12, 24, 0.48) 100%)',
          }}
        />
      </div>

      <div
        className="home-page__content flex flex-col items-center justify-center w-full"
        style={{ position: 'relative', zIndex: 1 }}
      >
      {/* Sección Principal Hero */}
      <section className="relative w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">

        {/* Insignia superior destacada */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-4 shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-xs font-semibold tracking-wide text-cyan-200">
            {t('home.badge', 'Plataforma Inteligente de Coworking por Horas')}
          </span>
        </div>

        {/* Título interactivo con animación de partículas */}
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

        {/* Subtítulo descriptivo */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-200 font-normal leading-relaxed mb-8 px-4">
          {t('home.hero.subtitle', 'Reserva escritorios de enfoque, salas directivas de juntas y cabinas insonorizadas por horas completas con diseño Liquid Glass.')}
        </p>

        {/* Botones de acción principales con borde eléctrico animado */}
        <div className="flex flex-wrap items-center justify-center gap-4 z-10 mb-12">
          <ElectricButton
            href="/spaces"
            color="#06b6d4"
            borderRadius={16}
            thickness={1.5}
            glow={0.8}
            className="liquid-glass-btn px-7 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 group hover:scale-105 border border-cyan-400/40 hover:border-cyan-300 transition-all cursor-pointer"
          >
            <span>{t('home.hero.explore', 'Explorar Catálogo de Espacios')}</span>
            <ArrowRight className="w-4 h-4 text-cyan-100 group-hover:translate-x-1 transition-transform" />
          </ElectricButton>
          <ElectricButton
            onClick={openRegisterModal}
            color="#8b5cf6"
            borderRadius={16}
            thickness={1.5}
            glow={0.7}
            className="liquid-glass-btn-secondary px-7 py-3.5 rounded-2xl text-sm font-semibold text-white hover:text-white hover:scale-105 border border-purple-500/50 hover:border-purple-300 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            {t('nav.register', 'Crear Cuenta Gratis')}
          </ElectricButton>
        </div>

        {/* Métricas y beneficios en tiempo real con borde eléctrico animado */}
        <div className="w-full max-w-4xl my-6">
          <ElectricBorder
            color="#06b6d4"
            borderRadius={20}
            thickness={1.5}
            glow={0.8}
            className="w-full"
          >
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 p-1">
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
          </ElectricBorder>
        </div>

        {/* Fichero interactivo con accesos directos y físicas 2D */}
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

      {/* Muestrario de Categorías con Tarjetas de Cristal Líquido */}
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
          {/* Tarjeta de Escritorios */}
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
              <Link href="/spaces?type=DESK" className="liquid-glass-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 hover:scale-105 transition-transform border border-cyan-500/40">
                Ver escritorios <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Tarjeta de Salas de Reunión */}
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
              <Link href="/spaces?type=MEETING_ROOM" className="liquid-glass-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 hover:scale-105 transition-transform border border-purple-500/40">
                Ver salas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Tarjeta de Cabinas Acústicas */}
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
              <Link href="/spaces?type=CABIN" className="liquid-glass-btn px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 hover:scale-105 transition-transform border border-amber-500/40">
                Ver cabinas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Servicios y Comodidades Incluidas */}
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
    </div>
  );
}
