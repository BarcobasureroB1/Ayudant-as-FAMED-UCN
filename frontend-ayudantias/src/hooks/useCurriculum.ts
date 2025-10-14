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

interface CurriculumData {
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
            const respuesta = await api.get(`/usuario/curriculum/${rut_alumno}`);
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
            const respuesta = await api.post('/usuario/curriculum', curriculum);
            return respuesta.data;
        },
        onSuccess: (_data) => {
            clienteQuery.invalidateQueries({ queryKey: ['curriculum'] });
        },
    });
}
