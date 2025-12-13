import {useMutation, useQueryClient, useQuery} from '@tanstack/react-query';
import api from '../api/axios';

export interface CrearAyudantíaData {
    departamento: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    lugar: string;
    rut_secretario: string;
    participantes: {
        nombre: string;
        cargo: string;
        correo: string;
    }[];  
    firmas: {
        nombre: string;
        cargo: string;
    }[];  
}

export function useCrearActa() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (ayudantia: CrearAyudantíaData) => {
            const respuesta = await api.post('acta', ayudantia);
            return respuesta.data;
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({ queryKey: ['actas'] });
        },
    });
}

export function useVerActasDeSecretario(rut_secretaria?: string){
    return useQuery({
        queryKey:['actas', rut_secretaria],
        queryFn: async () => {
            console.log("rut: ", rut_secretaria);
            const respuesta = await api.get(`acta/${rut_secretaria}`);
            return respuesta.data;
        },
    });
}