"use client";

import React, {useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile,User } from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
import { useUsuarios } from "@/hooks/useUsuarios";

interface UserProps {
    user:User
    usuarios: any[];
}
const DashboardCard = ({ 
        title, 
        description, 
        icon, 
        onClick, 
        color = "blue" 
    }: { 
        title: string; 
        description: string; 
        icon: string; 
        onClick: () => void;
        color?: "blue" | "green" | "purple" | "red" | "yellow" | "orange";
    }) => {
        const colorClasses = {
            blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
            green: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
            purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700",
            red: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700",
            yellow: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700",
            orange: "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
        };

        return (
            <div 
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-md ${colorClasses[color]}`}
                onClick={onClick}
            >
                <div className="flex items-center mb-3">
                    <div className="text-2xl mr-3">
                        <span>{icon}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <p className="text-sm opacity-80">{description}</p>
            </div>
        );
    };

export const AdminDashboard = ({user, usuarios}:UserProps) => {

    const {setToken, setUsertipo} = useAuth();

    const router = useRouter();

    const logout = () => {
        setToken(null);
        setUsertipo(null);
        Cookies.remove('token');
        Cookies.remove('tipoUser');
        router.push('/login');
        router.refresh();
    }

    const dashboardCoordinador = [
        {
            title: "Coordinador",
            description: "Acceder a funciones de coordinador",
            icon: "📄",
            path:"/coordinador",
            color: "yellow" as const
        }
    ];

    const dashboardDirectordepto = [
        {
            title: "Director de Departamento",
            description: "Acceder a funciones de director de departamento",
            icon: "🏛️",
            path:"/directorDepartamento",
            color: "orange" as const
        }
    ];

    const dashboardSecretariaDoc = [
        {
            title: "Secretaría Docente",
            description: "Acceder a funciones de secretaría docente",
            icon: "📝",
            path:"/secretariaDocente",
            color: "purple" as const
        }
    ];

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Panel de opciones
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Bienvenido, {user.nombres} {user.apellidos}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-black">RUT: {user.rut}</p>
                         <button 
                            onClick={logout}
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.tipo === 'coordinador_secretariaDocente' && (
                    <>
                        {dashboardCoordinador.map((item, index) => (
                            <DashboardCard
                                key={index}
                                title={item.title}
                                description={item.description}
                                icon={item.icon}
                                color={item.color}
                                onClick={() => handleNavigation(item.path)}
                            />
                        ))} 
                        {dashboardSecretariaDoc.map((item, index) => (
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

                {user.tipo === 'coordinador_directorDepto' && (
                    <>
                        {dashboardCoordinador.map((item, index) => (
                            <DashboardCard
                                key={index}
                                title={item.title}
                                description={item.description}
                                icon={item.icon}
                                color={item.color}
                                onClick={() => handleNavigation(item.path)}
                            />
                        ))} 
                        {dashboardDirectordepto.map((item, index) => (
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
            </div>


        </div>
    );
};

export default function AdminPage()
{
    const { data: user, isLoading: cargauser, isError } = useUserProfile();

    const { data: usuarios, isLoading: cargandoUsuarios } = useUsuarios();

        const router = useRouter();
    
        useEffect(() => {
            if (isError || !user) {
                router.push("/login");
            }
        }, [isError, user, router]);
    
        if (cargauser || cargandoUsuarios) {
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
    
        return <AdminDashboard user={user} usuarios={usuarios} />;
};