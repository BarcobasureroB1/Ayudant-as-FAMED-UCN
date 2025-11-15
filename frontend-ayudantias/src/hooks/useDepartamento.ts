import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';

export interface DepartamentoData
{
    id: number;
    nombre: string; //Nombre del departamento
}

export function useDatosDepartamento(rut_secretaria?: string){
    return useQuery<DepartamentoData, Error>({
        queryKey:['Departamento', rut_secretaria],
        queryFn: async () => {
            console.log("rut: ", rut_secretaria);
            const respuesta = await api.get(`departamento/${rut_secretaria}`);
            return respuesta.data;
        },
    });
}