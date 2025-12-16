import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';


export interface AyudantiasAnteriores
{
        id: number;
        evaluacion: string;
        periodo: string;
        remunerada: string;
        tipo_ayudantia: string;
        alumno: {
            rut: string;
            nombres: string;
            apellidos: string;
            nombre_carrera: string;
        },
        secretaria_docente: {
            rut: string;
            nombres: string;
            apellidos: string;
        },
        asignatura: {
            id: number;
            nombre: string;
        }
}

export function useAyudantiasPorAlumno(rut_alumno?: string){
    return useQuery<AyudantiasAnteriores, Error>({
        queryKey:['ayudantias', rut_alumno],
        queryFn: async () => {
            const respuesta = await api.get(`ayudantia/${rut_alumno}`);
            return respuesta.data;
        },
        enabled : !!rut_alumno,
    });
}

interface CrearAyudantíaData
{
    rut_alumno: string;
    id_asignatura: number;
    rut_coordinador_otro: string;
    periodo: string;
    remunerada: string;
    tipo_ayudantia: string;
}

export function useCrearAyudantia() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (ayudantia: CrearAyudantíaData) => {
            const respuesta = await api.post('ayudantia', ayudantia);
            return respuesta.data;
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({ queryKey: ['ayudantiasGlobales'] });
            clienteQuery.invalidateQueries({ queryKey: ['postulacionesCoordinador'] });
            clienteQuery.invalidateQueries({ queryKey: ['ayudantias'] });
            clienteQuery.invalidateQueries({queryKey: ['postulantes']});
        },
    });
}

export interface AyudantiaGlobalData {
    id: number;
    alumno: {
        rut: string;
        nombres: string;
        apellidos: string;
    };
    asignatura: {
        id: number;
        nombre: string;
    };
}

export function useTodasAyudantias() {
    return useQuery<AyudantiaGlobalData[], Error>({
        queryKey: ['ayudantiasGlobales'],
        queryFn: async () => {
            const respuesta = await api.get('/ayudantia');
            return respuesta.data;
        },

        staleTime: 1000 * 60,
    })
}