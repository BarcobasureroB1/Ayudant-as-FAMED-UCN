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
import { Filter, Search, Users, CheckSquare, Square, ChevronDown, Eye } from 'lucide-react';

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

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50/50 border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div className="p-0">
            {children}
        </div>
    </div>
);


export const DirectorCoordinacionVista = ({ postulantes, ayudantes, loading }: DirectorCoordinacionVistaProps) => {
    //hooks
    const { data: coordinadores } = useCoordinadoresTodos();
    const { data: listaAsignaturas } = useTodasAsignaturas();

    const [vista, setVista] = useState<'Postulantes' | 'Ayudantes'>('Postulantes');
    const isPostulante = vista === 'Postulantes';

    const [rutVerCurriculum, setRutVerCurriculum ] = useState<string | null>(null);
    const [postulanteVerDetalle, setPostulanteVerDetalle] = useState<PostulanteCoordinador | null>(null);
    const [postulanteAEvaluar, setPostulanteAEvaluar] = useState<PostulanteCoordinador | null>(null);
    const [ayudanteAEvaluar, setAyudanteAEvaluar] = useState<AyudanteCoordinador | null>(null);
    const [idPostulacionDescartar, setIdPostulacionDescartar] = useState<number | null>(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPagina, setItemsPagina] = useState(10);

    //hooks de llamados o mutaciones
    const evaluarPostulacion = useEvaluarPostulacion();
    const descartarPostulacion = useDescartarPostulacion();
    const evaluarAyudante = useEvaluarAyudanteFinal();


    //filtros
    const [busqueda, setBusqueda] = useState("");
    const [filtroAsignatura, setFiltroAsignatura] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    //filtro coordinadores
    const [coordinadoresSeleccionados, setCoordinadoresSeleccionados] = useState<string[]>([]);
    const [busquedaCoordinador, setBusquedaCoordinador] = useState("");


    //mapeo de asignaturas (id a Nombre)
    const mapAsig = useMemo(() => {
        if (!listaAsignaturas) {
            return {};
        }
        const map: Record<number, string> = {};
        if (Array.isArray(listaAsignaturas)) {
            listaAsignaturas.forEach((asig: any) => {map[asig.id] = asig.nombre; });
        }
        return map;
    }, [listaAsignaturas]);

    //filtrar lista de coordinadores a mostrar
    const coordinadoresVisibles = useMemo(() => {
        if (!coordinadores) return [];
        if (!busquedaCoordinador) return coordinadores;

        const term = busquedaCoordinador.toLowerCase();
        return coordinadores.filter((c: any) => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(term) ||
            c.rut.includes(term)
        );
    }, [coordinadores, busquedaCoordinador])
    
    //logica de datos filtrados
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


    //handlers
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
        }
    };

    const toggleCoordinador = (rut: string) => {
        setCoordinadoresSeleccionados(prev => 
            prev.includes(rut)
                ? prev.filter(r => r !== rut)
                : [...prev, rut]
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
            setIdPostulacionDescartar(null);
        }
    };

    const handleConfirmarEvaluacionAyu = async (nota: number) => {
        if (ayudanteAEvaluar) {
            await evaluarAyudante.mutateAsync({ id_ayudantia: ayudanteAEvaluar.id, evaluacion: nota });
            setAyudanteAEvaluar(null);
        }
    };


    //render
    return (
        <div className="flex flex-col xl:flex-row gap-8 items-start justify-center max-w-[1600px] mx-auto w-full animate-in fade-in pb-10">
            
            <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 flex">
                    <button 
                        onClick={() => setVista('Postulantes')} 
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isPostulante ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        Postulantes
                    </button>
                    <button 
                        onClick={() => setVista('Ayudantes')} 
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${!isPostulante ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                        Ayudantes
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Users className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Coordinadores</h3>
                        </div>
                        {coordinadoresSeleccionados.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {coordinadoresSeleccionados.length}
                            </span>
                        )}
                    </div>
                    
                    <div className="p-3 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Buscar coordinador..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-800"
                                value={busquedaCoordinador}
                                onChange={(e) => setBusquedaCoordinador(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-[160px] overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                        {coordinadoresVisibles.length > 0 ? (
                            coordinadoresVisibles.map((coord: CoordinadorData) => {
                                const isSelected = coordinadoresSeleccionados.includes(coord.rut);
                                return (
                                    <button
                                        key={coord.rut}
                                        onClick={() => toggleCoordinador(coord.rut)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left hover:bg-gray-50 ${isSelected ? 'bg-blue-50/60' : ''}`}
                                    >
                                        <div className={`flex-shrink-0 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                                             {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`truncate font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                                                {coord.nombres} {coord.apellidos}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                             <div className="p-6 text-center">
                                <p className="text-xs text-gray-400 italic">No se encontraron resultados</p>
                             </div>
                        )}
                    </div>

                    {coordinadoresSeleccionados.length > 0 && (
                        <div className="p-2 bg-gray-50 border-t border-gray-100">
                            <button 
                                onClick={() => setCoordinadoresSeleccionados([])}
                                className="w-full py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                                Limpiar selección
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                     <div className="flex items-center gap-2 mb-5 text-gray-800 border-b border-gray-100 pb-3">
                        <Filter className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Filtros de Datos</h3>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Buscar Alumno</label>
                            <input
                                type="text"
                                placeholder="Nombre o RUT..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Asignatura</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 pr-8"
                                    value={filtroAsignatura}
                                    onChange={(e) => setFiltroAsignatura(e.target.value)}
                                >
                                    <option value="">Todas las asignaturas</option>
                                    {Object.entries(mapAsig).map(([id, nombre]) => (
                                        <option key={id} value={id}>{nombre}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Estado</label>
                            <div className="relative">
                                <select 
                                    className="w-full appearance-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 pr-8"
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
                                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-w-0">
                <InfoCard title={isPostulante ? "Vista Global de Postulantes" : "Vista Global de Ayudantes"}>
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-end items-center bg-white">
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

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Cargando información...</p>
                        </div>
                    ) : (
                        <div className="w-full">
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-gray-200">
                                        
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[10%]">RUT</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[12%]">Nombre Alumno</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[14%]">Asignatura</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%]">Coordinador</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[8%]">{isPostulante ? 'Puntaje 1' : 'Nota'}</th>
                                        {isPostulante && <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[7%]">Puntaje 2</th>}
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[11%]">Estado</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[20%]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {dataPaginada.map((item: any, index: number) => {
                                        const nombreAsig = isPostulante 
                                            ? (mapAsig[item.id_asignatura] || item.id_asignatura) 
                                            : item.asignatura;
                                        
                                        const coordNombre = item.coordinador 
                                            ? `${item.coordinador.nombres} ${item.coordinador.apellidos}` 
                                            : "No asignado";

                                        const esEvaluadoPostulante = isPostulante && item.puntuacion_etapa2 != null && item.puntuacion_etapa2 > 0;
                                        const esEvaluadoAyudante = !isPostulante && item.evaluacion != null && item.evaluacion > 0;
                                        const esEvaluado = isPostulante ? esEvaluadoPostulante : esEvaluadoAyudante;

                                        const rutAlumno = isPostulante ? item.rut_alumno : item.alumno.rut;

                                        const keyUnica = `${item.id}-${rutAlumno}-${isPostulante ? item.id_asignatura : item.asignatura}-${index}`;

                                        return (
                                            <tr key={keyUnica} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-2 py-4 text-sm font-medium text-gray-900 align-middle break-words">
                                                    {rutAlumno}
                                                </td>
                                                <td className="px-2 py-4 text-sm text-gray-700 font-medium align-middle break-words">
                                                    {item.alumno.nombres} {item.alumno.apellidos}
                                                </td>
                                                <td className="px-2 py-4 text-sm text-gray-600 align-middle break-words">
                                                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700 break-words w-full text-center">
                                                        {nombreAsig}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4 text-sm text-gray-500 align-middle break-words">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                                        <span className="text-xs break-words">{coordNombre}</span>
                                                    </div>
                                                </td>

                                                {isPostulante ? (
                                                    <>
                                                        <td className="px-2 py-4 text-center align-middle">
                                                            <span className="font-bold text-gray-800">{item.puntuacion_etapa1}</span>
                                                        </td>
                                                        <td className="px-2 py-4 text-center align-middle">
                                                            {item.puntuacion_etapa2 ? (
                                                                <span className="font-bold text-blue-600">{item.puntuacion_etapa2}</span>
                                                            ) : (
                                                                <span className="text-gray-300">-</span>
                                                            )}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <td className="px-2 py-4 text-center font-bold text-gray-800 align-middle">
                                                        {item.evaluacion ? (item.evaluacion / 10).toFixed(1) : '-'}
                                                    </td>
                                                )}

                                                <td className="px-2 py-4 text-center align-middle">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${esEvaluado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {isPostulante 
                                                            ? (esEvaluado ? 'Evaluado' : 'Pendiente')
                                                            : (esEvaluado ? 'Calificado' : 'Activo')
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-2 py-4 text-center align-middle">
                                                    
                                                    <div className="flex justify-center items-center gap-1 flex-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                                                        {isPostulante ? (
                                                            <>
                                                                <button
                                                                    onClick={() => setPostulanteVerDetalle(item)}
                                                                    className="px-2 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:border-gray-300 text-xs font-semibold shadow-sm whitespace-nowrap flex items-center justify-center"
                                                                    title="Ver Detalle Postulación"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setPostulanteAEvaluar(item)}
                                                                    className={`px-2 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all whitespace-nowrap ${esEvaluado ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                                >
                                                                    {esEvaluado ? 'Editar' : 'Evaluar'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setRutVerCurriculum(item.rut_alumno)}
                                                                    className="px-2 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:border-gray-300 text-xs font-semibold shadow-sm whitespace-nowrap"
                                                                >
                                                                    CV
                                                                </button>
                                                                <button
                                                                    onClick={() => setIdPostulacionDescartar(item.id)}
                                                                    className="px-2 py-1.5 bg-white border border-red-100 text-red-500 rounded-md hover:bg-red-50 text-xs font-semibold shadow-sm hover:border-red-200 flex items-center justify-center"
                                                                    title="Descartar"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => setAyudanteAEvaluar(item)}
                                                                className={`px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm whitespace-nowrap transition-colors ${
                                                                    esEvaluado 
                                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                }`}
                                                            >
                                                                {esEvaluado ? 'Editar Nota' : 'Calificar'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {dataFiltrada.length === 0 && (
                                        <tr>
                                            <td colSpan={isPostulante ? 7 : 6} className="px-6 py-12 text-center text-gray-400 text-sm bg-white">
                                                No se encontraron registros que coincidan con los filtros.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </InfoCard>
            </div>

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