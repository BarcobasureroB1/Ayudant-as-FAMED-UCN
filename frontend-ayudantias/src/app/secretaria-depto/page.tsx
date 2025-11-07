"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, User} from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
//import { useAsignaturas } from '@/hooks/useAsignaturas';
//import { useDepartamentos } from '@/hooks/useDepartamentos';
//import { useLlamados } from '@/hooks/useLlamados';
//import { useAyudantia } from '@/hooks/useAyudantia';

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

    const secretariaFeatures = [
        {
            title: "Gestión de Asignaturas",
            description: "Administrar asignaturas del departamento y sus detalles",
            icon: "📚",
            status: "soon" as const,
            color: "blue" as const
        },
        {
            title: "Control de Llamados",
            description: "Gestionar llamados a concursos y procesos de selección",
            icon: "📢",
            status: "soon" as const,
            color: "green" as const
        },
        {
            title: "Administración de Ayudantías",
            description: "Gestionar postulaciones y asignación de ayudantías",
            icon: "👨‍🏫",
            status: "soon" as const,
            color: "purple" as const
        }
    ];

    const handleBackToAdmin = () => {
        router.push('/adminDashboard');
    };

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
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="text-3xl mr-4">🚧</div>
                        <div>
                            <h2 className="text-xl font-bold">Vista en Desarrollo</h2>
                            <p className="opacity-90">
                                El equipo está trabajando para darle las herramientas de gestión departamental
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-90">Disponible próximamente</div>
                        <div className="w-32 bg-white bg-opacity-30 rounded-full h-2 mt-2">
                            <div className="bg-white h-2 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Funcionalidades de Secretaría
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {secretariaFeatures.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                            status={feature.status}
                            color={feature.color}
                        />
                    ))}
                </div>
                
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">💡</div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Información Importante</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Esta sección estará disponible en las próximas actualizaciones. 
                                Por mientras, puede utilizar el panel de administración principal.
                            </p>
                        </div>
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