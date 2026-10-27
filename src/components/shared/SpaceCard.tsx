'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SpaceType } from '@prisma/client';
import { Users, MapPin, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';

export interface SpaceCardProps {
  id: string;
  name: string;
  description: string;
  type: SpaceType;
  capacity: number;
  pricePerHour: number | string;
  imageUrl: string;
  location?: string | null;
  amenities: string[];
  isActive?: boolean;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({
  id,
  name,
  description,
  type,
  capacity,
  pricePerHour,
  imageUrl,
  location,
  amenities,
  isActive: _isActive = true,
}) => {
  const { t } = useI18n();

  const typeLabelMap: Record<SpaceType, string> = {
    DESK: t('catalog.filter.desks'),
    MEETING_ROOM: t('catalog.filter.meetingRooms'),
    CABIN: t('catalog.filter.cabins'),
  };

  const typeColorMap: Record<SpaceType, string> = {
    DESK: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    MEETING_ROOM: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    CABIN: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };

  return (
    <div className="liquid-glass-card rounded-2xl overflow-hidden flex flex-col group h-full">
      {/* Contenedor de imagen optimizada con next/image */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={false}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              typeColorMap[type] || 'bg-white/20 text-white'
            }`}
          >
            {typeLabelMap[type] || type}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white flex items-baseline gap-1 shadow-lg">
          <span className="text-lg font-bold text-cyan-300">${Number(pricePerHour).toFixed(2)}</span>
          <span className="text-xs text-slate-400">{t('catalog.perHour')}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location & Capacity */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              {capacity} {t('catalog.capacity')}
            </span>
            {location && (
              <span className="flex items-center gap-1 truncate max-w-37.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {location}
              </span>
            )}
          </div>

          {/* Name & Description */}
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300"
              >
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-white/10">
          <Link
            href={`/spaces/${id}`}
            className="w-full liquid-glass-btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 group/btn"
          >
            <span>{t('catalog.viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
