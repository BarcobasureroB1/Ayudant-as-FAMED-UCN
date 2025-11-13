import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';

interface AsignarCoordinador
{
    id_asignatura: number;
    rut_coordinador: string;
}

interface QuitarCoordinador
{
    id_asignatura: string
    rut_coordinador: string
}

export function useCrearCurriculum() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (Info: AsignarCoordinador) => {
            const respuesta = await api.post('coordinador', Info);
            return respuesta.data;
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({ queryKey: ['asignaturasCoordinadores'] });
        },
    });
}

export function useQuitarCoordinador() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (info: QuitarCoordinador) => {
            await api.patch(`/coordinador/estado/${info.id_asignatura}/${info.rut_coordinador}`);
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['asignaturasCoordinadores']});
        }                        
    });

}