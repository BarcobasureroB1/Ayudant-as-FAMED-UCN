"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, User} from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

import AperturaConcursoAdmin from '@/components/Secretariadepartamento/AperturaConcursoAdmin';
import AperturaConcursoSecreDepto from '@/components/Secretariadepartamento/AperturaConcursoSecreDepto';

import { useTodasAsignaturas } from '@/hooks/useAsignaturas';


const InfoCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

interface UserProps {
    user: User;
    asignaturas: any[];
}

export const SecretariaDeptoDashboard = ({ user, asignaturas }: UserProps) => {
    const router = useRouter();

    const { setToken, setUsertipo } = useAuth();

    type Vista = 'Concurso' | 'Constancia' | 'Coordinador';
    const [vista, setVista] = useState<Vista>('Concurso');
    const isConcurso = vista === 'Concurso';
    const isConstancia = vista === 'Constancia';
    const isCoordinador = vista === 'Coordinador';

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
                            <button 
                                onClick={() => setVista('Coordinador')} 
                                className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                                isCoordinador 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Gestionar coordinadores
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
                <div className="flex justify-center">
                    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-12">
                            {vista === 'Concurso' ? (
                                <div className="space-y-6">
                                    {user.tipo === 'admin' && (
                                        <AperturaConcursoAdmin 
                                        asignaturas={asignaturas}
                                    />
                                    )}
                                    {user.tipo ==='secretaria_depto' && (
                                        <AperturaConcursoSecreDepto datosUsuario={user} />
                                    )}
                                </div>
                                
                            ): vista === 'Constancia' ? (
                                <div className="space-y-6">
                                </div>
                            ): vista ==='Coordinador' ? (
                                <div className="space-y-6">
                                    <InfoCard title="Gestionar Coordinadores">
                                        <p>Detalles de la gestión de coordinadores...</p>
                                    </InfoCard>
                                </div>
                            ) : null}

                    </div>
                </div>
        </div>
    );
};

export default function SecretariaDeptoPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();
    const { data: asignaturas, isLoading: cargaAsignaturas, isError: errorAsignaturas } = useTodasAsignaturas();
    const router = useRouter();

    useEffect(() => {
        if (isError || !user) {
            router.push("/login");
        }
    }, [isError, user, router]);

    if (cargauser || cargaAsignaturas) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (isError || !user || errorAsignaturas) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return <SecretariaDeptoDashboard user={user} asignaturas={asignaturas} />;
}