"use client";

import { useState, useMemo, useEffect } from "react";
import ModalVerActa from "./ModalVerActa";
import { useDepartamentos } from "@/hooks/useDepartamento";
import { 
    Search, Filter, Calendar, Building2, ChevronDown, FileText, Eye, 
    ChevronLeft, List
} from "lucide-react";

// Interfaces... (mantener igual)
interface Participante { nombre: string; cargo: string; correo: string; }
interface Firma { nombre: string; cargo: string; }
interface Acta { id: number; departamento: string; id_departamento: { id: number; nombre: string; }; fecha: string; hora_inicio: string; hora_fin: string; lugar: string; participantes: Participante[]; firmas: Firma[]; }
interface Props { actas: Acta[] | undefined; }

export default function VerActas({ actas }: Props) {
    const { data: listaDepartamentos } = useDepartamentos(); 

    // Estados... (mantener igual)
    const [busquedaGeneral, setBusquedaGeneral] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");
    const [filtroDepartamento, setFiltroDepartamento] = useState("");
    const [ordenFecha, setOrdenFecha] = useState<"desc" | "asc">("desc");
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPagina, setItemsPagina] = useState(10);
    const [actaSeleccionada, setActaSeleccionada] = useState<Acta | null>(null);

    // Lógica de filtrado... (mantener igual)
    const actasFiltradas = useMemo(() => {
        if (!actas) return [];
        const filtrados = actas.filter((acta) => {
            const texto = busquedaGeneral.toLowerCase();
            const matchTexto = acta.lugar.toLowerCase().includes(texto) || acta.id_departamento.nombre.toLowerCase().includes(texto);
            const matchFecha = filtroFecha ? acta.fecha === filtroFecha : true;
            const matchDepto = filtroDepartamento ? acta.id_departamento.id.toString() === filtroDepartamento : true;
            return matchTexto && matchFecha && matchDepto;
        });
        filtrados.sort((a, b) => {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return ordenFecha === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return filtrados;
    }, [actas, busquedaGeneral, filtroFecha, filtroDepartamento, ordenFecha]);

    const totalPaginas = Math.ceil(actasFiltradas.length / (itemsPagina || 1));
    const indiceInicio = (paginaActual - 1) * (itemsPagina || 1);
    const indiceFin = indiceInicio + (itemsPagina || 1);
    const dataPaginada = actasFiltradas.slice(indiceInicio, indiceFin);

    useEffect(() => { setPaginaActual(1); }, [busquedaGeneral, filtroFecha, filtroDepartamento, ordenFecha, itemsPagina]);
    const handlePaginaChange = (n: number) => { if (n >= 1 && n <= totalPaginas) setPaginaActual(n); };
    const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => { const v = Number(e.target.value); if (v > 0) setItemsPagina(v); };

    return (
        <div className="flex flex-col xl:flex-row gap-5 items-start animate-in fade-in duration-500">
            
            {/* SIDEBAR */}
            <div className="w-full xl:w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 xl:sticky xl:top-24 h-fit self-start">
                <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-base uppercase tracking-wide">Filtros Actas</h3>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Lugar o Departamento..."
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                value={busquedaGeneral}
                                onChange={(e) => setBusquedaGeneral(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Fecha</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input
                                type="date"
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-600"
                                value={filtroFecha}
                                onChange={(e) => setFiltroFecha(e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker()} 
                            />
                        </div>
                        {filtroFecha && (
                            <button onClick={() => setFiltroFecha("")} className="text-xs text-blue-500 hover:underline mt-1 text-right w-full">Limpiar fecha</button>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Departamento</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 text-gray-400 w-4 h-4 pointer-events-none" />
                            <select 
                                className="w-full appearance-none pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-600"
                                value={filtroDepartamento}
                                onChange={(e) => setFiltroDepartamento(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {listaDepartamentos?.map((dep) => (
                                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Orden Cronológico</label>
                        <div className="flex gap-2">
                            <button onClick={() => setOrdenFecha('desc')} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${ordenFecha === 'desc' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Recientes</button>
                            <button onClick={() => setOrdenFecha('asc')} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${ordenFecha === 'asc' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Antiguas</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 w-full min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    <div className="bg-white border-b border-gray-200 px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <List className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Historial de Actas</h3>
                                <p className="text-xs text-gray-500">Registro oficial de sesiones.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                            <span className="text-xs font-medium text-gray-500 pl-2">Filas:</span>
                            <input
                                type="number"
                                value={itemsPagina}
                                onChange={handleChangeItemsPorPagina}
                                className="w-12 bg-white border border-gray-200 rounded text-sm font-semibold text-gray-700 text-center focus:ring-1 focus:ring-blue-500 outline-none py-1"
                                min={1}
                            />
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button onClick={() => handlePaginaChange(paginaActual - 1)} disabled={paginaActual === 1} className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold text-gray-700 w-16 text-center">{paginaActual} / {totalPaginas || 1}</span>
                            <button onClick={() => handlePaginaChange(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all">
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 text-sm">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Departamento</th>
                                    <th className="px-6 py-4">Lugar</th>
                                    <th className="px-6 py-4 text-center">Acción</th>
                                </tr>
                            </thead>
                            
                            <tbody className="bg-white divide-y divide-gray-100 text-sm">
                                {dataPaginada.length > 0 ? (
                                    dataPaginada.map((acta) => (
                                        <tr key={acta.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 text-base">
                                                {new Date(acta.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">
                                                {acta.id_departamento.nombre}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {acta.lugar}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setActaSeleccionada(acta)}
                                                    className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <Eye size={14} />
                                                    Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                                <Search className="w-10 h-10 text-gray-200 mb-3" />
                                                <p className="text-sm font-medium">No se encontraron actas.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

           {actaSeleccionada && (
                <ModalVerActa acta={actaSeleccionada} onClose={() => setActaSeleccionada(null)} />
            )}
        </div>
    );
}