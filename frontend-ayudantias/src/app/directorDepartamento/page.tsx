"use client";

import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile, User} from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

import AutorizarConcursos from '@/components/FuncionesEncargado/AutorizarConcursos';
import { useSolicitudesDeConcurso } from '@/hooks/useAsignaturas';

interface UserProps {
    user: User;
}

export const SecretariaDeptoDashboard = ({ user }: UserProps) => {
    const router = useRouter();

    const { setToken, setUsertipo } = useAuth();
    const { data: asignaturasConcursos } = useSolicitudesDeConcurso();

    type Vista = 'Concurso' | 'Constancia' | 'Coordinador';
    const [vista, setVista] = useState<Vista>('Concurso');
    const isConcurso = vista === 'Concurso';

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
                        {user.tipo === 'admin' && (
                        <button 
                            onClick={handleBackToAdmin}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                        >
                            <span className="mr-2">←</span>
                            Volver al Panel Principal
                        </button>
                        )}
                        {user.tipo === 'encargado_ayudantias' && (
                        <button 
                            onClick={handleBackToAdmin}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                        >
                            <span className="mr-2">←</span>
                            Volver al Panel Principal
                        </button>
                        )}
                        <h1 className="text-2xl font-bold text-gray-800">
                            Dirección de Departamento
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Bienvenido, {user.nombres} {user.apellidos}
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
                                Revisar solicitudes de concurso
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
                                    <AutorizarConcursos 
                                        asignaturasConcursos={asignaturasConcursos}
                                        mostrar={false}
                                        onClose={() => {}}
                                    />
                                </div>
                                
                            ) : null}

                    </div>
                </div>
        </div>
    );
};

export default function SecretariaDeptoPage() {
    const { data: user, isLoading: cargauser, isError } = useUserProfile();

    const router = useRouter();

    useEffect(() => {
        if (isError || !user ) {
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
                    <p className="mt-4 text-gray-600">Ocurrió un error al buscar los datos. Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    return <SecretariaDeptoDashboard user={user}/>;
}