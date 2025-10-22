import {useQuery} from '@tanstack/react-query';
import api from '../api/axios';

export function useTodasAsignaturas(){
    return useQuery({
        queryKey:['asignaturas'],
        queryFn: async () => {
            const respuesta = await api.get('/asignaturas');
            return respuesta.data;
        },
    });
}

