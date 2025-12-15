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
    PostulanteCoordinador,
    AyudanteCoordinador
} from '@/hooks/useCoordinadores';
import { useTodasAsignaturas } from '@/hooks/useAsignaturas';
import {ModalDescarte} from '@/components/Coordinador/ModalDescarte';
import {ModalEvaluacionPostulante} from '@/components/Coordinador/ModalEvaluacionPostulante'; 
import {ModalEvaluacionAyudante} from '@/components/Coordinador/ModalEvaluacionAyudante';
import { ModalVerCurriculum } from '@/components/Coordinador/ModalVerCurriculum';
import { ModalDetallePostulacion } from '@/components/SecretariaDocente/ModalDetallePostulacion';
import { CoordinadorAdmin } from '@/components/Coordinador/CoordinadorAdmin';
import { CoordinadorUser } from '@/components/Coordinador/CoordinadorUser';
import { Filter, Search, Eye } from 'lucide-react';

interface CoordinadorDashboardProps {
    user: User;
    postulantes: PostulanteCoordinador[] | undefined;
    ayudantes: AyudanteCoordinador[] | undefined;
    loading: boolean;
    adminBar?: React.ReactNode;
}

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 text-center">{title}</h3>
        {children}
    </div>
);


export const CoordinadorDashboard = ({ user,postulantes, ayudantes, loading, adminBar}: CoordinadorDashboardProps) => {
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    const [rutVerCurriculum, setRutVerCurriculum] = useState<string | null>(null);

    type Vista = 'Postulantes' | 'Ayudantes';
    const [vista, setVista] = useState<Vista>('Postulantes');
    const isPostulantes = vista === 'Postulantes';
    const isAyudantes = vista === 'Ayudantes';

    const [busqueda, setBusqueda ] = useState("");
    const [paginaActual, setPaginaActual ] = useState(1);
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
        if (!listaAsignaturas)
        {
            return {};
        }
        const map : Record<number, string> = {};
        if (Array.isArray(listaAsignaturas))
        {
         listaAsignaturas.forEach((asig: any) => {
            map[asig.id] = asig.nombre;
         });   
        }
        return map;
    }, [listaAsignaturas]);

    const opcionesDisp = useMemo(() => {
        if (isPostulantes)
        {
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

        if (isPostulantes)
        {
        
            data = listaPostulantes.filter(p => {
                const matchTexto = p.alumno.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
                                   p.rut_alumno.toLowerCase().includes(busqueda.toLowerCase());
                const matchAsignatura = filtroAsignatura ? p.id_asignatura.toString() === filtroAsignatura : true;
                let matchEstado = true;
                if (filtroEstado)
                {
                    const esEvaluado = p.puntuacion_etapa2 != null && p.puntuacion_etapa2 > 0;
                    const estadoActual = esEvaluado ? "Evaluado" : "Pendiente";
                    matchEstado = estadoActual === filtroEstado;
                }
                return matchTexto && matchAsignatura && !p.motivo_descarte && matchEstado;
           });

           if (ordenPuntaje === 'desc')
            {
                data.sort((a, b) => b.puntuacion_etapa1 - a.puntuacion_etapa1);
            } else if (ordenPuntaje === 'asc')
            {
                data.sort((a,b) => a.puntuacion_etapa1 - b.puntuacion_etapa1);
            } else if (ordenPuntaje2 === 'desc')
            {
                data.sort((a,b) => (b.puntuacion_etapa2 || 0) - (a.puntuacion_etapa2 || 0));
            } else if (ordenPuntaje2 === 'asc')
            {
                data.sort((a,b) => (a.puntuacion_etapa2 || 0) - (b.puntuacion_etapa2 || 0));
            }

        }else if (isAyudantes)
        {
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

           if (ordenNota === 'desc')
            {
                data.sort((a, b) => (b.evaluacion || 0) - (a.evaluacion || 0));
            } else if (ordenNota === 'asc')
            {
                data.sort((a,b) => (a.evaluacion || 0) - (b.evaluacion || 0));
            }

            
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
        if (idPostulacionDescartar)
        {
            await descartarPostulacion.mutateAsync({
                id_postulacion: idPostulacionDescartar,
                motivo_descarte: motivo,
                fecha_descarte: new Date().toISOString().split('T')[0],
                rechazada_por_jefatura: true
            });
            setIdPostulacionDescartar(null);
        }
    };
    const handleConfirmarEvaluacionPost = async (puntajeTotal: number) => {
        if (postulanteAEvaluar)
        {
            await evaluarPostulacion.mutateAsync({
                id_postulacion: postulanteAEvaluar.id,
                puntuacion_etapa2: puntajeTotal
            });
            setPostulanteAEvaluar(null);
        }
    };

    const handleConfirmarEvaluacionAyu = async (nota: number) => {
        if (ayudanteAEvaluar)
        {
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

    const handleChangeItemsPorPagina = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = Number(e.target.value);
        if (valor > 0) {
            setItemsPagina(valor);
            setPaginaActual(1);
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') && (
                            <button 
                                onClick={handleBackToAdmin}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                            >
                                <span className="mr-2">←</span>
                                Volver al Panel Principal
                            </button>
                        )}
                        {(user.tipo === 'coordinador_secretariaDocente' || user.tipo === 'coordinador_directorDepto') && (
                            <button 
                                onClick={handleBackToDobleTipo}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                            >
                                <span className="mr-2">←</span>
                                Volver al Panel Principal
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-gray-800">Coordinador</h1>
                        <p className="text-gray-600 mt-1">Bienvenido, {user.nombres} {user.apellidos}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">RUT: {user.rut}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button 
                                onClick={() => { setVista('Postulantes'); setPaginaActual(1); setBusqueda(""); }} 
                                className={`py-2 px-4 rounded-lg transition-all duration-200 ${isPostulantes ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Postulantes
                            </button>
                            <button 
                                onClick={() => { setVista('Ayudantes'); setPaginaActual(1); setBusqueda(""); }} 
                                className={`py-2 px-4 rounded-lg transition-all duration-200 ${isAyudantes ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Mis Ayudantes
                            </button>
                        </div>
                        <button 
                            onClick={logout} 
                            className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                        >
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            {adminBar && (
                <div className="mb-6 max-w-7xl mx-auto w-full">
                    {adminBar}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-7xl mx-auto w-full">
                <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-gray-100 rounded-xl p-5 border border-gray-200 shadow-inner">
                        <div className="flex items-center gap-2 mb-4 text-gray-700 border-b border-gray-300 pb-2">
                            <Filter className="w-5 h-5" />
                            <h3 className="font-bold text-lg">Búsqueda Avanzada</h3>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Asignatura</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 text-gray-900"
                                    value={filtroAsignatura}
                                    onChange={(e) => setFiltroAsignatura(e.target.value)}
                                >
                                    <option value="">Todas</option>
                                    {opcionesDisp.map((opcion) => (
                                        <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {isPostulantes && (
                                <>
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                                        <select 
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                        >
                                            <option value="">Todos</option>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Evaluado">Evaluado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Orden por Puntaje (Etapa 1)</label>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="ordenPuntaje" 
                                                    checked={ordenPuntaje === "desc"} 
                                                    onChange={() => {setOrdenPuntaje("desc"); setOrdenPuntaje2("");}}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                Mayor a Menor
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="ordenPuntaje" 
                                                    checked={ordenPuntaje === "asc"} 
                                                    onChange={() => {setOrdenPuntaje("asc"); setOrdenPuntaje2("");}}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                Menor a Mayor
                                            </label>
                                            <button 
                                                onClick={() => setOrdenPuntaje("")}
                                                className="text-xs text-blue-500 hover:underline text-left mt-1"
                                            >
                                                Limpiar orden
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Orden por Puntaje (Etapa 2)</label>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="ordenPuntaje2" 
                                                    checked={ordenPuntaje2 === "desc"} 
                                                    onChange={() => { setOrdenPuntaje2("desc"); setOrdenPuntaje(""); }} 
                                                    className="text-blue-600 focus:ring-blue-500"
                                                /> Mayor a Menor
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="ordenPuntaje2" 
                                                    checked={ordenPuntaje2 === "asc"} 
                                                    onChange={() => { setOrdenPuntaje2("asc"); setOrdenPuntaje(""); }} 
                                                    className="text-blue-600 focus:ring-blue-500"
                                                /> Menor a Mayor
                                            </label>
                                            <button onClick={() => setOrdenPuntaje2("")} className="text-xs text-blue-500 hover:underline text-left mt-1">Limpiar orden</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {isAyudantes && (
                                <div>
                                    <div className="mb-4 border-b border-gray-200 pb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                                        <select 
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            value={filtroEstado}
                                            onChange={(e) => setFiltroEstado(e.target.value)}
                                        >
                                            <option value="">Todos</option>
                                            <option value="Calificado">Calificado</option>
                                            <option value="Pendiente">Pendiente</option>
                                        </select>
                                    </div>
                                    
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Orden por Nota Final</label>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="ordenNota" 
                                                checked={ordenNota === "desc"} 
                                                onChange={() => setOrdenNota("desc")}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            Mayor a Menor
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="ordenNota" 
                                                checked={ordenNota === "asc"} 
                                                onChange={() => setOrdenNota("asc")}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            Menor a Mayor
                                        </label>
                                        <button 
                                            onClick={() => setOrdenNota("")}
                                            className="text-xs text-blue-500 hover:underline text-left mt-1"
                                        >
                                            Limpiar orden
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {<div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12">
                    <InfoCard title={isPostulantes ? "Gestión de Postulantes" : "Gestión de Ayudantes"}>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 pb-4">
                            
                            <div className="relative w-full sm:w-1/3">
                                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={isPostulantes ? "Buscar postulante..." : "Buscar ayudante..."}
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                                    className="w-full border border-gray-300 text-black rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                />
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
                                        className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600"
                                    >
                                        ←
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 w-20 text-center">
                                        {paginaActual} / {totalPaginas || 1}
                                    </span>
                                    <button 
                                        onClick={() => handlePaginaChange(paginaActual + 1)} 
                                        disabled={paginaActual === totalPaginas} 
                                        className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-600"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading && (!postulantes && !ayudantes) ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-500 text-sm">Cargando datos...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full text-sm text-gray-700 bg-white">
                                    <thead className="bg-gray-50 text-gray-600 uppercase font-medium text-xs tracking-wider">
                                        <tr>
                                            <th className="p-4 text-left">RUT</th>
                                            <th className="p-4 text-left">{isPostulantes ? 'Nombre Postulante' : 'Nombre Ayudante'}</th>
                                            <th className="p-4 text-center">Asignatura</th>
                                            <th className="p-4 text-center">
                                                {isPostulantes ? 'Puntaje Etapa 1' : 'Nota Final'}
                                            </th>
                                            {isPostulantes && (
                                                <th className="p-4 text-center">Puntaje Etapa 2</th>
                                            )}
                                            <th className="p-4 text-center">Estado</th>
                                            <th className="p-4 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dataPaginada.length > 0 ? (
                                            isPostulantes ? (
                                                (dataPaginada as PostulanteCoordinador[]).map((p,index) => {
                                                    const esEvaluado = p.puntuacion_etapa2 !== null && p.puntuacion_etapa2 > 0;
                                                    const keyUnica = `${p.id}-${p.rut_alumno}-${p.id_asignatura}-${index}`; 
                                                    return (
                                                        <tr key={keyUnica} className="hover:bg-gray-50 transition">
                                                            <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{p.rut_alumno}</td>
                                                            <td className="p-4 whitespace-nowrap">{p.alumno.nombres} {p.alumno.apellidos}</td>
                                                            <td className="p-4 text-center text-gray-700 text-sm">{mapAsig[p.id_asignatura] || p.id_asignatura}</td>
                                                            <td className="p-4 text-center font-bold text-blue-600">{p.puntuacion_etapa1} pts</td>
                                                            <td className="p-4 text-center font-bold text-blue-600">
                                                                {p.puntuacion_etapa2 ? `${p.puntuacion_etapa2} pts` : '-'}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${esEvaluado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                    {esEvaluado ? 'Evaluado' : 'Pendiente'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-center flex justify-center gap-2">
                                                                <button 
                                                                    onClick={() => setPostulanteVerDetalle(p)}
                                                                    className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-200 text-xs font-medium transition-colors flex items-center gap-1 shadow-sm"
                                                                    title="Ver Detalle Postulación"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>

                                                                <button 
                                                                    onClick={() => setPostulanteAEvaluar(p)} 
                                                                    className={`px-3 py-1.5 rounded text-white text-xs font-medium shadow-sm transition-colors ${esEvaluado ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"}`}
                                                                >
                                                                    {esEvaluado ? 'Editar' : 'Evaluar'}
                                                                </button>

                                                                <button 
                                                                    onClick={() => setRutVerCurriculum(p.rut_alumno)} 
                                                                    className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-100 text-xs font-medium transition-colors flex items-center gap-1 shadow-sm"
                                                                    title="Ver Curriculum Vitae"
                                                                >
                                                                    <span>📄</span> CV
                                                                </button>

                                                                <button 
                                                                    onClick={() => setIdPostulacionDescartar(p.id)} 
                                                                    className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 text-xs font-medium"
                                                                >
                                                                    Descartar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                (dataPaginada as AyudanteCoordinador[]).map((a, index) => {
                                                    const esEvaluado = a.evaluacion !== null && a.evaluacion > 0;
                                                    const nota = esEvaluado ? (a.evaluacion! / 10).toFixed(1) : '-';
                                                    const keyUnicaAyudante = `${a.id}-${a.alumno.rut}-${a.asignatura}-${index}`;
                                                    return (
                                                        <tr key={keyUnicaAyudante} className="hover:bg-gray-50 transition">
                                                            <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{a.alumno.rut}</td>
                                                            <td className="p-4">{a.alumno.nombres} {a.alumno.apellidos}</td>
                                                            <td className="p-4 text-center">{a.asignatura}</td>
                                                            <td className={`p-4 text-center font-bold ${esEvaluado ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {esEvaluado ? nota : 'Pendiente'}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${esEvaluado ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'}`}>
                                                                    {esEvaluado ? 'Calificado' : 'Activo'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button 
                                                                    onClick={() => setAyudanteAEvaluar(a)} 
                                                                    className={`px-3 py-1.5 rounded text-white text-xs font-medium shadow-sm transition-colors ${esEvaluado ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-600 hover:bg-green-700"}`}
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
                                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Search className="w-8 h-8 text-gray-300 mb-2" />
                                                        <p>No se encontraron registros con estos filtros.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </InfoCard>
                </div>}
                
            </div>

            {idPostulacionDescartar && (
                <ModalDescarte 
                    onClose={() => setIdPostulacionDescartar(null)} 
                    onConfirm={handleConfirmarDescarte} 
                />
            )}
            
            {postulanteAEvaluar && (
                <ModalEvaluacionPostulante 
                    postulante={postulanteAEvaluar} 
                    onClose={() => setPostulanteAEvaluar(null)} 
                    onConfirm={handleConfirmarEvaluacionPost} 
                />
            )}

            {ayudanteAEvaluar && (
                <ModalEvaluacionAyudante 
                    ayudante={ayudanteAEvaluar} 
                    onClose={() => setAyudanteAEvaluar(null)} 
                    onConfirm={handleConfirmarEvaluacionAyu} 
                />
            )}

            {rutVerCurriculum && (
                <ModalVerCurriculum 
                    rut={rutVerCurriculum} 
                    onClose={() => setRutVerCurriculum(null)} 
                />
            )}
            
            {postulanteVerDetalle && (
                <ModalDetallePostulacion 
                    postulante={postulanteVerDetalle} 
                    onClose={() => setPostulanteVerDetalle(null)} 
                />
            )}

        </div>        
    );
};

export default function CoordinadorPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        if (isError || (!cargauser && !user)) {
            router.push("/login");
        }
    }, [isError, user, router, cargauser]);

    if (cargauser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {user.tipo === 'admin' || user.tipo === 'encargado_ayudantias' ? (
                <CoordinadorAdmin adminUser={user} />
            ) : (
                <CoordinadorUser user={user} />
            )}
        </div>
    );
}