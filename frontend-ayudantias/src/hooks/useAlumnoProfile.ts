import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';


export interface AlumnoData
{
    rut_alumno: string;
    nombres: string;
    apellidos: string;
    fecha_admision: string;
    nivel: number;
}

export function useAlumnoProfile(rut_alumno?: string){
    return useQuery<AlumnoData, Error>({
        queryKey:['alumno', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`usuario/alumno/${rut_alumno}`);
            return respuesta.data;
        },
    });
}

// Necesario para listar todos los alumnos en la vista de secretaria de departamento
export function useAlumnos(){
    return useQuery({
        queryKey:['alumnos'],
        queryFn: async () => {
            const respuesta = await api.get('alumno');
            return respuesta.data;
        },
    });
}
