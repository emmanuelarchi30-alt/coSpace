'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ReservationStatus, SpaceType } from '@prisma/client';

interface ReservationItem {
  id: string;
  userId: string;
  spaceId: string;
  startTime: string;
  endTime: string;
  hours: number;
  totalPrice: number;
  status: ReservationStatus;
  space: {
    id: string;
    name: string;
    type: SpaceType;
    imageUrl: string;
    location?: string | null;
    pricePerHour: number;
  };
}

// Strategy: CSR (Client-Side Rendering as required by Requirement 4)
export default function DashboardPage(): React.JSX.Element {
  const { t } = useI18n();
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<ReservationItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchReservations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      } else if (res.status === 401) {
        router.push('/login?from=/dashboard');
        return;
      } else {
        setErrorMessage('Error al cargar las reservas');
      }
    } catch {
      setErrorMessage('Error de red al consultar reservas');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelReservation = async (id: string): Promise<void> => {
    setCancellingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'No se pudo cancelar la reserva');
        setCancellingId(null);
        setCancelModalItem(null);
        return;
      }

      setSuccessMessage('Reserva cancelada exitosamente.');
      setCancelModalItem(null);
      await fetchReservations();
    } catch {
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setCancellingId(null);
    }
  };

  const [currentTime] = useState<number>(() => Date.now());

  // Función auxiliar para verificar si la reserva se puede cancelar (Regla de negocio 10: anticipación mínima de 2 horas)
  const canCancel = (startTimeIso: string): boolean => {
    const start = new Date(startTimeIso).getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    return start - currentTime >= twoHoursMs;
  };

  const upcomingReservations = reservations.filter(
    (r) => r.status === ReservationStatus.CONFIRMED && new Date(r.endTime).getTime() > currentTime
  );
  const pastOrCancelledReservations = reservations.filter(
    (r) => r.status === ReservationStatus.CANCELLED || new Date(r.endTime).getTime() <= currentTime
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 text-cyan-400" />
            {t('dashboard.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <Link
          href="/spaces"
          className="liquid-glass-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Reservar Otro Espacio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Estado de carga */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs">Cargando tus reservas en tiempo real...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="liquid-glass p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">{t('dashboard.noReservations')}</h3>
          <p className="text-xs text-slate-400">
            Explora nuestro catálogo y agenda tu primer escritorio, sala de reuniones o cabina acústica.
          </p>
          <Link
            href="/spaces"
            className="inline-flex liquid-glass-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg shadow-cyan-500/25 items-center gap-2"
          >
            <span>{t('dashboard.exploreCta')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active / Future Reservations */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              Reservas Próximas y Activas ({upcomingReservations.length})
            </h2>

            {upcomingReservations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tienes reservas activas pendientes.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingReservations.map((item) => {
                  const eligibleToCancel = canCancel(item.startTime);
                  const startDate = new Date(item.startTime);
                  const endDate = new Date(item.endTime);

                  return (
                    <div
                      key={item.id}
                      className="liquid-glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-cyan-500/20"
                    >
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                          <Image
                            src={item.space.imageUrl}
                            alt={item.space.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {t('dashboard.status.confirmed')}
                            </span>
                            <span className="text-sm font-bold text-cyan-300 font-mono">
                              ${Number(item.totalPrice).toFixed(2)}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white truncate">
                            {item.space.name}
                          </h3>

                          {item.space.location && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.space.location}
                            </p>
                          )}

                          <div className="mt-2 text-xs text-slate-300 space-y-0.5 font-mono">
                            <div className="flex items-center gap-1.5 text-cyan-200">
                              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{startDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} → {endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })} ({item.hours}h)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        {eligibleToCancel ? (
                          <button
                            type="button"
                            onClick={() => setCancelModalItem(item)}
                            className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 hover:underline"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('dashboard.cancel')}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            No cancelable (&lt; 2h del inicio)
                          </span>
                        )}

                        <Link
                          href={`/spaces/${item.space.id}`}
                          className="text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          Ver espacio →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past / Cancelled History */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-base font-bold text-slate-300">
              Historial de Reservas Anteriores ({pastOrCancelledReservations.length})
            </h2>

            {pastOrCancelledReservations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastOrCancelledReservations.map((item) => {
                  const startDate = new Date(item.startTime);
                  const isCancelled = item.status === ReservationStatus.CANCELLED;

                  return (
                    <div
                      key={item.id}
                      className="liquid-glass p-4 rounded-xl border border-white/5 opacity-75 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isCancelled
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {isCancelled ? t('dashboard.status.cancelled') : t('dashboard.status.completed')}
                          </span>
                          <span className="font-bold text-white truncate max-w-45">
                            {item.space.name}
                          </span>
                        </div>
                        <p className="text-slate-400 font-mono text-[11px]">
                          {startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} • {item.hours}h • ${Number(item.totalPrice).toFixed(2)}
                        </p>
                      </div>

                      <Link
                        href={`/spaces/${item.space.id}`}
                        className="text-cyan-400 hover:underline shrink-0"
                      >
                        Ver espacio
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="liquid-glass p-6 rounded-2xl border border-rose-500/30 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Cancelar esta reserva?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Estás a punto de cancelar tu reserva para <strong>{cancelModalItem.space.name}</strong>.
              El espacio quedará liberado inmediatamente para otros miembros.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={Boolean(cancellingId)}
                onClick={() => handleCancelReservation(cancelModalItem.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                {cancellingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Confirmar Cancelación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
