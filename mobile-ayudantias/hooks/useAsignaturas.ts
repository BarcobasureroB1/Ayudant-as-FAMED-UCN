import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';

export interface Asignatura {
    id: string;
    nombre: string,
    estado: string,
    semestre: number,
    nrc: string,
}


export function useAsignaturasDisponiblesPostulacion(rut_alumno: string){
    return useQuery({
        queryKey:['asignaturas', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`asignatura-alumno/${rut_alumno}`);
            return respuesta.data;
        },

        enabled: !!rut_alumno,
        retry: false,
    });
}

export function useTodasAsignaturas(){
    return useQuery({
        queryKey:['asignaturas'],
        queryFn: async () => {
            const respuesta = await api.get('asignatura');
            return respuesta.data;
        },
    });
}
