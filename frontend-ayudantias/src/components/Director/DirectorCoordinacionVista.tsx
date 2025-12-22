"use client";

import React, { useState, useMemo } from 'react';
import {
    useCoordinadoresTodos,
    CoordinadorData,
    PostulanteCoordinador,
    AyudanteCoordinador,
    useEvaluarPostulacion,
    useDescartarPostulacion,
    useEvaluarAyudanteFinal,
    PostulanteCoordinadorData
} from '@/hooks/useCoordinadores';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';
import { 
    Filter, Search, Users, CheckSquare, Square, 
    Eye, FileText, XCircle, GraduationCap, 
    ChevronLeft, SlidersHorizontal 
} from 'lucide-react';

import { ModalDescarte } from '../Coordinador/ModalDescarte';
import { ModalEvaluacionPostulante } from '../Coordinador/ModalEvaluacionPostulante';
import { ModalEvaluacionAyudante } from '../Coordinador/ModalEvaluacionAyudante';
import { ModalVerCurriculum } from '../Coordinador/ModalVerCurriculum';
import { ModalDetallePostulacion } from '../SecretariaDocente/ModalDetallePostulacion';

interface DirectorCoordinacionVistaProps {
    postulantes: PostulanteCoordinador[] | PostulanteCoordinadorData[]| undefined;
    ayudantes: AyudanteCoordinador[] | undefined;
    loading: boolean;
}

