import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      const respuesta = await api.get("coordinador");
      return respuesta.data;
    },
  });
}
