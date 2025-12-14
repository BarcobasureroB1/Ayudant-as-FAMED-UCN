"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

import AdministrarEstudiantes from "@/components/SecretariaDocente/AdministrarEstudiantes";
import GenerarActa from "@/components/SecretariaDocente/generarActas";
import { useVerActasDeSecretario } from "@/hooks/useActas";
import VerActas from "@/components/SecretariaDocente/revisarActas";

import GenerarAyudantia from "@/components/SecretariaDocente/GenerarAyudantia";


export default function SecretariaDocentePage() {
    const router = useRouter();
    const { setToken, setUsertipo } = useAuth();

    type Vista = "estudiantes" | "acta" | "actas" | "ayudantias";
    const [vista, setVista] = useState<Vista>("estudiantes");

    const { data: user, isLoading, isError } = useUserProfile();
    const { data: actas } = useVerActasDeSecretario(user?.rut);

    useEffect(() => {
        if (isError || !user) {
            router.push("/login");
        }
    }, [isError, user, router]);

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

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        {user.tipo === 'admin' || user.tipo === 'encargado_ayudantias' && (
                        <button 
                            onClick={handleBackToAdmin}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                        >
                            <span className="mr-2">←</span>
                            Volver al Panel Principal
                        </button>
                        )}
                        {user.tipo === 'coordinador_secretariaDocente' && (
                        <button 
                            onClick={handleBackToDobleTipo}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                        >
                            <span className="mr-2">←</span>
                            Volver al Panel Principal
                        </button>
                        )}
                        <h1 className="text-2xl font-bold text-gray-800">
                            Secretaría Docente
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Bienvenido, {user.nombres} {user.apellidos}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-600">RUT: {user.rut}</p>
                    </div>

                    <div className="flex bg-gray-100 rounded-lg p-1 space-x-1 overflow-x-auto max-w-full">

                        <button
                            onClick={() => setVista("estudiantes")}
                            className={`py-2 px-4 rounded-lg transition-all duration-200 whitespace-nowrap ${
                                vista === "estudiantes"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Administrar estudiantes
                        </button>

                        <button
                            onClick={() => setVista("acta")}
                            className={`py-2 px-4 rounded-lg transition-all duration-200 whitespace-nowrap ${
                                vista === "acta"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Generar acta
                        </button>

                        <button
                            onClick={() => setVista("actas")}
                            className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                vista === "actas"
                                ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Ver actas
                        </button>

                        <button
                            onClick={() => setVista("ayudantias")}
                            className={`py-2 px-4 rounded-lg transition-all duration-200 whitespace-nowrap ${
                                vista === "ayudantias"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            Formalizar Ayudantía
                        </button>

                    </div>

                    <button
                        onClick={logout}
                        className="bg-gray-800 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Cerrar Sesión
                    </button>

                </div>
            </div>

            <div className="flex justify-center">
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12">

                    {vista === "estudiantes" && <AdministrarEstudiantes />}

                    {vista === "acta" && (
                        <GenerarActa rutSecretario={user.rut} />
                    )}

                    {vista === "actas" && (
                        <VerActas actas={actas} />
                    )}
                    
                    {vista === "ayudantias" && (
                        <GenerarAyudantia user={user} onBack={() => setVista("estudiantes")} />
                    )}
                </div>
            </div>
        </div>
    );
}

