/*"use client";

import React, { useState, useMemo } from 'react';
import {
    useCoordinadoresTodos,
    CoordinadorData,
    PostulanteCoordinadorData,
    AyudanteActivoData,
    useEvaluarPostulacion,
    useDescartarPostulacion,
    useEvaluarAyudanteFinal
} from '@/hooks/useCoordinadores';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';
import { Filter, Search, Users, CheckSquare, Square } from 'lucide-react';

import { ModalDescarte } from '../Coordinador/ModalDescarte';
import { ModalEvaluacionPostulante } from '../Coordinador/ModalEvaluacionPostulante';
import { ModalEvaluacionAyudante } from '../Coordinador/ModalEvaluacionAyudante';
import { ModalVerCurriculum } from '../Coordinador/ModalVerCurriculum';

interface DirectorCoordinacionVistaProps {
    postulantes: PostulanteCoordinadorData[] | undefined;
    ayudantes: AyudanteActivoData[] | undefined;
    loading: boolean;
}

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 text-center">{title}</h3>
        {children}
    </div>
);


export const DirectorCoordinacionVista = ({ postulantes, ayudantes, loading }: DirectorCoordinacionVistaProps) => {
    //hooks
    const { data: coordinadores } = useCoordinadoresTodos();
    const { data: listaAsignaturas } = useTodasAsignaturas();

    const [vista, setVista] = useState<'Postulantes' | 'Ayudantes'>('Postulantes');
    const isPostulante = vista === 'Postulantes';

    const [rutVerCurriculum, setRutVerCurriculum ] = useState<string | null>(null);
    const [postulanteAEvaluar, setPostulanteAEvaluar] = useState<PostulanteCoordinadorData | null>(null);
    const [ayudanteAEvaluar, setAyudanteAEvaluar] = useState<AyudanteActivoData | null>(null);
    const [idPostulacionDescartar, setIdPostulacionDescartar] = useState<number | null>(null);

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
        if (!coordinadores)
        {
            return [];
        }
        if (!busquedaCoordinador)
        {
            return coordinadores;
        }

        const term = busquedaCoordinador.toLowerCase();
        return coordinadores.filter(c => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(term) ||
            c.rut.includes(term)
        );
    }, [coordinadores, busquedaCoordinador])
    
    //logica de datos filtrados
    const dataFiltrada = useMemo(() => {
        const listaBase = isPostulante ? (postulantes || []) : (ayudantes || []);

        return listaBase.filter((item: any) => {
            //filtro de texto para nombre o rut del alumno
            const matchTexto = item.alumno.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
                                item.rut_alumno.toLowerCase().includes(busqueda.toLowerCase());
            //filtro de asignaturas
            const idAsigStr = isPostulante ? item.id_asignatura.toString() : item.asignatura.toString(); // para ajustar la asignatura a mostrar dependiendo si viene Id o nombre en ayudantes
            const matchAsignatura = filtroAsignatura ? idAsigStr === filtroAsignatura : true;

            //filtro de estado para postulantes
            let matchEstado = true;
            if (isPostulante && filtroEstado)
            {
                const esEvaluado = item.puntuacion_etapa2 != null && item.puntuacion_etapa2 > 0;
                matchEstado = (esEvaluado ? "Evaluado" : "Pendiente") === filtroEstado;
            }

            //filtro para seleccionar multiples coordinadores
            let matchCoordinador = true;
            if(coordinadoresSeleccionados.length > 0)
            {
                const rutCoordItem = item.rut_coordinador || item.coordinador.rut;
                if(rutCoordItem){
                    matchCoordinador = coordinadoresSeleccionados.includes(rutCoordItem);
                }
            }

            return matchTexto && matchAsignatura && !item.motivo_descarte && matchEstado && matchCoordinador;
        });
    }, [isPostulante, postulantes, ayudantes, busqueda, filtroAsignatura, filtroEstado, coordinadoresSeleccionados]);


    //handlers
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
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-[1600px] mx-auto w-full animate-in fade-in">
            
            <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                     <div className="flex bg-gray-100 rounded-lg p-1 w-full">
                        <button 
                            onClick={() => setVista('Postulantes')} 
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isPostulante ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Postulantes
                        </button>
                        <button 
                            onClick={() => setVista('Ayudantes')} 
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isPostulante ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Ayudantes
                        </button>
                    </div>
                </div>

                <div className="bg-gray-100 rounded-xl p-5 border border-gray-200 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 text-gray-700 border-b border-gray-300 pb-2">
                        <Users className="w-5 h-5" />
                        <h3 className="font-bold text-base">Filtrar Coordinadores</h3>
                    </div>
                    
                    <div className="relative mb-3">
                        <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Buscar nombre..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-black shadow-sm"
                            value={busquedaCoordinador}
                            onChange={(e) => setBusquedaCoordinador(e.target.value)}
                        />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {coordinadoresVisibles.length > 0 ? (
                            coordinadoresVisibles.map((coord: CoordinadorData) => {
                                const isSelected = coordinadoresSeleccionados.includes(coord.rut);
                                return (
                                    <button
                                        key={coord.rut}
                                        onClick={() => toggleCoordinador(coord.rut)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors text-left group ${isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200 text-gray-700'}`}
                                    >
                                        <div className={`flex-shrink-0 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                             {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                        </div>
                                        <span className="truncate">{coord.nombres} {coord.apellidos}</span>
                                    </button>
                                );
                            })
                        ) : (
                             <p className="text-xs text-gray-400 text-center py-4 italic">
                                {coordinadores ? "No se encontraron coordinadores." : "Cargando..."}
                             </p>
                        )}
                    </div>

                    {coordinadoresSeleccionados.length > 0 && (
                        <button 
                            onClick={() => setCoordinadoresSeleccionados([])}
                            className="mt-3 text-xs text-blue-600 hover:underline w-full text-center font-medium"
                        >
                            Limpiar selección ({coordinadoresSeleccionados.length})
                        </button>
                    )}
                </div>

                <div className="bg-gray-100 rounded-xl p-5 border border-gray-200 shadow-inner">
                     <div className="flex items-center gap-2 mb-4 text-gray-700 border-b border-gray-300 pb-2">
                        <Filter className="w-5 h-5" />
                        <h3 className="font-bold text-base">Filtros Datos</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar Alumno</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Nombre o RUT..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 text-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asignatura</label>
                            <select 
                                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white text-black"
                                value={filtroAsignatura}
                                onChange={(e) => setFiltroAsignatura(e.target.value)}
                            >
                                <option value="">Todas</option>
                                {Object.entries(mapAsig).map(([id, nombre]) => (
                                    <option key={id} value={id}>{nombre}</option>
                                ))}
                            </select>
                        </div>
                        
                        {isPostulante && (
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado Evaluación</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white text-black"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Evaluado">Evaluado</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full">
                <InfoCard title={isPostulante ? "Vista Global de Postulantes" : "Vista Global de Ayudantes"}>
                    {loading ? (
                         <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                            <p className="text-gray-500">Cargando información del departamento...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-gray-700">
                                <thead className="bg-gray-50 text-gray-600 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="p-3 text-left">RUT Alumno</th>
                                        <th className="p-3 text-left">Nombre</th>
                                        <th className="p-3 text-center">Asignatura</th>
                                        <th className="p-3 text-center">Coordinador</th>
                                        <th className="p-3 text-center">{isPostulante ? 'Puntaje E1' : 'Nota'}</th>
                                        {isPostulante && <th className="p-3 text-center">Puntaje E2</th>}
                                        <th className="p-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dataFiltrada.map((item: any) => {
                                        const nombreAsig = isPostulante ? (mapAsig[item.id_asignatura] || item.id_asignatura) : item.asignatura;
                                        const coordNombre = item.nombre_coordinador || "No asignado"; 

                                        return (
                                            <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{item.rut_alumno}</td>
                                                <td className="p-3">{item.alumno.nombres} {item.alumno.apellidos}</td>
                                                <td className="p-3 text-center text-xs text-gray-600">{nombreAsig}</td>
                                                <td className="p-3 text-center text-xs text-blue-600 font-semibold">{coordNombre}</td>
                                                
                                                {isPostulante ? (
                                                     <>
                                                        <td className="p-3 text-center font-bold text-gray-700">{item.puntuacion_etapa1}</td>
                                                        <td className="p-3 text-center font-bold text-blue-600">{item.puntuacion_etapa2 || '-'}</td>
                                                     </>
                                                ) : (
                                                    <td className="p-3 text-center font-bold text-gray-700">
                                                        {item.evaluacion ? (item.evaluacion / 10).toFixed(1) : '-'}
                                                    </td>
                                                )}

                                                <td className="p-3 flex justify-center gap-2">
                                                    {isPostulante ? (
                                                        <>
                                                            <button 
                                                                onClick={() => setPostulanteAEvaluar(item)}
                                                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium"
                                                            >
                                                                Evaluar
                                                            </button>
                                                            <button 
                                                                onClick={() => setRutVerCurriculum(item.rut_alumno)}
                                                                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs font-medium"
                                                            >
                                                                CV
                                                            </button>
                                                            <button 
                                                                onClick={() => setIdPostulacionDescartar(item.id)}
                                                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setAyudanteAEvaluar(item)}
                                                            className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium"
                                                        >
                                                            Calificar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {dataFiltrada.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                                                No se encontraron registros con los filtros actuales.
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
            {postulanteAEvaluar && <ModalEvaluacionPostulante postulante={postulanteAEvaluar} onClose={() => setPostulanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionPost} />}
            {ayudanteAEvaluar && <ModalEvaluacionAyudante ayudante={ayudanteAEvaluar} onClose={() => setAyudanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionAyu} />}
            {idPostulacionDescartar && <ModalDescarte onClose={() => setIdPostulacionDescartar(null)} onConfirm={handleConfirmarDescarte} />}
        </div>
    );
};*/

