"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import PostulantePage from "../postulante/page";
import AdminPage from "../adminDashboard/page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SecretariaDeptoPage from "../secretaria-depto/page";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const router = useRouter();
    const { data: user, isLoading, isError} = useUserProfile();
    const {setToken, setUsertipo} = useAuth();

    //para obtener el url de la ruta actual
    const rutaActual = typeof globalThis !== 'undefined' && globalThis.location? globalThis.window.location.pathname : '';

    useEffect(() => {
        if (isError)
        {
            //quitar la cookie logout
            setToken(null);
            setUsertipo(null);
            router.push("/login");
        }
    }, [isError, router, setToken, setUsertipo])
    
    // para redireccionar segun tipo de usuario
    useEffect(() => {
        if (user && !isLoading && rutaActual === "/dashboard")
        {
            switch (user?.tipo)
            {
                case 'admin':
                    router.push("/adminDashboard");
                    break;
                case 'alumno':
                    router.push("/postulante");
                    break;
                case 'secretariaDepto':
                    router.push("/secretaria-depto");
                    break;
            }
        }
    }, [user, isLoading, rutaActual, router])
    

    if (rutaActual.startsWith("/postulante"))
    {
        return <PostulantePage/>; 
    }

    if (rutaActual.startsWith("/adminDashboard"))
    {
        return <AdminPage/>;
    }

    if (rutaActual.startsWith("/secretaria-depto"))
    {
        return <SecretariaDeptoPage/>;
    }

    if (isLoading)
    {
        return <div>Cargando perfil...</div>;
    }

    /*if(isError)
    {
        return <div>Error al cargar los datos </div>
    }*/

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirigiendo...</p>
            </div>
        </div>
    );

}