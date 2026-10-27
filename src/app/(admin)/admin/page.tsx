'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SpaceType } from '@prisma/client';
import SpaceForm from '@/components/forms/SpaceForm';
import {
  Building2,
  Plus,
  Edit2,
  PowerOff,
  Power,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface AdminSpace {
  id: string;
  name: string;
  description: string;
  type: SpaceType;
  capacity: number;
  pricePerHour: number;
  imageUrl: string;
  location?: string | null;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage(): React.JSX.Element {
  const [spaces, setSpaces] = useState<AdminSpace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSpace, setEditingSpace] = useState<AdminSpace | undefined>(undefined);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSpaces = async (): Promise<void> => {
    try {
      setLoading(true);
      // Fetch all spaces including deactivated ones for admin
      const res = await fetch('/api/spaces?all=true');
      if (res.ok) {
        const data = await res.json();
        setSpaces(data.spaces || []);
      } else {
        setError('Error al cargar catálogo administrativo');
      }
    } catch {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleToggleState = async (space: AdminSpace): Promise<void> => {
    setTogglingId(space.id);
    setError(null);
    setSuccess(null);

    const nextState = !space.isActive;

    try {
      const res = await fetch(`/api/spaces/${space.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No se pudo cambiar el estado del espacio');
        setTogglingId(null);
        return;
      }

      setSuccess(
        nextState
          ? `Espacio "${space.name}" activado exitosamente.`
          : `Espacio "${space.name}" desactivado exitosamente.`
      );
      await fetchSpaces();
    } catch {
      setError('Error de conexión al procesar el cambio de estado.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenCreate = (): void => {
    setEditingSpace(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (space: AdminSpace): void => {
    setEditingSpace(space);
    setIsFormOpen(true);
  };

  const activeCount = spaces.filter((s) => s.isActive).length;
  const inactiveCount = spaces.length - activeCount;

  return (
    <div className="space-y-8">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            Panel de Control del Administrador
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión completa del catálogo de espacios de coworking, estado y tarifas horarias.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="liquid-glass-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl shadow-cyan-500/25 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Espacio</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="liquid-glass p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total de Espacios</span>
            <span className="text-2xl font-black text-white">{spaces.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="liquid-glass p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 block">Espacios Activos</span>
            <span className="text-2xl font-black text-emerald-300">{activeCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Power className="w-5 h-5" />
          </div>
        </div>

        <div className="liquid-glass p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 block">Espacios Desactivados</span>
            <span className="text-2xl font-black text-rose-300">{inactiveCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <PowerOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Spaces Table / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs">Cargando catálogo administrativo...</p>
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="py-4 px-6">Espacio</th>
                  <th className="py-4 px-4">Tipo</th>
                  <th className="py-4 px-4">Capacidad</th>
                  <th className="py-4 px-4">Precio / h</th>
                  <th className="py-4 px-4">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {spaces.map((space) => {
                  const isToggling = togglingId === space.id;

                  return (
                    <tr
                      key={space.id}
                      className={`hover:bg-white/5 transition-colors ${
                        !space.isActive ? 'opacity-60 bg-slate-950/40' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                            <Image
                              src={space.imageUrl}
                              alt={space.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">
                              {space.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {space.location || 'Sin ubicación específica'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 border border-white/10">
                          {space.type}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono">
                        {space.capacity} {space.capacity === 1 ? 'persona' : 'personas'}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-cyan-300">
                        ${Number(space.pricePerHour).toFixed(2)}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            space.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {space.isActive ? 'Activo' : 'Desactivado'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(space)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                            title="Editar espacio"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleState(space)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              space.isActive
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                            title={
                              space.isActive
                                ? 'Desactivar espacio (no se mostrará en catálogo)'
                                : 'Activar espacio'
                            }
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : space.isActive ? (
                              <PowerOff className="w-3 h-3" />
                            ) : (
                              <Power className="w-3 h-3" />
                            )}
                            <span>{space.isActive ? 'Desactivar' : 'Activar'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Creating or Editing Space */}
      {isFormOpen && (
        <SpaceForm
          initialData={editingSpace}
          onSuccess={() => {
            setIsFormOpen(false);
            setSuccess(editingSpace ? 'Espacio actualizado correctamente' : 'Espacio creado correctamente');
            fetchSpaces();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
