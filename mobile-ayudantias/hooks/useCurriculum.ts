import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import api from '../api/axios';
import { CurriculumDataEditar } from '@/app/editar-curriculum';

export interface Ayudantia {
  id?: number;
  nombre_asig: string;
  nombre_coordinador: string;
  evaluacion_obtenida: string;
}

export interface AyudantiaResponse {
  id?: number;
  nombre_asig: string;
  nombre_coordinador: string;
  evaluacion: string;
}

export interface CursoTituloGrado {
  id?:number;
  nombre_asig: string;
  n_coordinador: string;
  evaluacion: string;
}

export interface ActividadCientifica {
  id?: number;
  nombre: string;
  descripcion: string;
  periodo_participacion: string;
}

export interface ActividadExtracurricular {
  id?:number;
  nombre: string;
  docente: string;
  descripcion: string;
  periodo_participacion: string;
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

export interface CurriculumResponse {
    
    "id": number;
    "usuario": {
        "rut": string,
        "nombres": string,
        "apellidos": string,
        "password": string,
        "tipo": string,
        "c_ayudantias": number,
        "deshabilitado": boolean,
        "actividades_cientificas": [
            {
                "id": number,
                "nombre": string,
                "descripcion": string,
                "periodo_participacion": string
            }
        ],
        "ayudantias": [
            {
                "id": number,
                "nombre_asig": string,
                "nombre_coordinador": string,
                "evaluacion": string
            }
        ],
        "titulos": [
            {
                "id": number,
                "nombre_asig": string,
                "n_coordinador": string,
                "evaluacion": string
            }
        ],
        "actividades_extracurriculares": [
            {
                "id": number,
                "nombre": string,
                "docente": string,
                "descripcion": string,
                "periodo_participacion": string
            }
        ]
    },
    "nombres": string,
    "apellidos": string,
    "fecha_nacimiento": string,
    "comuna": string,
    "ciudad": string,
    "Num_Celular": string,
    "correo": string,
    "carrera": string,
    "otros": string
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
            const respuesta = await api.get(`extracurriculares/${rut_alumno}`);
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
            const respuesta = await api.get(`cientificas/${rut_alumno}`);
            return respuesta.data
        },
        enabled: !!rut_alumno,
        retry: false,
    })
}

export function useCursos_titulos_grados(rut_alumno?: string) {
    return useQuery({
        queryKey: ['curriculum_cursos_titulos_grados', rut_alumno],
        queryFn: async() => {
            const respuesta = await api.get(`titulos-cursos/${rut_alumno}`);
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
            const respuesta = await api.get(`ayudantias-curriculum/${rut_alumno}`);
            return respuesta.data
        },
        enabled: !!rut_alumno,
        retry: false,
    })
}

export function useEditarCurriculum(){
    const clienteQuery = useQueryClient();
    return useMutation({
        mutationFn: async (curriculum: CurriculumDataEditar) => {
            await api.patch(`curriculum/${curriculum.id}`, curriculum)
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({queryKey:['curriculum']});
            clienteQuery.invalidateQueries({queryKey:['curriculum_ayudantias']});
            clienteQuery.invalidateQueries({queryKey:['curriculum_cursos_titulos_grados']});
            clienteQuery.invalidateQueries({queryKey:['curriculum_actividades_cientificas']});
            clienteQuery.invalidateQueries({queryKey:['curriculum_extracurricular']});
        }                        
    });

}