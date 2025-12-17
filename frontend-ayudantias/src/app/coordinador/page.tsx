"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, User} from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import {
    useEvaluarPostulacion,
    useDescartarPostulacion,
    useEvaluarAyudanteFinal,
    useCoordinadoresTodos, // Agregado para el modal
    usePostulantesCoordinador, // Agregado para data
    useAyudantesActivos, // Agregado para data
    PostulanteCoordinador,
    AyudanteCoordinador,
    PostulanteCoordinadorData,
    AyudanteActivoData,
} from '@/hooks/useCoordinadores';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';
import {ModalDescarte} from '@/components/Coordinador/ModalDescarte';
import {ModalEvaluacionPostulante} from '@/components/Coordinador/ModalEvaluacionPostulante'; 
import {ModalEvaluacionAyudante} from '@/components/Coordinador/ModalEvaluacionAyudante';
import { ModalVerCurriculum } from '@/components/Coordinador/ModalVerCurriculum';
import { ModalDetallePostulacion } from '@/components/SecretariaDocente/ModalDetallePostulacion';
import { ModalSeleccionarCoordinadorAdmin } from '@/components/Coordinador/ModalSeleccionarCoordinadorAdmin'; 

import { 
    Filter, Search, Eye, FileText, XCircle, 
    ChevronLeft, LogOut, Briefcase, 
    GraduationCap, Users, SlidersHorizontal, RefreshCw 
} from 'lucide-react';

interface CoordinadorDashboardProps {
    user: User;
    postulantes: PostulanteCoordinador[] | PostulanteCoordinadorData[] | undefined;
    ayudantes: AyudanteCoordinador[] | AyudanteActivoData[] | undefined;
    loading: boolean;
    adminBar?: React.ReactNode;
}

