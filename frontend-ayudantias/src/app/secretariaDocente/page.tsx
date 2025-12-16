"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Briefcase, RefreshCw } from 'lucide-react'; 

import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSecretariaDocente } from "@/hooks/useUsuarios"; 

import AdministrarEstudiantes from "@/components/SecretariaDocente/AdministrarEstudiantes";
import GenerarActa from "@/components/SecretariaDocente/generarActas";
import { useVerActasDeSecretario } from "@/hooks/useActas";
import VerActas from "@/components/SecretariaDocente/revisarActas";
import GenerarAyudantia from "@/components/SecretariaDocente/GenerarAyudantia";
import { ModalSeleccionarSecretariaAdmin } from "@/components/SecretariaDocente/ModalSeleccionarSecretariaAdmin";

export default function SecretariaDocentePage() {
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    type Vista = "estudiantes" | "acta" | "actas" | "ayudantias";
    const [vista, setVista] = useState<Vista>("estudiantes");

    const { data: user, isLoading, isError } = useUserProfile();
    
    // --- LÓGICA DE SELECCIÓN DE SECRETARIA (ESTADO GLOBAL) ---
    const { data: listaSecretarias, isLoading: cargaSecretarias } = useSecretariaDocente();
    const [rutSecretariaSeleccionada, setRutSecretariaSeleccionada] = useState<string>("");
    const [nombreSecretariaSeleccionada, setNombreSecretariaSeleccionada] = useState<string>("");
    const [modalSecAbierto, setModalSecAbierto] = useState(false);

    // Las actas dependen de la secretaria seleccionada
    const { data: actas } = useVerActasDeSecretario(rutSecretariaSeleccionada);

    useEffect(() => {
        if (isError || !user) {
            router.push("/login");
        }
    }, [isError, user, router]);

    // Efecto para inicializar la secretaria o pedir selección
    useEffect(() => {
        if (user) {
            if (user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') {
                if (!rutSecretariaSeleccionada) {
                    setModalSecAbierto(true);
                }
            } else if (user.tipo === 'secretaria_docente' || user.tipo === 'secretaria') {
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

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            
            {/* Modal de Selección Global */}
            <ModalSeleccionarSecretariaAdmin 
                abierto={modalSecAbierto}
                onClose={handleCerrarModalSecretaria}
                onSelect={handleSelectSecretaria}
                secretarias={listaSecretarias}
                isLoading={cargaSecretarias}
            />

            {/* --- ENCABEZADO PRINCIPAL UNIFICADO --- */}
            <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-200 overflow-hidden">
                
                {/* PARTE SUPERIOR: Título (Izq) y Pestañas + Logout (Der) */}
                <div className="p-6 flex flex-col xl:flex-row justify-between items-center gap-6">
                    
                    {/* IZQUIERDA: Botones de volver y Títulos */}
                    <div className="w-full xl:w-auto flex flex-col items-start">
                        {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') && (
                            <button 
                                onClick={handleBackToAdmin}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors text-sm font-medium"
                            >
                                <span className="mr-2">←</span> Volver al Panel Principal
                            </button>
                        )}
                        {user.tipo === 'coordinador_secretariaDocente' && (
                            <button 
                                onClick={handleBackToDobleTipo}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors text-sm font-medium"
                            >
                                <span className="mr-2">←</span> Volver al Panel Principal
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-gray-800 leading-tight">
                            Secretaría Docente
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Bienvenido, <span className="font-medium text-gray-700">{user.nombres} {user.apellidos}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">RUT: {user.rut}</p>
                    </div>

                    {/* DERECHA: Pestañas y Botón Logout */}
                    <div className="w-full xl:w-auto flex flex-col sm:flex-row items-center gap-3 justify-end">

                        {/* GRUPO DE PESTAÑAS (Restaurado a la posición "de antes") */}
                        <div className="flex bg-gray-100/80 p-1 rounded-lg overflow-x-auto max-w-full">
                            <button
                                onClick={() => setVista("estudiantes")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    vista === "estudiantes"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                                }`}
                            >
                                Administrar estudiantes
                            </button>

                            <button
                                onClick={() => setVista("acta")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    vista === "acta"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                                }`}
                            >
                                Generar acta
                            </button>

                            <button
                                onClick={() => setVista("actas")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    vista === "actas"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                                }`}
                            >
                                Ver actas
                            </button>

                            <button
                                onClick={() => setVista("ayudantias")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    vista === "ayudantias"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                                }`}
                            >
                                Formalizar Ayudantía
                            </button>
                        </div>

                        {/* BOTÓN CERRAR SESIÓN */}
                        <button
                            onClick={logout}
                            className="bg-gray-900 hover:bg-black text-white font-medium py-2.5 px-5 rounded-lg transition duration-200 text-sm whitespace-nowrap shadow-sm"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* PARTE INFERIOR: BARRA DE SUPERVISIÓN (Si es admin) */}
                {/* Se renderiza justo debajo del bloque anterior, dentro del mismo card */}
                {(user.tipo === 'admin' || user.tipo === 'encargado_ayudantias') && (
                    <div className="bg-indigo-50 border-t border-indigo-100 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-md shadow-sm text-indigo-600 border border-indigo-100">
                                <Briefcase size={18} />
                            </div>
                            <div className="text-sm">
                                <span className="font-bold text-indigo-700 uppercase text-xs block mb-0.5">
                                    Modo Supervisión Activo
                                </span>
                                <span className="text-indigo-900">
                                    Gestionando como: 
                                    {nombreSecretariaSeleccionada ? (
                                        <>
                                            <strong className="ml-1">{nombreSecretariaSeleccionada}</strong>
                                            <span className="text-indigo-700/70 ml-1 font-normal">(Rut: {rutSecretariaSeleccionada})</span>
                                        </>
                                    ) : (
                                        <span className="italic text-indigo-400 ml-1"> Seleccione Secretaria...</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setModalSecAbierto(true)}
                            className="flex items-center gap-2 bg-white text-indigo-600 px-3 py-1.5 rounded-md text-xs font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                            <RefreshCw size={14} /> 
                            Cambiar usuario
                        </button>
                    </div>
                )}
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex justify-center">
                <div className="w-full max-w-[95rem] px-0 sm:px-4">

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
    );
}