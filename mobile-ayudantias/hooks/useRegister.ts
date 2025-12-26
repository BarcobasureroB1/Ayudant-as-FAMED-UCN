import { useMutation } from "@tanstack/react-query"
import api from "../api/axios"
import type { AxiosError } from "axios"

interface Registerdata {
  rut: string
  nombres: string
  apellidos: string
  tipo: string
  correo:string;
  password: string
}

interface Registerresponse {
  message: string
}

export function useRegister(onSuccess: () => void, onFail: (error: string) => void) {
  return useMutation<Registerresponse, AxiosError, Registerdata>({
    mutationFn: async ({ rut, nombres, apellidos, correo, tipo, password }) => {
      const respuesta = await api.post("/auth/register", { rut, nombres, apellidos, correo, tipo, password})
      return respuesta.data
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error) => {
      const mensaje = (error.response?.data as { message?: string })?.message || "no se pudo identificar el error xd"
      onFail(mensaje)
    },
  })
}
