'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/I18nContext';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface BookingFormProps {
  spaceId: string;
  pricePerHour: number;
  spaceName?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  spaceId,
  pricePerHour,
  spaceName: _spaceName,
}) => {
  const { t } = useI18n();
  const router = useRouter();

  // Tomorrow's date formatted as YYYY-MM-DD for default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(minDateStr);
  const [startHour, setStartHour] = useState<number>(9); // 9:00 AM default
  const [hours, setHours] = useState<number>(2); // 2 hours default
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Available start hours: 7 to 20
  const availableStartHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  // Maximum hours allowed based on start hour (closing time is 21:00)
  const maxAllowedHours = Math.min(4, 21 - startHour);

  const calculatedTotalPrice = hours * pricePerHour;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create exact ISO timestamps for start and end
      const [year, month, day] = date.split('-').map(Number);
      const start = new Date(year, month - 1, day, startHour, 0, 0, 0);
      const end = new Date(year, month - 1, day, startHour + hours, 0, 0, 0);

      // Generate a unique idempotency key for this booking attempt
      const idempotencyKey = `booking-${spaceId}-${start.getTime()}-${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?from=/spaces/${spaceId}`);
          return;
        }
        setError(data.error || 'No se pudo procesar la reserva');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Reservation submission error:', err);
      setError('Error al conectar con el servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="liquid-glass p-6 rounded-2xl border border-white/20 shadow-2xl relative">
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-400" />
        {t('detail.bookingCardTitle')}
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        {t('detail.bookingRuleNote')}
      </p>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Reserva confirmada con éxito! Redirigiendo a tus reservas...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {t('detail.date')}
          </label>
          <input
            type="date"
            min={minDateStr}
            max={maxDateStr}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-sm"
          />
        </div>

        {/* Start Hour Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>{t('detail.startTime')}</span>
            <span className="text-[11px] text-cyan-400">Rango 7:00 a 21:00</span>
          </label>
          <select
            value={startHour}
            onChange={(e) => {
              const newStart = Number(e.target.value);
              setStartHour(newStart);
              if (hours > 21 - newStart) {
                setHours(Math.max(1, 21 - newStart));
              }
            }}
            className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-sm"
          >
            {availableStartHours.map((h) => (
              <option key={h} value={h} className="bg-slate-900 text-white">
                {String(h).padStart(2, '0')}:00 {h < 12 ? 'AM' : 'PM'}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>{t('detail.hours')}</span>
            <span className="text-[11px] text-slate-400">1 a 4 horas completas</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((h) => {
              const disabled = h > maxAllowedHours;
              return (
                <button
                  key={h}
                  type="button"
                  disabled={disabled}
                  onClick={() => setHours(h)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    hours === h
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : disabled
                      ? 'opacity-30 cursor-not-allowed bg-white/5 text-slate-500'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {h} {h === 1 ? 'hora' : 'horas'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Horario reservado:</span>
            <span className="font-mono text-cyan-300">
              {String(startHour).padStart(2, '0')}:00 → {String(startHour + hours).padStart(2, '0')}:00
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tarifa horaria:</span>
            <span className="font-mono">${pricePerHour.toFixed(2)}/h</span>
          </div>
        </div>

        {/* Server Calculated Total Price (Rule 8) */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <span className="text-sm font-medium text-slate-300">{t('detail.totalEstimate')}:</span>
          <span className="text-2xl font-extrabold text-cyan-400">
            ${calculatedTotalPrice.toFixed(2)}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full liquid-glass-btn py-3.5 rounded-xl font-bold text-white text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Validando disponibilidad...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{t('detail.confirmBooking')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