// Badge Component
const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error" }) => {
    const variants = {
        default: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-red-50 text-red-700 border-red-200"
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]} shadow-sm`}>
            {children}
        </span>
    );
};

export const CoordinadorDashboard = ({ user, postulantes, ayudantes, loading, adminBar}: CoordinadorDashboardProps) => {
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    const [rutVerCurriculum, setRutVerCurriculum] = useState<string | null>(null);

    type Vista = 'Postulantes' | 'Ayudantes';
    const [vista, setVista] = useState<Vista>('Postulantes');
    const isPostulantes = vista === 'Postulantes';
    const isAyudantes = vista === 'Ayudantes';

    const [busqueda, setBusqueda ] = useState("");
    const [paginaActual, setPaginaActual ] = useState(1);
    
    // Estado inicial de filas por página
    const [itemsPagina, setItemsPagina] = useState(10);

    const [filtroAsignatura, setFiltroAsignatura ] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [ordenPuntaje, setOrdenPuntaje ] = useState<"desc" | "asc" | "">("");
    const [ordenPuntaje2, setOrdenPuntaje2 ] = useState<"desc" | "asc" | "">("");
    const [ordenNota, setOrdenNota] = useState<"desc" | "asc" | "">("");

    const [idPostulacionDescartar, setIdPostulacionDescartar] = useState<number | null>(null);
    const [postulanteVerDetalle, setPostulanteVerDetalle] = useState<PostulanteCoordinador | null>(null);
    const [postulanteAEvaluar, setPostulanteAEvaluar] = useState<PostulanteCoordinador | null>(null);
    const [ayudanteAEvaluar, setAyudanteAEvaluar ] = useState<AyudanteCoordinador | null>(null);

    const evaluarPostulacion = useEvaluarPostulacion();
    const descartarPostulacion = useDescartarPostulacion();
    const evaluarAyudante = useEvaluarAyudanteFinal();

    const listaPostulantes = useMemo(() => postulantes || [], [postulantes]);
    const listaAyudantes = useMemo(() => ayudantes || [], [ayudantes]);

    const { data: listaAsignaturas } = useTodasAsignaturas();

    const mapAsig = useMemo(() => {
        if (!listaAsignaturas) return {};
        const map : Record<number, string> = {};
        if (Array.isArray(listaAsignaturas)) {
         listaAsignaturas.forEach((asig: any) => {
            map[asig.id] = asig.nombre;
         });   
        }
        return map;
    }, [listaAsignaturas]);

    const opcionesDisp = useMemo(() => {
        if (isPostulantes) {
            const ids = Array.from(new Set(listaPostulantes.map(p => p.id_asignatura)));
            return ids.map(id => ({
                id: id.toString(),
                nombre: mapAsig[id] || `Asignatura ${id}`
            })).sort((a,b) => a.nombre.localeCompare(b.nombre));
        } else {
            const nombres = Array.from(new Set(listaAyudantes.map(a => a.asignatura)));
            return nombres.map(nombre => ({
                id: nombre,
                nombre: nombre
            })).sort((a,b) => a.nombre.localeCompare(b.nombre));
        }
    }, [isPostulantes, listaPostulantes, listaAyudantes, mapAsig]);

    const dataFiltrada = useMemo(() => {
        let data: any[] = [];

        if (isPostulantes) {
            data = listaPostulantes.filter(p => {
                const matchTexto = p.alumno.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
                                   p.rut_alumno.toLowerCase().includes(busqueda.toLowerCase());
                const matchAsignatura = filtroAsignatura ? p.id_asignatura.toString() === filtroAsignatura : true;
                let matchEstado = true;
                if (filtroEstado) {
                    const esEvaluado = p.puntuacion_etapa2 != null && p.puntuacion_etapa2 > 0;
                    const estadoActual = esEvaluado ? "Evaluado" : "Pendiente";
                    matchEstado = estadoActual === filtroEstado;
                }
                return matchTexto && matchAsignatura && !p.motivo_descarte && matchEstado;
           });

           if (ordenPuntaje === 'desc') data.sort((a, b) => b.puntuacion_etapa1 - a.puntuacion_etapa1);
           else if (ordenPuntaje === 'asc') data.sort((a,b) => a.puntuacion_etapa1 - b.puntuacion_etapa1);
           else if (ordenPuntaje2 === 'desc') data.sort((a,b) => (b.puntuacion_etapa2 || 0) - (a.puntuacion_etapa2 || 0));
           else if (ordenPuntaje2 === 'asc') data.sort((a,b) => (a.puntuacion_etapa2 || 0) - (b.puntuacion_etapa2 || 0));

        } else if (isAyudantes) {
            data = listaAyudantes.filter(a => {
                const matchTexto = a.alumno.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
                                   a.alumno.rut.toLowerCase().includes(busqueda.toLowerCase());
                const matchAsignatura = filtroAsignatura ? a.asignatura.toString() === filtroAsignatura : true;

                let matchEstado = true;
                if (filtroEstado) {
                    const esCalificado = a.evaluacion !== null && a.evaluacion > 0;
                    const estadoActual = esCalificado ? "Calificado" : "Pendiente";
                    matchEstado = estadoActual === filtroEstado;
                }
                return matchTexto && matchAsignatura && matchEstado;
           });

           if (ordenNota === 'desc') data.sort((a, b) => (b.evaluacion || 0) - (a.evaluacion || 0));
           else if (ordenNota === 'asc') data.sort((a,b) => (a.evaluacion || 0) - (b.evaluacion || 0));
        }
        return data;
    }, [filtroEstado,isPostulantes, isAyudantes, listaPostulantes, listaAyudantes, busqueda, filtroAsignatura, ordenPuntaje, ordenPuntaje2, ordenNota])

    const handleBackToAdmin = () => {
        router.push('/adminDashboard');
    };

    const handleBackToDobleTipo = () => {
        router.push('/DobleTipo');
    };

    const logout = () => {
        setToken(null);
        setUsertipo(null);
        Cookies.remove('token');
        Cookies.remove('tipoUser');
        router.push('/login');
        router.refresh();
    }

    const handleConfirmarDescarte = async (motivo: string) => {
        if (idPostulacionDescartar) {
            await descartarPostulacion.mutateAsync({
                id_postulacion: idPostulacionDescartar,
                motivo_descarte: motivo,
                fecha_descarte: new Date().toISOString().split('T')[0],
                rechazada_por_jefatura: true
            });
        }
    };
    const handleConfirmarEvaluacionPost = async (puntajeTotal: number) => {
        if (postulanteAEvaluar) {
            await evaluarPostulacion.mutateAsync({
                id_postulacion: postulanteAEvaluar.id,
                puntuacion_etapa2: puntajeTotal
            });
            setPostulanteAEvaluar(null);
        }
    };

    const handleConfirmarEvaluacionAyu = async (nota: number) => {
        if (ayudanteAEvaluar) {
            await evaluarAyudante.mutateAsync({
                id_ayudantia: ayudanteAEvaluar.id,
                evaluacion: nota
            });
            setAyudanteAEvaluar(null);
        }
    };

    const totalPaginas = Math.ceil(dataFiltrada.length / (itemsPagina || 1));
    const indiceInicio = (paginaActual - 1) * (itemsPagina || 1);
    const indiceFin = indiceInicio + (itemsPagina || 1);
    const dataPaginada = dataFiltrada.slice(indiceInicio, indiceFin);

    const handlePaginaChange = (nuevaPagina: number) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

    // Handler para cambiar las filas por página
    const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = Number(e.target.value);
        if (valor > 0) {
            setItemsPagina(valor);
            setPaginaActual(1);
        } else if (e.target.value === '') {
            // Permitir borrar para escribir
            setItemsPagina(0); 
        }
    };

    useEffect(() => {
        setFiltroAsignatura("");
        setFiltroEstado("");
        setOrdenPuntaje("");
        setOrdenPuntaje2("");
        setOrdenNota("");
        setPaginaActual(1);
        setBusqueda("");
    }, [vista]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        
                        {/* IZQUIERDA: LOGO Y TÍTULO */}
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">
                                {/* Condición para el título */}
                                {user.tipo === 'admin' ? 'Portal Administración' : 'Portal Coordinador'}
                            </span>
                        </div>

                        {/* DERECHA: DATOS USUARIO Y LOGOUT */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-900">
                                    {user.nombres.split(' ')[0]} {user.apellidos.split(' ')[0]}
                                </p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    {/* Condición para el rol */}
                                    {user.tipo === 'admin' ? 'Administrador' : 'Coordinador'}
                                </p>
                            </div>
                            <button 
                                onClick={logout} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias' || user.tipo === 'coordinador_secretariaDocente' || user.tipo === 'coordinador_directorDepto') && (
                            <button 
                                onClick={user.tipo.includes('coordinador_') ? handleBackToDobleTipo : handleBackToAdmin}
                                className="flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 mb-2 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Panel
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900">Coordinador</h1>
                        <p className="text-gray-500 mt-1 text-lg">Administra postulaciones y evaluaciones de ayudantes.</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button 
                            onClick={() => { setVista('Postulantes'); setPaginaActual(1); setBusqueda(""); }} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isPostulantes ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Users className="w-5 h-5" /> Postulantes
                        </button>
                        <button 
                            onClick={() => { setVista('Ayudantes'); setPaginaActual(1); setBusqueda(""); }} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isAyudantes ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <GraduationCap className="w-5 h-5" /> Mis Ayudantes
                        </button>
                    </div>
                </div>

                {/* AQUÍ SE RENDERIZA LA BARRA DE SUPERVISIÓN (si existe) */}
                {adminBar && <div className="mb-6 animate-in slide-in-from-top-2">{adminBar}</div>}

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* SIDEBAR FILTROS */}
                    <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-gray-900">Filtros y Orden</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Filtro Asignatura */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Asignatura</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all"
                                    value={filtroAsignatura}
                                    onChange={(e) => setFiltroAsignatura(e.target.value)}
                                >
                                    <option value="">Todas las asignaturas</option>
                                    {opcionesDisp.map((opcion) => (
                                        <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro Estado */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Estado</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="">Todos los estados</option>
                                    {isPostulantes ? (
                                        <>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Evaluado">Evaluado</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Calificado">Calificado</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Ordenamiento */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Ordenar por</label>
                                {isPostulantes ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-semibold text-indigo-600 mb-2">Puntaje Etapa 1</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setOrdenPuntaje("desc"); setOrdenPuntaje2(""); }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${ordenPuntaje === 'desc' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Mayor</button>
                                                <button onClick={() => { setOrdenPuntaje("asc"); setOrdenPuntaje2(""); }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${ordenPuntaje === 'asc' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Menor</button>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-xs font-semibold text-indigo-600 mb-2">Puntaje Etapa 2</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setOrdenPuntaje2("desc"); setOrdenPuntaje(""); }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${ordenPuntaje2 === 'desc' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Mayor</button>
                                                <button onClick={() => { setOrdenPuntaje2("asc"); setOrdenPuntaje(""); }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${ordenPuntaje2 === 'asc' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Menor</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-semibold text-indigo-600 mb-2">Nota Final</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOrdenNota("desc")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${ordenNota === 'desc' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Mayor</button>
                                            <button onClick={() => setOrdenNota("asc")} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${ordenNota === 'asc' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Menor</button>
                                        </div>
                                    </div>
                                )}
                                {(ordenPuntaje || ordenPuntaje2 || ordenNota) && (
                                    <button onClick={() => { setOrdenPuntaje(""); setOrdenPuntaje2(""); setOrdenNota(""); }} className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 underline">Limpiar Orden</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CONTENIDO PRINCIPAL */}
                    <div className="flex-1 w-full min-w-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            
                            {/* Barra de Búsqueda y Paginación */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <div className="relative w-full sm:w-96">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                                        placeholder={isPostulantes ? "Buscar por nombre o RUT..." : "Buscar ayudante..."}
                                        value={busqueda}
                                        onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                                    />
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                    
                                    {/* Input de Filas */}
                                    <div className="hidden sm:flex items-center gap-1 pl-3 pr-3 border-r border-gray-200">
                                        <span className="text-xs font-medium text-gray-500">Filas:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={itemsPagina || ""}
                                            onChange={handleChangeItemsPorPagina}
                                            className="w-10 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none py-1"
                                        />
                                    </div>

                                    {/* Botones Paginación */}
                                    <button 
                                        onClick={() => handlePaginaChange(paginaActual - 1)} 
                                        disabled={paginaActual === 1} 
                                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-semibold text-gray-700 w-20 text-center">
                                        {paginaActual} / {totalPaginas || 1}
                                    </span>
                                    <button 
                                        onClick={() => handlePaginaChange(paginaActual + 1)} 
                                        disabled={paginaActual === totalPaginas} 
                                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>

                            {/* TABLA AMPLIA Y ESPACIOSA */}
                            {loading && (!postulantes && !ayudantes) ? (
                                <div className="text-center py-20">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500 text-sm font-medium">Cargando información...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 whitespace-nowrap uppercase text-xs tracking-wider">RUT</th>
                                                <th className="px-6 py-4 whitespace-nowrap uppercase text-xs tracking-wider">Nombre Completo</th>
                                                <th className="px-6 py-4 text-center uppercase text-xs tracking-wider">Asignatura</th>
                                                <th className="px-6 py-4 text-center uppercase text-xs tracking-wider">{isPostulantes ? 'Puntaje E1' : 'Nota Final'}</th>
                                                {isPostulantes && <th className="px-6 py-4 text-center uppercase text-xs tracking-wider">Puntaje E2</th>}
                                                <th className="px-6 py-4 text-center uppercase text-xs tracking-wider">Estado</th>
                                                <th className="px-6 py-4 text-center uppercase text-xs tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {dataPaginada.length > 0 ? (
                                                isPostulantes ? (
                                                    (dataPaginada as PostulanteCoordinador[]).map((p, index) => {
                                                        const esEvaluado = p.puntuacion_etapa2 !== null && p.puntuacion_etapa2 > 0;
                                                        return (
                                                            <tr key={`${p.id}-${index}`} className="hover:bg-indigo-50/20 transition-colors group">
                                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{p.rut_alumno}</td>
                                                                <td className="px-6 py-4 text-gray-700 font-medium">
                                                                    {p.alumno.nombres} {p.alumno.apellidos}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                                                                        {mapAsig[p.id_asignatura] || p.id_asignatura}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center font-bold text-indigo-600 text-base">{p.puntuacion_etapa1}</td>
                                                                <td className="px-6 py-4 text-center font-bold text-gray-700 text-base">
                                                                    {p.puntuacion_etapa2 ? p.puntuacion_etapa2 : '-'}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <Badge variant={esEvaluado ? 'success' : 'warning'}>
                                                                        {esEvaluado ? 'Evaluado' : 'Pendiente'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button onClick={() => setPostulanteVerDetalle(p)} className="flex flex-col items-center gap-0.5 p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-w-[45px]" title="Ver Detalle">
                                                                            <Eye className="w-5 h-5" />
                                                                            <span className="text-[10px] font-bold">Detalle</span>
                                                                        </button>
                                                                        <button onClick={() => setRutVerCurriculum(p.rut_alumno)} className="flex flex-col items-center gap-0.5 p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors min-w-[45px]" title="Ver CV">
                                                                            <FileText className="w-5 h-5" />
                                                                            <span className="text-[10px] font-bold">CV</span>
                                                                        </button>
                                                                        <div className="flex flex-col justify-center">
                                                                            <button 
                                                                                onClick={() => setPostulanteAEvaluar(p)} 
                                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                                                                                    esEvaluado 
                                                                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200" 
                                                                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                                                                                }`}
                                                                            >
                                                                                {esEvaluado ? 'Editar' : 'Evaluar'}
                                                                            </button>
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => setIdPostulacionDescartar(p.id)} 
                                                                            className="flex flex-col items-center gap-0.5 p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[45px]" 
                                                                            title="Descartar"
                                                                        >
                                                                            <XCircle className="w-5 h-5" />
                                                                            <span className="text-[10px] font-bold">Borrar</span>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    (dataPaginada as AyudanteCoordinador[]).map((a, index) => {
                                                        const esEvaluado = a.evaluacion !== null && a.evaluacion > 0;
                                                        const nota = esEvaluado ? (a.evaluacion! / 10).toFixed(1) : '-';
                                                        return (
                                                            <tr key={`${a.id}-${index}`} className="hover:bg-indigo-50/20 transition-colors group">
                                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{a.alumno.rut}</td>
                                                                <td className="px-6 py-4 text-gray-700 font-medium">
                                                                    {a.alumno.nombres} {a.alumno.apellidos}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                                                                        {a.asignatura}
                                                                    </span>
                                                                </td>
                                                                <td className={`px-6 py-4 text-center font-bold text-base ${esEvaluado ? 'text-emerald-600' : 'text-gray-300'}`}>
                                                                    {esEvaluado ? nota : '-'}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <Badge variant={esEvaluado ? 'success' : 'default'}>
                                                                        {esEvaluado ? 'Calificado' : 'Activo'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <button 
                                                                        onClick={() => setAyudanteAEvaluar(a)} 
                                                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 mx-auto ${esEvaluado ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                                                                    >
                                                                        {esEvaluado ? 'Editar Nota' : 'Evaluar'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="bg-gray-50 p-4 rounded-full mb-3 border border-gray-100">
                                                                <Filter className="w-8 h-8 text-gray-300" />
                                                            </div>
                                                            <p className="text-sm font-medium">No se encontraron registros con estos filtros.</p>
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

            {/* MODALES (Lógica intacta) */}
            {idPostulacionDescartar && (
                <ModalDescarte onClose={() => setIdPostulacionDescartar(null)} onConfirm={handleConfirmarDescarte} />
            )}
            
            {postulanteAEvaluar && (
                <ModalEvaluacionPostulante postulante={postulanteAEvaluar} onClose={() => setPostulanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionPost} />
            )}

            {ayudanteAEvaluar && (
                <ModalEvaluacionAyudante ayudante={ayudanteAEvaluar} onClose={() => setAyudanteAEvaluar(null)} onConfirm={handleConfirmarEvaluacionAyu} />
            )}

            {rutVerCurriculum && (
                <ModalVerCurriculum rut={rutVerCurriculum} onClose={() => setRutVerCurriculum(null)} />
            )}
            
            {postulanteVerDetalle && (
                <ModalDetallePostulacion postulante={postulanteVerDetalle} onClose={() => setPostulanteVerDetalle(null)} />
            )}

        </div>        
    );
};

export default function CoordinadorPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const router = useRouter();

    // LÓGICA DE SELECCIÓN DE COORDINADOR (ESTADO GLOBAL PARA ADMINS)
    const { data: listaCoordinadores, isLoading: cargaCoordinadores } = useCoordinadoresTodos();
    const [rutCoordinadorSeleccionado, setRutCoordinadorSeleccionado] = useState<string>("");
    const [nombreCoordinadorSeleccionado, setNombreCoordinadorSeleccionado] = useState<string>(""); // Estado para el nombre (opcional para mostrar en banner)
    const [modalCoordAbierto, setModalCoordAbierto] = useState(false);

    // FETCH DE DATA (Postulantes y Ayudantes)
    // Se ejecuta solo cuando hay un RUT seleccionado (Admin) o cuando es User
    const rutQuery = rutCoordinadorSeleccionado || user?.rut;
    
    // Si el usuario es admin y no ha seleccionado a nadie, no queremos que la query se vuelva loca,
    // pero gracias a enabled: !!rutQuery se controla.
    const { data: postulantes, isLoading: cargaPostulantes } = usePostulantesCoordinador(rutQuery || "");
    const { data: ayudantes, isLoading: cargaAyudantes } = useAyudantesActivos(rutQuery || "");

    useEffect(() => {
        if (isError || (!cargauser && !user)) {
            router.push("/login");
        }
    }, [isError, user, router, cargauser]);

    // Efecto para inicializar el coordinador o pedir selección
    useEffect(() => {
        if (user) {
            if (user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') {
                if (!rutCoordinadorSeleccionado) {
                    setModalCoordAbierto(true);
                }
            } else {
                // Si es coordinador normal, setear su propio RUT
                setRutCoordinadorSeleccionado(user.rut);
                setNombreCoordinadorSeleccionado(`${user.nombres} ${user.apellidos}`);
            }
        }
    }, [user, rutCoordinadorSeleccionado]);

    const handleSelectCoordinador = (rut: string) => {
        setRutCoordinadorSeleccionado(rut);
        const coord = listaCoordinadores?.find((c: any) => c.rut === rut);
        if(coord) setNombreCoordinadorSeleccionado(`${coord.nombres} ${coord.apellidos}`);
        
        setModalCoordAbierto(false);
    };

    const handleCerrarModalCoordinador = () => {
        if (user?.tipo === 'admin' && !rutCoordinadorSeleccionado) {
            router.push('/adminDashboard');
        } else {
            setModalCoordAbierto(false);
        }
    };

    if (cargauser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium text-sm">Cargando...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="bg-red-50 p-4 rounded-full inline-flex mb-4">
                        <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-gray-800 font-bold mb-2">Sesión no válida</p>
                    <p className="text-sm text-gray-500">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    const adminBar = (user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg text-indigo-600 shadow-sm border border-indigo-50">
                    <Briefcase className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Modo Supervisión</p>
                    <p className="text-sm text-indigo-900">
                        Gestionando como: <span className="font-bold">{nombreCoordinadorSeleccionado || "Seleccione..."}</span>
                        {rutCoordinadorSeleccionado && <span className="opacity-70 font-normal ml-1">({rutCoordinadorSeleccionado})</span>}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={() => setModalCoordAbierto(true)}
                className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
            >
                <RefreshCw className="w-4 h-4" /> 
                Cambiar Usuario
            </button>
        </div>
    ) : undefined;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 1. EL MODAL SIEMPRE SE RENDERIZA (pero controla su visibilidad) */}
            <ModalSeleccionarCoordinadorAdmin 
                abierto={modalCoordAbierto}
                onClose={handleCerrarModalCoordinador}
                onSelect={handleSelectCoordinador}
                coordinadores={listaCoordinadores}
                isLoading={cargaCoordinadores}
            />

            {/* 2. EL CONTENIDO DEL DASHBOARD SIEMPRE ESTÁ DETRÁS */}
            <CoordinadorDashboard 
                user={user} 
                postulantes={postulantes} 
                ayudantes={ayudantes} 
                loading={cargaPostulantes || cargaAyudantes}
                adminBar={adminBar}
            />
        </div>
    );
}