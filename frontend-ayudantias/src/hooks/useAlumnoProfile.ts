import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
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

interface CrearAlumnoData{
    rut_alumno: string,
    nombres: string,
    apellidos: string,
    correo: string,
    fecha_admision: string,
    codigo_carrera: string,
    nombre_carrera: string,
    promedio: number,
    nivel: number,
    periodo: string

}

export function useCrearAlumno() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: async (Alumno: CrearAlumnoData) => {
      const respuesta = await api.post("alumno", Alumno);
      return respuesta.data;
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}