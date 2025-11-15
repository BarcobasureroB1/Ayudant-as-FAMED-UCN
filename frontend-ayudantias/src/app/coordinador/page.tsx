"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, User} from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';


interface UserProps {
    user: User;
}

const FeatureCard = ({ 
    title, 
    description, 
    icon, 
    status = "soon",
    color = "blue" 
}: { 
    title: string; 
    description: string; 
    icon: string; 
    status?: "soon" | "active";
    color?: "blue" | "green" | "purple" | "red" | "yellow";
}) => {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-200 text-blue-700",
        green: "bg-green-50 border-green-200 text-green-700",
        purple: "bg-purple-50 border-purple-200 text-purple-700",
        red: "bg-red-50 border-red-200 text-red-700",
        yellow: "bg-yellow-50 border-yellow-200 text-yellow-700"
    };

    const statusClasses = status === "soon" 
        ? "opacity-60 cursor-not-allowed" 
        : "cursor-pointer hover:scale-105 hover:shadow-md";

    return (
        <div 
            className={`p-6 rounded-lg border-2 transition-all duration-300 ${colorClasses[color]} ${statusClasses}`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="text-2xl mr-3">
                        <span>{icon}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                {status === "soon" && (
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        Próximamente
                    </span>
                )}
            </div>
            <p className="text-sm opacity-80">{description}</p>
        </div>
    );
};

export const SecretariaDeptoDashboard = ({ user }: UserProps) => {
    const router = useRouter();

    const { setToken, setUsertipo } = useAuth();

    type Vista = 'Concurso' | 'Constancia';
    const [vista, setVista] = useState<Vista>('Concurso');
    const isConcurso = vista === 'Concurso';
    const isConstancia = vista === 'Constancia';

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
        }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <button 
                            onClick={handleBackToAdmin}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                        >
                            <span className="mr-2">←</span>
                            Volver al Panel Principal
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Secretaría de Departamento
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Bienvenido, {user.nombres} {user.apellido}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Rol: {user.tipo}</p>
                        <p className="text-sm text-gray-600">RUT: {user.rut}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button 
                                onClick={() => setVista('Concurso')} 
                                className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                isConcurso 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Abrir concurso de postulacion
                            </button>
                            <button 
                                onClick={() => setVista('Constancia')} 
                                className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                isConstancia 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Generar constancia
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

        </div>
    );
};

export default function SecretariaDeptoPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        if (isError || !user) {
            router.push("/login");
        }
    }, [isError, user, router]);

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

    return <SecretariaDeptoDashboard user={user} />;
}