// Componente Badge
const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" }) => {
    const variants = {
        default: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-red-50 text-red-700 border-red-200"
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${variants[variant]} shadow-sm`}>
            {children}
        </span>
    );
};

export const DirectorCoordinacionVista = ({ postulantes, ayudantes, loading }: DirectorCoordinacionVistaProps) => {
    // --- Hooks y Datos ---
    const { data: coordinadores } = useCoordinadoresTodos();
    const { data: listaAsignaturas } = useTodasAsignaturas();

    const [vista, setVista] = useState<'Postulantes' | 'Ayudantes'>('Postulantes');
    const isPostulante = vista === 'Postulantes';
    const isAyudantes = vista === 'Ayudantes';

    // Estados de Modales
    const [rutVerCurriculum, setRutVerCurriculum ] = useState<string | null>(null);
    const [postulanteVerDetalle, setPostulanteVerDetalle] = useState<PostulanteCoordinador | null>(null);
    const [postulanteAEvaluar, setPostulanteAEvaluar] = useState<PostulanteCoordinador | null>(null);
    const [ayudanteAEvaluar, setAyudanteAEvaluar] = useState<AyudanteCoordinador | null>(null);
    const [idPostulacionDescartar, setIdPostulacionDescartar] = useState<number | null>(null);

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPagina, setItemsPagina] = useState(10);

    // Mutaciones
    const evaluarPostulacion = useEvaluarPostulacion();
    const descartarPostulacion = useDescartarPostulacion();
    const evaluarAyudante = useEvaluarAyudanteFinal();

    // Filtros
    const [busqueda, setBusqueda] = useState("");
    const [filtroAsignatura, setFiltroAsignatura] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    // Filtro Coordinadores
    const [coordinadoresSeleccionados, setCoordinadoresSeleccionados] = useState<string[]>([]);
    const [busquedaCoordinador, setBusquedaCoordinador] = useState("");

    // --- Memos y Lógica ---

    const mapAsig = useMemo(() => {
        if (!listaAsignaturas) return {};
        const map: Record<number, string> = {};
        if (Array.isArray(listaAsignaturas)) {
            listaAsignaturas.forEach((asig: any) => {map[asig.id] = asig.nombre; });
        }
        return map;
    }, [listaAsignaturas]);

    const coordinadoresVisibles = useMemo(() => {
        if (!coordinadores) return [];
        if (!busquedaCoordinador) return coordinadores;
        const term = busquedaCoordinador.toLowerCase();
        return coordinadores.filter((c: any) => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(term) ||
            c.rut.includes(term)
        );
    }, [coordinadores, busquedaCoordinador])
    
    const dataFiltrada = useMemo(() => {
        const listaBase = isPostulante ? (postulantes || []) : (ayudantes || []);

        return listaBase.filter((item: any) => {
            const nombres = item.alumno.nombres;
            const rut = item.rut_alumno || item.alumno.rut;

            const matchTexto = nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
                                rut.toLowerCase().includes(busqueda.toLowerCase());

            let matchAsignatura = true;
            if (filtroAsignatura) {
                if (isPostulante) {
                    matchAsignatura = item.id_asignatura.toString() === filtroAsignatura;
                } else {
                    const nombreAsigFiltro = mapAsig[Number(filtroAsignatura)];
                    matchAsignatura = item.asignatura === nombreAsigFiltro;
                }
            }

            let matchEstado = true;
            if (filtroEstado) {
                if (isPostulante) {
                    const esEvaluado = item.puntuacion_etapa2 != null && item.puntuacion_etapa2 > 0;
                    matchEstado = (esEvaluado ? "Evaluado" : "Pendiente") === filtroEstado;
                } else {
                    const esEvaluado = item.evaluacion != null && item.evaluacion > 0;
                    matchEstado = (esEvaluado ? "Calificado" : "Activo") === filtroEstado;
                }
            }

            let matchCoordinador = true;
            if(coordinadoresSeleccionados.length > 0)
            {
                const rutCoordItem = item.coordinador?.rut;
                if(rutCoordItem){
                    matchCoordinador = coordinadoresSeleccionados.includes(rutCoordItem);
                } else {
                    matchCoordinador = false;
                }
            }

            const noDescartado = (item as PostulanteCoordinador).motivo_descarte ? false : true;

            return matchTexto && matchAsignatura && noDescartado && matchEstado && matchCoordinador;
        });
    }, [isPostulante, postulantes, ayudantes, busqueda, filtroAsignatura, filtroEstado, coordinadoresSeleccionados, mapAsig]);

    React.useEffect(() => {
        setPaginaActual(1);
    }, [vista, busqueda, filtroAsignatura, filtroEstado, coordinadoresSeleccionados]);

    const totalPaginas = Math.ceil(dataFiltrada.length / (itemsPagina || 1));
    const indiceInicio = (paginaActual - 1) * (itemsPagina || 1);
    const indiceFin = indiceInicio + (itemsPagina || 1);
    const dataPaginada = dataFiltrada.slice(indiceInicio, indiceFin);

    // --- Handlers ---
    const handlePaginaChange = (nuevaPagina: number) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

    const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = Number(e.target.value);
        if (valor > 0) {
            setItemsPagina(valor);
            setPaginaActual(1);
        } else if (e.target.value === '') {
            setItemsPagina(0); 
        }
    };

    const toggleCoordinador = (rut: string) => {
        setCoordinadoresSeleccionados(prev => 
            prev.includes(rut) ? prev.filter(r => r !== rut) : [...prev, rut]
        );
    };

    const handleConfirmarEvaluacionPost = async (puntajeTotal: number) => {
        if (postulanteAEvaluar) {
            await evaluarPostulacion.mutateAsync({ id_postulacion: postulanteAEvaluar.id, puntuacion_etapa2: puntajeTotal});
            setPostulanteAEvaluar(null);
        }
    };

    const handleConfirmarDescarte = async (motivo: string) => {
        if (idPostulacionDescartar) {
            await descartarPostulacion.mutateAsync({
                id_postulacion: idPostulacionDescartar, motivo_descarte: motivo,
                fecha_descarte: new Date().toISOString().split('T')[0], rechazada_por_jefatura: true
            });
        }
    };

    const handleConfirmarEvaluacionAyu = async (nota: number) => {
        if (ayudanteAEvaluar) {
            await evaluarAyudante.mutateAsync({ id_ayudantia: ayudanteAEvaluar.id, evaluacion: nota });
            setAyudanteAEvaluar(null);
        }
    };

    // --- Renderizado ---
    return (
        <div className="flex flex-col xl:flex-row gap-5 items-start animate-in fade-in duration-500">
            
            {/* SIDEBAR (Filtros) */}
            <div className="w-full xl:w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-5 xl:sticky xl:top-24 h-fit self-start">
                
                {/* 1. Selector de Coordinadores */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-base text-gray-900">Coordinadores</h3>
                    </div>
                    
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar coordinador..."
                            className="placeholder-gray-500 w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray- rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            value={busquedaCoordinador}
                            onChange={(e) => setBusquedaCoordinador(e.target.value)}
                        />
                    </div>
                    
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar divide-y divide-gray-100 border border-gray-100 rounded-lg bg-gray-50/50">
                        {coordinadoresVisibles.length > 0 ? (
                            coordinadoresVisibles.map((coord: CoordinadorData) => {
                                const isSelected = coordinadoresSeleccionados.includes(coord.rut);
                                return (
                                    <button
                                        key={coord.rut}
                                        onClick={() => toggleCoordinador(coord.rut)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-all text-left hover:bg-white ${isSelected ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className={`flex-shrink-0 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                                             {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`truncate font-medium ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>
                                                {coord.nombres} {coord.apellidos}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                             <div className="p-4 text-center">
                                <p className="text-sm text-gray-400 italic">No se encontraron resultados</p>
                             </div>
                        )}
                    </div>
                    
                    {coordinadoresSeleccionados.length > 0 && (
                        <button 
                            onClick={() => setCoordinadoresSeleccionados([])}
                            className="w-full mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-right"
                        >
                            Limpiar selección ({coordinadoresSeleccionados.length})
                        </button>
                    )}
                </div>

                {/* 2. Filtros Generales */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-base text-gray-900">Filtros Datos</h3>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Asignatura</label>
                        <select 
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
                            value={filtroAsignatura}
                            onChange={(e) => setFiltroAsignatura(e.target.value)}
                        >
                            <option value="">Todas las asignaturas</option>
                            {Object.entries(mapAsig).map(([id, nombre]) => (
                                <option key={id} value={id}>{nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Estado</label>
                        <select 
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Todos los estados</option>
                            {isPostulante ? (
                                <>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Evaluado">Evaluado</option>
                                </>
                            ) : (
                                <>
                                    <option value="Activo">Activo</option>
                                    <option value="Calificado">Calificado</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL (Tabla) */}
            <div className="flex-1 w-full min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    
                    {/* Header Interno: Tabs, Búsqueda y Paginación */}
                    <div className="flex flex-col gap-5 mb-6">
                        
                        {/* Fila Superior: Tabs a la derecha */}
                        <div className="flex justify-end">
                            <div className="bg-gray-50 p-1 rounded-lg border border-gray-200 inline-flex">
                                <button 
                                    onClick={() => { setVista('Postulantes'); setPaginaActual(1); }} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${isPostulante ? 'bg-white text-blue-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Users className="w-4 h-4" /> Postulantes
                                </button>
                                <button 
                                    onClick={() => { setVista('Ayudantes'); setPaginaActual(1); }} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${isAyudantes ? 'bg-white text-blue-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <GraduationCap className="w-4 h-4" /> Ayudantes
                                </button>
                            </div>
                        </div>

                        {/* Fila Inferior: Buscador y Paginación */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="relative w-full sm:w-96">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    placeholder={isPostulante ? "Buscar nombre o RUT..." : "Buscar ayudante..."}
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                <div className="hidden sm:flex items-center gap-2 pl-2 pr-2 border-r border-gray-200">
                                    <span className="text-xs font-medium text-gray-500">Filas:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={itemsPagina || ""}
                                        onChange={handleChangeItemsPorPagina}
                                        className="w-12 bg-white border border-gray-200 rounded text-sm font-semibold text-gray-700 text-center focus:ring-1 focus:ring-blue-500 outline-none py-1"
                                    />
                                </div>
                                <button 
                                    onClick={() => handlePaginaChange(paginaActual - 1)} 
                                    disabled={paginaActual === 1} 
                                    className="p-2 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-semibold text-gray-700 w-20 text-center">
                                    {paginaActual} / {totalPaginas || 1}
                                </span>
                                <button 
                                    onClick={() => handlePaginaChange(paginaActual + 1)} 
                                    disabled={paginaActual === totalPaginas} 
                                    className="p-2 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                         <div className="text-center py-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 text-sm font-medium">Cargando...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                             <table className="min-w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 text-sm">
                                    <tr>
                                        <th className="px-5 py-4 whitespace-nowrap uppercase tracking-wider">RUT</th>
                                        <th className="px-5 py-4 uppercase tracking-wider min-w-[180px]">Alumno</th>
                                        <th className="px-5 py-4 uppercase tracking-wider min-w-[160px]">Coordinador</th>
                                        <th className="px-5 py-4 text-center uppercase tracking-wider min-w-[120px]">Asignatura</th>
                                        <th className="px-5 py-4 text-center uppercase tracking-wider whitespace-nowrap">{isPostulante ? 'Puntaje 1' : 'Nota'}</th>
                                        {isPostulante && <th className="px-5 py-4 text-center uppercase tracking-wider whitespace-nowrap">Puntaje 2</th>}
                                        <th className="px-5 py-4 text-center uppercase tracking-wider whitespace-nowrap">Estado</th>
                                        <th className="px-5 py-4 text-center uppercase tracking-wider whitespace-nowrap">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white text-sm">
                                    {dataPaginada.map((item: any, index: number) => {
                                         const nombreAsig = isPostulante 
                                            ? (mapAsig[item.id_asignatura] || item.id_asignatura) 
                                            : item.asignatura;
                                        
                                        const coordNombre = item.coordinador 
                                            ? `${item.coordinador.nombres.split(' ')[0]} ${item.coordinador.apellidos.split(' ')[0]}` 
                                            : "No asignado";

                                        const esEvaluadoPostulante = isPostulante && item.puntuacion_etapa2 != null && item.puntuacion_etapa2 > 0;
                                        const esEvaluadoAyudante = !isPostulante && item.evaluacion != null && item.evaluacion > 0;
                                        const esEvaluado = isPostulante ? esEvaluadoPostulante : esEvaluadoAyudante;

                                        const rutAlumno = isPostulante ? item.rut_alumno : item.alumno.rut;
                                        const keyUnica = `${item.id}-${rutAlumno}-${isPostulante ? item.id_asignatura : item.asignatura}-${index}`;

                                        return (
                                            <tr key={keyUnica} className="hover:bg-indigo-50/20 transition-colors group">
                                                 <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap text-base">{rutAlumno}</td>
                                                 
                                                 <td className="px-5 py-4 text-gray-800 font-semibold break-words leading-snug text-base">
                                                    {item.alumno.nombres} {item.alumno.apellidos}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                                                        <span className="leading-snug break-words">{coordNombre}</span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium border border-gray-200 leading-tight">
                                                        {nombreAsig}
                                                    </span>
                                                </td>
                                                
                                                {isPostulante ? (
                                                    <>
                                                        <td className="px-5 py-4 text-center font-bold text-indigo-600 text-base">{item.puntuacion_etapa1}</td>
                                                        <td className="px-5 py-4 text-center font-bold text-gray-700 text-base">
                                                            {item.puntuacion_etapa2 ? item.puntuacion_etapa2 : '-'}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <td className={`px-5 py-4 text-center font-bold text-base ${esEvaluado ? 'text-emerald-600' : 'text-gray-300'}`}>
                                                        {item.evaluacion ? (item.evaluacion / 10).toFixed(1) : '-'}
                                                    </td>
                                                )}

                                                <td className="px-5 py-4 text-center">
                                                    <Badge variant={esEvaluado ? 'success' : (isPostulante ? 'warning' : 'default')}>
                                                        {isPostulante 
                                                            ? (esEvaluado ? 'Evaluado' : 'Pendiente')
                                                            : (esEvaluado ? 'Calificado' : 'Activo')
                                                        }
                                                    </Badge>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {isPostulante ? (
                                                            <>
                                                                <button onClick={() => setPostulanteVerDetalle(item)} className="flex flex-col items-center gap-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-w-[50px]" title="Ver Detalle">
                                                                    <Eye className="w-5 h-5" />
                                                                    <span className="text-[11px] font-bold">Detalle</span>
                                                                </button>
                                                                <button onClick={() => setRutVerCurriculum(item.rut_alumno)} className="flex flex-col items-center gap-1 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors min-w-[50px]" title="Ver CV">
                                                                    <FileText className="w-5 h-5" />
                                                                    <span className="text-[11px] font-bold">CV</span>
                                                                </button>
                                                                
                                                                <div className="flex flex-col justify-center">
                                                                    <button 
                                                                        onClick={() => setPostulanteAEvaluar(item)} 
                                                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                                                                            esEvaluado 
                                                                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200" 
                                                                                : "bg-blue-600 text-white hover:bg-indigo-700 shadow-md"
                                                                        }`}
                                                                    >
                                                                        {esEvaluado ? 'Editar' : 'Evaluar'}
                                                                    </button>
                                                                </div>
                                                                
                                                                <button 
                                                                    onClick={() => setIdPostulacionDescartar(item.id)} 
                                                                    className="flex flex-col items-center gap-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[50px]" 
                                                                    title="Descartar"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
                                                                    <span className="text-[11px] font-bold">Borrar</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                             <button 
                                                                onClick={() => setAyudanteAEvaluar(item)} 
                                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 mx-auto ${esEvaluado ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                                                            >
                                                                {esEvaluado ? 'Editar Nota' : 'Evaluar'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {dataPaginada.length === 0 && (
                                         <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="bg-gray-50 p-4 rounded-full mb-3 border border-gray-100">
                                                        <Filter className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-medium">No se encontraron registros.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                             </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALES */}
            {rutVerCurriculum && <ModalVerCurriculum rut={rutVerCurriculum} onClose={() => setRutVerCurriculum(null)} />}
            {postulanteVerDetalle && (
                <ModalDetallePostulacion 
                    postulante={postulanteVerDetalle} 
                    onClose={() => setPostulanteVerDetalle(null)} 
                />
            )}
            {postulanteAEvaluar && <ModalEvaluacionPostulante postulante={postulanteAEvaluar} onClose={() => setPostulanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionPost} />}
            {ayudanteAEvaluar && <ModalEvaluacionAyudante ayudante={ayudanteAEvaluar} onClose={() => setAyudanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionAyu} />}
            {idPostulacionDescartar && <ModalDescarte onClose={() => setIdPostulacionDescartar(null)} onConfirm={handleConfirmarDescarte} />}
        </div>
    );
};