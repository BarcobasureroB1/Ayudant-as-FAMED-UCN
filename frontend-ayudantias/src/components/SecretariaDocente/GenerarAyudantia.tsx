"use client"

import React, { useState, useMemo, useEffect } from 'react';
import {
    useCoordinadoresTodos,
    CoordinadorData,
    PostulanteCoordinador,
    usePostulacionesCoordinador,
    useDescartarPostulacion
} from '@/hooks/useCoordinadores';

import { useTodasAyudantias } from '@/hooks/useAyudantia';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';

import { ModalCrearAyudantia } from './ModalCrearAyudantia';
import { ModalDetallePostulacion } from './ModalDetallePostulacion';
import { ModalDescarte } from '../Coordinador/ModalDescarte';
import { ModalVerCurriculum } from '../Coordinador/ModalVerCurriculum';

import { 
    Search, Users, CheckSquare, Square, Filter, ChevronDown, 
    UserCheck, FileText, Eye, XCircle, CheckCircle
} from 'lucide-react';


interface Props {
    rutSecretaria: string; 
    onBack: () => void;
}

export default function GenerarAyudantia({ rutSecretaria }: Props) {


    const { data: coordinadores } = useCoordinadoresTodos();    
    const { data: postulantes, isLoading: cargaPostulantes } = usePostulacionesCoordinador();
    const { data: listaAyudantias } = useTodasAyudantias();
    const { data: listaAsignaturas } = useTodasAsignaturas();
    const descartarPostulacion = useDescartarPostulacion();

    // Filtros
    const [busquedaAlumno, setBusquedaAlumno ] = useState("");
    const [busquedaCoordinador, setBusquedaCoordinador] = useState("");
    const [coordinadoresSeleccionados, setCoordinadoresSeleccionados] = useState<string[]>([]);
    const [filtroAsignatura, setFiltroAsignatura ] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [ordenTotal, setOrdenTotal] = useState<"desc" | "asc" | "">("");

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPagina, setItemsPagina] = useState(10);

    // Modales
    const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<PostulanteCoordinador | null>(null);
    const [modalAyudantiaAbierto, setModalAyudantiaAbierto] = useState(false);
    const [rutVerCurriculum, setRutVerCurriculum] = useState<string | null>(null);
    const [idPostulacionDescartar, setIdPostulacionDescartar] = useState<number | null>(null);
    const [postulanteVerDetalle, setPostulanteVerDetalle] = useState<any | null>(null);

    const mapAsig = useMemo(() => {
        if (!listaAsignaturas) return {};
        const map: Record<number, string> = {};
        if (Array.isArray(listaAsignaturas)) {
            listaAsignaturas.forEach((asig: any) => { map[asig.id] = asig.nombre; });
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
    }, [coordinadores, busquedaCoordinador]);


    const postulantesFiltrados = useMemo(() => {
        if (!postulantes) return [];

        const filtrados = postulantes.filter((item: any) => {
            const matchTexto = item.alumno.nombres.toLowerCase().includes(busquedaAlumno.toLowerCase()) || 
                               item.rut_alumno.toLowerCase().includes(busquedaAlumno.toLowerCase());
            
            const idAsigStr = item.id_asignatura.toString();
            const matchAsignatura = filtroAsignatura ? idAsigStr === filtroAsignatura : true;

            let matchCoordinador = true;
            if (coordinadoresSeleccionados.length > 0) {
                const rutCoordItem = item.coordinador?.rut;
                if (rutCoordItem) {
                    matchCoordinador = coordinadoresSeleccionados.includes(rutCoordItem);
                } else {
                    matchCoordinador = false;
                }
            }

            let matchEstado = true;
            
            const yaTieneAyudantia = listaAyudantias?.some((ayudantia: any) => 
                ayudantia.alumno.rut === item.rut_alumno && 
                ayudantia.asignatura.id === item.id_asignatura
            );

            if (filtroEstado) {
                if (filtroEstado === "Seleccionado") matchEstado = !!yaTieneAyudantia;
                else if (filtroEstado === "Pendiente") matchEstado = !yaTieneAyudantia;
            }

            const noDescartado = !item.motivo_descarte;

            return matchTexto && matchAsignatura && matchCoordinador && noDescartado && matchEstado;
        });

        if (ordenTotal) {
            filtrados.sort((a: any, b: any) => {
                const totalA = (a.puntuacion_etapa1 || 0) + (a.puntuacion_etapa2 || 0);
                const totalB = (b.puntuacion_etapa1 || 0) + (b.puntuacion_etapa2 || 0);
                return ordenTotal === 'desc' ? totalB - totalA : totalA - totalB; 
            });
        }
        return filtrados;

    }, [postulantes, busquedaAlumno, filtroAsignatura, coordinadoresSeleccionados, ordenTotal, filtroEstado, listaAyudantias]);

    // Lógica Paginación
    const totalPaginas = Math.ceil(postulantesFiltrados.length / (itemsPagina || 1));
    const indiceInicio = (paginaActual - 1) * (itemsPagina || 1);
    const indiceFin = indiceInicio + (itemsPagina || 1);
    const dataPaginada = postulantesFiltrados.slice(indiceInicio, indiceFin);

    const handlePaginaChange = (nuevaPagina: number) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) setPaginaActual(nuevaPagina);
    };

    const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = Number(e.target.value);
        if (valor > 0) { setItemsPagina(valor); setPaginaActual(1); }
    };
    
    useEffect(() => { setPaginaActual(1); }, [busquedaAlumno, filtroAsignatura, coordinadoresSeleccionados, ordenTotal, filtroEstado]);


    const toggleCoordinador = (rut: string) => {
        setCoordinadoresSeleccionados(prev => prev.includes(rut) ? prev.filter(r => r !== rut) : [...prev, rut]);
    };

    const handleFormalizar = (p: PostulanteCoordinador) => {
        setPostulanteSeleccionado(p);
        setModalAyudantiaAbierto(true);
    };

    const handleConfirmarDescarte = async (motivo: string) => {
        if (idPostulacionDescartar) {
            try {
                await descartarPostulacion.mutateAsync({
                    id_postulacion: idPostulacionDescartar,
                    motivo_descarte: motivo,
                    fecha_descarte: new Date().toISOString().split('T')[0],
                    rechazada_por_jefatura: true
                });
            } catch (error) {
                console.error("Error al descartar ", error);
            } finally {
                setIdPostulacionDescartar(null);
            }
        }
    }

