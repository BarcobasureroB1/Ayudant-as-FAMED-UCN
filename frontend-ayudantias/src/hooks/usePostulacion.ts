import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';

export interface PostulacionData
{
    id: number;
    rut_alumno: string;
    id_asignatura: string;
    descripcion_carta: string;
    correo_profe: string;
    actividad: string;
    metodologia: string;
    dia: string;
    bloque: string;
}

export interface CrearPostulacion
{
    rut_alumno: string;
    id_asignatura: string;
    nombre_asignatura: string;
    descripcion_carta: string;
    correo_profe: string;
    actividad: string;
    metodologia: string;
    dia: string;
    bloque: string;
}

export interface EditarPostulacion
{
    id: number;
    rut_alumno: string;
    id_asignatura: string;
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
            console.log("rut: ", rut_alumno);
            const respuesta = await api.get(`postulacion/${rut_alumno}`);
            return respuesta.data;
        },
    });
}

export function useCancelarPostulacion(){   
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async ({id}:{id: number}) => {
            await api.patch(`/postulacion/cancel/${id}`)
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['postulaciones']});
        }                        
    });

}

export function useCrearPostulacion() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (postulacion: CrearPostulacion) => {
            const respuesta = await api.post('postulacion', postulacion);
            return respuesta.data;
        },
        onSuccess: () => {
            clienteQuery.invalidateQueries({queryKey:['postulaciones']});
        },
    });
}

export function useEditarPostulacion() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (postulacion: EditarPostulacion) => {
            await api.patch('/postulacion', postulacion);
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['postulaciones']});
        }                        
    });

}