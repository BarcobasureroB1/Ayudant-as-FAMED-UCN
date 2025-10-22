import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';

export interface PostulacionData
{
    id: number;
    nombre_asignatura: string;
    descripcion_carta: string;
    correo_profe: string;
    actividad: string;
    metodologia: string;
    dia: string;
    bloque: string;
}

export function usePostulacionesPorAlumno(rut_alumno?: string){
    return useQuery<PostulacionData, Error>({
        queryKey:['postulaciones', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`postulaciones/${rut_alumno}`);
            return respuesta.data;
        },
    });
}

export function useCancelarPostulacion(){   
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async ({id}:{id: number}) => {
            await api.patch(`postulaciones/${id}`)
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['postulaciones']});
        }                        
    });

}

export function useCrearSubjects() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async ({nombre_asignatura, descripcion_carta, correo_profe, actividad, metodologia, dia, bloque}:PostulacionData) => {
            const respuesta = await api.post('asignatura',{nombre_asignatura, descripcion_carta, correo_profe, actividad, metodologia, dia, bloque});
            return respuesta.data;
        },
        onSuccess: () => {
            clienteQuery.invalidateQueries({queryKey:['subjects']});
        },
    });
}