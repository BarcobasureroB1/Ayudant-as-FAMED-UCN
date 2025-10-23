import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';

export function useAsignaturasDisponiblesPostulacion(rut_alumno: string){
    return useQuery({
        queryKey:['asignaturas', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`asignaturas/${rut_alumno}`);
            return respuesta.data;
        },
    });
}

export function useTodasAsignaturas(){
    return useQuery({
        queryKey:['asignaturas'],
        queryFn: async () => {
            const respuesta = await api.get('asignaturas');
            return respuesta.data;
        },
    });
}
