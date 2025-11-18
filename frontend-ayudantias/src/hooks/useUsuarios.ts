import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';

interface PatchData
{
    rut_usuario: string;
    nuevo_tipo: string;
}

export function useUsuarios(){
    return useQuery({
        queryKey:['usuarios'],
        queryFn: async () => {
            const respuesta = await api.get('usuario');
            return respuesta.data;
        },
    });
}

export function useCambiarTipoUsuario() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (datos: PatchData) => {
            await api.patch('/usuario/cambiar-tipo/', datos);
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['usuarios']});
        }                        
    });

}