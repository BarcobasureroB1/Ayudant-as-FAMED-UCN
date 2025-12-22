"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
    Building2, // Icono para Depto
    LogOut, 
    ChevronLeft, 
    FileBadge, // Para Constancias
    Users, 
    GraduationCap, // Para Concursos
    LayoutDashboard,
    ScrollText
} from 'lucide-react'; 

import { useUserProfile, User } from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import { AlumnoData, useAlumnos } from '@/hooks/useAlumnoProfile';
import { useTodasAsignaturas, useAsignaturasCoordinadores } from '@/hooks/useAsignaturas';
import { CoordinadorData, useCoordinadoresTodos } from '@/hooks/useCoordinadores';

// Componentes internos
import AperturaConcursoAdmin from '@/components/Secretariadepartamento/AperturaConcursoAdmin';
import GenerarConstanciaAdmin from '@/components/Secretariadepartamento/GenerarConstanciaAdmin';
import GestionCoordinadoresAdmin from '@/components/Secretariadepartamento/GestionCoordinadoresAdmin';

interface DashboardProps {
    user: User;
    asignaturas: any[];
    asignaturasCoordinadores: any[];
    alumnos: AlumnoData[];
    coordinadoresTodos: CoordinadorData[];
}

export const SecretariaDeptoDashboard = ({ user, asignaturas, asignaturasCoordinadores, alumnos, coordinadoresTodos }: DashboardProps) => {
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    type Vista = 'Concurso' | 'Constancia' | 'Coordinador';
    const [vista, setVista] = useState<Vista>('Concurso');

    const handleBackToAdmin = () => {
        router.push('/adminDashboard');
    };

    const logout = () => {
        setToken(null);
        setUsertipo(null);
        Cookies.remove('token');
        Cookies.remove('tipoUser');
        router.push('/login');
        router.refresh();
    };

    // Helper para clases de botones activos (Estilo Cápsula)
    const getTabClass = (isActive: boolean) => 
        `flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            isActive 
            ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            
            {/* 1. NAVBAR STICKY */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm h-16">
                <div className="max-w-[98%] mx-auto px-4 h-full">
                    <div className="flex justify-between h-full items-center">
                        
                        {/* IZQUIERDA: LOGO Y TÍTULO */}
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                {/* Icono de Edificio para Depto */}
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">
                                {user.tipo === 'admin' ? 'Portal Administración' : 'Secretaría de Departamento'}
                            </span>
                        </div>

                        {/* DERECHA: DATOS USUARIO Y LOGOUT */}
                        <div className="flex items-center gap-5">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-900">
                                    {user.nombres.split(' ')[0]} {user.apellidos.split(' ')[0]}
                                </p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    {user.tipo === 'admin' ? 'Administrador' : 'Secretaría Depto.'}
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

            {/* 2. CONTENEDOR PRINCIPAL */}
            <div className="max-w-[98%] mx-auto px-4 py-6">
                
                {/* HEADER: TÍTULO Y TABS */}
                <div className="flex flex-col xl:flex-row justify-between items-end mb-6 gap-6">
                    <div>
                        {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') && (
                            <button 
                                onClick={handleBackToAdmin}
                                className="flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 mb-2 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Panel
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Secretaría de Departamento</h1>
                        <p className="text-gray-500 text-base mt-1">Administración de concursos, coordinadores y constancias.</p>
                    </div>

                    {/* TABS DE NAVEGACIÓN */}
                    <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex overflow-x-auto max-w-full">
                        <button onClick={() => setVista('Concurso')} className={getTabClass(vista === 'Concurso')}>
                            <GraduationCap className="w-4 h-4" /> Concursos
                        </button>
                        <button onClick={() => setVista('Constancia')} className={getTabClass(vista === 'Constancia')}>
                            <ScrollText className="w-4 h-4" /> Constancias
                        </button>
                        <button onClick={() => setVista('Coordinador')} className={getTabClass(vista === 'Coordinador')}>
                            <Users className="w-4 h-4" /> Coordinadores
                        </button>
                    </div>
                </div>

                {/* 3. ÁREA DE CONTENIDO (TARJETA BLANCA GRANDE) */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[600px]">
                        
                        {vista === 'Concurso' && (
                            <AperturaConcursoAdmin
                                rutSecretaria={user.rut} 
                                asignaturas={asignaturas}
                                asignaturasConCoordinadores={asignaturasCoordinadores}
                            />
                        )}
                        
                        {vista === 'Constancia' && (
                            <GenerarConstanciaAdmin 
                                alumnos={alumnos}
                            />
                        )}

                        {vista === 'Coordinador' && (
                            <GestionCoordinadoresAdmin
                                asignaturas={asignaturasCoordinadores}
                                coordinadoresTodos={coordinadoresTodos}
                            />
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PAGE (Lógica de carga y redirección) ---
export default function SecretariaDeptoPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const router = useRouter();

    // Hooks de datos
    const { data: asignaturas, isLoading: cargaAsignaturas, isError: errorAsignaturas } = useTodasAsignaturas();
    const { data: asignaturasCoordinadores, isLoading: cargaAsignaturasCoordinadores, isError: errorAsignaturasCoordinadores } = useAsignaturasCoordinadores();
    const { data: alumnos, isLoading: cargaAlumnos, isError: errorAlumnos } = useAlumnos();
    const { data: coordinadoresTodos, isLoading: cargaCoordinadoresTodos, isError: errorCoordinadoresTodos } = useCoordinadoresTodos();

    useEffect(() => {
        if (isError || (!cargauser && !user)) {
            router.push("/login");
        }
    }, [isError, user, router, cargauser]);

    // Redirección si falla la carga de datos críticos
    useEffect(() => {
        if (errorAsignaturasCoordinadores || errorAsignaturas || errorAlumnos || errorCoordinadoresTodos) {
            // Opcional: Podrías mostrar un toast de error antes de redirigir
            console.error("Error cargando datos departamentales");
        }
    }, [errorAsignaturas, errorAsignaturasCoordinadores, errorAlumnos, errorCoordinadoresTodos]);

    const isLoadingAll = cargauser || cargaAsignaturas || cargaAsignaturasCoordinadores || cargaAlumnos || cargaCoordinadoresTodos;
    const hasError = isError || (!cargauser && !user) || errorAsignaturas || errorAsignaturasCoordinadores || errorAlumnos || errorCoordinadoresTodos;

    if (isLoadingAll) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando panel...</p>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="bg-red-50 p-4 rounded-full inline-flex mb-4">
                        <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-gray-800 font-bold mb-2 text-lg">Error de carga</p>
                    <p className="text-base text-gray-500 mb-4">No se pudieron obtener los datos necesarios.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <SecretariaDeptoDashboard 
            user={user} 
            asignaturas={asignaturas} 
            asignaturasCoordinadores={asignaturasCoordinadores} 
            alumnos={alumnos} 
            coordinadoresTodos={coordinadoresTodos} 
        />
    );
}