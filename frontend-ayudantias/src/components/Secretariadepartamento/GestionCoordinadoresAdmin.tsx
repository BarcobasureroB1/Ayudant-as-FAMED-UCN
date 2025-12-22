"use client";

import React, { useState } from "react";
import Select from "react-select";
import { useAsignarCoordinador, useQuitarCoordinador } from "../../hooks/useCoordinadores";
import { 
  Search, 
  Users, 
  UserPlus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Briefcase,
  Settings
} from "lucide-react";

// --- INTERFACES ---
interface CoordinadorData {
  rut: string;
  nombres: string;
  apellidos: string;
  asignaturas: {
    coordinadorId: number;
    asignatura: {
      id: number;
      nombre: string;
    };
    actual: boolean;
  }[];
}

interface AsignaturaCoordinadoresData {
  id: number;
  nombre: string;
  estado: string;
  semestre: string;
  nrc: string;
  abierta_postulacion: boolean;
  coordinadores: { rut: string; nombres: string; apellidos: string }[];
}

interface Props {
  asignaturas?: AsignaturaCoordinadoresData[];
  coordinadoresTodos?: CoordinadorData[];
}

export default function GestionCoordinadoresAdmin({
  asignaturas = [],
  coordinadoresTodos = [],
}: Props) {
  // --- Estados ---
  const [itemsPorPagina, setItemsPorPagina] = useState(8);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<AsignaturaCoordinadoresData | null>(null);
  const [confirmarQuitar, setConfirmarQuitar] = useState<{ asignaturaId: number; rut: string; nombre: string } | null>(null);
  const [nuevoCoordinador, setNuevoCoordinador] = useState<any>(null);

  // Hooks
  const asignarCoordinador = useAsignarCoordinador();
  const quitarCoordinador = useQuitarCoordinador();

  // --- Lógica de Filtrado y Paginación ---
  const asignaturasFiltradas = asignaturas.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginasFiltradas = Math.ceil(asignaturasFiltradas.length / (itemsPorPagina || 1));
  const indiceInicio = (paginaActual - 1) * (itemsPorPagina || 1);
  const asignaturasPaginadas = asignaturasFiltradas.slice(indiceInicio, indiceInicio + (itemsPorPagina || 1));

  // --- Helpers ---
  const obtenerCoordinadoresDisponibles = (asignatura: AsignaturaCoordinadoresData) => {
    const asignadosRut = new Set(asignatura.coordinadores.map((c) => c.rut));
    return coordinadoresTodos.filter((c) => !asignadosRut.has(c.rut));
  };

  const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (valor === "") { setItemsPorPagina(NaN); return; }
    const numero = Number(valor);
    if (numero > 0) { setItemsPorPagina(numero); setPaginaActual(1); }
  };

  // --- Handlers ---
  const handleAgregar = () => {
    if (!nuevoCoordinador || !asignaturaSeleccionada) return;

    asignarCoordinador.mutate(
      { id_asignatura: asignaturaSeleccionada.id, rut_coordinador: nuevoCoordinador.value },
      {
        onSuccess: () => {
          const coordinador = coordinadoresTodos.find((c) => c.rut === nuevoCoordinador.value);
          if (coordinador) {
            setAsignaturaSeleccionada((prev) =>
              prev ? {
                  ...prev,
                  coordinadores: [...prev.coordinadores, { rut: coordinador.rut, nombres: coordinador.nombres, apellidos: coordinador.apellidos }],
                } : prev
            );
          }
          setNuevoCoordinador(null);
        },
      }
    );
  };

  const handleConfirmarQuitar = () => {
    if (!confirmarQuitar) return;

    quitarCoordinador.mutate(
      { id_asignatura: String(confirmarQuitar.asignaturaId), rut_coordinador: confirmarQuitar.rut },
      {
        onSuccess: () => {
          setAsignaturaSeleccionada((prev) =>
            prev ? {
                  ...prev,
                  coordinadores: prev.coordinadores.filter((c) => c.rut !== confirmarQuitar.rut),
                } : prev
          );
          setConfirmarQuitar(null);
        },
      }
    );
  };

  // --- Renderizado ---
  return (
    <div className="w-full">
      
      {/* TÍTULO DE LA SECCIÓN */}
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
            <Briefcase className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
            Gestión de Coordinadores por Asignatura
        </h2>
      </div>

      {/* --- BARRA DE CONTROL SUPERIOR --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                  type="text"
                  placeholder="Buscar asignatura..."
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm"
              />
          </div>
          
          <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 pl-3 border-r border-gray-100 pr-3">
                  <span className="text-xs text-gray-600 font-medium">Filas:</span>
                  <input
                      type="number"
                      min="1"
                      value={isNaN(itemsPorPagina) ? "" : itemsPorPagina}
                      onChange={handleChangeItemsPorPagina}
                      className="w-12 text-center text-sm border-gray-100 text-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1"
                  />
              </div>

              <div className="flex items-center gap-1 pr-1">
                  <button 
                      onClick={() => setPaginaActual(p => Math.max(1, p - 1))} 
                      disabled={paginaActual === 1} 
                      className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                  >
                      <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                      {paginaActual} / {totalPaginasFiltradas || 1}
                  </span>
                  <button 
                      onClick={() => setPaginaActual(p => Math.min(totalPaginasFiltradas, p + 1))} 
                      disabled={paginaActual === totalPaginasFiltradas} 
                      className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
                  >
                      <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
      </div>

      {/* --- TABLA PRINCIPAL --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {asignaturas.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-[60%] px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asignatura</th>
                <th className="w-[20%] px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Coordinadores</th>
                <th className="w-[20%] px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {asignaturasPaginadas.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 align-middle">
                     <span className="text-sm font-semibold text-slate-900 block truncate" title={a.nombre}>{a.nombre}</span>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        a.coordinadores.length > 0 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                        <Users className="w-3 h-3" />
                        {a.coordinadores.length} Asignados
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <button
                      onClick={() => setAsignaturaSeleccionada(a)}
                      className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" /> Gestionar
                    </button>
                  </td>
                </tr>
              ))}
              {asignaturasPaginadas.length === 0 && (
                 <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No se encontraron asignaturas.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        ) : (
             <div className="p-12 text-center">
                <p className="text-slate-500 text-sm">No hay asignaturas disponibles.</p>
            </div>
        )}
      </div>

      {/* --- MODAL GESTIÓN COORDINADORES --- */}
      {asignaturaSeleccionada && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
             <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setAsignaturaSeleccionada(null)} />

                <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-slate-100">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-white">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Gestión de Equipo</h3>
                            <p className="text-xs text-indigo-600 font-medium mt-0.5">{asignaturaSeleccionada.nombre}</p>
                        </div>
                        <button onClick={() => setAsignaturaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors">
                            <X className="w-6 h-6"/>
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Lista Actual */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4"/> Coordinadores Actuales
                            </h4>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                {asignaturaSeleccionada.coordinadores.length > 0 ? (
                                    <ul className="divide-y divide-slate-200">
                                        {asignaturaSeleccionada.coordinadores.map((c) => (
                                            <li key={c.rut} className="flex items-center justify-between p-3 hover:bg-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                        {c.nombres.charAt(0)}{c.apellidos.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{c.nombres} {c.apellidos}</p>
                                                        <p className="text-xs text-slate-500">{c.rut}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setConfirmarQuitar({
                                                        asignaturaId: asignaturaSeleccionada.id,
                                                        rut: c.rut,
                                                        nombre: `${c.nombres} ${c.apellidos}`
                                                    })}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Quitar coordinador"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-6 text-center text-slate-400 text-sm italic">
                                        Sin coordinadores asignados.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Agregar Nuevo - SECCIÓN CORREGIDA */}
                        <div className="pt-4 border-t border-slate-100">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <UserPlus className="w-4 h-4"/> Asignar Nuevo
                            </h4>
                            <div className="space-y-3">
                                <Select
                                    value={nuevoCoordinador}
                                    onChange={setNuevoCoordinador}
                                    options={obtenerCoordinadoresDisponibles(asignaturaSeleccionada).map((c) => ({
                                        value: c.rut,
                                        label: `${c.nombres} ${c.apellidos} (${c.rut})`,
                                    }))}
                                    placeholder="Ingrese el nombre docente..."
                                    className="text-sm"
                                    // AQUÍ ESTÁ LA CORRECCIÓN DE ESTILOS:
                                    classNames={{
                                        control: (state) => `!rounded-lg !border-slate-300 !shadow-sm hover:!border-indigo-400 !bg-white ${state.isFocused ? '!ring-2 !ring-indigo-500/20 !border-indigo-500' : ''}`,
                                        option: (state) => state.isSelected ? "!bg-indigo-600 !text-white" : state.isFocused ? "!bg-indigo-50 !text-slate-800" : "!text-slate-600",
                                        singleValue: () => "!text-slate-800 !font-medium", // Texto seleccionado oscuro
                                        input: () => "!text-slate-800", // Texto de búsqueda oscuro
                                        menu: () => "!bg-white !rounded-lg !shadow-lg !border !border-slate-100 !mt-1",
                                        placeholder: () => "!text-slate-400"
                                    }}
                                    noOptionsMessage={() => "No hay coordinadores disponibles"}
                                    isSearchable
                                />
                                <button
                                    onClick={handleAgregar}
                                    disabled={!nuevoCoordinador}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex justify-center items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4"/> Confirmar Asignación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* --- MODAL CONFIRMACIÓN QUITAR --- */}
      {confirmarQuitar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform scale-100 border border-slate-100 text-center">
                <div className="mx-auto bg-red-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Quitar coordinador?</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Estás a punto de desvincular a <span className="font-semibold text-slate-800">{confirmarQuitar.nombre}</span> de esta asignatura.
                </p>
                <div className="flex justify-center gap-3">
                    <button 
                        onClick={() => setConfirmarQuitar(null)} 
                        className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirmarQuitar} 
                        className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm text-sm font-medium transition-colors"
                    >
                        Sí, quitar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}