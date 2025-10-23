import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';


export interface AyudantiasAnteriores
{
    id: number;
    rut_alumno: string;
    nombre_alumno: string;
    id_asignatura: string;
    nombre_asig: string;
    nombre_coordinador: string;
    evaluacion: number;
    rut_coordinador_otro: string;
    periodo: string;
    remunerada: string;
}

export function useAyudantiasPorAlumno(rut_alumno?: string){
    return useQuery<AyudantiasAnteriores, Error>({
        queryKey:['ayudantias', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`ayudantias/${rut_alumno}`);
            return respuesta.data;
        },
    });
}