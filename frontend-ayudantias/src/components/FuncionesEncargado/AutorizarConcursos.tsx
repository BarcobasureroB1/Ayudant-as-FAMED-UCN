"use client";

import React, { useMemo, useState } from "react";
import { useAutorizarConcurso, useDenegarConcurso } from "@/hooks/useAsignaturas";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  X 
} from "lucide-react";

interface Asignatura {
  id: number;
  nombre: string;
  estado: string;
  semestre: number;
  nrc: string;
  abierta_postulacion: boolean;
}

export default function AdministrarAsignaturas({
  onClose,
  asignaturasConcursos = [],
  mostrar,
}: {
  onClose: () => void;
  asignaturasConcursos: Asignatura[];
  mostrar: boolean;
}) {
  const autorizarConcurso = useAutorizarConcurso();
  const denegarConcurso = useDenegarConcurso();

  // -------------------------
  // ESTADOS
  // -------------------------
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);

  const [pending, setPending] = useState<{
    id: number;
    nombre: string;
    accion: "aprobar" | "denegar";
  } | null>(null);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // -------------------------
  // FILTRADO
  // -------------------------
  const asignaturasFiltradas = useMemo(() => {
    const t = busqueda.toLowerCase();
    return asignaturasConcursos.filter((u) =>
      `${u.id} ${u.nombre} ${u.estado}`.toLowerCase().includes(t)
    );
  }, [busqueda, asignaturasConcursos]);

  const totalPaginasFiltradas = Math.ceil(
    asignaturasFiltradas.length / (itemsPorPagina || 1)
  );

  // -------------------------
  // PAGINACIÓN
  // -------------------------
  const asignaturasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return asignaturasFiltradas.slice(inicio, inicio + itemsPorPagina);
  }, [paginaActual, itemsPorPagina, asignaturasFiltradas]);

  // -------------------------
  // CONFIRMAR ACCIÓN
  // -------------------------
  const confirmarCambio = async () => {
    if (!pending) return;

    if (pending.accion === "aprobar") {
      await autorizarConcurso.mutateAsync(pending.id);
    } else {
      await denegarConcurso.mutateAsync(pending.id);
    }

    setShowConfirmPopup(false);
    setPending(null);
  };

  const cancelarCambio = () => {
    setPending(null);
    setShowConfirmPopup(false);
  };

  const anyLoading = autorizarConcurso.isPending || denegarConcurso.isPending;

  // -------------------------
  // HANDLERS UI
  // -------------------------
  const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    if (valor === "") {
        setItemsPorPagina(NaN);
        return;
    }
    const numero = Number(valor);
    if (numero > 0) {
        setItemsPorPagina(numero);
        setPaginaActual(1);
    }
  };

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="w-full">
      
      {/* HEADER TARJETA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Administración de Asignaturas</h2>
                    <p className="text-sm text-slate-500">Autorización de concursos pendientes</p>
                </div>
            </div>
            {mostrar && (
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    title="Cerrar vista"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>

        <div className="p-6">
            {/* BARRA DE CONTROLES */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar asignatura..."
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(1);
                        }}
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

            {/* TABLA */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="w-[50%] px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Asignatura</th>
                            <th className="w-[20%] px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                            <th className="w-[30%] px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {asignaturasPaginadas.length > 0 ? (
                            asignaturasPaginadas.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 align-middle">
                                        <div className="text-sm font-semibold text-slate-900 truncate" title={u.nombre}>
                                            {u.nombre}
                                        </div>
                                        {u.nrc && <div className="text-xs text-slate-400 font-mono mt-0.5">NRC: {u.nrc}</div>}
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            u.estado.toLowerCase().includes('pendiente') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            u.estado.toLowerCase().includes('abierto') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                            {u.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                disabled={anyLoading}
                                                onClick={() => {
                                                    setPending({ id: u.id, nombre: u.nombre, accion: "aprobar" });
                                                    setShowConfirmPopup(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Aprobar solicitud"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                                            </button>
                                            <button
                                                disabled={anyLoading}
                                                onClick={() => {
                                                    setPending({ id: u.id, nombre: u.nombre, accion: "denegar" });
                                                    setShowConfirmPopup(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Denegar solicitud"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Denegar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">
                                    No se encontraron asignaturas pendientes.
                                </td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* POPUP CONFIRMACION */}
      {showConfirmPopup && pending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-slate-100 transform scale-100 transition-all">
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                    pending.accion === "aprobar" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}>
                    {pending.accion === "aprobar" ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {pending.accion === "aprobar" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    ¿Estás seguro que deseas 
                    <strong className={`mx-1 ${pending.accion === "aprobar" ? "text-emerald-700" : "text-red-700"}`}>
                        {pending.accion === "aprobar" ? "APROBAR" : "DENEGAR"}
                    </strong>
                    la solicitud para la asignatura <br/>
                    <span className="font-semibold text-slate-800">"{pending.nombre}"</span>?
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={cancelarCambio}
                        className="flex-1 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={confirmarCambio}
                        disabled={anyLoading}
                        className={`flex-1 px-4 py-2.5 text-white rounded-lg shadow-sm text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                            pending.accion === "aprobar" 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {anyLoading ? (
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            "Confirmar"
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}