"use client";

import React, { useState, useMemo } from 'react';
import {
    useCoordinadoresTodos,
    CoordinadorData,
    PostulanteCoordinadorData,
    AyudanteActivoData,
    useEvaluarPostulacion,
    useDescartarPostulacion,
    useEvaluarAyudanteFinal
} from '@/hooks/useCoordinadores';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';
import { Filter, Search, Users, CheckSquare, Square, ChevronDown } from 'lucide-react';

import { ModalDescarte } from '../Coordinador/ModalDescarte';
import { ModalEvaluacionPostulante } from '../Coordinador/ModalEvaluacionPostulante';
import { ModalEvaluacionAyudante } from '../Coordinador/ModalEvaluacionAyudante';
import { ModalVerCurriculum } from '../Coordinador/ModalVerCurriculum';

interface DirectorCoordinacionVistaProps {
    postulantes: PostulanteCoordinadorData[] | undefined;
    ayudantes: AyudanteActivoData[] | undefined;
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
    const [postulanteAEvaluar, setPostulanteAEvaluar] = useState<PostulanteCoordinadorData | null>(null);
    const [ayudanteAEvaluar, setAyudanteAEvaluar] = useState<AyudanteActivoData | null>(null);
    const [idPostulacionDescartar, setIdPostulacionDescartar] = useState<number | null>(null);

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
        return coordinadores.filter(c => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(term) ||
            c.rut.includes(term)
        );
    }, [coordinadores, busquedaCoordinador])
    
    //logica de datos filtrados
    const dataFiltrada = useMemo(() => {
        const listaBase = isPostulante ? (postulantes || []) : (ayudantes || []);

        return listaBase.filter((item: any) => {
            const matchTexto = item.alumno.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
                                item.rut_alumno.toLowerCase().includes(busqueda.toLowerCase());
            
            const idAsigStr = isPostulante ? item.id_asignatura.toString() : item.asignatura.toString(); 
            const matchAsignatura = filtroAsignatura ? idAsigStr === filtroAsignatura : true;

            let matchEstado = true;
            if (isPostulante && filtroEstado)
            {
                const esEvaluado = item.puntuacion_etapa2 != null && item.puntuacion_etapa2 > 0;
                matchEstado = (esEvaluado ? "Evaluado" : "Pendiente") === filtroEstado;
            }

            let matchCoordinador = true;
            if(coordinadoresSeleccionados.length > 0)
            {
                const rutCoordItem = item.rut_coordinador || item.coordinador.rut;
                if(rutCoordItem){
                    matchCoordinador = coordinadoresSeleccionados.includes(rutCoordItem);
                }
            }

            return matchTexto && matchAsignatura && !item.motivo_descarte && matchEstado && matchCoordinador;
        });
    }, [isPostulante, postulantes, ayudantes, busqueda, filtroAsignatura, filtroEstado, coordinadoresSeleccionados]);


    //handlers
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
                        
                        {isPostulante && (
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Estado</label>
                                <div className="relative">
                                    <select 
                                        className="w-full appearance-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-gray-800 pr-8"
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value)}
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Evaluado">Evaluado</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-w-0">
                <InfoCard title={isPostulante ? "Vista Global de Postulantes" : "Vista Global de Ayudantes"}>
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
                                        
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[12%]">RUT</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[18%]">Nombre Alumno</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[14%]">Asignatura</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[14%]">Coordinador</th>
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[10%]">{isPostulante ? 'Puntaje 1' : 'Nota'}</th>
                                        {isPostulante && <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[10%]">Puntaje 2</th>}
                                        <th className="px-2 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[22%]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {dataFiltrada.map((item: any) => {
                                        const nombreAsig = isPostulante ? (mapAsig[item.id_asignatura] || item.id_asignatura) : item.asignatura;
                                        const coordNombre = item.nombre_coordinador || "No asignado";
                                        const esEvaluado = isPostulante && item.puntuacion_etapa2 != null && item.puntuacion_etapa2 > 0;

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-2 py-4 text-sm font-medium text-gray-900 align-middle break-words">
                                                    {item.rut_alumno}
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
                                                    
                                                    <div className="flex justify-center items-center gap-1 flex-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                                                        {isPostulante ? (
                                                            <>
                                                                <button
                                                                    onClick={() => setPostulanteAEvaluar(item)}
                                                                    // Reduje px-3 a px-2 para ahorrar espacio horizontal
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
                                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-xs font-semibold shadow-sm whitespace-nowrap"
                                                            >
                                                                Calificar
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
            {postulanteAEvaluar && <ModalEvaluacionPostulante postulante={postulanteAEvaluar} onClose={() => setPostulanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionPost} />}
            {ayudanteAEvaluar && <ModalEvaluacionAyudante ayudante={ayudanteAEvaluar} onClose={() => setAyudanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionAyu} />}
            {idPostulacionDescartar && <ModalDescarte onClose={() => setIdPostulacionDescartar(null)} onConfirm={handleConfirmarDescarte} />}
        </div>
    );
};