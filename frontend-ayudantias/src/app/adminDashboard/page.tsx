"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, User } from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import CambiarTipoDeUsuario from '@/components/FuncionesAdmin/CambiarTipoDeUsuario';
import { useUsuarios } from "@/hooks/useUsuarios";
import AutorizarConcursos from '@/components/FuncionesEncargado/AutorizarConcursos';
import { useSolicitudesDeConcurso } from '@/hooks/useAsignaturas';
import { 
    LayoutDashboard, 
    LogOut, 
    UserCircle, 
    Building2, 
    FileText, 
    Landmark, 
    GraduationCap, 
    Users, 
    ShieldCheck,
    ChevronRight,
} from 'lucide-react';

interface UserProps {
    user: User;
    usuarios: any[];
}

// --- COMPONENTE DE TARJETA MEJORADO ---
const DashboardCard = ({ 
    title, 
    description, 
    icon: Icon, 
    onClick, 
    color = "blue" 
}: { 
    title: string; 
    description: string; 
    icon: React.ElementType; 
    onClick: () => void;
    color?: "blue" | "green" | "purple" | "red" | "yellow" | "orange" | "indigo";
}) => {
    
    const colorStyles = {
        blue:   "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        green:  "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
        red:    "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white",
        yellow: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
        orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
    };

    const borderStyles = {
        blue:   "hover:border-blue-200",
        green:  "hover:border-emerald-200",
        purple: "hover:border-purple-200",
        red:    "hover:border-red-200",
        yellow: "hover:border-amber-200",
        orange: "hover:border-orange-200",
        indigo: "hover:border-indigo-200",
    };

    return (
        <div 
            className={`group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${borderStyles[color]}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl transition-colors duration-300 ${colorStyles[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
            </div>
            
            <div className="mt-4">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

export const AdminDashboard = ({user, usuarios}: UserProps) => {

    const {setToken, setUsertipo} = useAuth();
    const [mostrarCambiarTipo, setMostrarCambiarTipo] = useState(false);
    const [mostrarAutorizarConcursos, setMostrarAutorizarConcursos] = useState(false);
    const { data: asignaturasConcursos } = useSolicitudesDeConcurso();
    const router = useRouter();

    const logout = () => {
        setToken(null);
        setUsertipo(null);
        Cookies.remove('token');
        Cookies.remove('tipoUser');
        router.push('/login');
        router.refresh();
    }

    const dashboardItems = [
        {
            title: "Tu perfil de postulante",
            description: "Ver y gestionar tu información personal como postulante.",
            icon: UserCircle,
            path: "/postulante",
            color: "blue" as const
        },
        {
            title: "Secretaría de Depto",
            description: "Acceder al panel de gestión departamental.",
            icon: Building2,
            path: "/secretaria-depto",
            color: "green" as const
        },
        {
            title: "Coordinador",
            description: "Gestión académica y coordinación de asignaturas.",
            icon: FileText,
            path: "/coordinador",
            color: "yellow" as const
        },
        {
            title: "Director de Departamento",
            description: "Funciones directivas y supervisión general.",
            icon: Landmark,
            path: "/directorDepartamento",
            color: "orange" as const
        },
        {
            title: "Secretaría Docente",
            description: "Administración docente y procesos académicos.",
            icon: GraduationCap,
            path: "/secretariaDocente",
            color: "purple" as const
        }
    ];

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-900">
            
            {/* HEADER */}
            <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                            Panel de Administración
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-0.5">
                            Bienvenido, <span className="text-indigo-600">{user.nombres} {user.apellidos}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RUT</p>
                        <p className="text-sm font-semibold text-slate-700 font-mono">{user.rut}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-1"></div>
                    <button 
                        onClick={logout}
                        className="group flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-semibold"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            </header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {!mostrarCambiarTipo && !mostrarAutorizarConcursos && (
                        <>
                            {/* Tarjeta Administración de Usuarios */}
                            <DashboardCard
                                title="Cambiar Tipo de Usuario"
                                description="Gestionar roles y permisos de los usuarios del sistema."
                                icon={Users}
                                color="indigo"
                                onClick={() => setMostrarCambiarTipo(true)}
                            />
                            
                            {/* Tarjeta Autorizar Concursos (Condicional) */}
                            {user.tipo === 'encargado_ayudantias' && (
                                <DashboardCard
                                    title="Autorizar Concursos"
                                    description="Revisar y aprobar solicitudes de asignaturas pendientes."
                                    icon={ShieldCheck}
                                    color="red"
                                    onClick={() => setMostrarAutorizarConcursos(true)}
                                />  
                            )}

                            {/* Resto de Items de Navegación */}
                            {dashboardItems.map((item, index) => (
                                <DashboardCard
                                    key={index}
                                    title={item.title}
                                    description={item.description}
                                    icon={item.icon}
                                    color={item.color}
                                    onClick={() => handleNavigation(item.path)}
                                />
                            ))}
                        </>
                    )}

                    {/* VISTAS INTERNAS (Full Width) */}
                    {mostrarCambiarTipo && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 animate-in fade-in zoom-in-95 duration-300">
                            <CambiarTipoDeUsuario 
                                onClose={() => setMostrarCambiarTipo(false)} 
                                usuarios={usuarios}
                            />
                        </div>
                    )}

                    {mostrarAutorizarConcursos && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 animate-in fade-in zoom-in-95 duration-300">
                            <AutorizarConcursos 
                                onClose={() => setMostrarAutorizarConcursos(false)} 
                                mostrar={true}
                                asignaturasConcursos={asignaturasConcursos}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default function AdminPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const { data: usuarios, isLoading: cargandoUsuarios } = useUsuarios();
    const router = useRouter();

    useEffect(() => {
        if (isError || (!cargauser && !user)) {
            router.push("/login");
        }
    }, [isError, user, cargauser, router]);

    // ESTADO DE CARGA
    if (cargauser || cargandoUsuarios) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                </div>
                <p className="mt-6 text-slate-500 font-medium animate-pulse">Cargando sistema...</p>
            </div>
        );
    }

    // ESTADO DE REDIRECCIÓN / ERROR
    if (isError || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-slate-100">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Sesión no válida</h3>
                    <p className="text-slate-500 mb-6">No se pudo verificar tu identidad. Serás redirigido al inicio de sesión.</p>
                </div>
            </div>
        );
    }

    return <AdminDashboard user={user} usuarios={usuarios} />;
}