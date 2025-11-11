import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';

export function useAsignaturasDisponiblesPostulacion(rut_alumno: string){
    return useQuery({
        queryKey:['asignaturas', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`asignatura/${rut_alumno}`);
            return respuesta.data;
        },
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

//Vista Secretaria Depto

interface AsignaturaData
{
    id: number;
    nombre: string;
    estado: string;
    semestre: string;
    nrc: string;
    abierta_postulacion: boolean;
}

export function useAbrirConcurso() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/postulacion/${id}`);
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['postulaciones']});
        }                        
    });

}

export function useCerrarConcurso() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/postulacion/cerrar/${id}`);
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['postulaciones']});
        }                        
    });

}

export function useAsignaturasPorDepartamento(id_departamento: string){
    return useQuery<AsignaturaData[], Error>({
        queryKey:['asignaturas', id_departamento],
        queryFn: async () => {
            const respuesta = await api.get(`asignatura/por-departamento/${id_departamento}`);
            return respuesta.data;
        },
    });
}

//