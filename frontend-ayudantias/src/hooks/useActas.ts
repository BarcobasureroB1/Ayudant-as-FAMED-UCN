import {useMutation, useQueryClient} from '@tanstack/react-query';
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

export function useCrearAyudantia() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (ayudantia: CrearAyudantíaData) => {
            const respuesta = await api.post('ayudantia', ayudantia);
            return respuesta.data;
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({ queryKey: ['ayudantias'] });
        },
    });
}