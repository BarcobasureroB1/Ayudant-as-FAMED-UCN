import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';

export interface Departamento
{
    id: number;
    nombre: string; 
}

export type DepartamentosData = Departamento[];

export function useDatosDepartamento(rut_secretaria?: string){
    return useQuery<DepartamentosData, Error>({
        queryKey:['Departamento', rut_secretaria],
        queryFn: async () => {
            console.log("rut: ", rut_secretaria);
            const respuesta = await api.get(`departamento/${rut_secretaria}`);
            return respuesta.data;
        },
    });
}

export function useDepartamentos(){
    return useQuery<DepartamentosData, Error>({
        queryKey:['Departamento'],
        queryFn: async () => {
            const respuesta = await api.get('departamento');
            return respuesta.data;
        },
    });
}