return (
        <div className="space-y-6 animate-in fade-in pb-10">
            
            <ModalCrearAyudantia 
                abierto={modalAyudantiaAbierto}
                onClose={() => setModalAyudantiaAbierto(false)}
                postulante={postulanteSeleccionado}
                rutSecretaria={rutSecretaria}
                nombreAsignatura={postulanteSeleccionado ? (mapAsig[postulanteSeleccionado.id_asignatura] || `ID: ${postulanteSeleccionado.id_asignatura}`) : ''}
            />

            {postulanteVerDetalle && (
                <ModalDetallePostulacion 
                    postulante={postulanteVerDetalle} 
                    onClose={() => setPostulanteVerDetalle(null)} 
                />
            )}

            {rutVerCurriculum && (
                <ModalVerCurriculum 
                    rut={rutVerCurriculum} 
                    onClose={() => setRutVerCurriculum(null)} 
                />
            )}

            {idPostulacionDescartar && (
                <ModalDescarte 
                    onClose={() => setIdPostulacionDescartar(null)} 
                    onConfirm={handleConfirmarDescarte} 
                />
            )}

            <div className="flex flex-col xl:flex-row gap-4 items-start justify-center w-full max-w-full mx-auto px-4">
                
                <div className="w-full xl:w-72 flex-shrink-0 space-y-4">
                    
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
                        
                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar divide-y divide-gray-100">
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
                        <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2">
                            <Filter className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Filtros Datos</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Buscar Alumno</label>
                                <input
                                    type="text"
                                    placeholder="Nombre o RUT..."
                                    value={busquedaAlumno}
                                    onChange={(e) => setBusquedaAlumno(e.target.value)}
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
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Seleccionado">Seleccionado</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Orden por Puntaje Total</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="ordenTotal" 
                                            className="text-blue-600 focus:ring-blue-500"
                                            checked={ordenTotal === 'desc'}
                                            onChange={() => setOrdenTotal('desc')}
                                        />
                                        Mayor a menor
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="ordenTotal" 
                                            className="text-blue-600 focus:ring-blue-500"
                                            checked={ordenTotal === 'asc'}
                                            onChange={() => setOrdenTotal('asc')}
                                        />
                                        Menor a mayor
                                    </label>
                                    {ordenTotal && (
                                        <button 
                                            onClick={() => setOrdenTotal("")}
                                            className="text-xs text-blue-500 hover:underline pl-5"
                                        >
                                            Limpiar orden
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>

                {/* Columna der: Tabla con Paginación */}
                <div className="flex-1 w-full min-w-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        
                        <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Postulantes Disponibles</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Seleccione un postulante para formalizar su ayudantía.</p>
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

                        {cargaPostulantes ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-500 font-medium">Cargando postulantes...</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead className="bg-gray-50 text-gray-600 uppercase font-medium text-xs tracking-wider">
                                        <tr>
                                            <th className="px-2 py-4 w-[10%]">RUT</th>
                                            <th className="px-2 py-4 w-[15%]">Alumno</th>
                                            <th className="px-2 py-4 text-center w-[14%]">Asignatura</th>
                                            <th className="px-2 py-4 text-center w-[14%]">Coordinador</th>
                                            <th className="px-1 py-4 text-center w-[5%]">P. E1</th>
                                            <th className="px-1 py-4 text-center w-[5%]">P. E2</th>
                                            <th className="px-1 py-4 text-center w-[5%]">Total</th>
                                            <th className="px-2 py-4 text-center w-[10%]">Estado</th>
                                            <th className="px-2 py-4 text-center w-[20%]">Acciones</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {dataPaginada.length > 0 ? (
                                            dataPaginada.map((item: any, index:number) => {
                                                const nombreAsig = mapAsig[item.id_asignatura] || item.id_asignatura;
                                                const coordNombre = item.coordinador 
                                                    ? `${item.coordinador.nombres} ${item.coordinador.apellidos}` 
                                                    : "N/A";
                                                
                                                const p1 = item.puntuacion_etapa1 || 0;
                                                const p2 = item.puntuacion_etapa2;
                                                const total = p1 + (p2 || 0);

                                                const yaTieneAyudantia = listaAyudantias?.some((ayudantia: any) => 
                                                    ayudantia.alumno.rut === item.rut_alumno && 
                                                    ayudantia.asignatura.id === item.id_asignatura
                                                );

                                                const keyUnica = `${item.id}-${item.rut_alumno}-${item.id_asignatura}-${index}`;

                                                return (
                                                    <tr key={keyUnica} className="hover:bg-gray-50 transition-colors group">
                                                    {/* 1. RUT */}
                                                    <td className="px-2 py-4 text-sm font-medium text-gray-900 font-mono">
                                                        {item.rut_alumno}
                                                    </td>

                                                    {/* 2. ALUMNO */}
                                                    <td className="px-2 py-4 text-sm text-gray-700 font-medium break-words whitespace-normal">
                                                        {item.alumno.nombres} {item.alumno.apellidos}
                                                    </td>

                                                    {/* 3. ASIGNATURA */}
                                                    <td className="px-2 py-4 text-center text-sm text-gray-600">
                                                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs truncate whitespace-normal w-full">
                                                            {nombreAsig}
                                                        </span>
                                                    </td>

                                                    <td className="px-2 py-4 text-center text-sm text-gray-500 text-xs break-words whitespace-normal">
                                                        {coordNombre}
                                                    </td>

                                                    <td className="px-1 py-4 text-center text-sm text-gray-600">
                                                        {p1}
                                                    </td>
                                                    <td className="px-1 py-4 text-center text-sm text-gray-600">
                                                        {p2 !== null ? p2 : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td className="px-1 py-4 text-center text-sm">
                                                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                                            {total}
                                                        </span>
                                                    </td>

                                                    <td className="px-2 py-4 text-center">
                                                        {yaTieneAyudantia ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                                Seleccionado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                    
                                                    <td className="px-2 py-4 text-center align-middle">
                                                        <div className="flex flex-wrap items-center justify-center gap-1">
                                                            <button 
                                                                onClick={() => setPostulanteVerDetalle(item)}
                                                                className="p-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200 transition-colors"
                                                                title="Ver Postulación"
                                                            >
                                                                <Eye size={15} />
                                                            </button>

                                                            <button 
                                                                onClick={() => setRutVerCurriculum(item.rut_alumno)}
                                                                className="p-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                                title="Ver Curriculum"
                                                            >
                                                                <FileText size={15} />
                                                            </button>

                                                            <button 
                                                                onClick={() => !yaTieneAyudantia && setIdPostulacionDescartar(item.id)}
                                                                disabled={yaTieneAyudantia}
                                                                className={`p-1 rounded-md border transition-colors ${yaTieneAyudantia ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'}`}
                                                                title="Descartar"
                                                            >
                                                                <XCircle size={15} />
                                                            </button>

                                                            {yaTieneAyudantia ? (
                                                                <button
                                                                    disabled
                                                                    className="flex items-center gap-1 bg-green-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold shadow-sm opacity-90 cursor-default whitespace-nowrap"
                                                                >
                                                                    <CheckCircle size={14}/>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleFormalizar(item)}
                                                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                                                                    title="Formalizar Ayudantía"
                                                                >
                                                                    <UserCheck size={14}/> Escoger
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="bg-white">
                                                    <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400 text-sm py-12">
                                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                            <Search size={40} className="text-gray-300"/>
                                                        </div>
                                                        <p className="font-medium text-gray-500">No se encontraron registros que coincidan con los filtros.</p>
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
            </div>
        </div>
    );
}