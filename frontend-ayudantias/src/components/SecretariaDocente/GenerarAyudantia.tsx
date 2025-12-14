"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { User } from '@/hooks/useUserProfile';
import {
    useCoordinadoresTodos,
    CoordinadorData,
    PostulanteCoordinadorData,
    usePostulantesGlobales,
    useDescartarPostulacion
} from '@/hooks/useCoordinadores';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';
import { useSecretariaDocente } from '@/hooks/useUsuarios';

import { ModalSeleccionarSecretariaAdmin } from './ModalSeleccionarSecretariaAdmin';
import { ModalCrearAyudantia } from './ModalCrearAyudantia';


import { ModalDetallePostulacion } from './ModalDetallePostulacion';
import { ModalDescarte } from '../Coordinador/ModalDescarte';
import { ModalVerCurriculum } from '../Coordinador/ModalVerCurriculum';


import { 
    Search, Users, CheckSquare, Square, Filter, ChevronDown, 
    Briefcase, RefreshCw, UserCheck, FileText, Eye, XCircle 
} from 'lucide-react';


interface Props {
    user: User;
    onBack: () => void;
}

export default function GenerarAyudantia({ user, onBack }: Props) {

    const { data: listaSecretarias, isLoading: cargaSecretarias } = useSecretariaDocente();
    const [rutSecretariaSeleccionada, setRutSecretariaSeleccionada] = useState<string>("");
    const [nombreSecretariaSeleccionada, setNombreSecretariaSeleccionada] = useState<string>("");
    const [modalSecAbierto, setModalSecAbierto] = useState(false);

    useEffect(() => {
        if (user.tipo === 'secretaria_docente' || user.tipo === 'secretaria') {
            setRutSecretariaSeleccionada(user.rut);
            setNombreSecretariaSeleccionada(`${user.nombres} ${user.apellidos}`);
        } else if (user.tipo === 'admin' && !rutSecretariaSeleccionada) {
            setModalSecAbierto(true);
        }
    }, [user, rutSecretariaSeleccionada]);

    const { data: coordinadores } = useCoordinadoresTodos();    
    const { data: postulantes, isLoading: cargaPostulantes } = usePostulantesGlobales();
    const { data: listaAsignaturas } = useTodasAsignaturas();
    const descartarPostulacion = useDescartarPostulacion();

    const [busquedaAlumno, setBusquedaAlumno ] = useState("");
    const [busquedaCoordinador, setBusquedaCoordinador] = useState("");
    const [coordinadoresSeleccionados, setCoordinadoresSeleccionados] = useState<string[]>([]);
    const [filtroAsignatura, setFiltroAsignatura ] = useState("");

    const [ordenTotal, setOrdenTotal] = useState<"desc" | "asc" | "">("");
    const [postulanteSeleccionado, setPostulanteSeleccionado] = useState<PostulanteCoordinadorData | null>(null);
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
        return coordinadores.filter(c => 
            `${c.nombres} ${c.apellidos}`.toLowerCase().includes(term) ||
            c.rut.includes(term)
        );
    }, [coordinadores, busquedaCoordinador]);


    const postulantesFiltrados = useMemo(() => {
        if (!postulantes) return [];

        const filtrados = postulantes.filter((item: any) => {
            // filtro alumno
            const matchTexto = item.alumno.nombres.toLowerCase().includes(busquedaAlumno.toLowerCase()) || 
                               item.rut_alumno.toLowerCase().includes(busquedaAlumno.toLowerCase());
            
            // filtro Asignatura
            const idAsigStr = item.id_asignatura.toString();
            const matchAsignatura = filtroAsignatura ? idAsigStr === filtroAsignatura : true;

            // filtro Coordinadores Seleccionados
            let matchCoordinador = true;
            if (coordinadoresSeleccionados.length > 0) {
                const rutCoordItem = item.rut_coordinador || (item.coordinador ? item.coordinador.rut : null);
                if (rutCoordItem) {
                    matchCoordinador = coordinadoresSeleccionados.includes(rutCoordItem);
                } else {
                    matchCoordinador = false;
                }
            }

            // solo mostrar los que NO están descartados
            const noDescartado = !item.motivo_descarte;

            return matchTexto && matchAsignatura && matchCoordinador && noDescartado;
        });

        if (ordenTotal)
        {
            filtrados.sort((a: any, b: any) => {
                const totalA = (a.puntuacion_etapa1 || 0) + (a.puntuacion_etapa2 || 0);
                const totalB = (b.puntuacion_etapa1 || 0) + (b.puntuacion_etapa2 || 0);

                if (ordenTotal === 'desc') {
                    return totalB - totalA; // Mayor a menor
                } else {
                    return totalA - totalB; // Menor a mayor
                }
            });
            
        }

        return filtrados;

    }, [postulantes, busquedaAlumno, filtroAsignatura, coordinadoresSeleccionados, ordenTotal]);


    const toggleCoordinador = (rut: string) => {
        setCoordinadoresSeleccionados(prev => 
            prev.includes(rut) ? prev.filter(r => r !== rut) : [...prev, rut]
        );
    };


    const handleSelectSecretaria = (rut: string, nombre: string) => {
        setRutSecretariaSeleccionada(rut);
        setNombreSecretariaSeleccionada(nombre);
        setModalSecAbierto(false);

    };



    const handleFormalizar = (p: PostulanteCoordinadorData) => {
        setPostulanteSeleccionado(p);
        setModalAyudantiaAbierto(true);
    };


    const handleConfirmarDescarte = async (motivo: string) => {
        if (idPostulacionDescartar)
        {
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

    const handleCerrarModalSecretaria = () => {
        if(rutSecretariaSeleccionada)
        {
            setModalSecAbierto(false);
            return;
        }
        
        if (user.tipo === 'admin')
        {
            onBack();
        } else {
            setModalSecAbierto(false);
        }


    }



return (
        <div className="space-y-6 animate-in fade-in pb-10">
            
            <ModalSeleccionarSecretariaAdmin 
                abierto={modalSecAbierto}
                onClose={handleCerrarModalSecretaria}
                onSelect={handleSelectSecretaria}
                secretarias={listaSecretarias}
                isLoading={cargaSecretarias}
            />

            <ModalCrearAyudantia 
                abierto={modalAyudantiaAbierto}
                onClose={() => setModalAyudantiaAbierto(false)}
                postulante={postulanteSeleccionado}
                rutSecretaria={rutSecretariaSeleccionada}
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

            {user.tipo === 'admin' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                            <Briefcase size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-indigo-600 font-bold uppercase">Modo Supervisión: Gestionando como</p>
                            <p className="text-sm font-bold text-gray-800">
                                {nombreSecretariaSeleccionada ? (
                                    <span>
                                        {nombreSecretariaSeleccionada} 
                                        <span className="text-gray-500 font-normal ml-1">
                                            (Rut: {rutSecretariaSeleccionada})
                                        </span>
                                    </span>
                                ) : (
                                    "Seleccione Secretaria..."
                                )}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setModalSecAbierto(true)}
                        className="flex items-center gap-2 bg-white text-indigo-600 px-3 py-1.5 rounded-md text-xs font-medium border border-indigo-200 hover:bg-indigo-50 transition"
                    >
                        <RefreshCw size={14} /> Cambiar
                    </button>
                </div>
            )}

            <div className="flex flex-col xl:flex-row gap-6 items-start justify-center w-full">
                
                <div className="w-full xl:w-80 flex-shrink-0 space-y-4">
                    
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

                <div className="flex-1 w-full min-w-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50/50 border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-bold text-gray-800">Postulantes Disponibles</h3>
                            <p className="text-xs text-gray-500 mt-1">Seleccione un postulante para formalizar su ayudantía.</p>
                        </div>

                        {cargaPostulantes ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-500 font-medium">Cargando postulantes...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-2 py-4 w-[10%]">RUT</th>
                                            
                                            <th className="px-2 py-4 w-[20%]">Alumno</th>
                                            
                                            <th className="px-2 py-4 text-center w-[15%]">Asignatura</th>
                                            
                                            <th className="px-2 py-4 text-center w-[10%]">Coordinador</th>
                                            
                                            <th className="px-1 py-4 text-center w-[5%]">P. E1</th>
                                            <th className="px-1 py-4 text-center w-[5%]">P. E2</th>
                                            <th className="px-1 py-4 text-center w-[5%]">Total</th>
                                            
                                            <th className="px-2 py-4 text-center w-[20%]">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {postulantesFiltrados.map((item: any) => {
                                            const nombreAsig = mapAsig[item.id_asignatura] || item.id_asignatura;
                                            const coordNombre = item.nombre_coordinador || (item.coordinador ? `${item.coordinador.nombres} ${item.coordinador.apellidos}` : "N/A");
                                            
                                            const p1 = item.puntuacion_etapa1 || 0;
                                            const p2 = item.puntuacion_etapa2;
                                            const total = p1 + (p2 || 0);

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-2 py-4 text-sm font-medium text-gray-900 font-mono truncate">
                                                        {item.rut_alumno}
                                                    </td>
                                                    <td className="px-2 py-4 text-sm text-gray-700 font-medium truncate max-w-[150px]" title={`${item.alumno.nombres} ${item.alumno.apellidos}`}>
                                                        {item.alumno.nombres} {item.alumno.apellidos}
                                                    </td>
                                                    <td className="px-2 py-4 text-center text-sm text-gray-600">
                                                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs truncate max-w-[120px]" title={nombreAsig}>
                                                            {nombreAsig}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-4 text-center text-sm text-gray-500 text-xs truncate max-w-[100px]" title={coordNombre}>
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
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button 
                                                                onClick={() => setPostulanteVerDetalle(item)}
                                                                className="p-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 border border-gray-200 transition-colors"
                                                                title="Ver Postulación"
                                                            >
                                                                <Eye size={15} />
                                                            </button>

                                                            <button 
                                                                onClick={() => setRutVerCurriculum(item.rut_alumno)}
                                                                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                                title="Ver Curriculum"
                                                            >
                                                                <FileText size={15} />
                                                            </button>

                                                            <button 
                                                                onClick={() => setIdPostulacionDescartar(item.id)}
                                                                className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 border border-red-200 transition-colors"
                                                                title="Descartar"
                                                            >
                                                                <XCircle size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => handleFormalizar(item)}
                                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                                                                title="Formalizar Ayudantía"
                                                            >
                                                                <UserCheck size={14}/> Escoger
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {postulantesFiltrados.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="bg-white">
                                                    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 text-sm">
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