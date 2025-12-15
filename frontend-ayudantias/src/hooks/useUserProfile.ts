import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';

export interface User
{
    rut: string;
    nombres: string;
    correo: string;
    apellidos: string;
    tipo: 'admin' | 'postulante' | 'secretaria de departamento' | string; //despues añadir mas roles
    deshabilitado: boolean;
}


export function useUserProfile(){
    return useQuery({
        queryKey:['user'],
        queryFn: async () => {
            const respuesta = await api.get('/auth/profile');
            console.log("revisar si está deshabilitado: ",respuesta.data);
            return respuesta.data;
        },
    });
}