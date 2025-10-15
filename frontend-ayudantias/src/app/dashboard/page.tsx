"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import PostulantePage from "../postulante/page";
import AdminPage from "../adminDashboard/page";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const { data: user, isLoading, isError} = useUserProfile();
    
    if (isLoading)
    {
        return <div>Cargando perfil...</div>;
    }

    if (isError)
    {
        //quitar la cookie logout
        router.push("/login");
        return <div>Error al cargar los datos </div>
    }

    switch (user?.tipo)
    {
        case 'admin':
            return <AdminPage/>;
        case 'postulante':
            return <PostulantePage/>;
        default:
            return <div>Sin permisos necesarios</div>
    }




}