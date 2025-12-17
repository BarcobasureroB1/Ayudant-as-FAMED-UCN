"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, User} from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

import AutorizarConcursos from '@/components/FuncionesEncargado/AutorizarConcursos';
import { DirectorCoordinacionVista } from '@/components/Director/DirectorCoordinacionVista';
import { useSolicitudesDeConcurso } from '@/hooks/useAsignaturas';
import { usePostulacionesCoordinador, useAyudantesCoordinador } from '@/hooks/useCoordinadores';
import { ChevronLeft, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';

interface UserProps {
    user: User;
}

export const DirectorDeptoDashboard = ({ user }: UserProps) => {
    const router = useRouter();

    const { setToken, setUsertipo } = useAuth();
    const { data: asignaturasConcursos, isLoading: cargaConcursos } = useSolicitudesDeConcurso();

    const { data: postulantesGlobal, isLoading: cargaPostulantes} = usePostulacionesCoordinador();
    const { data: ayudantesGlobal, isLoading: cargaAyudantes} = useAyudantesCoordinador();

    type Vista = 'Concurso' |'Coordinacion';
    const [vista, setVista] = useState<Vista>('Concurso');
    const isConcurso = vista === 'Concurso';

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            
            {/* Navbar Sticky */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm h-16">
                <div className="max-w-[98%] mx-auto px-4 h-full">
                    <div className="flex justify-between h-full items-center">
                        
                        {/* IZQUIERDA: ICONO Y TÍTULO */}
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">
                                {/* Condición para el título */}
                                {user.tipo === 'admin' ? 'Portal Administración' : 'Portal Director'}
                            </span>
                        </div>

                        {/* DERECHA: DATOS USUARIO Y LOGOUT */}
                        <div className="flex items-center gap-5">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-900">
                                    {user.nombres.split(' ')[0]} {user.apellidos.split(' ')[0]}
                                </p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    {/* Condición para el rol */}
                                    {user.tipo === 'admin' ? 'Administrador' : 'Director de Departamento'}
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

            {/* Contenedor Principal Expandido (max-w-[98%]) */}
            <div className="max-w-[98%] mx-auto px-4 py-6">
                
                {/* Header Actions & Title */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div>
                        {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias' || user.tipo === 'coordinador_directorDepto') && (
                            <button 
                                onClick={user.tipo === 'coordinador_directorDepto' ? handleBackToDobleTipo : handleBackToAdmin}
                                className="flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 mb-2 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Panel
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Director de Departamento</h1>
                        <p className="text-gray-500 text-base mt-1">Gestión de concursos y supervisión.</p>
                    </div>

                    {/* Main Tabs (Botones superiores) - Texto y padding aumentado */}
                    <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button 
                            onClick={() => setVista('Concurso')} 
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isConcurso ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" /> Solicitudes de Concurso
                        </button>
                        <button 
                            onClick={() => setVista('Coordinacion')} 
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${!isConcurso ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <UserCheck className="w-5 h-5" /> Panel Coordinador
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {vista === 'Concurso' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            {cargaConcursos ? (
                                <div className="text-center py-24">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500 text-base font-medium">Cargando solicitudes...</p>
                                </div>
                            ): (
                                <AutorizarConcursos 
                                    asignaturasConcursos={asignaturasConcursos || []}
                                    mostrar={false}
                                    onClose={() => {}}
                                />
                            )}
                        </div>
                    ) : (
                        <DirectorCoordinacionVista
                            postulantes={postulantesGlobal}
                            ayudantes={ayudantesGlobal}
                            loading={cargaPostulantes || cargaAyudantes}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default function DirectorDeptoPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        if (isError || (!cargauser && !user)) {
            router.push("/login");
        }
    }, [isError, user, router, cargauser]);

    if (cargauser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium text-base">Cargando...</p>
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
                    <p className="text-gray-800 font-bold mb-2 text-lg">Sesión no válida</p>
                    <p className="text-base text-gray-500">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return <DirectorDeptoDashboard user={user}/>;
}