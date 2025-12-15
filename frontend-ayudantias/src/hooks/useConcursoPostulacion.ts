import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';


interface CrearConcursoData
{
    id_asignatura: number;
    semestre: string;
    entrega_antecedentes: Date;
    fecha_inicio: Date;
    fecha_termino: Date;
    tipo_ayudantia: string;
    tipo_remuneracion: string;
    horas_mensuales: number;
    horario_fijo: boolean;
    cant_ayudantes: number;
    estado: string;
    rut_secretaria: string;
    descripcion: string[];
}

export function useCrearConcurso() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (concurso: CrearConcursoData) => {
            const respuesta = await api.post('llamado-postulacion', concurso);
            return respuesta.data;
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({ queryKey: ['asignaturas'] });
        },
    });
}

export function useBuscarDatosAfiche(id_asignatura: number) {
    return useQuery({
        queryKey: ['llamado-postulacion', id_asignatura],
        queryFn: async() => {
            const respuesta = await api.get(`llamado-postulacion/${id_asignatura}`);
            return respuesta.data
        },
        enabled: false,
        retry: false,
    })
}

export function useCancelarAficheConcurso(){
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (id_concurso : number) => {
            await api.patch(`llamado-postulacion/${id_concurso}`);
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['llamado-postulacion']});
            clienteQuery.invalidateQueries({queryKey:['asignaturas']});
            
        }                        
    });

}
