"use client";

import { useState, useMemo, useEffect } from "react";
import ModalVerActa from "./ModalVerActa";
import { useDepartamentos } from "@/hooks/useDepartamento";
import { 
    Search, 
    Filter, 
    Calendar, 
    Building2, 
    ChevronDown, 
    FileText, 
    Eye 
} from "lucide-react";

interface Participante {
    nombre: string;
    cargo: string;
    correo: string;
}

interface Firma {
    nombre: string;
    cargo: string;
}

interface Acta {
    id: number;
    departamento: string;
    id_departamento: {
        id: number;
        nombre: string;
    };
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    lugar: string;
    participantes: Participante[];
    firmas: Firma[];
}

interface Props {
    actas: Acta[] | undefined;
}

export default function VerActas({ actas }: Props) {
    const { data: listaDepartamentos } = useDepartamentos(); 

    // Estado para filtros
    const [busquedaGeneral, setBusquedaGeneral] = useState("");
    const [filtroFecha, setFiltroFecha] = useState("");
    const [filtroDepartamento, setFiltroDepartamento] = useState("");
    const [ordenFecha, setOrdenFecha] = useState<"desc" | "asc">("desc");

    // Estado para paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPagina, setItemsPagina] = useState(10);

    // Estado para modal
    const [actaSeleccionada, setActaSeleccionada] = useState<Acta | null>(null);

    const actasFiltradas = useMemo(() => {
        if (!actas) return [];

        const filtrados = actas.filter((acta) => {
            // Filtro por Texto General (Busca en lugar o nombre depto)
            const texto = busquedaGeneral.toLowerCase();
            const matchTexto = 
                acta.lugar.toLowerCase().includes(texto) ||
                acta.id_departamento.nombre.toLowerCase().includes(texto);

            // Filtro por Fecha Exacta
            const matchFecha = filtroFecha ? acta.fecha === filtroFecha : true;

            // Filtro por Departamento ID
            const matchDepto = filtroDepartamento 
                ? acta.id_departamento.id.toString() === filtroDepartamento 
                : true;

            return matchTexto && matchFecha && matchDepto;
        });

        // Ordenamiento
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

    useEffect(() => {
        setPaginaActual(1);
    }, [busquedaGeneral, filtroFecha, filtroDepartamento, ordenFecha, itemsPagina]);

    const handlePaginaChange = (nuevaPagina: number) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) setPaginaActual(nuevaPagina);
    };

    const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = Number(e.target.value);
        if (valor > 0) setItemsPagina(valor);
    };

    if (!actas && !busquedaGeneral) {
        return (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400 w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No hay actas registradas</h3>
                <p className="text-gray-500 mt-1">Aún no se han generado actas en el sistema.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            
            <div className="flex flex-col xl:flex-row gap-4 items-start justify-center w-full max-w-full mx-auto">
                
                <div className="w-full xl:w-72 flex-shrink-0 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2">
                            <Filter className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Filtros de Búsqueda</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Buscar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="text"
                                        placeholder="Lugar o Departamento..."
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-800"
                                        value={busquedaGeneral}
                                        onChange={(e) => setBusquedaGeneral(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Fecha de Reunión</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                                    <input
                                        type="date"
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 cursor-pointer"
                                        value={filtroFecha}
                                        onChange={(e) => setFiltroFecha(e.target.value)}
                                        onClick={(e) => e.currentTarget.showPicker()} 
                                    />
                                </div>
                                {filtroFecha && (
                                    <button 
                                        onClick={() => setFiltroFecha("")}
                                        className="text-xs text-blue-500 hover:underline mt-1 ml-1"
                                    >
                                        Limpiar fecha
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Departamento</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                                    <select 
                                        className="w-full appearance-none pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                                        value={filtroDepartamento}
                                        onChange={(e) => setFiltroDepartamento(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        {listaDepartamentos?.map((dep) => (
                                            <option key={dep.id} value={dep.id}>
                                                {dep.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Orden Cronológico</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="ordenFecha" 
                                            className="text-blue-600 focus:ring-blue-500"
                                            checked={ordenFecha === 'desc'}
                                            onChange={() => setOrdenFecha('desc')}
                                        />
                                        Más recientes primero
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="ordenFecha" 
                                            className="text-blue-600 focus:ring-blue-500"
                                            checked={ordenFecha === 'asc'}
                                            onChange={() => setOrdenFecha('asc')}
                                        />
                                        Más antiguas primero
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full min-w-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        
                        <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Historial de Actas</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Visualice y descargue las actas generadas.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 hidden sm:block">Mostrar</span>
                                    <input
                                        type="number"
                                        value={itemsPagina}
                                        onChange={handleChangeItemsPorPagina}
                                        className="w-16 border border-gray-300 text-black rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={1}
                                    />
                                    <span className="text-sm text-gray-500 hidden sm:block">filas</span>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    <button 
                                        onClick={() => handlePaginaChange(paginaActual - 1)} 
                                        disabled={paginaActual === 1} 
                                        className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                                    >
                                        ←
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 w-20 text-center select-none">
                                        {paginaActual} / {totalPaginas || 1}
                                    </span>
                                    <button 
                                        onClick={() => handlePaginaChange(paginaActual + 1)} 
                                        disabled={paginaActual === totalPaginas} 
                                        className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 uppercase font-medium text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Departamento</th>
                                        <th className="px-6 py-4">Lugar</th>
                                        <th className="px-6 py-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {dataPaginada.length > 0 ? (
                                        dataPaginada.map((acta) => (
                                            <tr key={acta.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                    {new Date(acta.fecha + 'T12:00:00').toLocaleDateString('es-CL', {
                                                        day: '2-digit', month: 'long', year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {acta.id_departamento.nombre}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {acta.lugar}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setActaSeleccionada(acta)}
                                                        className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
                                                    >
                                                        <Eye size={16} />
                                                        Ver Detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4}>
                                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                                    <Search className="w-10 h-10 text-gray-300 mb-2" />
                                                    <p>No se encontraron actas con los filtros aplicados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

           {actaSeleccionada && (
                <ModalVerActa 
                    acta={actaSeleccionada} 
                    onClose={() => setActaSeleccionada(null)} 
                />
            )}
        </div>
    );
}