import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import api from '@/api/axios';

interface Ayudantia {
  nombreAsig: string;
  coordinador: string;
  evaluacion: string;
}

interface CursoTituloGrado {
  nombre: string;
  institucion: string;
  fecha: string;
}

interface ActividadCientifica {
  nombre: string;
  descripcion: string;
  periodoParticipacion: string;
}

interface ActividadExtracurricular {
  nombre: string;
  docenteInstitucion: string;
  descripcion: string;
  periodoParticipacion: string;
}

export interface CurriculumData {
  rut_alumno: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  comuna: string;
  ciudad: string;
  num_celular: string;
  correo: string;
  carrera: string;
  otros?: string;

  ayudantias?: Ayudantia[];
  cursos_titulos_grados?: CursoTituloGrado[];
  actividades_cientificas?: ActividadCientifica[];
  actividades_extracurriculares?: ActividadExtracurricular[];
}

export function useComprobarCurriculum(rut_alumno?: string) {
    return useQuery({
        queryKey: ['curriculum', rut_alumno],
        queryFn: async() => {
            const respuesta = await api.get(`curriculum/${rut_alumno}`);
            return respuesta.data
        },
        enabled: !!rut_alumno,
        retry: false,
    })
}

export function useCrearCurriculum() {
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (curriculum: CurriculumData) => {
            const respuesta = await api.post('curriculum', curriculum);
            return respuesta.data;
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({ queryKey: ['curriculum'] });
            clienteQuery.invalidateQueries({ queryKey: ['curriculum_ayudantias'] });
            clienteQuery.invalidateQueries({ queryKey: ['curriculum_cursos_titulos_grados'] });
            clienteQuery.invalidateQueries({ queryKey: ['curriculum_actividades_cientificas'] });
            clienteQuery.invalidateQueries({ queryKey: ['curriculum_extracurricular'] });
        },
    });
}

export function useActividadesExtracurriculares(rut_alumno?: string) {
    return useQuery({
        queryKey: ['curriculum_extracurricular', rut_alumno],
        queryFn: async() => {
            const respuesta = await api.get(`curriculum/extracurricular/${rut_alumno}`);
            return respuesta.data
        },
        enabled: !!rut_alumno,
        retry: false,
    })
}

export function useActividadescientificas(rut_alumno?: string) {
    return useQuery({
        queryKey: ['curriculum_actividades_cientificas', rut_alumno],
        queryFn: async() => {
            const respuesta = await api.get(`curriculum/cientificas/${rut_alumno}`);
            return respuesta.data
        },
        enabled: !!rut_alumno,
        retry: false,
    })
}

export function usecursos_titulos_grados(rut_alumno?: string) {
    return useQuery({
        queryKey: ['curriculum_cursos_titulos_grados', rut_alumno],
        queryFn: async() => {
            const respuesta = await api.get(`curriculum/cursos_titulos_grados/${rut_alumno}`);
            return respuesta.data
        },
        enabled: !!rut_alumno,
        retry: false,
    })
}

export function useAyudantias(rut_alumno?: string) {
    return useQuery({
        queryKey: ['curriculum_ayudantias', rut_alumno],
        queryFn: async() => {
            const respuesta = await api.get(`curriculum/ayudantias/${rut_alumno}`);
            return respuesta.data
        },
        enabled: !!rut_alumno,
        retry: false,
    })
}

export function useEditarCurriculum(){
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async ({id}:{id: number}) => {
            await api.patch(`curriculum/${id}`)
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['curriculum']});
        }                        
    });

}