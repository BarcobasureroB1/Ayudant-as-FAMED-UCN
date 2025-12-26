import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';


export interface AyudantiasAnteriores
{
    id: number;
    alumno: {
        rut: string;
        nombres: string;
        apellidos: string;
        nombre_carrera: string;
    };
    asignatura: {
        id: string;
        nombre: string;
    }
    coordinador: {
        rut: string;
        nombres: string;
        apellidos: string;
    }
    evaluacion: string;
    periodo: string;
    remunerada: string;
    tipo_ayudantia: string;
}

export function useAyudantiasPorAlumno(rut_alumno?: string){
    return useQuery<AyudantiasAnteriores, Error>({
        queryKey:['ayudantias', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`ayudantia/${rut_alumno}`);
            return respuesta.data;
        },
        enabled: !!rut_alumno,
        retry: false,
    });
}