import { createContext, useContext } from 'react';
import { User } from '@/hooks/useUserProfile';
import { AlumnoData } from '@/hooks/useAlumnoProfile';
import { 
    CurriculumResponse, 
    ActividadExtracurricular,
    ActividadCientifica,
    CursoTituloGrado,
    AyudantiaResponse  
} from '@/hooks/useCurriculum';
import { PostulacionData } from '@/hooks/usePostulacion';
import { AyudantiasAnteriores } from '@/hooks/useAyudantia';
import { Asignatura } from '@/hooks/useAsignaturas';
import { UseMutationResult } from '@tanstack/react-query';

export interface LoadingGlobalState {
    postulaciones: boolean;
    asignaturas: boolean;
    ayudantias: boolean;
    curriculum: boolean;
    extra: boolean;
}

export interface PostulanteContextType{
    user?: User;
    alumno?: AlumnoData;
    curriculum?: CurriculumResponse;
    postulaciones?: PostulacionData[];
    actividadesExtracurriculares?: ActividadExtracurricular[];
    actividadesCientificas?: ActividadCientifica[];
    cursosTitulosGrados?: CursoTituloGrado[];
    ayudantias?: AyudantiaResponse[];
    ayudantiasAnteriores?: AyudantiasAnteriores[];
    asignaturasDisponibles?: Asignatura[];
    asignaturasTodas?: Asignatura[];
    
    loadingGlobal: LoadingGlobalState;

    cancelarPostulacion: UseMutationResult<any, Error, { id: number; }, unknown>;
}

export const PostulanteContexto = createContext<PostulanteContextType | null>(null);

export const usePostulante = () => {
    const contexto = useContext(PostulanteContexto);
    if (!contexto)
    {
        throw new Error('usePostulante debe estar dentro del PostulanteProvider');
    }
    return contexto;
};