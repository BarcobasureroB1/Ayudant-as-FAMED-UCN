"use client";
import React from 'react';
import { usePostulantesCoordinador, useAyudantesActivos } from '@/hooks/useCoordinadores';
import { CoordinadorDashboard } from '@/app/coordinador/page';
import { User } from '@/hooks/useUserProfile';

export const CoordinadorUser = ({user}: {user: User}) => {
    const { data: postulantes, isLoading: cargaPostulantes } = usePostulantesCoordinador(user.rut);
    const { data: ayudantes, isLoading: cargaAyudantes } = useAyudantesActivos(user.rut);

    return(
        <CoordinadorDashboard
            user={user}
            postulantes={postulantes}
            ayudantes={ayudantes}
            loading={cargaAyudantes || cargaPostulantes}
        />
    );
};