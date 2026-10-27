import React from 'react';
import prisma from '@/lib/prisma';
import { SpaceType } from '@prisma/client';
import SpaceCard from '@/components/shared/SpaceCard';
import Link from 'next/link';
import { Filter, Search, Sparkles } from 'lucide-react';

// Strategy: SSR (Server-Side Rendering as required by Requirement 4)
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    type?: string;
    q?: string;
  }>;
}

export default async function SpacesCatalogPage({ searchParams }: PageProps): Promise<React.JSX.Element> {
  const { type, q } = await searchParams;

  // Condición de consulta para excluir espacios desactivados del catálogo público (Regla 12)
  const whereCondition: {
    isActive: boolean;
    type?: SpaceType;
    OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; location?: { contains: string; mode: 'insensitive' } }>;
  } = {
    isActive: true,
  };

  if (type && Object.values(SpaceType).includes(type as SpaceType)) {
    whereCondition.type = type as SpaceType;
  }

  if (q && q.trim() !== '') {
    whereCondition.OR = [
      { name: { contains: q.trim(), mode: 'insensitive' } },
      { location: { contains: q.trim(), mode: 'insensitive' } },
    ];
  }

  const spaces = await prisma.space.findMany({
    where: whereCondition,
    orderBy: { pricePerHour: 'asc' },
  });

  const categories = [
    { label: 'Todos los Espacios', value: '' },
    { label: 'Escritorios', value: SpaceType.DESK },
    { label: 'Salas de Reuniones', value: SpaceType.MEETING_ROOM },
    { label: 'Cabinas Acústicas', value: SpaceType.CABIN },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Disponibilidad en Tiempo Real</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Catálogo de Espacios
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Encuentra y reserva por horas tu puesto de coworking, sala de conferencias o cabina acústica insonorizada.
          </p>
        </div>

        {/* Search Bar */}
        <form method="GET" action="/spaces" className="w-full md:w-80">
          {type && <input type="hidden" name="type" value={type} />}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Buscar por nombre o piso..."
              className="w-full liquid-glass-input pl-10 pr-4 py-2.5 rounded-xl text-xs placeholder:text-slate-500"
            />
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        {categories.map((cat) => {
          const isSelected = (!type && cat.value === '') || type === cat.value;
          const href = cat.value ? `/spaces?type=${cat.value}${q ? `&q=${encodeURIComponent(q)}` : ''}` : `/spaces${q ? `?q=${encodeURIComponent(q)}` : ''}`;

          return (
            <Link
              key={cat.label}
              href={href}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'liquid-glass-btn-secondary text-slate-300 hover:text-white'
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Grid of Spaces */}
      {spaces.length === 0 ? (
        <div className="liquid-glass p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <p className="text-slate-300 font-semibold text-base">
            No se encontraron espacios con los filtros seleccionados.
          </p>
          <p className="text-xs text-slate-400">
            Intenta limpiando la búsqueda o seleccionando otra categoría.
          </p>
          <Link
            href="/spaces"
            className="inline-block liquid-glass-btn px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-cyan-500/20"
          >
            Ver todos los espacios
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              id={space.id}
              name={space.name}
              description={space.description}
              type={space.type}
              capacity={space.capacity}
              pricePerHour={Number(space.pricePerHour)}
              imageUrl={space.imageUrl}
              location={space.location}
              amenities={space.amenities}
              isActive={space.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
