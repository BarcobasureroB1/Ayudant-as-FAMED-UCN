import { useMutation,useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export interface CoordinadorAsignatura {
  coordinadorId: number;
  asignatura: {
    id: number;
    nombre: string;
  };
  actual: boolean;
}

export interface CoordinadorData {
  rut: string;
  nombres: string;
  apellidos: string;
  asignaturas: {
    coordinadorId: number;
    asignatura: {
      id: number;
      nombre: string;
    };
    actual: boolean;
  }[];
}

interface AsignarCoordinador {
  rut_coordinador: string;
  id_asignatura: number;
}

interface QuitarCoordinador {
  id_asignatura: string;
  rut_coordinador: string;
}

interface AlumnoData {
  nombres: string;
  apellidos: string;
  nombre_carrera: string;
}

export interface PostulanteCoordinadorData {
  id: number;
  rut_alumno: string;
  alumno: AlumnoData;
  id_asignatura: number;
  nombre_asignatura: string;
  descripcion_carta: string;
  metodologia: string;
  actividad: string;
  puntuacion_etapa1: number;
  puntuacion_etapa2: number | null;
  motivo_descarte: string | null;
  fecha_descarte: string | null;
  rechazada_por_jefatura: boolean;
}


export interface AyudanteActivoData {
  id: number;
  
  alumno: {
    rut:string;
    nombres: string;
    apellidos: string;
  };
  asignatura: string;
  periodo: string;
  evaluacion: number | null;
}

interface EvaluarPostulacion {
  id_postulacion: number;
  puntuacion_etapa2: number;
}

interface DescartarPostulacion {
  id_postulacion: number;
  motivo_descarte: string;
  fecha_descarte: string;
  rechazada_por_jefatura: boolean;
}

interface EvaluarAyudante {
  id_ayudantia: number;
  evaluacion: number;
}

export interface PostulanteCoordinador {
  id: number;
  rut_alumno: string;
  alumno: {
    rut: string;
    nombres: string;
    apellidos: string;
  };
  id_asignatura: number;
  nombre_asignatura: string;
  descripcion_carta: string;
  metodologia: string;
  actividad:string;
  puntuacion_etapa1: number;
  puntuacion_etapa2: number | null;
  motivo_descarte: string | null;
  fecha_descarte: string | null;
  rechazada_por_jefatura: boolean;
  coordinador: {
    rut: string;
    nombres: string;
    apellidos: string;
  };
}

export interface AyudanteCoordinador {
  id: number;
  alumno: {
    rut: string;
    nombres: string;
    apellidos: string;
    correo: string;
    nivel: number;
    promedio: number;
    nombre_carrera: string;
  };
  asignatura: string;
  periodo: string;
  evaluacion: number | null;
  coordinador: {
    rut: string;
    nombres: string;
    apellidos: string;
  };
}

export function useAsignarCoordinador() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: async (info: AsignarCoordinador) => {
      const respuesta = await api.post("coordinador", info);
      return respuesta.data;
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: ["asignaturasCoordinadores"] });
      clienteQuery.invalidateQueries({ queryKey: ["coordinadores"] });
    },
  });
}

export function useQuitarCoordinador() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: async (info: QuitarCoordinador) => {
      await api.patch(
        `/coordinador/estado/${info.id_asignatura}/${info.rut_coordinador}`
      );
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: ["asignaturasCoordinadores"] });
      clienteQuery.invalidateQueries({ queryKey: ["coordinadores"] });
    },
  });
}

export function useCoordinadoresTodos() {
  return useQuery({
    queryKey: ["coordinadores"],
    queryFn: async () => {
      const respuesta = await api.get("usuario/coordinadores/all");
      return respuesta.data;
    },
  });
}


//hooks pa la vista de coordinador
export function usePostulantesCoordinador(rut_coordinador?: string) {
  return useQuery<PostulanteCoordinadorData[], Error>({
    queryKey: ["postulantesCoordinador", rut_coordinador],
    queryFn: async () => {
      if (!rut_coordinador)
      {
        return [];
      }

      const respuesta = await api.get(`postulacion/coordinador/${rut_coordinador}`);

      const data = respuesta.data as PostulanteCoordinadorData[];
      return data.sort((a, b) => b.puntuacion_etapa1 - a.puntuacion_etapa1); //mayor valor puntaje desde backend para la etapa 1 primero
    },
    enabled: !!rut_coordinador,
  });
}


export function useAyudantesActivos(rut_coordinador?:string) {
  return useQuery<AyudanteActivoData[], Error>({
    queryKey: ["ayudantesActivos", rut_coordinador],
    queryFn: async () => {
      if (!rut_coordinador)
      {
        return [];
      }

      const respuesta = await api.get(`ayudantia/coordinador/${rut_coordinador}`);
      return respuesta.data;
    },
    enabled: !!rut_coordinador,
  });
}


export function useEvaluarPostulacion() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: async ({id_postulacion, puntuacion_etapa2}: EvaluarPostulacion) => {
      await api.patch(`postulacion/puntuacionetapa2/${id_postulacion}`, {
        puntuacion_etapa2
      });
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({queryKey: ["postulantesCoordinador"]});
      clienteQuery.invalidateQueries({queryKey: ["postulacionesCoordinador"]});
      clienteQuery.invalidateQueries({queryKey: ["ayudantesCoordinador"]});
    },
  });
}



export function useDescartarPostulacion() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: async ({id_postulacion, motivo_descarte, fecha_descarte, rechazada_por_jefatura}: DescartarPostulacion) => {
      await api.patch(`postulacion/descartar-postulacion/${id_postulacion}`, {
        motivo_descarte,
        fecha_descarte,
        rechazada_por_jefatura
      });
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({queryKey: ["postulantesCoordinador"]});
      clienteQuery.invalidateQueries({queryKey: ["postulaciones"]});
      clienteQuery.invalidateQueries({queryKey: ["postulacionesCoordinador"]});
      clienteQuery.invalidateQueries({queryKey: ["ayudantesCoordinador"]});
    },
  });
}


export function useEvaluarAyudanteFinal() {
  const clienteQuery = useQueryClient();
  return useMutation({
    mutationFn: async ({id_ayudantia, evaluacion}: EvaluarAyudante) => {
      await api.patch(`ayudantia/${id_ayudantia}`, {
        evaluacion
      });
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({queryKey: ["ayudantesActivos"]});
    }

  });
}

export function usePostulacionesCoordinador() {
  return useQuery<PostulanteCoordinador[], Error>({
    queryKey: ["postulacionesCoordinador"],
    queryFn: async () => {
      const respuesta = await api.get("postulacion/coord/in/ador/a"); 
      return respuesta.data;
    },
  });
}

export function useAyudantesCoordinador() {
  return useQuery<AyudanteCoordinador[], Error>({
    queryKey: ["ayudantesCoordinador"],
    queryFn: async () => {
      const respuesta = await api.get("ayudantia/coord/ina/dor/a");
      return respuesta.data;
    },
  });
}



