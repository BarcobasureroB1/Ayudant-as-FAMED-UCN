"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
    Briefcase, 
    RefreshCw, 
    LogOut, 
    ChevronLeft, 
    Users, 
    FileText, 
    Files, 
    GraduationCap,
    LayoutDashboard 
} from 'lucide-react'; 

import { useAuth } from "@/context/AuthContext";
import { useUserProfile, User } from "@/hooks/useUserProfile";
import { useSecretariaDocente } from "@/hooks/useUsuarios"; 
import { useVerActasDeSecretario } from "@/hooks/useActas";

import AdministrarEstudiantes from "@/components/SecretariaDocente/AdministrarEstudiantes";
import GenerarActa from "@/components/SecretariaDocente/generarActas";
import VerActas from "@/components/SecretariaDocente/revisarActas";
import GenerarAyudantia from "@/components/SecretariaDocente/GenerarAyudantia";
import { ModalSeleccionarSecretariaAdmin } from "@/components/SecretariaDocente/ModalSeleccionarSecretariaAdmin";

interface UserProps {
    user: User;
}

// --- COMPONENTE DASHBOARD (Copia exacta del estilo Director) ---
export const SecretariaDocenteDashboard = ({ user }: UserProps) => {
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    type Vista = "estudiantes" | "acta" | "actas" | "ayudantias";
    const [vista, setVista] = useState<Vista>("estudiantes");

    // --- LÓGICA DE SELECCIÓN DE SECRETARIA (Mantenida) ---
    const { data: listaSecretarias, isLoading: cargaSecretarias } = useSecretariaDocente();
    const [rutSecretariaSeleccionada, setRutSecretariaSeleccionada] = useState<string>("");
    const [nombreSecretariaSeleccionada, setNombreSecretariaSeleccionada] = useState<string>("");
    const [modalSecAbierto, setModalSecAbierto] = useState(false);

    const { data: actas } = useVerActasDeSecretario(rutSecretariaSeleccionada);

    useEffect(() => {
        if (user) {
            if (user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') {
                if (!rutSecretariaSeleccionada) {
                    setModalSecAbierto(true);
                }
            } else if (user.tipo === 'secretaria_docente' || user.tipo === 'secretaria' || user.tipo === 'coordinador_secretariaDocente') {
                setRutSecretariaSeleccionada(user.rut);
                setNombreSecretariaSeleccionada(`${user.nombres} ${user.apellidos}`);
            }
        }
    }, [user, rutSecretariaSeleccionada]);

    const handleSelectSecretaria = (rut: string, nombre: string) => {
        setRutSecretariaSeleccionada(rut);
        setNombreSecretariaSeleccionada(nombre);
        setModalSecAbierto(false);
    };

    const handleCerrarModalSecretaria = () => {
        if (user?.tipo === 'admin' && !rutSecretariaSeleccionada) {
            router.push('/adminDashboard');
        } else {
            setModalSecAbierto(false);
        }
    };

    const handleBackToAdmin = () => {
        router.push('/adminDashboard');
    };

    const handleBackToDobleTipo = () => {
        router.push('/DobleTipo');
    };

    const logout = () => {
        setToken(null);
        setUsertipo(null);
        Cookies.remove("token");
        Cookies.remove("tipoUser");
        router.push("/login");
        router.refresh();
    };

    // Helper para clases de botones activos (Estilo Director)
    const getTabClass = (isActive: boolean) => 
        `flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 whitespace-nowrap ${
            isActive 
            ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm h-16">
                <div className="max-w-[98%] mx-auto px-4 h-full">
                    <div className="flex justify-between h-full items-center">
                        
                        {/* IZQUIERDA: LOGO Y TÍTULO */}
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight hidden md:block">
                                {/* Condición para el título principal */}
                                {user.tipo === 'admin' ? 'Portal Administración' : 'Portal Secretaría Docente'}
                            </span>
                        </div>

                        {/* DERECHA: DATOS USUARIO Y LOGOUT */}
                        <div className="flex items-center gap-5">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-900">
                                    {user.nombres.split(' ')[0]} {user.apellidos.split(' ')[0]}
                                </p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    {/* Condición para el cargo/rol */}
                                    {user.tipo === 'admin' ? 'Administrador' : 'Secretaría Docente'}
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

            {/* Modal de Selección Global */}
            <ModalSeleccionarSecretariaAdmin 
                abierto={modalSecAbierto}
                onClose={handleCerrarModalSecretaria}
                onSelect={handleSelectSecretaria}
                secretarias={listaSecretarias}
                isLoading={cargaSecretarias}
            />

            {/* Contenedor Principal Expandido (max-w-[98%]) */}
            <div className="max-w-[98%] mx-auto px-4 py-6">
                
                {/* Header Actions & Title */}
                <div className="flex flex-col xl:flex-row justify-between items-end mb-6 gap-6">
                    <div>
                        {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias' || user.tipo === 'coordinador_secretariaDocente') && (
                            <button 
                                onClick={user.tipo === 'coordinador_secretariaDocente' ? handleBackToDobleTipo : handleBackToAdmin}
                                className="flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 mb-2 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Panel
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Secretaría Docente</h1>
                        <p className="text-gray-500 text-base mt-1">Administración centralizada de procesos académicos.</p>
                    </div>

                    {/* Main Tabs (Botones superiores) - Estilo Director */}
                    <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex overflow-x-auto max-w-full">
                        <button onClick={() => setVista('estudiantes')} className={getTabClass(vista === 'estudiantes')}>
                            <Users className="w-5 h-5" /> Estudiantes
                        </button>
                        <button onClick={() => setVista('acta')} className={getTabClass(vista === 'acta')}>
                            <FileText className="w-5 h-5" /> Generar Acta
                        </button>
                        <button onClick={() => setVista('actas')} className={getTabClass(vista === 'actas')}>
                            <Files className="w-5 h-5" /> Ver Actas
                        </button>
                        <button onClick={() => setVista('ayudantias')} className={getTabClass(vista === 'ayudantias')}>
                            <GraduationCap className="w-5 h-5" /> Ayudantías
                        </button>
                    </div>
                </div>

                {/* Barra de Supervisión (Solo Admin) - Adaptada al estilo limpio */}
                {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg text-indigo-600 shadow-sm border border-indigo-50">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Modo Supervisión Activo</p>
                                <p className="text-sm text-indigo-900">
                                    Gestionando vista de: <span className="font-bold">{nombreSecretariaSeleccionada || "Seleccione..."}</span>
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setModalSecAbierto(true)}
                            className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" /> 
                            Cambiar Usuario
                        </button>
                    </div>
                )}

                {/* Content Area - Tarjeta Blanca Grande (Estilo Director) */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[600px]">
                        {vista === "estudiantes" && <AdministrarEstudiantes />}

                        {vista === "acta" && (
                            <GenerarActa rutSecretario={rutSecretariaSeleccionada} />
                        )}

                        {vista === "actas" && (
                            <VerActas actas={actas} />
                        )}
                        
                        {vista === "ayudantias" && (
                            <GenerarAyudantia 
                                rutSecretaria={rutSecretariaSeleccionada} 
                                onBack={() => setVista("estudiantes")} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL (Page Logic) ---
export default function SecretariaDocentePage() {
    const { data: user, isLoading, isError } = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        if (isError || (!isLoading && !user)) {
            router.push("/login");
        }
    }, [isError, user, router, isLoading]);

    if (isLoading) {
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

    return <SecretariaDocenteDashboard user={user} />;
}