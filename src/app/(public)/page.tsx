import React from 'react';
import Link from 'next/link';
import ParticleText from '@/components/ui/ParticleText';
import FolderFloat from '@/components/ui/FolderFloat';
import { ArrowRight, Sparkles, Monitor, Shield, Clock, Users, Coffee, Wifi, PhoneCall } from 'lucide-react';

// Strategy: SSG (Static Site Generation as required by Requirement 4)
export const dynamic = 'force-static';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      {/* Hero Section with Liquid Glass & ParticleText */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow ambient backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-6 shadow-md shadow-cyan-500/10">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            Espacios de Coworking de Alto Rendimiento
          </span>
        </div>

        {/* ParticleText React Bits Component Integration */}
        <div className="w-full max-w-4xl h-56 sm:h-72 my-2 relative flex items-center justify-center">
          <ParticleText
            text="CoSpace"
            particleSize={2.2}
            density={3.5}
            color="#e2e8f0"
            highlightColor="#06b6d4"
            highlightMode="motion"
            shape="circle"
            intro="gather"
            scatter={160}
            gatherDuration={1500}
            stagger={380}
            clickBurst={true}
            burstStrength={1}
            pointerRepel={35}
            repelRadius={110}
            idleDrift={0.6}
            trigger="hover"
            fontSize="clamp(3.5rem, 11vw, 7.5rem)"
            fontWeight={900}
            glow={true}
          />
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-8">
          Reserva escritorios ergonómicos, salas de juntas premium y cabinas insonorizadas por horas completas.
          Diseñado con estética <span className="text-cyan-300 font-medium">Liquid Glass</span> y máxima velocidad.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 z-10 mb-16">
          <Link
            href="/spaces"
            className="liquid-glass-btn px-7 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 group"
          >
            <span>Explorar Espacios Disponibles</span>
            <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/register"
            className="liquid-glass-btn-secondary px-7 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 hover:text-white"
          >
            Crear Cuenta Gratis
          </Link>
        </div>

        {/* FolderFloat React Bits Component Integration for Business Rules */}
        <div className="w-full max-w-xl my-8 p-6 rounded-3xl liquid-glass border border-white/20 flex flex-col items-center shadow-2xl relative">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
              Reglas de Negocio Interactivas
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Políticas de Reserva Transparentes
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Pasa el cursor o interactúa con el fichero físico para soltar y arrastrar las notas de políticas.
            </p>
          </div>

          <div className="py-6 flex items-center justify-center w-full min-h-[220px]">
            <FolderFloat
              items={[
                '1 a 4 horas completas',
                'Horario: 7:00 a 21:00',
                'Cancela hasta 2h antes',
                'Máx. 3 reservas futuras',
                'Salas con pantallas 4K',
                'Desinfección garantizada',
              ]}
              label="Reglamento CoSpace"
              sublabel="6 normas clave"
              trigger="hover"
              physics={true}
              drift={0.6}
              folderColor="#0f172a"
              frontColor="#1e293b"
              paperColor="#f8fafc"
              itemColor="#06b6d4"
              itemTextColor="#020617"
              labelColor="#38bdf8"
              width={220}
              height={140}
              spread={190}
              lift={28}
            />
          </div>
        </div>
      </section>

      {/* Categories Showcase with Liquid Glass Cards */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Espacios Diseñados para Cada Necesidad
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Desde puestos individuales de máxima concentración hasta salas directivas de alto impacto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Desk Card */}
          <div className="liquid-glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Escritorios Flexibles & Dedicados</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Puestos individuales con sillas Herman Miller, monitores 4K y conexión de fibra óptica simétrica.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Desde $15.00/h</span>
              <Link href="/spaces?type=DESK" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                Ver escritorios <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Meeting Room Card */}
          <div className="liquid-glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Salas de Reuniones</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Capacidad de 6 a 12 personas con pantallas interactivas, cámaras 4K para videoconferencia y catering.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Desde $40.00/h</span>
              <Link href="/spaces?type=MEETING_ROOM" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                Ver salas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Cabin Card */}
          <div className="liquid-glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cabinas Acústicas</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Aislamiento sonoro de 38dB, iluminación regulable y micrófonos Shure para videollamadas privadas.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Desde $22.00/h</span>
              <Link href="/spaces?type=CABIN" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                Ver cabinas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Included Amenities Banner */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="liquid-glass p-8 rounded-3xl border border-white/15 flex flex-wrap items-center justify-around gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Wifi className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-semibold text-white">WiFi 6 Simétrico</span>
            <span className="text-[11px] text-slate-400">1 Gbps de bajada y subida</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-400" />
            <span className="text-xs font-semibold text-white">Café de Especialidad</span>
            <span className="text-[11px] text-slate-400">Granos tostados artesanales</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-semibold text-white">Reserva Inmediata</span>
            <span className="text-[11px] text-slate-400">Confirmación al instante</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-6 h-6 text-violet-400" />
            <span className="text-xs font-semibold text-white">Seguridad Total</span>
            <span className="text-[11px] text-slate-400">Acceso digital y lockers</span>
          </div>
        </div>
      </section>
    </div>
  );
}
