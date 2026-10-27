import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BookingForm from '@/components/forms/BookingForm';
import { ArrowLeft, Users, MapPin, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { SpaceType } from '@prisma/client';

// Strategy: SSR (Server-Side Rendering as required by Requirement 4)
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaceDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  const space = await prisma.space.findUnique({
    where: { id },
  });

  // If space does not exist or is inactive, trigger 404 (Rule 7 & 12)
  if (!space || !space.isActive) {
    notFound();
  }

  const typeLabelMap: Record<SpaceType, string> = {
    DESK: 'Escritorio Individual',
    MEETING_ROOM: 'Sala de Juntas',
    CABIN: 'Cabina Acústica',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/spaces"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Image, Details & Amenities (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Space Image with next/image */}
          <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden liquid-glass border border-white/20 shadow-2xl">
            <Image
              src={space.imageUrl}
              alt={space.name}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                {typeLabelMap[space.type]}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {space.name}
                </h1>
                {space.location && (
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {space.location}
                  </p>
                )}
              </div>
              <div className="px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md text-white text-right">
                <span className="text-2xl font-black text-cyan-300">
                  ${Number(space.pricePerHour).toFixed(2)}
                </span>
                <span className="text-xs text-slate-300 block">/ hora</span>
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="liquid-glass p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Capacidad</span>
                <span className="text-sm font-bold text-white">
                  {space.capacity} {space.capacity === 1 ? 'Persona' : 'Personas'}
                </span>
              </div>
            </div>

            <div className="liquid-glass p-4 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Tipo</span>
                <span className="text-sm font-bold text-white">
                  {space.type}
                </span>
              </div>
            </div>

            <div className="liquid-glass p-4 rounded-2xl border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Estado</span>
                <span className="text-sm font-bold text-emerald-300">
                  Disponible
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-base font-bold text-white">Descripción del Espacio</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {space.description}
            </p>
          </div>

          {/* Amenities & Services */}
          <div className="liquid-glass p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-white">Servicios y Comodidades Incluidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {space.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Booking Form */}
        <div className="lg:col-span-1 sticky top-28">
          <BookingForm
            spaceId={space.id}
            pricePerHour={Number(space.pricePerHour)}
            spaceName={space.name}
          />
        </div>
      </div>
    </div>
  );
}
