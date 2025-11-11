"use client";

import React, {useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile,User } from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';
interface UserProps {
    user:User
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
        color?: "blue" | "green" | "purple" | "red" | "yellow";
    }) => {
        const colorClasses = {
            blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
            green: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
            purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700",
            red: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700",
            yellow: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700"
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

export const AdminDashboard = ({user}:UserProps) => {

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

    const dashboardItems = [
        {
            title: "Gestión de Postulantes",
            description: "Ver y gestionar postulaciónes",
            icon: "👥",
            path: "/postulante",
            color: "blue" as const
        },
        {
            title: "Secretaría de Depto",
            description: "Acceder a funciones de secretaría de depto (proximamente)",
            icon: "📊",
            path:"/secretaria-depto",
            color: "green" as const
        },
        /*{
            title: "Coordinador",
            description: "Acceder a funciones de coordinador (proximamente)",
            icon: "📄",
            color: "purple" as const
        }*/
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
                            Panel de Administración
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Bienvenido, {user.nombres} {user.apellido}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-black">Rol: {user.tipo}</p>
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

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>
            </div>
        </div>
    );
};

export default function AdminPage()
{
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
    
        return <AdminDashboard user={user}/>;
};