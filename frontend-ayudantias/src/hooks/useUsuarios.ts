import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';

interface PatchData
{
    rut_usuario: string;
    nuevo_tipo: string;
}

export interface UsuarioData {
    rut: string;
    nombres: string;
    apellidos: string;
    tipo: string;
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

export function useDeshabilitarUsuario(){   
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (rut : string) => {
            await api.patch(`/usuario/deshabilitar/${rut}`)
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['usuarios']});
        }                        
    });

}

export function useHabilitarUsuario(){   
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (rut : string) => {
            await api.patch(`/usuario/habilitar/${rut}`)
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['usuarios']});
        }                        
    });

}

export function useSecretariaDocente()
{
    return useQuery<UsuarioData[]>({
        queryKey: ['usuarios', 'secretaria'],
        queryFn: async () => {
            const { data } = await api.get('/usuario/secretaria-docente/endpoint/a');
            return data;
        }
    })

}


