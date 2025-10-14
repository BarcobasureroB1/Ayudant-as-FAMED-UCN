"use client";

import React, {useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile,User } from '@/hooks/useUserProfile';
interface UserProps {
    user:User
}

export const AdminDashboard = ({user}:UserProps) => {

    return(
        <div>Bienvenido Admin: {user.nombres}</div>
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